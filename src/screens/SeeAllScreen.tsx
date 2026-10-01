import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { DOCTORS_DATA, DoctorItem } from '../constants/doctorsData';
import { PHARMACIES_DATA, PharmacyItem } from '../constants/pharmaciesData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';
import { ARTICLES_DATA, ArticleItem } from '../constants/articlesData';
import BookDoctorModal from '../components/home/BookDoctorModal';
import PharmacyOrderModal from '../components/home/PharmacyOrderModal';
import HospitalDirectionsModal from '../components/home/HospitalDirectionsModal';
import ArticleDetailModal from '../components/modals/ArticleDetailModal';
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
        const matchesQ =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.hospital && d.hospital.toLowerCase().includes(q));
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
        const matchesQ = !q || h.name.toLowerCase().includes(q) || (h.address && h.address.toLowerCase().includes(q));
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

      {/* 5. Detail & Booking Modals */}
      <BookDoctorModal
        visible={!!bookingDoctor}
        doctor={bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        onNavigateToSchedule={() => {
          setBookingDoctor(null);
          if (onNavigateToSchedule) onNavigateToSchedule();
        }}
      />

      <PharmacyOrderModal
        visible={!!orderingPharmacy}
        pharmacy={orderingPharmacy}
        initialMode={pharmacyModalMode}
        onClose={() => setOrderingPharmacy(null)}
      />

      <HospitalDirectionsModal
        visible={!!directionsHospital}
        hospital={directionsHospital}
        onEmergencyPress={onEmergencyPress || (() => navigation?.navigate('Ambulance'))}
        onClose={() => setDirectionsHospital(null)}
      />

      <ArticleDetailModal
        visible={!!selectedArticle}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
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
