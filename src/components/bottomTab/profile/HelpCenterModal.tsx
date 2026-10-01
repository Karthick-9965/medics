import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';
import SearchBar from '../../common/SearchBar';
import FilterChipsBar from '../../common/FilterChipsBar';
import EmptyState from '../../common/EmptyState';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';
import SupportContactCards from './SupportContactCards';
import FaqAccordionItem, { FAQItem } from './FaqAccordionItem';

const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'consultation',
    question: 'How do I start a video or audio consultation with my doctor?',
    answer:
      'Go to the Schedule tab, tap your upcoming confirmed appointment, and click "Start Video Call" or "Audio Consultation". Ensure your camera and microphone permissions are granted.',
  },
  {
    id: 'faq_2',
    category: 'consultation',
    question: 'Can I reschedule or cancel my booked appointment?',
    answer:
      'Yes. Open the Schedule tab, select your appointment, and tap "Reschedule" or "Cancel Appointment" at least 2 hours before the scheduled slot to avoid any cancellation charges.',
  },
  {
    id: 'faq_3',
    category: 'prescriptions',
    question: 'Where can I access my digital prescriptions and lab reports?',
    answer:
      'Open Profile > "My Prescriptions & Reports Vault". You can search, view high-resolution Rx sheets, inspect prescribed medications with dosage timings, and upload your own medical documents.',
  },
  {
    id: 'faq_4',
    category: 'prescriptions',
    question: 'Are my health records protected and HIPAA compliant?',
    answer:
      'Yes. All consultations, doctor notes, and uploaded prescription files are secured with 256-bit AES encryption conforming to global healthcare and HIPAA privacy benchmarks.',
  },
  {
    id: 'faq_5',
    category: 'pharmacy',
    question: 'How do I order medicines and track delivery?',
    answer:
      'Tap Pharmacy on the Home screen or upload an Rx sheet. You can browse certified medicines, choose Cash on Delivery or UPI, and track real-time delivery progress under Profile > "My Pharmacy Orders".',
  },
  {
    id: 'faq_6',
    category: 'pharmacy',
    question: 'How long does medicine delivery take?',
    answer:
      'Our partner pharmacies (Apollo Pharmacy, Care Pharma, MedPlus) dispatch rapid orders within 15 to 30 minutes in urban service zones with temperature-controlled packaging.',
  },
  {
    id: 'faq_7',
    category: 'emergency',
    question: 'How do I call an emergency ambulance?',
    answer:
      'On the Home screen, tap the "Ambulance" quick action or call our direct emergency dispatch at 108. You can track GPS vehicle arrival in real time.',
  },
  {
    id: 'faq_8',
    category: 'emergency',
    question: 'What should I do in case of life-threatening emergencies?',
    answer:
      'Immediately dial 108 or our 24/7 hotline 1800-MED-CARE. Do not wait for online chat or video queues during chest pain, severe trauma, or acute breathing difficulty.',
  },
];

const CATEGORY_OPTIONS = [
  { key: 'all', label: 'All Topics' },
  { key: 'consultation', label: 'Consultations' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'emergency', label: 'Emergency' },
];

interface HelpCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Main Help Center & FAQs Modal.
 * Clean, modular architecture composed of SupportContactCards, SearchBar,
 * FilterChipsBar, FaqAccordionItem, and EmptyState.
 */
export default function HelpCenterModal({
  visible,
  onClose,
}: HelpCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: MedicalAlertType;
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:18006332273').catch(() => {
      setAlertConfig({
        visible: true,
        type: 'info',
        icon: 'call',
        title: '24/7 Help Desk',
        message: 'Toll-free patient care helpline: 1800-MED-CARE (1800 633 2273).',
      });
    });
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:108').catch(() => {
      setAlertConfig({
        visible: true,
        type: 'ambulance',
        icon: 'warning',
        title: 'Emergency 108',
        message: 'Connecting to direct ambulance emergency services (108).',
      });
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@medicsapp.com?subject=Telemedicine%20Support%20Request').catch(() => {
      setAlertConfig({
        visible: true,
        type: 'info',
        icon: 'mail-outline',
        title: 'Email Support',
        message: 'Send an email to support@medicsapp.com for any account or billing queries.',
      });
    });
  };

  const handleLiveChat = () => {
    setAlertConfig({
      visible: true,
      type: 'success',
      icon: 'chatbubble-ellipses-outline',
      title: 'Support Desk Connected',
      message:
        'A dedicated medical support executive is reviewing your account. Live chat response average time is under 2 minutes.',
    });
  };

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = faq.question.toLowerCase().includes(q);
      const matchA = faq.answer.toLowerCase().includes(q);
      return matchQ || matchA;
    }
    return true;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <ModalHeader
          title="Help Center & FAQs"
          subtitle="Patient assistance & answers"
          onClose={onClose}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Reusable Contact Support Cards */}
          <Text style={styles.sectionHeading}>Contact Medical Support</Text>
          <SupportContactCards
            onCallSupport={handleCallSupport}
            onCallEmergency={handleCallEmergency}
            onLiveChat={handleLiveChat}
            onEmailSupport={handleEmailSupport}
          />

          {/* Reusable Search Bar */}
          <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
            Frequently Asked Questions
          </Text>
          <View style={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search help topics or questions..."
              onClear={() => setSearchQuery('')}
            />
          </View>

          {/* Reusable Category Filter Chips */}
          <FilterChipsBar
            options={CATEGORY_OPTIONS}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            containerStyle={styles.filterBar}
          />

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFaqs.length === 0 ? (
              <EmptyState
                icon="help-buoy-outline"
                title="No Answers Found"
                subtitle="Try searching with different words or tap our 24/7 Helpline above."
              />
            ) : (
              filteredFaqs.map((faq) => (
                <FaqAccordionItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedId === faq.id}
                  onToggle={() => toggleExpand(faq.id)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Medical Alert Modal */}
        <MedicalAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          icon={alertConfig.icon}
          title={alertConfig.title}
          message={alertConfig.message}
          onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  searchWrap: {
    marginBottom: 4,
  },
  filterBar: {
    marginVertical: 8,
  },
  faqList: {
    marginTop: 6,
  },
});
