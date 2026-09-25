import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { DOCTORS_DATA, DoctorItem } from '../constants/doctorsData';
import { PHARMACIES_DATA, PharmacyItem } from '../constants/pharmaciesData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';
import { ARTICLES_DATA, ArticleItem } from '../constants/articlesData';
import ModalHeader from '../components/common/ModalHeader';
import BookDoctorModal from '../components/home/BookDoctorModal';
import PharmacyOrderModal from '../components/home/PharmacyOrderModal';
import HospitalDirectionsModal from '../components/home/HospitalDirectionsModal';

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
  const handleEmergency = () => (onEmergencyPress ? onEmergencyPress() : navigation?.navigate('Ambulance'));

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
      ? ['All', 'ICU Beds', 'Emergency 24/7']
      : ['All', 'Cardiology', 'Wellness', 'Nutrition'];

  const getFilteredData = (): any[] => {
    const q = searchQuery.toLowerCase();
    if (category === 'doctor') {
      const list = DOCTORS_DATA.filter((d) => {
        const matchesQ =
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
        const matchesQ = p.name.toLowerCase().includes(q) || (p.address && p.address.toLowerCase().includes(q));
        const matchesF = activeFilter === 'All' || (activeFilter === 'Open 24/7' && p.deliveryTime?.includes('24'));
        return matchesQ && matchesF;
      });
    }
    if (category === 'hospital') {
      return HOSPITALS_DATA.filter((h) => {
        const matchesQ = h.name.toLowerCase().includes(q) || (h.address && h.address.toLowerCase().includes(q));
        const matchesF = activeFilter === 'All' || (activeFilter === 'ICU Beds' && (h.availableBeds || 0) > 0);
        return matchesQ && matchesF;
      });
    }
    return ARTICLES_DATA.filter((a) => {
      const matchesQ = a.title.toLowerCase().includes(q) || (a.author && a.author.toLowerCase().includes(q));
      const matchesF = activeFilter === 'All' || a.category.toLowerCase().includes(activeFilter.toLowerCase());
      return matchesQ && matchesF;
    });
  };

  const dataList = getFilteredData();

  const renderDoctorItem = ({ item }: { item: DoctorItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        if (onSelectDoctor) onSelectDoctor(item);
        else setBookingDoctor(item);
      }}
    >
      <View style={styles.thumbWrapper}>
        <Image source={item.image} style={styles.storeThumb} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{item.specialization}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.experience || '8+ yrs exp'} • {item.hospital || 'Care Hospital'}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10.5} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={10.5} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance || '800m away'}</Text>
          </View>
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              if (onSelectDoctor) onSelectDoctor(item);
              else setBookingDoctor(item);
            }}
          >
            <Ionicons name="calendar-outline" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderArticleItem = ({ item }: { item: ArticleItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setSelectedArticle(item)}
    >
      <View style={styles.thumbWrapper}>
        <Image source={item.image} style={styles.storeThumb} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          By {item.author || 'Medical Team'} • Health Guide
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="time-outline" size={10.5} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.readTime}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="calendar-outline" size={10.5} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => setSelectedArticle(item)}
          >
            <Ionicons name="book-outline" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPharmacyItem = ({ item }: { item: PharmacyItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        setOrderingPharmacy(item);
        setPharmacyModalMode('catalog');
      }}
    >
      <View style={styles.thumbWrapper}>
        <Image source={item.image} style={styles.storeThumb} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>Pharmacy & Medicine</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          ⚡ {item.deliveryTime || '15-25 mins'} • Express Delivery
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10.5} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={10.5} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance || '1.2 km'}</Text>
          </View>
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              setOrderingPharmacy(item);
              setPharmacyModalMode('catalog');
            }}
          >
            <Ionicons name="cart" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Order Medicines</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHospitalItem = ({ item }: { item: HospitalItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setDirectionsHospital(item)}
    >
      <View style={styles.thumbWrapper}>
        <Image source={item.image} style={styles.storeThumb} />
        <View style={[styles.storeRxBadge, { backgroundColor: 'rgba(22, 163, 74, 0.92)' }]}>
          <Ionicons name="bed" size={8.5} color={Colors.white} />
          <Text style={styles.storeRxBadgeText}>{item.availableBeds || 12} Beds</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{item.departments?.[0] || 'Hospital'}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          🛏️ {item.availableBeds || 12} ICU Beds • {item.visitingHours || '24/7 Open'}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10.5} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={10.5} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance || '2.5 km'}</Text>
          </View>
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => setDirectionsHospital(item)}
          >
            <Ionicons name="calendar" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Book Visit / Reception</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => {
    switch (category) {
      case 'doctor':
        return renderDoctorItem({ item });
      case 'article':
        return renderArticleItem({ item });
      case 'pharmacy':
        return renderPharmacyItem({ item });
      case 'hospital':
        return renderHospitalItem({ item });
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Search Filter */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.inputPlaceholder} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${getTitle().toLowerCase()}...`}
          placeholderTextColor={Colors.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={styles.clearIconBtn}>
            <Ionicons name="close-circle" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Category Pills */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {filterOptions.map((opt) => {
            const isSelected = activeFilter === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <FlatList
        data={dataList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
          </View>
        }
      />

      {/* Modals */}
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
        onClose={() => setDirectionsHospital(null)}
        onAmbulancePress={handleEmergency}
      />

      {/* Article Detail Modal */}
      <Modal visible={!!selectedArticle} animationType="slide" transparent onRequestClose={() => setSelectedArticle(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ModalHeader title={selectedArticle?.title || 'Article'} onClose={() => setSelectedArticle(null)} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.articleBody}>
              {selectedArticle && (
                <>
                  <Image source={selectedArticle.image} style={styles.articleImage} />
                  <Text style={styles.articleMeta}>{selectedArticle.category} • {selectedArticle.date} • {selectedArticle.readTime}</Text>
                  <Text style={styles.articleContent}>{selectedArticle.summary || selectedArticle.title}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
  },
  headerRightSpace: {
    width: 36,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.black,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  doctorAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  articleThumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 14,
  },
  storeThumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
  },
  storeRxBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 154, 142, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  storeRxBadgeText: {
    color: Colors.white,
    fontSize: 8.5,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 3,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: Colors.secondary,
    fontSize: 10,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 10.5,
    color: Colors.secondary,
    marginLeft: 3,
  },
  metaText: {
    fontSize: 10.5,
    color: Colors.secondary,
    marginTop: 2,
    marginBottom: 6,
  },
  cardActionRow: {
    marginTop: 2,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  actionBtnOutlineText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.secondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  articleBody: {
    padding: 16,
  },
  articleImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },
  articleMeta: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  articleContent: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textDark,
  },
  clearIconBtn: {
    padding: 4,
  },
  filterScrollWrapper: {
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
