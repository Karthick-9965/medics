import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import MessagesSearchBar, { MessageFilter } from '../components/bottomTab/messages/MessagesSearchBar';
import ConversationCard, { ConversationItem } from '../components/bottomTab/messages/ConversationCard';
import ChatDetailModal, { ChatMessage } from '../components/bottomTab/messages/ChatDetailModal';
import { CONVERSATIONS, INITIAL_CHAT_MESSAGES } from '../data/messagesData';

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all');
  const [selectedChat, setSelectedChat] = useState<ConversationItem | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [id: string]: ChatMessage[] }>(INITIAL_CHAT_MESSAGES);

  const filteredConversations = CONVERSATIONS.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleSendMessage = (text: string) => {
    if (!selectedChat) return;
    const currentList = chatMessages[selectedChat.id] || [];
    const newMsg: ChatMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages({
      ...chatMessages,
      [selectedChat.id]: [...currentList, newMsg],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textDark} />
          </TouchableOpacity>
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
                onPress={() => setSelectedChat(item)}
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
        onClose={() => setSelectedChat(null)}
        onSendMessage={handleSendMessage}
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
  headerIconButton: {
    padding: 6,
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