import { contacts, currentUser } from './users';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachedTransaction?: {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    type: 'send' | 'receive' | 'request';
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

export const messages: Message[] = [
  // Conversation with Emma Wilson
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: contacts[0].id,
    receiverId: currentUser.id,
    text: "Hey, can you send me $50 for lunch yesterday?",
    timestamp: '2023-11-15T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: currentUser.id,
    receiverId: contacts[0].id,
    text: "Sure, sending it now!",
    timestamp: '2023-11-15T14:15:00Z',
    isRead: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: currentUser.id,
    receiverId: contacts[0].id,
    text: "I've sent you $50",
    timestamp: '2023-11-15T14:30:00Z',
    isRead: true,
    attachedTransaction: {
      id: 'tx-1',
      amount: 50.00,
      currency: 'USD',
      status: 'completed',
      type: 'send',
    },
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: contacts[0].id,
    receiverId: currentUser.id,
    text: "Thanks! Got it.",
    timestamp: '2023-11-15T14:35:00Z',
    isRead: true,
  },

  // Conversation with James Rodriguez
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: currentUser.id,
    receiverId: contacts[1].id,
    text: "Hey James, do you want to split the bill for coffee today?",
    timestamp: '2023-11-14T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: contacts[1].id,
    receiverId: currentUser.id,
    text: "Yes, how much do I owe you?",
    timestamp: '2023-11-14T09:05:00Z',
    isRead: true,
  },
  {
    id: 'msg-7',
    conversationId: 'conv-2',
    senderId: currentUser.id,
    receiverId: contacts[1].id,
    text: "It's $25.50 for your part",
    timestamp: '2023-11-14T09:10:00Z',
    isRead: true,
  },
  {
    id: 'msg-8',
    conversationId: 'conv-2',
    senderId: contacts[1].id,
    receiverId: currentUser.id,
    text: "Sent you $25.50",
    timestamp: '2023-11-14T09:15:00Z',
    isRead: true,
    attachedTransaction: {
      id: 'tx-2',
      amount: 25.50,
      currency: 'USD',
      status: 'completed',
      type: 'receive',
    },
  },

  // Conversation with Sophia Chen
  {
    id: 'msg-9',
    conversationId: 'conv-3',
    senderId: currentUser.id,
    receiverId: contacts[2].id,
    text: "Hi Sophia! I got us concert tickets for next weekend.",
    timestamp: '2023-11-10T18:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-10',
    conversationId: 'conv-3',
    senderId: contacts[2].id,
    receiverId: currentUser.id,
    text: "That's awesome! How much do I owe you?",
    timestamp: '2023-11-10T18:35:00Z',
    isRead: true,
  },
  {
    id: 'msg-11',
    conversationId: 'conv-3',
    senderId: currentUser.id,
    receiverId: contacts[2].id,
    text: "It's $200 for your ticket. I'll send you the details later.",
    timestamp: '2023-11-10T18:40:00Z',
    isRead: true,
  },
  {
    id: 'msg-12',
    conversationId: 'conv-3',
    senderId: currentUser.id,
    receiverId: contacts[2].id,
    text: "I've sent you $200 for the concert ticket",
    timestamp: '2023-11-10T18:45:00Z',
    isRead: true,
    attachedTransaction: {
      id: 'tx-3',
      amount: 200.00,
      currency: 'USD',
      status: 'completed',
      type: 'send',
    },
  },

  // Conversation with Michael Brown
  {
    id: 'msg-13',
    conversationId: 'conv-4',
    senderId: contacts[3].id,
    receiverId: currentUser.id,
    text: "Hey, I'll send you the money for the group dinner soon.",
    timestamp: '2023-11-08T11:10:00Z',
    isRead: false,
  },
  {
    id: 'msg-14',
    conversationId: 'conv-4',
    senderId: currentUser.id,
    receiverId: contacts[3].id,
    text: "No rush, whenever you can.",
    timestamp: '2023-11-08T11:15:00Z',
    isRead: false,
  },
  {
    id: 'msg-15',
    conversationId: 'conv-4',
    senderId: contacts[3].id,
    receiverId: currentUser.id,
    text: "I've initiated a transfer of $75.25",
    timestamp: '2023-11-08T11:20:00Z',
    isRead: false,
    attachedTransaction: {
      id: 'tx-4',
      amount: 75.25,
      currency: 'USD',
      status: 'pending',
      type: 'receive',
    },
  },

  // Conversation with Olivia Martinez
  {
    id: 'msg-16',
    conversationId: 'conv-5',
    senderId: currentUser.id,
    receiverId: contacts[4].id,
    text: "Happy Birthday Olivia! I'm sending you a little something.",
    timestamp: '2023-11-05T16:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-17',
    conversationId: 'conv-5',
    senderId: currentUser.id,
    receiverId: contacts[4].id,
    text: "I've sent you $150 as a birthday gift! Enjoy!",
    timestamp: '2023-11-05T16:10:00Z',
    isRead: true,
    attachedTransaction: {
      id: 'tx-5',
      amount: 150.00,
      currency: 'USD',
      status: 'completed',
      type: 'send',
    },
  },
  {
    id: 'msg-18',
    conversationId: 'conv-5',
    senderId: contacts[4].id,
    receiverId: currentUser.id,
    text: "Thank you so much! That's very generous of you!",
    timestamp: '2023-11-05T16:15:00Z',
    isRead: true,
  },
];

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [currentUser.id, contacts[0].id],
    lastMessage: messages.find(m => m.id === 'msg-4')!,
    unreadCount: 0,
  },
  {
    id: 'conv-2',
    participants: [currentUser.id, contacts[1].id],
    lastMessage: messages.find(m => m.id === 'msg-8')!,
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participants: [currentUser.id, contacts[2].id],
    lastMessage: messages.find(m => m.id === 'msg-12')!,
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    participants: [currentUser.id, contacts[3].id],
    lastMessage: messages.find(m => m.id === 'msg-15')!,
    unreadCount: 3,
  },
  {
    id: 'conv-5',
    participants: [currentUser.id, contacts[4].id],
    lastMessage: messages.find(m => m.id === 'msg-18')!,
    unreadCount: 0,
  },
];