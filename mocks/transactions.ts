import { contacts, currentUser } from './users';

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive' | 'request';
  date: string;
  note?: string;
}

export const transactions: Transaction[] = [
  {
    id: 'tx-1',
    senderId: currentUser.id,
    receiverId: contacts[0].id,
    amount: 50.00,
    currency: 'USD',
    status: 'completed',
    type: 'send',
    date: '2023-11-15T14:30:00Z',
    note: 'Lunch payment',
  },
  {
    id: 'tx-2',
    senderId: contacts[1].id,
    receiverId: currentUser.id,
    amount: 25.50,
    currency: 'USD',
    status: 'completed',
    type: 'receive',
    date: '2023-11-14T09:15:00Z',
    note: 'Coffee and snacks',
  },
  {
    id: 'tx-3',
    senderId: currentUser.id,
    receiverId: contacts[2].id,
    amount: 200.00,
    currency: 'USD',
    status: 'completed',
    type: 'send',
    date: '2023-11-10T18:45:00Z',
    note: 'Concert tickets',
  },
  {
    id: 'tx-4',
    senderId: contacts[3].id,
    receiverId: currentUser.id,
    amount: 75.25,
    currency: 'USD',
    status: 'pending',
    type: 'receive',
    date: '2023-11-08T11:20:00Z',
    note: 'Group dinner',
  },
  {
    id: 'tx-5',
    senderId: currentUser.id,
    receiverId: contacts[4].id,
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    type: 'send',
    date: '2023-11-05T16:10:00Z',
    note: 'Birthday gift',
  },
  {
    id: 'tx-6',
    senderId: contacts[0].id,
    receiverId: currentUser.id,
    amount: 30.75,
    currency: 'USD',
    status: 'completed',
    type: 'receive',
    date: '2023-11-01T13:40:00Z',
    note: 'Movie night',
  },
];