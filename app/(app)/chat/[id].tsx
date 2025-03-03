import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setActiveConversation, sendMessage } from '../../../store/slices/chatSlice';
import { Send } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, activeConversation } = useSelector((state: RootState) => state.chat);
  
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Find the conversation by ID
  const conversation = conversations.find(c => c.id === id);
  
  useEffect(() => {
    if (conversation) {
      dispatch(setActiveConversation(conversation));
    }
    
    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [dispatch, conversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'current-user',
      receiverId: activeConversation.participantId,
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    dispatch(sendMessage({ conversationId: activeConversation.id, message: newMessage }));
    setMessageText('');
    
    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: activeConversation.participantId,
        receiverId: user?.id || 'current-user',
        content: getRandomResponse(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      dispatch(sendMessage({ conversationId: activeConversation.id, message: responseMessage }));
    }, 2000);
  };

  const getRandomResponse = () => {
    const responses = [
      "I'll check that for you right away.",
      "That sounds good. When would you like to schedule the repair?",
      "I have the parts in stock. I can fix it tomorrow.",
      "Could you provide more details about the issue?",
      "I'll be at the shop until 6 PM today if you want to bring your car in.",
      "The repair should take about 2 hours once I start working on it.",
      "I've seen this issue before. It's usually a quick fix.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === user?.id || item.senderId === 'current-user';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: activeConversation.participantImage }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{activeConversation.participantName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
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
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation by sending a message</Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#95a5a6"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.disabledSendButton]}
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