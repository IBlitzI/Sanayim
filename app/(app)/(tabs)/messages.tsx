import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { fetchConversationsSuccess, receiveMessage } from '../../../store/slices/chatSlice';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

// Server URL
const SERVER_URL = Constants.expoConfig?.extra?.base_url || 'http://192.168.1.103:5000'

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (token) {
      // Connect to Socket.IO server with authentication
      socketRef.current = io(SERVER_URL, {
        auth: { token }
      });

      // Listen for new messages (use the same event as chat screen)
      socketRef.current.on('message received', (data) => {
        // Kendi mesajımızı da işleyelim, sadece chat ekranında değil, burada da!
        // Her iki kullanıcı da mesajı anında görmeli
        // Transform the message to match our app's format
        const message = {
          id: data.message._id || `msg-${Date.now()}`,
          senderId: data.message.senderId,
          receiverId: user?.id || '',
          content: data.message.content,
          timestamp: data.message.timestamp || new Date().toISOString(),
          read: false
        };
        dispatch(receiveMessage({ 
          conversationId: data.chatId, 
          message: message 
        }));
        // Listeyi güncelle (unreadCount ve son mesaj için)
        setTimeout(() => {
          fetchChats(true);
        }, 300);
      });

      // Connection status events
      socketRef.current.on('connect', () => {
        console.log('Messages screen socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Messages screen socket disconnected');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Messages screen socket connection error:', err);
      });

      // Clean up on component unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [token, user?.id]);

  const fetchChats = async (isRefreshing = false) => {
    if (!token) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const result = await response.json();
      
      if (result.success && result.data.chats) {
        // Transform the chat data to match our frontend format and filter out chats without messages
        const transformedChats = result.data.chats
          .filter((chat: any) => chat.messages && chat.messages.length > 0)
          .map((chat: any) => {
            const otherParticipant = chat.otherParticipant;
            
            return {
              id: chat._id,
              participantId: otherParticipant._id,
              participantName: otherParticipant.fullName,
              participantImage: otherParticipant.profileImage,
              lastMessage: chat.lastMessage?.content || '',
              lastMessageTime: chat.lastMessage?.timestamp || chat.createdAt,
              unreadCount: chat.unreadCount || 0,
              messages: chat.messages.map((msg: any) => ({
                id: msg._id,
                senderId: msg.senderId,
                content: msg.content,
                timestamp: msg.timestamp,
                read: msg.read,
                edited: msg.edited
              }))
            };
          });

        dispatch(fetchConversationsSuccess(transformedChats));
      }
    } catch (err) {
      console.error('Fetch chats error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchChats();
  }, [dispatch, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={`${item.id}-${item.lastMessageTime}`} // Add key to force re-render when changes occur
      style={[styles.conversationItem, { borderBottomColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}
      onPress={() => handleConversationPress(item.id)}
    >
      <Image
        source={{ uri: item.participantImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
        style={styles.avatar}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.participantName, { color: isDark ? '#fff' : '#000' }]}>{item.participantName}</Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage, 
              item.unreadCount > 0 && styles.unreadMessage,
              { color: isDark ? '#bdc3c7' : '#2c3e50' }
            ]}
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#ff6b6b' : '#e74c3c' }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchChats()} style={styles.retryButton}>
          <Text style={[styles.retryText, { color: isDark ? '#fff' : '#000' }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        extraData={conversations.map(c => `${c.id}-${c.lastMessageTime}-${c.unreadCount}`).join(',')} // Force refresh when messages or unread counts change
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>No conversations yet</Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
                Your messages with mechanics will appear here
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
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
  },
  timeText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex:1,
  },
  unreadMessage: {
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});