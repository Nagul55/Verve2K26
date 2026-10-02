export type EventCategory = 'Technical' | 'Non-Technical';

export interface Fest {
  id: string;
  name: string;
  description: string;
  rules: {
    minTechnical: number;
    minNonTechnical: number;
  };
}

export interface SubEvent {
  id: string;
  festId: string;
  category: EventCategory;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

export interface FeaturedEvent {
  id: string;
  number: string;
  category: EventCategory;
  title: string | React.ReactNode;
  description: string;
  date: string;
  location: string;
  imageType: 'code' | 'innovate' | 'treasure';
}

export interface Registration {
  id: string;
  number: string;
  category: EventCategory;
  title: string;
  date: string;
  location: string;
}

export interface OverviewStats {
  registrations: { value: number; delta: string; trend: 'up' | 'down' };
  attendance: { value: number; delta: string; trend: 'up' | 'down' };
  teamsFormed: { value: number; delta: string; trend: 'up' | 'down' };
}

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
}

export const mockFeaturedEvents: FeaturedEvent[] = [
  {
    id: 'e1',
    number: '01',
    category: 'Technical',
    title: 'CODE CLASH', // Handled differently in UI if needs break
    description: 'A competitive coding challenge for problem solvers.',
    date: 'Oct 15, 2026',
    location: 'Main Block',
    imageType: 'code',
  },
  {
    id: 'e2',
    number: '02',
    category: 'Technical',
    title: 'INNOVATEX',
    description: 'Build innovative solutions for real-world problems.',
    date: 'Oct 16, 2026',
    location: 'Lab Complex',
    imageType: 'innovate',
  },
  {
    id: 'e3',
    number: '03',
    category: 'Non-Technical',
    title: 'TREASURE HUNT',
    description: 'Decode. Explore. Win.',
    date: 'Oct 17, 2026',
    location: 'Campus Grounds',
    imageType: 'treasure',
  },
];

export const mockRegistrations: Registration[] = [
  {
    id: 'r1',
    number: '01',
    category: 'Technical',
    title: 'Code Clash',
    date: 'Oct 15, 2026',
    location: 'Main Block',
  },
  {
    id: 'r2',
    number: '02',
    category: 'Technical',
    title: 'InnovateX',
    date: 'Oct 16, 2026',
    location: 'Lab Complex',
  },
  {
    id: 'r3',
    number: '03',
    category: 'Non-Technical',
    title: 'Treasure Hunt',
    date: 'Oct 17, 2026',
    location: 'Campus Grounds',
  },
];

export const mockOverviewStats: OverviewStats = {
  registrations: { value: 842, delta: '+12%', trend: 'up' },
  attendance: { value: 76, delta: '+8%', trend: 'up' }, // 76%
  teamsFormed: { value: 128, delta: '+24%', trend: 'up' },
};

export const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: 'u1',
    day: '15',
    month: 'OCT',
    title: 'Code Clash',
    location: 'Main Block',
    time: '09:00 AM',
  },
  {
    id: 'u2',
    day: '16',
    month: 'OCT',
    title: 'InnovateX',
    location: 'Lab Complex',
    time: '10:00 AM',
  },
  {
    id: 'u3',
    day: '17',
    month: 'OCT',
    title: 'Treasure Hunt',
    location: 'Campus Grounds',
    time: '09:00 AM',
  },
  {
    id: 'u4',
    day: '18',
    month: 'OCT',
    title: 'Open Mic',
    location: 'Auditorium',
    time: '02:00 PM',
  },
];

export const mockFest: Fest = {
  id: 'f1',
  name: 'Verve26',
  description: 'The Ultimate Tech and Cultural Fest',
  rules: {
    minTechnical: 1,
    minNonTechnical: 1,
  }
};

export const mockFestEvents: SubEvent[] = [
  {
    id: 'se1',
    festId: 'f1',
    category: 'Technical',
    title: 'Code Clash',
    description: 'A competitive coding challenge for problem solvers.',
    date: 'Oct 15, 2026',
    time: '09:00 AM',
    location: 'Main Block',
  },
  {
    id: 'se2',
    festId: 'f1',
    category: 'Technical',
    title: 'InnovateX',
    description: 'Build innovative solutions for real-world problems.',
    date: 'Oct 16, 2026',
    time: '10:00 AM',
    location: 'Lab Complex',
  },
  {
    id: 'se3',
    festId: 'f1',
    category: 'Non-Technical',
    title: 'Treasure Hunt',
    description: 'Decode. Explore. Win.',
    date: 'Oct 17, 2026',
    time: '09:00 AM',
    location: 'Campus Grounds',
  },
  {
    id: 'se4',
    festId: 'f1',
    category: 'Non-Technical',
    title: 'Open Mic',
    description: 'Showcase your hidden talents.',
    date: 'Oct 18, 2026',
    time: '02:00 PM',
    location: 'Auditorium',
  },
];
