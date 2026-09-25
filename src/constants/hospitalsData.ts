export interface HospitalItem {
  id: string;
  name: string;
  image: any;
  rating: string;
  distance: string;
  address?: string;
  emergencyPhone?: string;
  receptionPhone?: string;
  consultationFee?: number;
  visitingHours?: string;
  hospitalType?: string;
  availableBeds?: number;
  totalBeds?: number;
  departments?: string[];
  latitude?: number;
  longitude?: number;
}

export const HOSPITALS_DATA: HospitalItem[] = [
  {
    id: '1',
    name: 'Apollo Speciality Hospital',
    image: require('../assets/images/home/hospitals/apollo.png'),
    rating: '4.9',
    distance: '2.4 km away',
    address: '21 Greams Lane, Medical District',
    emergencyPhone: '1066 / +1 (555) 901-0000',
    receptionPhone: '+1 (555) 012-4000',
    consultationFee: 30,
    visitingHours: '24/7 Open • OPD: 8:00 AM - 9:00 PM',
    hospitalType: 'Super Specialty & Multi-Organ Center',
    availableBeds: 18,
    totalBeds: 120,
    departments: ['Cardiology', 'Emergency', 'Neurology', 'ICU Care', 'Trauma', 'Orthopedics'],
    latitude: 13.0604,
    longitude: 80.2496,
  },
  {
    id: '2',
    name: 'Grace Memorial Hospital',
    image: require('../assets/images/home/hospitals/grace-memorial.png'),
    rating: '4.8',
    distance: '3.8 km away',
    address: '500 Memorial Boulevard, North Sector',
    emergencyPhone: '105010 / +1 (555) 902-1111',
    receptionPhone: '+1 (555) 013-5000',
    consultationFee: 25,
    visitingHours: '24/7 Open • OPD: 8:30 AM - 8:30 PM',
    hospitalType: 'Multi-Specialty & Trauma Care Center',
    availableBeds: 12,
    totalBeds: 95,
    departments: ['Orthopedics', 'Pediatrics', 'Oncology', 'ICU', 'Radiology', 'General Surgery'],
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: '3',
    name: 'City Care Medical Center',
    image: require('../assets/images/home/hospitals/city-care.png'),
    rating: '4.7',
    distance: '1.1 km away',
    address: '88 City Center Cross, Downtown',
    emergencyPhone: '108 / +1 (555) 903-2222',
    receptionPhone: '+1 (555) 014-6000',
    consultationFee: 20,
    visitingHours: '24/7 Open • OPD: 9:00 AM - 8:00 PM',
    hospitalType: 'General Healthcare & Daycare Center',
    availableBeds: 8,
    totalBeds: 60,
    departments: ['General Medicine', 'Psychiatry', 'ENT', 'Emergency 24/7', 'Dermatology'],
    latitude: 13.0475,
    longitude: 80.2090,
  },
  {
    id: '4',
    name: 'Metro Health Super Specialty',
    image: require('../assets/images/home/hospitals/metro-health.png'),
    rating: '4.9',
    distance: '4.5 km away',
    address: '102 Metro Ring Road, South Zone',
    emergencyPhone: '105711 / +1 (555) 904-3333',
    receptionPhone: '+1 (555) 015-7000',
    consultationFee: 35,
    visitingHours: '24/7 Open • OPD: 8:00 AM - 9:30 PM',
    hospitalType: 'Tertiary Care & Organ Transplant Hospital',
    availableBeds: 24,
    totalBeds: 200,
    departments: ['Cardiac Surgery', 'Nephrology', 'Organ Transplant', 'Trauma Care', 'Neurology'],
    latitude: 12.9800,
    longitude: 80.2200,
  },
  {
    id: '5',
    name: 'Sunrise Community Hospital',
    image: require('../assets/images/home/hospitals/sunrise.png'),
    rating: '4.6',
    distance: '5.2 km away',
    address: '14 Sunrise Avenue, East Bay',
    emergencyPhone: '108 / +1 (555) 905-4444',
    receptionPhone: '+1 (555) 016-8000',
    consultationFee: 15,
    visitingHours: '24/7 Open • OPD: 9:00 AM - 7:00 PM',
    hospitalType: 'Community & Maternity Hospital',
    availableBeds: 5,
    totalBeds: 40,
    departments: ['Maternity Care', 'Pediatrics', 'Vaccination Center', 'General Care', 'Gynecology'],
    latitude: 13.1200,
    longitude: 80.2900,
  },
];
