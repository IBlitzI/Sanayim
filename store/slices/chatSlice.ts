import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

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
  socket: Socket | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,
  socket: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket>) => {
      state.socket = action.payload as any;
    },
    disconnectSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
    },
    fetchConversationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.isLoading = false;
      state.conversations = action.payload;
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
      if (action.payload) {
        const index = state.conversations.findIndex(c => c.id === action.payload?.id);
        if (index !== -1) {
          state.conversations[index].unreadCount = 0;
        }
      }
    },
    sendMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.timestamp;
        
        if (state.activeConversation?.id === conversationId) {
          state.activeConversation.messages.push(message);
          state.activeConversation.lastMessage = message.content;
          state.activeConversation.lastMessageTime = message.timestamp;
        }
      }
    },
    receiveMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.timestamp;
        
        if (state.activeConversation?.id === conversationId) {
          state.activeConversation.messages.push(message);
          state.activeConversation.lastMessage = message.content;
          state.activeConversation.lastMessageTime = message.timestamp;
        } else {
          conversation.unreadCount += 1;
        }
      }
    },
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.activeConversation = action.payload;
    },
  },
});

export const {
  setSocket,
  disconnectSocket,
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  setActiveConversation,
  sendMessage,
  receiveMessage,
  createConversation,
} = chatSlice.actions;

export default chatSlice.reducer;