export interface Booking {
  id: string;
  date: string;
  guestName: string;
  email: string;
  phone: string;
  slotType: 'day' | 'night';
  guestCount: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
  advancePaid: number;
  totalAmount: number;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface BlockedDate {
  date: string;
  dayBlocked: boolean;
  nightBlocked: boolean;
  reason: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
}

// Mock bookings data
export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    date: '2026-05-25',
    guestName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    slotType: 'day',
    guestCount: 8,
    paymentStatus: 'completed',
    advancePaid: 1500,
    totalAmount: 3000,
    createdAt: '2026-05-31T10:30:00',
    status: 'confirmed',
  },
  {
    id: 'BK002',
    date: '2026-05-26',
    guestName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43211',
    slotType: 'night',
    guestCount: 12,
    paymentStatus: 'partial',
    advancePaid: 1500,
    totalAmount: 3000,
    createdAt: '2026-05-31T14:20:00',
    status: 'confirmed',
  },
  {
    id: 'BK003',
    date: '2026-05-27',
    guestName: 'Amit Patel',
    email: 'amit.patel@email.com',
    phone: '+91 98765 43212',
    slotType: 'day',
    guestCount: 15,
    paymentStatus: 'pending',
    advancePaid: 0,
    totalAmount: 3000,
    createdAt: '2026-05-31T09:15:00',
    status: 'pending',
  },
  {
    id: 'BK004',
    date: '2026-05-28',
    guestName: 'Sneha Desai',
    email: 'sneha.desai@email.com',
    phone: '+91 98765 43213',
    slotType: 'night',
    guestCount: 10,
    paymentStatus: 'completed',
    advancePaid: 1500,
    totalAmount: 3000,
    createdAt: '2026-06-01T16:45:00',
    status: 'confirmed',
  },
  {
    id: 'BK005',
    date: '2026-05-30',
    guestName: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 98765 43214',
    slotType: 'day',
    guestCount: 6,
    paymentStatus: 'partial',
    advancePaid: 1500,
    totalAmount: 3000,
    createdAt: '2026-06-01T11:30:00',
    status: 'confirmed',
  },
];

export const mockBlockedDates: BlockedDate[] = [
  {
    date: '2026-06-01',
    dayBlocked: true,
    nightBlocked: true,
    reason: 'Property maintenance',
  },
  {
    date: '2026-06-05',
    dayBlocked: false,
    nightBlocked: true,
    reason: 'Family event',
  },
];

export const mockGuests: Guest[] = [
  {
    id: 'G001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    totalBookings: 3,
    lastBooking: '2026-05-25',
  },
  {
    id: 'G002',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43211',
    totalBookings: 2,
    lastBooking: '2026-05-26',
  },
  {
    id: 'G003',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    phone: '+91 98765 43212',
    totalBookings: 1,
    lastBooking: '2026-05-27',
  },
  {
    id: 'G004',
    name: 'Sneha Desai',
    email: 'sneha.desai@email.com',
    phone: '+91 98765 43213',
    totalBookings: 4,
    lastBooking: '2026-05-28',
  },
  {
    id: 'G005',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 98765 43214',
    totalBookings: 1,
    lastBooking: '2026-05-30',
  },
];
