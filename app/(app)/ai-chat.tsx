import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Send, ArrowLeft } from 'lucide-react-native';

export default function AIChatScreen() {
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.settings);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; fromUser: boolean }>>([
    { 
      id: '1', 
      content: 'Merhaba! Ben Sanayim AI. Size araç bakımı ve onarımı konusunda yardımcı olabilirim. Ne sormak istersiniz?', 
      fromUser: false 
    }
  ]);
  
  const isDark = theme === 'dark';
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: messageText.trim(),
      fromUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageText('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(userMessage.content),
        fromUser: false,
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const getAIResponse = (userMessage: string) => {
    const responses = [
      "Anladım. Bu sorununuz için öncelikle bir mekanik kontrol yapılması gerekebilir.",
      "Bu durumda size en yakın yetkili servisi önerebilirim.",
      "Araç bakımlarını düzenli yaptırmak bu tür sorunları önleyebilir.",
      "Bu belirtiler genellikle [parça] ile ilgili sorunları işaret eder.",
      "Size yardımcı olabilecek uzman bir mekanik önerebilirim.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.fromUser ? styles.userMessage : styles.aiMessage,
            { backgroundColor: item.fromUser ? '#3498db' : (isDark ? '#2c3e50' : '#ecf0f1') }
          ]}>
            <Text style={[
              styles.messageText,
              { color: item.fromUser ? '#fff' : (isDark ? '#fff' : '#2c3e50') }
            ]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={[styles.inputContainer, { borderTopColor: isDark ? '#2c2c2c' : '#e0e0e0' }]}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#2c3e50' : '#f5f5f5',
              color: isDark ? '#fff' : '#000',
            }
          ]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Sorunuzu yazın..."
          placeholderTextColor={isDark ? '#95a5a6' : '#7f8c8d'}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
            { backgroundColor: messageText.trim() ? '#3498db' : (isDark ? '#95a5a6' : '#bdc3c7') }
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || loading}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});