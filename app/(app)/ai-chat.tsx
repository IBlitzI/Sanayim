import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Send, ArrowLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AIChatScreen() {
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.settings);
  const { token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; fromUser: boolean }>>([
    { 
      id: '1', 
      content: 'Merhaba! Ben Sanayim AI. Size araç bakımı ve onarımı konusunda yardımcı olabilirim. Ne sormak istersiniz?', 
      fromUser: false 
    }
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const isDark = theme === 'dark';
  const flatListRef = useRef<FlatList>(null);


  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: messageText.trim(),
      fromUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageText('');
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Send only the current message since history is handled by the backend
      formData.append('message', messageText.trim());
      
      if (selectedImage) {
        const imageUriParts = selectedImage.split('.');
        const fileType = imageUriParts[imageUriParts.length - 1];
        
        formData.append('image', {
          uri: selectedImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch("http://192.168.1.103:5000/api/gemini/chat", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          fromUser: false,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('API response indicates failure');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: `Bir hata oluştu: ${error}`,
        fromUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch("http://192.168.1.103:5000/api/gemini/history", {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset local messages to initial state
      setMessages([{ 
        id: '1', 
        content: 'Merhaba! Ben Sanayim AI. Size araç bakımı ve onarımı konusunda yardımcı olabilirim. Ne sormak istersiniz?', 
        fromUser: false 
      }]);
    } catch (error) {
      console.error('Error clearing history:', error);
      // Show error message in chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Geçmiş silinirken bir hata oluştu.',
        fromUser: false
      }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#ffffff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}> 
        <TouchableOpacity 
          style={[styles.clearButton, { backgroundColor: isDark ? '#2c3e50' : '#3498db' }]}
          onPress={handleClearHistory}
        >
          <Text style={styles.clearButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[ 
          styles.messagesContainer, 
          { paddingBottom: selectedImage ? 120 : 80 } // Add extra padding when image is selected
        ]}
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
        {selectedImage && (
          <View style={styles.selectedImageWrapper}>
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: isDark ? '#2c3e50' : '#f5f5f5' }]}
            onPress={pickImage}
          >
            <Camera size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

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
              (!messageText.trim() && !selectedImage) && styles.sendButtonDisabled,
              { backgroundColor: (messageText.trim() || selectedImage) ? '#3498db' : (isDark ? '#95a5a6' : '#bdc3c7') }
            ]}
            onPress={handleSendMessage}
            disabled={(!messageText.trim() && !selectedImage) || loading}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'flex-end',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  clearButton: {
    width: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '600',
    marginTop: -2,
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
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedImageWrapper: {
    width: '100%',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  selectedImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});