import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { fetchConversationsSuccess } from '../../../store/slices/chatSlice';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    participantId: '1',
    participantName: 'Ahmet Yılmaz',
    participantImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    lastMessage: 'I ll be there to check your car at 2 PM',
    lastMessageTime: '2023-06-20T14:30:00Z',
    unreadCount: 2,
    messages: [
      {
        id: '101',
        senderId: '1',
        receiverId: 'current-user',
        content: 'Hello, I saw your repair request. I can help with your brake issue.',
        timestamp: '2023-06-20T10:30:00Z',
        read: true,
      },
      {
        id: '102',
        senderId: 'current-user',
        receiverId: '1',
        content: 'Great! When can you take a look at it?',
        timestamp: '2023-06-20T10:35:00Z',
        read: true,
      },
      {
        id: '103',
        senderId: '1',
        receiverId: 'current-user',
        content: 'I ll be there to check your car at 2 PM',
        timestamp: '2023-06-20T14:30:00Z',
        read: false,
      },
    ],
  },
  {
    id: '2',
    participantId: '2',
    participantName: 'Mustafa Demir',
    participantImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    lastMessage: 'The parts will arrive tomorrow',
    lastMessageTime: '2023-06-19T18:45:00Z',
    unreadCount: 0,
    messages: [
      {
        id: '201',
        senderId: '2',
        receiverId: 'current-user',
        content: 'I ve ordered the parts for your car.',
        timestamp: '2023-06-19T16:30:00Z',
        read: true,
      },
      {
        id: '202',
        senderId: 'current-user',
        receiverId: '2',
        content: 'When will they arrive?',
        timestamp: '2023-06-19T17:15:00Z',
        read: true,
      },
      {
        id: '203',
        senderId: '2',
        receiverId: 'current-user',
        content: 'The parts will arrive tomorrow',
        timestamp: '2023-06-19T18:45:00Z',
        read: true,
      },
    ],
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { conversations } = useSelector((state: RootState) => state.chat);
  const [loading, setLoading] = useState(true);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  useEffect(() => {
    // Simulate API call to fetch conversations
    setTimeout(() => {
      dispatch(fetchConversationsSuccess(mockConversations));
      setLoading(false);
    }, 1000);
  }, [dispatch]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week, show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.id)}
    >
      <Image
        source={{ uri: item.participantImage }}
        style={styles.avatar}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName}>{item.participantName}</Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    listContainer: {
      padding: 16,
      flexGrow: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0',
      alignItems: 'center',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    participantName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    timeText: {
      fontSize: 12,
      color: isDark ? '#95a5a6' : '#7f8c8d',
    },
    messageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessage: {
      fontSize: 14,
      color: isDark ? '#bdc3c7' : '#2c3e50',
      flex: 1,
    },
    unreadMessage: {
      color: isDark ? '#fff' : '#000',
      fontWeight: '500',
    },
    unreadBadge: {
      backgroundColor: '#3498db',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    unreadCount: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? '#95a5a6' : '#7f8c8d',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>
                Your messages with mechanics will appear here
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}