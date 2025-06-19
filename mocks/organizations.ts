export interface Organization {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: 'health' | 'education' | 'environment' | 'humanitarian' | 'animals' | 'other';
}

export const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Red Cross',
    logo: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=200&auto=format&fit=crop',
    description: 'Providing humanitarian aid worldwide',
    category: 'humanitarian',
  },
  {
    id: 'org-2',
    name: 'Save the Children',
    logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=200&auto=format&fit=crop',
    description: 'Supporting children in need',
    category: 'humanitarian',
  },
  {
    id: 'org-3',
    name: 'WWF',
    logo: 'https://images.unsplash.com/photo-1575887339850-1acc9d8daf3e?q=80&w=200&auto=format&fit=crop',
    description: 'Protecting wildlife and nature',
    category: 'environment',
  },
  {
    id: 'org-4',
    name: 'Doctors Without Borders',
    logo: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=200&auto=format&fit=crop',
    description: 'Medical care in crisis areas',
    category: 'health',
  },
  {
    id: 'org-5',
    name: 'UNICEF',
    logo: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=200&auto=format&fit=crop',
    description: 'Helping children worldwide',
    category: 'humanitarian',
  },
  {
    id: 'org-6',
    name: 'Greenpeace',
    logo: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=200&auto=format&fit=crop',
    description: 'Environmental protection',
    category: 'environment',
  },
];