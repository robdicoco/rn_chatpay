export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email: string;
  isRegistered?: boolean;
  wallets?:Chain[];
  }

  export interface Chain {
    name: string;
    account: string;
  }

export const currentUser: User = {
  id: 'current-user',
  name: 'Alex Morgan',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
 
  email: 'alex.morgan@example.com',
  isRegistered: true,
  wallets: [{name: "XION",account: '0x7F9e82F1c6D35A2b91dBd34F4A2D1D3C8e3B5a9F'}],
};

export const contacts: User[] = [
  {
    id: 'user-1',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    email: 'emma.wilson@example.com',
    isRegistered: true,
    wallets: [{name: "XION",account: '0x7F9e82F1c6D35A2b91dBd34F4A2D1D3C8e3B5a9F'}],
  },
  {
    id: 'user-2',
    name: 'James Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    email: 'james.rodriguez@example.com',
    isRegistered: true,
    wallets: [{name: "XION",account: '0x7F9e82F1c6D35A2b91dBd34F4A2D1D3C8e3B5a9F'}],
  },
  {
    id: 'user-3',
    name: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=388&q=80',
    email: 'sophia.chen@example.com',
    isRegistered: true,
    wallets: [{name: "XION",account: '0x7F9e82F1c6D35A2b91dBd34F4A2D1D3C8e3B5a9F'}],
  },
  {
    id: 'user-4',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    email: 'michael.brown@example.com',
    isRegistered: false,
  },
  {
    id: 'user-5',
    name: 'Olivia Martinez',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    email: 'olivia.martinez@example.com',
    isRegistered: false,
  },
];