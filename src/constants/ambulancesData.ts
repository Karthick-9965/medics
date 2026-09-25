import { EMERGENCY_HOTLINES } from './appData';
export { EMERGENCY_HOTLINES };

export interface AmbulanceType {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  eta: string;
  price: string;
  iconName: string;
  features: string[];
  recommendedFor: string;
}

export interface AmbulanceUnit {
  id: string;
  driverName: string;
  vehicleNumber: string;
  ambulanceType: string;
  rating: string;
  distance: string;
  etaMinutes: number;
  phone: string;
  currentHospital: string;
}

export interface HospitalAmbulanceNumber {
  id: string;
  hospitalName: string;
  shortHotline: string;
  directPhone: string;
  ambulanceType: string;
  distance: string;
  eta: string;
  availableUnits: number;
  badgeColor?: string;
}

export const AMBULANCE_TYPES: AmbulanceType[] = [
  {
    id: 'bls',
    name: 'Basic Life Support (BLS)',
    shortCode: 'BLS',
    description: 'Standard medical transport with oxygen, stretcher, and basic first-aid equipment.',
    eta: '4-6 mins',
    price: '$45.00',
    iconName: 'ambulance',
    features: ['Standard Stretcher', 'Basic First Aid', 'Oxygen Cylinder', 'Trained Paramedic'],
    recommendedFor: 'Fractures, Non-critical transfers, Moderate sickness',
  },
  {
    id: 'als',
    name: 'Advanced Life Support (ALS / ICU)',
    shortCode: 'ALS/ICU',
    description: 'Full mobile intensive care unit with portable ventilator and defibrillator.',
    eta: '5-8 mins',
    price: '$75.00',
    iconName: 'heartbeat',
    features: ['Portable Ventilator', 'ECG / Defibrillator', 'Critical Care Paramedic', 'IV Infusion Pump'],
    recommendedFor: 'Cardiac events, Stroke, Severe respiratory distress',
  },
  {
    id: 'cardiac',
    name: 'Oxygen & Cardiac Unit',
    shortCode: 'Cardiac',
    description: 'Equipped with cardiac monitoring, high-flow oxygen, and resuscitation gear.',
    eta: '3-5 mins',
    price: '$90.00',
    iconName: 'procedures',
    features: ['Cardiac Monitor', 'High Flow Oxygen', 'Emergency Resuscitation', 'Doctor On-Board Option'],
    recommendedFor: 'Chest pain, Heart attack symptoms, Severe asthma',
  },
];

export const NEARBY_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb_1',
    driverName: 'Ramesh Kumar (ALS Certified)',
    vehicleNumber: 'TN-09-EM-1082',
    ambulanceType: 'ALS / ICU Unit',
    rating: '4.9',
    distance: '1.2 km away',
    etaMinutes: 4,
    phone: '+91 98765 43210',
    currentHospital: 'Apollo Speciality Hospital',
  },
  {
    id: 'amb_2',
    driverName: 'Karthik Raja (BLS Paramedic)',
    vehicleNumber: 'TN-07-EM-4421',
    ambulanceType: 'Basic Life Support (BLS)',
    rating: '4.8',
    distance: '2.4 km away',
    etaMinutes: 6,
    phone: '+91 98401 11223',
    currentHospital: 'City Care Medical Center',
  },
  {
    id: 'amb_3',
    driverName: 'Dr. Vignesh (Cardiac Specialist)',
    vehicleNumber: 'TN-01-CR-9901',
    ambulanceType: 'Cardiac Care Unit',
    rating: '5.0',
    distance: '3.1 km away',
    etaMinutes: 8,
    phone: '+91 94440 55667',
    currentHospital: 'Grace Memorial Hospital',
  },
];

export const HOSPITAL_AMBULANCE_NUMBERS: HospitalAmbulanceNumber[] = [
  {
    id: 'hosp_amb_1',
    hospitalName: 'Apollo Speciality Hospital',
    shortHotline: '1066',
    directPhone: '+1 (555) 901-0000',
    ambulanceType: 'Cardiac & Mobile ICU Unit',
    distance: '2.4 km away',
    eta: '4-6 mins',
    availableUnits: 3,
    badgeColor: '#7C3AED',
  },
  {
    id: 'hosp_amb_2',
    hospitalName: 'Grace Memorial Hospital',
    shortHotline: '105010',
    directPhone: '+1 (555) 902-1111',
    ambulanceType: 'Trauma & Emergency Life Support',
    distance: '3.8 km away',
    eta: '5-8 mins',
    availableUnits: 2,
    badgeColor: '#DC2626',
  },
  {
    id: 'hosp_amb_3',
    hospitalName: 'City Care Medical Center',
    shortHotline: '108',
    directPhone: '+1 (555) 903-2222',
    ambulanceType: 'Basic & Advanced Life Support (BLS/ALS)',
    distance: '1.1 km away',
    eta: '3-5 mins',
    availableUnits: 4,
    badgeColor: '#0D9488',
  },
  {
    id: 'hosp_amb_4',
    hospitalName: 'Metro Health Super Specialty',
    shortHotline: '105711',
    directPhone: '+1 (555) 904-3333',
    ambulanceType: 'Ventilator & Critical Care Unit',
    distance: '4.5 km away',
    eta: '6-9 mins',
    availableUnits: 2,
    badgeColor: '#2563EB',
  },
  {
    id: 'hosp_amb_5',
    hospitalName: 'Sunrise Community Hospital',
    shortHotline: '108',
    directPhone: '+1 (555) 905-4444',
    ambulanceType: '24/7 Community Emergency Van',
    distance: '5.2 km away',
    eta: '7-10 mins',
    availableUnits: 1,
    badgeColor: '#EA580C',
  },
];
