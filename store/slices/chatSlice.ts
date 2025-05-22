import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: Message[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },
    sendMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.timestamp;
      }
      if (state.activeConversation?.id === conversationId) {
        state.activeConversation.messages.push(message);
        state.activeConversation.lastMessage = message.content;
        state.activeConversation.lastMessageTime = message.timestamp;
      }
    },
    receiveMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        // Only add the message if it doesn't already exist
        if (!conversation.messages.some(msg => msg.id === message.id)) {
          conversation.messages.push(message);
          conversation.lastMessage = message.content;
          conversation.lastMessageTime = message.timestamp;
          conversation.unreadCount += 1; // Increment unread count for new incoming messages
        }
      }
      if (state.activeConversation?.id === conversationId) {
        // Only add the message if it doesn't already exist
        if (!state.activeConversation.messages.some(msg => msg.id === message.id)) {
          state.activeConversation.messages.push(message);
          state.activeConversation.lastMessage = message.content;
          state.activeConversation.lastMessageTime = message.timestamp;
        }
      }
    },
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.activeConversation = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const { conversationId, count } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = count;
      }
      if (state.activeConversation?.id === conversationId) {
        state.activeConversation.unreadCount = count;
      }
    },
  },
});

export const {
  fetchConversationsSuccess,
  setActiveConversation,
  sendMessage,
  receiveMessage,
  createConversation,
  setUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;