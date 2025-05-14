import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import {
  setActiveConversation,
  sendMessage,
  createConversation,
} from '../../../store/slices/chatSlice';
import { Send } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { conversations, activeConversation } = useSelector((state: RootState) => state.chat);

  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find((c) => c.id === id);
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark';

  const markAsRead = async (chatId: string) => {
    try {
      await fetch(`http://192.168.64.95:5000/api/chat/${chatId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  useEffect(() => {
    const loadChat = async () => {
      try {
        if (!conversation) {
          const response = await fetch(`http://192.168.64.95:5000/api/chat/${id}/messages`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch chat');
          }
          const chatData = await response.json();
          const mechanic = chatData.participants[0];

          const newChat = {
            id: chatData._id,
            participantId: mechanic._id,
            participantName: mechanic.fullName,
            participantImage: mechanic.profileImage,
            lastMessage: '',
            lastMessageTime: chatData.lastMessage || new Date().toISOString(),
            unreadCount: 0,
            messages: chatData.messages || [],
          };

          dispatch(createConversation(newChat));
          await markAsRead(chatData._id);
        } else {
          dispatch(setActiveConversation(conversation));
          await markAsRead(conversation.id);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChat();

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [dispatch, id, conversation, token]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation || !user || !token) {
      return;
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: activeConversation.participantId,
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      const response = await fetch(`http://192.168.64.95:5000/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: id,
          content: messageText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const responseData = await response.json();

      if (responseData.success) {
        dispatch(sendMessage({ conversationId: activeConversation.id, message: newMessage }));
        setMessageText('');
      } else {
        throw new Error(responseData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === user?.id || item.senderId === 'current-user';
    

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        > 
          <Text style={styles.messageParticipantName}>{item.senderId === user?.id ? 'You' : activeConversation?.participantName}</Text>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  if (!activeConversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: isDark ? '#2c2c2c' : '#cccccc' }]}>
        <Image source={{ uri: activeConversation.participantImage }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: isDark ? '#fff' : '#000' }]}>
            {activeConversation.participantName}
          </Text>
          <Text style={[styles.headerStatus, { color: isDark ? '#2ecc71' : '#27ae60' }]}>Online</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={activeConversation.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>No messages yet</Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#95a5a6' : '#7f8c8d' }]}>
              Start the conversation by sending a message
            </Text>
          </View>
        }
      />

      <View style={[styles.inputContainer, { borderTopColor: isDark ? '#2c2c2c' : '#cccccc' }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#2c3e50' : '#ecf0f1',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.disabledSendButton,
            {
              backgroundColor: !messageText.trim()
                ? isDark
                  ? '#95a5a6'
                  : '#bdc3c7'
                : isDark
                ? '#3498db'
                : '#2980b9',
            },
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#2ecc71',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#2c3e50',
    borderBottomLeftRadius: 4,
  },
  messageParticipantName: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2c',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#95a5a6',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
