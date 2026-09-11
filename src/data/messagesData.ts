import { ConversationItem } from '../components/bottomTab/messages/ConversationCard';
import { ChatMessage } from '../components/bottomTab/messages/ChatDetailModal';

export const CONVERSATIONS: ConversationItem[] = [
  {
    id: '1',
    name: 'Dr. Marcus Horizon',
    specialization: 'Cardiologist',
    avatar: require('../assets/images/home/doctors/marcus-horizon.png'),
    lastMessage: 'Hello, how can I help you today? Please send your symptoms.',
    time: '10:24 AM',
    unread: 2,
    online: true,
    type: 'doctor',
  },
  {
    id: '2',
    name: 'Dr. Maria Elena',
    specialization: 'Psychologist',
    avatar: require('../assets/images/home/doctors/maria-elena.png'),
    lastMessage: 'Your prescription has been updated successfully.',
    time: '09:04 AM',
    unread: 0,
    online: false,
    type: 'doctor',
  },
  {
    id: '3',
    name: 'Dr. Stefi Jessi',
    specialization: 'Orthopedist',
    avatar: require('../assets/images/home/doctors/stefi-jessi.png'),
    lastMessage: 'Please follow the exercise routine for 2 weeks.',
    time: 'Yesterday',
    unread: 1,
    online: true,
    type: 'doctor',
  },
  {
    id: '4',
    name: 'Dr. Gerty Cori',
    specialization: 'General Specialist',
    avatar: require('../assets/images/home/doctors/doctor-gerty.png'),
    lastMessage: 'Your test results look completely normal and healthy.',
    time: '2 days ago',
    unread: 0,
    online: false,
    type: 'doctor',
  },
  {
    id: '5',
    name: 'Dr. Diandra',
    specialization: 'Dentist',
    avatar: require('../assets/images/home/doctors/doctor-diandra.png'),
    lastMessage: 'Don’t forget our checkup appointment tomorrow at 10 AM.',
    time: '3 days ago',
    unread: 0,
    online: true,
    type: 'doctor',
  },
];

export const INITIAL_CHAT_MESSAGES: { [id: string]: ChatMessage[] } = {
  '1': [
    { sender: 'doctor', text: 'Hello! I am Dr. Marcus Horizon. How are you feeling today?', time: '10:20 AM' },
    { sender: 'user', text: 'Hi Doctor, I have had a mild headache and tiredness since yesterday.', time: '10:22 AM' },
    { sender: 'doctor', text: 'Hello, how can I help you today? Please send your symptoms.', time: '10:24 AM' },
  ],
};
