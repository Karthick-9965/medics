import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { DOCTORS_DATA, DoctorItem } from '../constants/doctorsData';
import { PHARMACIES_DATA, PharmacyItem } from '../constants/pharmaciesData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';
import { ARTICLES_DATA, ArticleItem } from '../constants/articlesData';
import { INITIAL_CHAT_MESSAGES } from '../constants/messagesData';
import { matchesDoctorSearch, matchesHospitalSearch } from '../utils/searchUtils';
import { generateDoctorReply } from '../utils/doctorReplyEngine';
import { sendDoctorMessageNotification } from '../services/notificationManager';
import SeeAllModalsContainer from '../components/seeall/SeeAllModalsContainer';
import { ChatMessage } from '../constants/messagesData';
import FilterChipsBar from '../components/common/FilterChipsBar';
import ScreenHeader from '../components/common/ScreenHeader';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';
import DoctorListItem from '../components/cards/DoctorListItem';
import ArticleListItem from '../components/cards/ArticleListItem';
import FacilityListItem from '../components/cards/FacilityListItem';

export type SeeAllCategory = 'doctor' | 'article' | 'pharmacy' | 'hospital';

interface SeeAllScreenProps {
  category?: SeeAllCategory;
  initialQuery?: string;
  onBack?: () => void;
  onSelectDoctor?: (doctor: DoctorItem) => void;
  onCallDoctor?: (doctor: DoctorItem) => void;
  onChatDoctor?: (doctor: DoctorItem) => void;
  onEmergencyPress?: () => void;
  onNavigateToSchedule?: () => void;
  navigation?: any;
  route?: any;
}

/**
 * Clean & modular SeeAllScreen.
 * Displays searchable & filterable listings for Doctors, Pharmacies, Hospitals, and Articles.
 */
export default function SeeAllScreen({
  category: propCat,
  initialQuery,
  onBack,
  onSelectDoctor,
  onCallDoctor,
  onChatDoctor,
  onEmergencyPress,
  onNavigateToSchedule,
  navigation,
  route,
}: SeeAllScreenProps) {
  const category: SeeAllCategory = propCat || route?.params?.category || 'doctor';

  const handleGoBack = () => (onBack ? onBack() : navigation?.goBack());

  const [searchQuery, setSearchQuery] = useState(initialQuery || route?.params?.query || '');
  const [activeFilter, setActiveFilter] = useState('All');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorItem | null>(null);
  const [orderingPharmacy, setOrderingPharmacy] = useState<PharmacyItem | null>(null);
  const [pharmacyModalMode, setPharmacyModalMode] = useState<'prescription' | 'catalog'>('catalog');
  const [directionsHospital, setDirectionsHospital] = useState<HospitalItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  // Audio / Video Call & In-App Doctor Chat State
  const [callingDoctor, setCallingDoctor] = useState<DoctorItem | null>(null);
  const [videoCallingDoctor, setVideoCallingDoctor] = useState<DoctorItem | null>(null);
  const [chatDoctor, setChatDoctor] = useState<DoctorItem | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [id: string]: ChatMessage[] }>(INITIAL_CHAT_MESSAGES);
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@app_chat_messages').then((stored) => {
      if (stored) {
        try {
          setChatMessages({ ...INITIAL_CHAT_MESSAGES, ...JSON.parse(stored) });
        } catch (e) {
          console.log('Error parsing stored chat messages:', e);
        }
      }
    });
  }, []);

  const handleCallDoctor = (doctor: DoctorItem) => {
    if (onCallDoctor) {
      onCallDoctor(doctor);
    } else {
      setCallingDoctor(doctor);
    }
  };

  const handleChatDoctor = (doctor: DoctorItem) => {
    if (onChatDoctor) {
      onChatDoctor(doctor);
    } else {
      setChatDoctor(doctor);
    }
  };

  const handleSendMessageToDoctor = async (
    text: string,
    image?: string,
    isPrescription?: boolean,
    prescriptionName?: string
  ) => {
    if (!chatDoctor) return;
    const docId = chatDoctor.id;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      sender: 'user',
      text,
      time: nowTime,
      image,
      isPrescription,
      prescriptionName,
    };

    const currentDocMessages = chatMessages[docId] || [
      {
        sender: 'doctor',
        text: `Hello! I am ${chatDoctor.name}, ${chatDoctor.specialization} at ${chatDoctor.hospital || 'Care Hospital'}. How can I assist you with your health today?`,
        time: nowTime,
      },
    ];

    const updated = [...currentDocMessages, newMsg];
    const newChatState = { ...chatMessages, [docId]: updated };
    setChatMessages(newChatState);
    await AsyncStorage.setItem('@app_chat_messages', JSON.stringify(newChatState));

    setIsDoctorTyping(true);
    setTimeout(async () => {
      setIsDoctorTyping(false);
      const replyText = generateDoctorReply(text, chatDoctor.name, chatDoctor.specialization);
      const replyMsg: ChatMessage = {
        sender: 'doctor',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updated, replyMsg];
      const finalState = { ...chatMessages, [docId]: finalMessages };
      setChatMessages(finalState);
      await AsyncStorage.setItem('@app_chat_messages', JSON.stringify(finalState));
      await sendDoctorMessageNotification({
        senderName: chatDoctor.name,
        specialization: chatDoctor.specialization,
        message: replyText,
        conversationId: docId,
      });
    }, 1200);
  };

  const handleDeleteChatMessage = (messageIndex: number) => {
    if (!chatDoctor) return;
    const docId = chatDoctor.id;
    const updated = (chatMessages[docId] || []).filter((_, idx) => idx !== messageIndex);
    const newState = { ...chatMessages, [docId]: updated };
    setChatMessages(newState);
    AsyncStorage.setItem('@app_chat_messages', JSON.stringify(newState));
  };

  // Pharmacy Call & Chat Consultation State
  const [callingPharmacy, setCallingPharmacy] = useState<PharmacyItem | null>(null);
  const [chatPharmacy, setChatPharmacy] = useState<PharmacyItem | null>(null);

  const handleCallPharmacy = (pharmacy: PharmacyItem) => {
    setCallingPharmacy(pharmacy);
  };

  const handleChatPharmacy = (pharmacy: PharmacyItem) => {
    setChatPharmacy(pharmacy);
  };

  const handleSendPharmacyMessage = async (
    text: string,
    image?: string,
    isPrescription?: boolean,
    prescriptionName?: string
  ) => {
    if (!chatPharmacy) return;
    const pharmacyChatId = `pharmacy_${chatPharmacy.id}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      sender: 'user',
      text,
      time: nowTime,
      image,
      isPrescription,
      prescriptionName,
    };

    const currentMessages = chatMessages[pharmacyChatId] || [
      {
        sender: 'doctor',
        text: `Welcome to ${chatPharmacy.name}! Our licensed pharmacist is available to answer your prescription questions or prepare medicine delivery. How can we help?`,
        time: nowTime,
      },
    ];

    const updated = [...currentMessages, newMsg];
    const newChatState = { ...chatMessages, [pharmacyChatId]: updated };
    setChatMessages(newChatState);
    await AsyncStorage.setItem('@app_chat_messages', JSON.stringify(newChatState));

    setIsDoctorTyping(true);
    setTimeout(async () => {
      setIsDoctorTyping(false);
      let replyText = `Thank you for contacting ${chatPharmacy.name}. Your medicine inquiry has been received. Standard doorstep delivery takes ${chatPharmacy.deliveryTime || '15-25 mins'}.`;
      if (isPrescription) {
        replyText = `We have received your prescription document at ${chatPharmacy.name}. Our pharmacist is validating dosage and preparing your order now.`;
      }
      const replyMsg: ChatMessage = {
        sender: 'doctor',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updated, replyMsg];
      const finalState = { ...chatMessages, [pharmacyChatId]: finalMessages };
      setChatMessages(finalState);
      await AsyncStorage.setItem('@app_chat_messages', JSON.stringify(finalState));
      await sendDoctorMessageNotification({
        senderName: chatPharmacy.name,
        specialization: 'Licensed Pharmacy Desk',
        message: replyText,
        conversationId: pharmacyChatId,
      });
    }, 1200);
  };

  const handleDeletePharmacyChatMessage = (messageIndex: number) => {
    if (!chatPharmacy) return;
    const pharmacyChatId = `pharmacy_${chatPharmacy.id}`;
    const updated = (chatMessages[pharmacyChatId] || []).filter((_, idx) => idx !== messageIndex);
    const newState = { ...chatMessages, [pharmacyChatId]: updated };
    setChatMessages(newState);
    AsyncStorage.setItem('@app_chat_messages', JSON.stringify(newState));
  };

  // Hospital Reception Call State
  const [callingHospital, setCallingHospital] = useState<HospitalItem | null>(null);

  const handleCallHospital = (hospital: HospitalItem) => {
    const phone = hospital.receptionPhone || hospital.emergencyPhone || '+1 (555) 012-4000';
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      // Fallback to in-app audio call simulation if device has no cellular dialer
      setCallingHospital(hospital);
    });
  };

  const handleMailHospital = (hospital: HospitalItem) => {
    const email = hospital.email || 'reception@hospitalcare.org';
    const subject = encodeURIComponent(`Inquiry - ${hospital.name} Reception`);
    const body = encodeURIComponent(
      `Dear ${hospital.name} Reception Desk,\n\nI would like to inquire about hospital services and doctor appointments.\n\nThank you,\nPatient`
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch((err) => {
      console.log('Error opening mail client:', err);
    });
  };

  const getTitle = () => {
    switch (category) {
      case 'doctor': return 'Specialists';
      case 'pharmacy': return 'Nearby Pharmacies';
      case 'hospital': return 'Nearby Hospitals';
      case 'article': return 'Health Articles';
    }
  };

  const filterOptions =
    category === 'doctor'
      ? ['All', 'Psychologist', 'Pediatrician', 'Neurologist', 'Orthopedist', 'Dermatologist', 'Cardiologist', 'General', 'Dentist']
      : category === 'pharmacy'
      ? ['All', 'Open 24/7', 'Home Delivery']
      : category === 'hospital'
      ? ['All', 'Emergency 24/7', 'Super Specialty', 'General']
      : ['All', 'Cardiology', 'Wellness', 'Nutrition'];

  const getFilteredData = (): any[] => {
    const q = searchQuery.toLowerCase().trim();
    if (category === 'doctor') {
      const list = DOCTORS_DATA.filter((d) => {
        const matchesQ = !q || matchesDoctorSearch(d, searchQuery);
        const matchesF =
          activeFilter === 'All' ||
          d.specialization.toLowerCase().includes(activeFilter.toLowerCase());
        return matchesQ && matchesF;
      });
      return list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    if (category === 'pharmacy') {
      return PHARMACIES_DATA.filter((p) => {
        const matchesQ = !q || p.name.toLowerCase().includes(q) || (p.address && p.address.toLowerCase().includes(q));
        const matchesF = activeFilter === 'All' || (activeFilter === 'Open 24/7' && p.deliveryTime?.includes('24'));
        return matchesQ && matchesF;
      });
    }
    if (category === 'hospital') {
      return HOSPITALS_DATA.filter((h) => {
        const matchesQ = !q || matchesHospitalSearch(h, searchQuery);
        const matchesF =
          activeFilter === 'All' ||
          (activeFilter === 'Emergency 24/7' &&
            (h.visitingHours?.includes('24/7') ||
              h.departments?.some((d) => d.toLowerCase().includes('emergency')))) ||
          (activeFilter === 'Super Specialty' &&
            h.hospitalType?.toLowerCase().includes('specialty')) ||
          (activeFilter === 'General' &&
            (h.hospitalType?.toLowerCase().includes('general') ||
              h.hospitalType?.toLowerCase().includes('community')));
        return matchesQ && matchesF;
      });
    }
    return ARTICLES_DATA.filter((a) => {
      const matchesQ = !q || a.title.toLowerCase().includes(q) || (a.author && a.author.toLowerCase().includes(q));
      const matchesF = activeFilter === 'All' || a.category.toLowerCase().includes(activeFilter.toLowerCase());
      return matchesQ && matchesF;
    });
  };

  const dataList = getFilteredData();

  const renderItem = ({ item }: any) => {
    switch (category) {
      case 'doctor':
        return (
          <DoctorListItem
            doctor={item}
            onPress={() => (onSelectDoctor ? onSelectDoctor(item) : setBookingDoctor(item))}
            onBookPress={() => (onSelectDoctor ? onSelectDoctor(item) : setBookingDoctor(item))}
            onCallPress={() => handleCallDoctor(item)}
            onChatPress={() => handleChatDoctor(item)}
          />
        );
      case 'article':
        return (
          <ArticleListItem
            article={item}
            onPress={() => setSelectedArticle(item)}
          />
        );
      case 'pharmacy':
        return (
          <FacilityListItem
            image={item.image}
            title={item.name}
            subtitle={`${item.deliveryTime || '15-25 mins'} • Express Delivery`}
            subtitleIcon="flash"
            subtitleIconColor={Colors.warningAmber}
            rating={item.rating}
            distance={item.distance || '1.2 km'}
            action={{
              label: 'Order Medicines',
              icon: 'cart',
              onPress: () => {
                setOrderingPharmacy(item);
                setPharmacyModalMode('catalog');
              },
            }}
            onCallPress={() => handleCallPharmacy(item)}
            onChatPress={() => handleChatPharmacy(item)}
            onPress={() => {
              setOrderingPharmacy(item);
              setPharmacyModalMode('catalog');
            }}
          />
        );
      case 'hospital':
        return (
          <FacilityListItem
            image={item.image}
            title={item.name}
            category={item.departments?.[0] || 'Hospital'}
            subtitle={item.visitingHours || '24/7 Open • Emergency Services'}
            subtitleIcon="time-outline"
            subtitleIconColor={Colors.primary}
            rating={item.rating}
            distance={item.distance || '2.5 km'}
            action={{
              label: 'Book Visit / Reception',
              icon: 'calendar',
              onPress: () => setDirectionsHospital(item),
            }}
            onCallPress={() => handleCallHospital(item)}
            onMailPress={() => handleMailHospital(item)}
            onPress={() => setDirectionsHospital(item)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Unified Screen Header */}
      <ScreenHeader
        title={getTitle()}
        onBack={handleGoBack}
        iconName="arrow-back"
      />

      {/* 2. Unified Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${getTitle().toLowerCase()}...`}
        />
      </View>

      {/* 3. Filter Category Pills */}
      <FilterChipsBar
        options={filterOptions}
        selected={activeFilter}
        onSelect={setActiveFilter}
        containerStyle={styles.filterScrollWrapper}
      />

      {/* 4. Main Results List */}
      <FlatList
        data={dataList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Results Found"
            subtitle={`We couldn't find any results matching "${searchQuery}".`}
          />
        }
      />

      {/* Modals & Consultations Container */}
      <SeeAllModalsContainer
        bookingDoctor={bookingDoctor}
        onCloseBookingDoctor={() => setBookingDoctor(null)}
        onNavigateToSchedule={() => {
          setBookingDoctor(null);
          if (onNavigateToSchedule) onNavigateToSchedule();
        }}
        orderingPharmacy={orderingPharmacy}
        pharmacyModalMode={pharmacyModalMode}
        onCloseOrderingPharmacy={() => setOrderingPharmacy(null)}
        directionsHospital={directionsHospital}
        onCloseDirectionsHospital={() => setDirectionsHospital(null)}
        onEmergencyPress={onEmergencyPress || (() => navigation?.navigate('Ambulance'))}
        selectedArticle={selectedArticle}
        onCloseSelectedArticle={() => setSelectedArticle(null)}
        callingDoctor={callingDoctor}
        onEndCallingDoctor={() => setCallingDoctor(null)}
        onSwitchDoctorToVideo={() => {
          const doc = callingDoctor;
          setCallingDoctor(null);
          setVideoCallingDoctor(doc);
        }}
        videoCallingDoctor={videoCallingDoctor}
        onEndVideoDoctor={() => setVideoCallingDoctor(null)}
        onSwitchDoctorToAudio={() => {
          const doc = videoCallingDoctor;
          setVideoCallingDoctor(null);
          setCallingDoctor(doc);
        }}
        chatDoctor={chatDoctor}
        chatMessages={chatMessages}
        isDoctorTyping={isDoctorTyping}
        onCloseChatDoctor={() => setChatDoctor(null)}
        onSendMessageToDoctor={handleSendMessageToDoctor}
        onDeleteChatMessage={handleDeleteChatMessage}
        onAudioCallDoctor={() => {
          const doc = chatDoctor;
          setChatDoctor(null);
          setCallingDoctor(doc);
        }}
        onVideoCallDoctor={() => {
          const doc = chatDoctor;
          setChatDoctor(null);
          setVideoCallingDoctor(doc);
        }}
        callingPharmacy={callingPharmacy}
        onEndCallingPharmacy={() => setCallingPharmacy(null)}
        chatPharmacy={chatPharmacy}
        onCloseChatPharmacy={() => setChatPharmacy(null)}
        onSendPharmacyMessage={handleSendPharmacyMessage}
        onDeletePharmacyChatMessage={handleDeletePharmacyChatMessage}
        onAudioCallPharmacy={() => {
          const ph = chatPharmacy;
          setChatPharmacy(null);
          setCallingPharmacy(ph);
        }}
        callingHospital={callingHospital}
        onEndCallingHospital={() => setCallingHospital(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterScrollWrapper: {
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
});
