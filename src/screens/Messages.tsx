import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import MessagesSearchBar, { MessageFilter } from '../components/bottomTab/messages/MessagesSearchBar';
import ConversationCard, { ConversationItem } from '../components/bottomTab/messages/ConversationCard';
import ChatDetailModal, { ChatMessage } from '../components/bottomTab/messages/ChatDetailModal';
import AudioCallModal from '../components/consultation/AudioCallModal';
import VideoCallModal from '../components/consultation/VideoCallModal';
import NotificationsModal from '../components/home/NotificationsModal';
import EmptyState from '../components/common/EmptyState';
import { CONVERSATIONS, INITIAL_CHAT_MESSAGES } from '../constants/messagesData';
import { generateDoctorReply } from '../utils/doctorReplyEngine';
import { sendDoctorMessageNotification } from '../services/notificationManager';

interface MessagesProps {
  navigation?: any;
  onNavigateToSchedule?: () => void;
  onNavigateToAmbulance?: () => void;
  onNavigateToPharmacy?: () => void;
}

export default function Messages({
  navigation,
  onNavigateToSchedule,
  onNavigateToAmbulance,
  onNavigateToPharmacy,
}: MessagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all');
  const [conversations, setConversations] = useState<ConversationItem[]>(CONVERSATIONS);
  const [selectedChat, setSelectedChat] = useState<ConversationItem | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [id: string]: ChatMessage[] }>(INITIAL_CHAT_MESSAGES);
  const [typingDoctorId, setTypingDoctorId] = useState<string | null>(null);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const storedChats = await AsyncStorage.getItem('@app_chat_messages');
        if (storedChats) {
          setChatMessages({ ...INITIAL_CHAT_MESSAGES, ...JSON.parse(storedChats) });
        }

        const storedConvs = await AsyncStorage.getItem('@app_conversations');
        let currentConvs = CONVERSATIONS;
        if (storedConvs) {
          currentConvs = JSON.parse(storedConvs);
          setConversations(currentConvs);
        } else {
          setConversations(CONVERSATIONS);
        }

        // If Android OS killed activity during camera capture, recover active doctor chat
        try {
          const pending = await ImagePicker.getPendingResultAsync();
          if (
            pending &&
            'assets' in pending &&
            !pending.canceled &&
            pending.assets &&
            pending.assets.length > 0
          ) {
            const activeId = await AsyncStorage.getItem('@active_chat_id');
            if (activeId) {
              const activeDoc =
                currentConvs.find((c: ConversationItem) => c.id === activeId) ||
                CONVERSATIONS.find((c) => c.id === activeId);
              if (activeDoc) {
                setSelectedChat(activeDoc);
              }
            }
          }
        } catch (err) {
          console.log('Pending image check in Messages error:', err);
        }
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, []);

  const saveChats = async (data: { [id: string]: ChatMessage[] }) => {
    try {
      await AsyncStorage.setItem('@app_chat_messages', JSON.stringify(data));
    } catch (e) {
      console.log(e);
    }
  };

  const saveConversations = async (data: ConversationItem[]) => {
    try {
      await AsyncStorage.setItem('@app_conversations', JSON.stringify(data));
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenChat = async (item: ConversationItem) => {
    // Clear unread badge for this conversation
    const updated = conversations.map((c) =>
      c.id === item.id ? { ...c, unread: 0 } : c
    );
    setConversations(updated);
    saveConversations(updated);
    setSelectedChat({ ...item, unread: 0 });
    try {
      await AsyncStorage.setItem('@active_chat_id', item.id);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCloseChat = async () => {
    setSelectedChat(null);
    try {
      await AsyncStorage.removeItem('@active_chat_id');
    } catch (e) {
      console.log(e);
    }
  };

  const filteredConversations = conversations.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleReceiveDoctorMessage = async (doctorId: string, replyText: string) => {
    const target =
      conversations.find((c) => c.id === doctorId) ||
      CONVERSATIONS.find((c) => c.id === doctorId);
    if (!target) return;

    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const docMsg: ChatMessage = {
      sender: 'doctor',
      text: replyText,
      time: replyTime,
    };

    // 1. Append message to chat history
    setChatMessages((prev) => {
      const currentList = prev[doctorId] || [
        { sender: 'doctor', text: target.lastMessage, time: target.time },
      ];
      const next = { ...prev, [doctorId]: [...currentList, docMsg] };
      saveChats(next);
      return next;
    });

    // 2. Update conversation: increment unread count by +1 and move to top
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === doctorId) || target;
      const currentUnread = existing.unread || 0;
      const newUnread = currentUnread + 1;

      const updatedItem: ConversationItem = {
        ...existing,
        lastMessage: replyText,
        time: replyTime,
        unread: newUnread,
      };

      const others = prev.filter((c) => c.id !== doctorId);
      const reordered = [updatedItem, ...others];
      saveConversations(reordered);
      return reordered;
    });

    // 3. Send Push Notification + In-App Notification Center
    await sendDoctorMessageNotification({
      senderName: target.name,
      specialization: target.specialization,
      message: replyText,
      conversationId: doctorId,
    });
  };

  const handleSendMessage = (
    text: string,
    image?: string,
    isPrescription?: boolean,
    prescriptionName?: string
  ) => {
    if (!selectedChat) return;
    const id = selectedChat.id;
    const currentList = chatMessages[id] || [
      { sender: 'doctor', text: selectedChat.lastMessage, time: selectedChat.time },
    ];
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image,
      isPrescription,
      prescriptionName: prescriptionName || (image ? 'Prescription Document' : undefined),
    };
    const updatedMessages = { ...chatMessages, [id]: [...currentList, userMsg] };
    setChatMessages(updatedMessages);
    saveChats(updatedMessages);

    // Update conversation last message in list
    const isPdf =
      prescriptionName?.toLowerCase().endsWith('.pdf') ||
      image?.toLowerCase().endsWith('.pdf') ||
      image?.toLowerCase().includes('.pdf');
    const attachmentLabel = isPdf ? '📄 Prescription PDF' : '📷 Prescription Photo';

    const updatedConvs = conversations.map((c) =>
      c.id === id
        ? {
            ...c,
            lastMessage: text || (image ? attachmentLabel : 'Attachment'),
            time: 'Just now',
          }
        : c
    );
    setConversations(updatedConvs);
    saveConversations(updatedConvs);

    // Auto-Reply simulation with real Push & in-app Notification and doctor card unread badge
    setTypingDoctorId(id);
    setTimeout(async () => {
      let reply: string;
      if (isPrescription || image) {
        reply = `Thank you for uploading your prescription sheet! I've reviewed the medications and dosage. Everything is verified and noted in your consultation chart. Please take them as advised and let me know if you have any questions.`;
      } else {
        reply = generateDoctorReply(text, selectedChat.name, selectedChat.specialization);
      }

      await handleReceiveDoctorMessage(id, reply);
      setTypingDoctorId(null);
    }, 1500);
  };

  const handleDeleteMessage = (messageIndex: number, messageId?: string) => {
    if (!selectedChat) return;
    const id = selectedChat.id;
    const currentList = chatMessages[id] || [];
    if (currentList.length === 0) return;

    let updatedList: ChatMessage[];
    if (messageId) {
      updatedList = currentList.filter((m) => m.id !== messageId);
    } else {
      updatedList = currentList.filter((_, idx) => idx !== messageIndex);
    }

    const updatedMessages = { ...chatMessages, [id]: updatedList };
    setChatMessages(updatedMessages);
    saveChats(updatedMessages);

    // Update conversation card preview if the deleted message was the latest one
    const newLastMsg = updatedList[updatedList.length - 1];
    let newLastText = 'No messages yet';
    let newTime = 'Just now';

    if (newLastMsg) {
      newTime = newLastMsg.time;
      if (newLastMsg.text) {
        newLastText = newLastMsg.text;
      } else if (newLastMsg.image) {
        const isPdf =
          newLastMsg.prescriptionName?.toLowerCase().endsWith('.pdf') ||
          newLastMsg.image?.toLowerCase().endsWith('.pdf') ||
          newLastMsg.image?.toLowerCase().includes('.pdf');
        newLastText = isPdf ? '📄 Prescription PDF' : '📷 Prescription Photo';
      }
    }

    const updatedConvs = conversations.map((c) =>
      c.id === id
        ? {
            ...c,
            lastMessage: newLastText,
            time: newTime,
          }
        : c
    );
    setConversations(updatedConvs);
    saveConversations(updatedConvs);
  };

  const handleNotificationSelectChat = (conversationId?: string) => {
    setShowNotifModal(false);
    if (conversationId) {
      const target = conversations.find((c) => c.id === conversationId);
      if (target) {
        handleOpenChat(target);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Search & Filter */}
        <MessagesSearchBar
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />

        {/* Conversations List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredConversations.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages found"
              subtitle="Try searching for a different doctor or keyword"
            />
          ) : (
            filteredConversations.map((item) => (
              <ConversationCard
                key={item.id}
                conversation={item}
                onPress={() => handleOpenChat(item)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Interactive Chat Modal */}
      <ChatDetailModal
        visible={!!selectedChat}
        conversation={selectedChat}
        messages={
          selectedChat
            ? chatMessages[selectedChat.id] || [
                { sender: 'doctor', text: selectedChat.lastMessage, time: selectedChat.time },
              ]
            : []
        }
        isTyping={typingDoctorId === selectedChat?.id}
        onClose={handleCloseChat}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
        onAudioCall={() => setShowAudioCall(true)}
        onVideoCall={() => setShowVideoCall(true)}
      />

      {/* Consultations */}
      <AudioCallModal
        visible={showAudioCall}
        doctor={selectedChat}
        onEndCall={() => setShowAudioCall(false)}
        onSwitchToVideo={() => {
          setShowAudioCall(false);
          setShowVideoCall(true);
        }}
      />

      <VideoCallModal
        visible={showVideoCall}
        doctor={selectedChat}
        onEndCall={() => setShowVideoCall(false)}
        onSwitchToAudio={() => {
          setShowVideoCall(false);
          setShowAudioCall(true);
        }}
      />

      {/* In-App Notifications Modal */}
      <NotificationsModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onNavigateToMessages={handleNotificationSelectChat}
        onNavigateToSchedule={() => {
          setShowNotifModal(false);
          if (onNavigateToSchedule) onNavigateToSchedule();
          else if (navigation) navigation.navigate('Main', { screen: 'ScheduleTab' });
        }}
        onNavigateToAmbulance={() => {
          setShowNotifModal(false);
          if (onNavigateToAmbulance) onNavigateToAmbulance();
          else if (navigation) navigation.navigate('Ambulance');
        }}
        onNavigateToPharmacy={() => {
          setShowNotifModal(false);
          if (onNavigateToPharmacy) onNavigateToPharmacy();
          else if (navigation) navigation.navigate('SeeAll', { category: 'pharmacy' });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
