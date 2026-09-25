export interface PharmacyItem {
  id: string;
  name: string;
  image: any;
  rating: string;
  distance: string;
  address?: string;
  openTime?: string;
  deliveryTime?: string;
  isAvailable24h?: boolean;
  phone?: string;
}

export const PHARMACIES_DATA: PharmacyItem[] = [
  {
    id: '1',
    name: 'Apollo Pharmacy',
    image: require('../assets/images/home/pharmacies/apollopharmacy.png'),
    rating: '4.8',
    distance: '1.2 km away',
    address: '124 Medical Corridor, Block B, Health City',
    openTime: 'Open 24 Hours',
    deliveryTime: '15-25 mins',
    isAvailable24h: true,
    phone: '+1 (555) 301-4400',
  },
  {
    id: '2',
    name: 'MedLife Care',
    image: require('../assets/images/home/pharmacies/medilife.png'),
    rating: '4.7',
    distance: '2.0 km away',
    address: '89 Central Avenue, West Wing, Metro City',
    openTime: 'Open 24 Hours',
    deliveryTime: '20-30 mins',
    isAvailable24h: true,
    phone: '+1 (555) 302-8800',
  },
  {
    id: '3',
    name: 'Care Pharma Direct',
    image: require('../assets/images/home/pharmacies/carepharma.png'),
    rating: '4.6',
    distance: '3.1 km away',
    address: '45 Health Square, Near City Library',
    openTime: '8:00 AM - 11:00 PM',
    deliveryTime: '25-35 mins',
    isAvailable24h: false,
    phone: '+1 (555) 303-1212',
  },
  {
    id: '4',
    name: 'HealthPlus Pharmacy',
    image: require('../assets/images/home/pharmacies/healthplus.png'),
    rating: '4.9',
    distance: '800m away',
    address: '12 Park Road, Beside Central Hospital',
    openTime: 'Open 24 Hours',
    deliveryTime: '10-20 mins',
    isAvailable24h: true,
    phone: '+1 (555) 304-9900',
  },
  {
    id: '5',
    name: 'WellCare Pharmacy',
    image: require('../assets/images/home/pharmacies/wellcare.png'),
    rating: '4.5',
    distance: '4.0 km away',
    address: '77 Sunrise Highway, East Sector',
    openTime: '9:00 AM - 10:00 PM',
    deliveryTime: '30-45 mins',
    isAvailable24h: false,
    phone: '+1 (555) 305-7766',
  },
];
