export interface User {
  id: string;
  name: string;
  avatar: string;
  phoneNumber: string;
  email: string;
  isRegistered: boolean;
  walletHash?: string;
}

export const currentUser: User = {
  id: 'current-user',
  name: 'Alex Morgan',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
  phoneNumber: '+1 (555) 123-4567',
  email: 'alex.morgan@example.com',
  isRegistered: true,
  walletHash: '0x7F9e82F1c6D35A2b91dBd34F4A2D1D3C8e3B5a9F',
};

export const contacts: User[] = [
  {
    id: 'user-1',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    phoneNumber: '+1 (555) 234-5678',
    email: 'emma.wilson@example.com',
    isRegistered: true,
    walletHash: '0x3A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t',
  },
  {
    id: 'user-2',
    name: 'James Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    phoneNumber: '+1 (555) 345-6789',
    email: 'james.rodriguez@example.com',
    isRegistered: true,
    walletHash: '0x9F8e7D6c5B4a3A2b1C0d9E8f7A6b5C4d3E2f1A0b',
  },
  {
    id: 'user-3',
    name: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=388&q=80',
    phoneNumber: '+1 (555) 456-7890',
    email: 'sophia.chen@example.com',
    isRegistered: true,
    walletHash: '0x1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t',
  },
  {
    id: 'user-4',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    phoneNumber: '+1 (555) 567-8901',
    email: 'michael.brown@example.com',
    isRegistered: false,
  },
  {
    id: 'user-5',
    name: 'Olivia Martinez',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    phoneNumber: '+1 (555) 678-9012',
    email: 'olivia.martinez@example.com',
    isRegistered: false,
  },
];