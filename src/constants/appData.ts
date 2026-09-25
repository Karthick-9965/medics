export interface BookingDateItem {
  day: string;
  date: string;
  fullDate: string;
  dayNumber?: string;
  monthName?: string;
  weekday?: string;
}

export const getDynamicBookingDates = (count: number = 14): BookingDateItem[] => {
  const dates: BookingDateItem[] = [];
  const today = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    let dayLabel = dayNames[d.getDay()];
    if (i === 0) dayLabel = 'Today';
    else if (i === 1) dayLabel = 'Tomorrow';

    const dayNum = d.getDate();
    const month = monthNames[d.getMonth()];
    const dateFormatted = `${dayNum} ${month}`;

    const dd = String(dayNum).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const fullDate = `${dd}/${mm}/${yyyy}`;

    dates.push({
      day: dayLabel,
      date: dateFormatted,
      fullDate,
      dayNumber: String(dayNum),
      monthName: month,
      weekday: dayNames[d.getDay()],
    });
  }

  return dates;
};

export const BOOKING_DATES: BookingDateItem[] = getDynamicBookingDates(14);

export const MORNING_SLOTS = ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM'];
export const AFTERNOON_SLOTS = ['02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM'];
export const EVENING_SLOTS = ['05:30 PM', '06:15 PM', '07:00 PM', '07:45 PM'];

export type ConsultationType = 'Video Call' | 'Hospital Visit' | 'Voice Call';
export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export interface ConsultationOption {
  type: ConsultationType;
  title: string;
  desc: string;
  fee: number;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

export const CONSULTATION_OPTIONS: ConsultationOption[] = [
  {
    type: 'Video Call',
    title: 'HD Video Consultation',
    desc: 'Face-to-face encrypted video call with instant digital prescription',
    fee: 50.0,
    icon: 'videocam',
  },
  {
    type: 'Hospital Visit',
    title: 'In-Clinic Physical Visit',
    desc: 'Direct consultation at clinic with zero queue priority pass',
    fee: 60.0,
    icon: 'medical',
  },
  {
    type: 'Voice Call',
    title: 'Voice Call Consultation',
    desc: 'High quality audio call with medical guidance and notes',
    fee: 40.0,
    icon: 'call',
  },
];

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  desc: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'upi', title: 'Instant UPI', desc: 'Google Pay, PhonePe, Paytm', icon: 'flash' },
  { id: 'card', title: 'Credit / Debit Card', desc: 'Visa, MasterCard, Rupay', icon: 'card' },
  { id: 'netbanking', title: 'Net Banking', desc: 'All major Indian & international banks', icon: 'globe' },
  { id: 'cod', title: 'Cash / Pay on Delivery', desc: 'Pay with cash or QR upon arrival', icon: 'cash' },
];

export interface EmergencyHotline {
  number: string;
  label: string;
  subtitle: string;
  color: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

export const EMERGENCY_HOTLINES: EmergencyHotline[] = [
  { number: '108', label: 'Ambulance 108', subtitle: 'National Medical SOS', color: '#DC2626', icon: 'medical' },
  { number: '104', label: 'Health Helpline 104', subtitle: '24/7 Medical Advice', color: '#0D9488', icon: 'call' },
  { number: '1066', label: 'Apollo SOS 1066', subtitle: 'Hospital Emergency', color: '#7C3AED', icon: 'heart' },
];

export const MEDICINE_CATEGORIES = [
  'All',
  'Pain Relief',
  'Tablets',
  'Syrups',
  'Vitamins',
  'First Aid',
  'Skin Care',
  'Digestive',
];

export const CANCEL_REASONS = [
  'Doctor not available / Delayed response',
  'Recovered / Symptom subsided',
  'Found an alternative hospital / clinic',
  'Schedule conflict / Change of plan',
  'High consultation / procedure fee',
  'Other reason',
];
