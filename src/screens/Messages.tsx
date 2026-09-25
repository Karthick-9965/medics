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
import { Colors } from '../constants/Colors';
import MessagesSearchBar, { MessageFilter } from '../components/bottomTab/messages/MessagesSearchBar';
import ConversationCard, { ConversationItem } from '../components/bottomTab/messages/ConversationCard';
import ChatDetailModal, { ChatMessage } from '../components/bottomTab/messages/ChatDetailModal';
import AudioCallModal from '../components/consultation/AudioCallModal';
import VideoCallModal from '../components/consultation/VideoCallModal';
import NotificationsModal from '../components/home/NotificationsModal';
import { CONVERSATIONS, INITIAL_CHAT_MESSAGES } from '../constants/messagesData';
import { generateDoctorReply } from '../utils/doctorReplyEngine';
import { sendDoctorMessageNotification } from '../services/notificationManager';
import { getUnreadNotificationsCount, subscribeNotifications } from '../services/notificationStorage';

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
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const storedChats = await AsyncStorage.getItem('@app_chat_messages');
        if (storedChats) {
          setChatMessages({ ...INITIAL_CHAT_MESSAGES, ...JSON.parse(storedChats) });
        }

        const storedConvs = await AsyncStorage.getItem('@app_conversations');
        if (storedConvs) {
          setConversations(JSON.parse(storedConvs));
        } else {
          setConversations(CONVERSATIONS);
        }
      } catch (e) {
        console.log(e);
      }
    };
    load();

    getUnreadNotificationsCount().then(setUnreadNotifCount);
    const unsub = subscribeNotifications((list) => {
      setUnreadNotifCount(list.filter((n) => !n.read).length);
    });
    return () => unsub();
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

  const handleOpenChat = (item: ConversationItem) => {
    // Clear unread badge for this conversation
    const updated = conversations.map((c) =>
      c.id === item.id ? { ...c, unread: 0 } : c
    );
    setConversations(updated);
    saveConversations(updated);
    setSelectedChat({ ...item, unread: 0 });
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

  const handleSendMessage = (text: string, image?: string, isPrescription?: boolean) => {
    if (!selectedChat) return;
    const id = selectedChat.id;
    const currentList = chatMessages[id] || [
      { sender: 'doctor', text: selectedChat.lastMessage, time: selectedChat.time },
    ];
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image,
      isPrescription,
    };
    const updatedMessages = { ...chatMessages, [id]: [...currentList, userMsg] };
    setChatMessages(updatedMessages);
    saveChats(updatedMessages);

    // Update conversation last message in list
    const updatedConvs = conversations.map((c) =>
      c.id === id
        ? {
            ...c,
            lastMessage: text || (image ? '📄 Prescription Attached' : 'Attachment'),
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

  const handleSimulateIncomingMessage = async () => {
    const candidates = conversations.filter((c) => c.type === 'doctor');
    const doctor = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0];
    if (!doctor) return;

    const sampleDoctorMessages = [
      `Hello! Please remember to drink warm water and take your prescribed morning tablets.`,
      `Hi, your diagnostic health report looks very positive! Keep up your morning walk routine.`,
      `Good day! How are your symptoms progressing after taking the prescribed medication?`,
      `Hello! Don't forget your scheduled follow-up consultation next week. Let me know if you need anything.`,
    ];
    const randomMsg = sampleDoctorMessages[Math.floor(Math.random() * sampleDoctorMessages.length)];
    await handleReceiveDoctorMessage(doctor.id, randomMsg);
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.testMsgBtn}
              onPress={handleSimulateIncomingMessage}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
              <Text style={styles.testMsgBtnText}>Test Msg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => setShowNotifModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
              {unreadNotifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.secondary} />
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptySubtitle}>Try searching for a different doctor or keyword</Text>
            </View>
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
        onClose={() => setSelectedChat(null)}
        onSendMessage={handleSendMessage}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testMsgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    gap: 4,
  },
  testMsgBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
  },
});
