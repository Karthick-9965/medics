import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import HomeHeader from '../components/home/HomeHeader';
import HomeSearchBar from '../components/home/HomeSearchBar';
import QuickServices from '../components/home/QuickServices';
import HealthBanner from '../components/home/HealthBanner';
import SectionHeader from '../components/home/SectionHeader';
import DoctorCard from '../components/home/DoctorCard';
import ArticleCard from '../components/home/ArticleCard';
import PharmacyCard from '../components/home/PharmacyCard';
import HospitalCard from '../components/home/HospitalCard';
import EmergencyCareCard from '../components/home/EmergencyCareCard';
import HomeProfileModal from '../components/home/HomeProfileModal';
import LogoutModal from '../components/modals/LogoutModal';
import NotificationsModal from '../components/home/NotificationsModal';
import BookDoctorModal from '../components/home/BookDoctorModal';
import PharmacyOrderModal from '../components/home/PharmacyOrderModal';
import HospitalDirectionsModal from '../components/home/HospitalDirectionsModal';
import ModalHeader from '../components/common/ModalHeader';
import { SeeAllCategory } from './SeeAllScreen';
import { getLoginSession, clearLoginSession } from '../utils/storage';
import { getUnreadNotificationsCount, subscribeNotifications } from '../services/notificationStorage';
import { DOCTORS_DATA, DoctorItem } from '../constants/doctorsData';
import { ARTICLES_DATA, ArticleItem } from '../constants/articlesData';
import { PHARMACIES_DATA, PharmacyItem } from '../constants/pharmaciesData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';

type SearchCategoryFilter = 'all' | 'doctor' | 'pharmacy' | 'article' | 'hospital';

interface HomeProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSeeAll?: (category: SeeAllCategory, query?: string) => void;
  onAmbulancePress?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToProfile?: () => void;
  navigation?: any;
}

export default function Home({
  userName: propName,
  userEmail: propEmail,
  onLogout,
  onSeeAll,
  onAmbulancePress,
  onNavigateToSchedule,
  onNavigateToMessages,
  onNavigateToProfile,
  navigation,
}: HomeProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showHomeProfileModal, setShowHomeProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [storedName, setStoredName] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<SearchCategoryFilter>('all');

  // Booking & Service Modals
  const [bookingDoctor, setBookingDoctor] = useState<DoctorItem | null>(null);
  const [orderingPharmacy, setOrderingPharmacy] = useState<PharmacyItem | null>(null);
  const [pharmacyModalMode, setPharmacyModalMode] = useState<'prescription' | 'catalog'>('catalog');
  const [directionsHospital, setDirectionsHospital] = useState<HospitalItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const userName = (propName && propName !== 'User') ? propName : (storedName || 'User');
  const effectiveEmail = (propEmail && !propEmail.includes('@example.com')) ? propEmail : (storedEmail || `${userName.toLowerCase().replace(/\s+/g, '')}@example.com`);

  useEffect(() => {
    const init = async () => {
      const session = await getLoginSession();
      if (session) {
        setStoredName(session.name);
        setStoredEmail(session.email);
      }
      const av = await AsyncStorage.getItem('@user_avatar');
      if (av) setAvatarUri(av);
    };
    init();
    getUnreadNotificationsCount().then(setUnreadNotifCount);
    const unsub = subscribeNotifications((list) => setUnreadNotifCount(list.filter((n) => !n.read).length));
    return () => unsub();
  }, [propName, propEmail]);

  const handleGoSeeAll = (category: SeeAllCategory, query?: string) => {
    const q = query !== undefined ? query : (searchQuery.trim() ? searchQuery.trim() : undefined);
    if (onSeeAll) onSeeAll(category, q);
    else navigation?.navigate('SeeAll', { category, query: q });
  };

  const handleGoAmbulance = () => {
    if (onAmbulancePress) onAmbulancePress();
    else navigation?.navigate('Ambulance');
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    else {
      await clearLoginSession();
      navigation?.reset({ index: 0, routes: [{ name: 'GetStarted' }] });
    }
  };

  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.toLowerCase().trim();

  // Multi-category filtering across all 4 categories
  const filteredDoctors = DOCTORS_DATA.filter((d) => {
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.hospital && d.hospital.toLowerCase().includes(q)) ||
      (d.about && d.about.toLowerCase().includes(q))
    );
  }).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

  const filteredPharmacies = PHARMACIES_DATA.filter((p) => {
    const matchesDrugKeyword =
      q.includes('drug') ||
      q.includes('medicine') ||
      q.includes('pharma') ||
      q.includes('tablet') ||
      q.includes('pill');
    return (
      matchesDrugKeyword ||
      p.name.toLowerCase().includes(q) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.openTime && p.openTime.toLowerCase().includes(q)) ||
      (p.deliveryTime && p.deliveryTime.toLowerCase().includes(q))
    );
  });

  const filteredArticles = ARTICLES_DATA.filter((a) => {
    const matchesArticleKeyword =
      q.includes('article') ||
      q.includes('health') ||
      q.includes('tip') ||
      q.includes('news');
    return (
      matchesArticleKeyword ||
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.author && a.author.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q))
    );
  });

  const filteredHospitals = HOSPITALS_DATA.filter((h) => {
    const matchesHospitalKeyword =
      q.includes('hospital') ||
      q.includes('clinic') ||
      q.includes('emergency') ||
      q.includes('icu') ||
      q.includes('bed');
    return (
      matchesHospitalKeyword ||
      h.name.toLowerCase().includes(q) ||
      (h.address && h.address.toLowerCase().includes(q)) ||
      (h.departments && h.departments.some((dep) => dep.toLowerCase().includes(q)))
    );
  });

  const totalResults =
    filteredDoctors.length +
    filteredPharmacies.length +
    filteredArticles.length +
    filteredHospitals.length;

  const SEARCH_TABS: { key: SearchCategoryFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalResults },
    { key: 'doctor', label: 'Doctors', count: filteredDoctors.length },
    { key: 'pharmacy', label: 'Drugs & Pharmacies', count: filteredPharmacies.length },
    { key: 'article', label: 'Articles', count: filteredArticles.length },
    { key: 'hospital', label: 'Hospitals', count: filteredHospitals.length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 1. Header with Clickable Avatar */}
        <HomeHeader
          userName={userName}
          avatarUri={avatarUri}
          unreadCount={unreadNotifCount}
          onProfilePress={() => setShowHomeProfileModal(true)}
          onNotificationPress={() => setShowNotificationsModal(true)}
        />

        {/* 2. Interactive Search Bar for Doctors, Drugs, Articles, Hospitals */}
        <HomeSearchBar
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (!text) setActiveCategoryFilter('all');
          }}
          onClear={() => {
            setSearchQuery('');
            setActiveCategoryFilter('all');
          }}
          onSubmitEditing={() => {
            if (searchQuery.trim()) {
              handleGoSeeAll('doctor', searchQuery.trim());
            }
          }}
        />

        {isSearching ? (
          <>
            {/* Search Summary Header */}
            <View style={styles.searchHeader}>
              <View style={styles.searchHeaderLeft}>
                <Text style={styles.searchTitle}>Search Results</Text>
                <Text style={styles.searchSubtitle}>
                  {totalResults > 0
                    ? `Found ${totalResults} result${totalResults > 1 ? 's' : ''} for "${searchQuery.trim()}"`
                    : `No results for "${searchQuery.trim()}"`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('all');
                }}
                activeOpacity={0.7}
                style={styles.clearBadge}
              >
                <Text style={styles.clearBadgeText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Tabs */}
            <View style={styles.tabsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContent}
              >
                {SEARCH_TABS.map((tab) => {
                  const isSelected = activeCategoryFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.tabChip, isSelected && styles.tabChipActive]}
                      onPress={() => setActiveCategoryFilter(tab.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                        {tab.label} ({tab.count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Empty State */}
            {totalResults === 0 ? (
              <View style={styles.emptySearchContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="search-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.emptySearchTitle}>No results found</Text>
                <Text style={styles.emptySearchSub}>
                  We couldn't find any doctor, drug/pharmacy, article, or hospital matching "{searchQuery.trim()}".
                </Text>
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategoryFilter('all');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* 1. Doctors Results */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'doctor') &&
            filteredDoctors.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={`Doctors (${filteredDoctors.length})`}
                  onSeeAllPress={() => handleGoSeeAll('doctor', searchQuery.trim())}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      name={doctor.name}
                      specialization={doctor.specialization}
                      image={doctor.image}
                      rating={doctor.rating}
                      distance={doctor.distance}
                      onPress={() => setBookingDoctor(doctor)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* 2. Drugs & Pharmacy Results */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'pharmacy') &&
            filteredPharmacies.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={`Drugs & Pharmacies (${filteredPharmacies.length})`}
                  onSeeAllPress={() => handleGoSeeAll('pharmacy', searchQuery.trim())}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {filteredPharmacies.map((pharmacy) => (
                    <PharmacyCard
                      key={pharmacy.id}
                      name={pharmacy.name}
                      image={pharmacy.image}
                      rating={pharmacy.rating}
                      distance={pharmacy.distance}
                      onPress={() => setOrderingPharmacy(pharmacy)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* 3. Health Articles Results */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'article') &&
            filteredArticles.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={`Health Articles (${filteredArticles.length})`}
                  onSeeAllPress={() => handleGoSeeAll('article', searchQuery.trim())}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      title={article.title}
                      image={article.image}
                      date={article.date}
                      readTime={article.readTime}
                      onPress={() => setSelectedArticle(article)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* 4. Hospitals Results */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'hospital') &&
            filteredHospitals.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={`Hospitals (${filteredHospitals.length})`}
                  onSeeAllPress={() => handleGoSeeAll('hospital', searchQuery.trim())}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {filteredHospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id}
                      name={hospital.name}
                      image={hospital.image}
                      rating={hospital.rating}
                      distance={hospital.distance}
                      onPress={() => setDirectionsHospital(hospital)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </>
        ) : (
          <>
            {/* 3. Quick Services */}
            <QuickServices
              onServicePress={(id) => {
                if (id === 'ambulance') handleGoAmbulance();
                else handleGoSeeAll(id as SeeAllCategory);
              }}
            />

            {/* 4. Health Promotion Banner */}
            <HealthBanner />

            {/* 5. Specialists */}
            <View style={styles.section}>
              <SectionHeader
                title="Specialists"
                onSeeAllPress={() => handleGoSeeAll('doctor')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {DOCTORS_DATA.slice(0, 3).map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    name={doctor.name}
                    specialization={doctor.specialization}
                    image={doctor.image}
                    rating={doctor.rating}
                    distance={doctor.distance}
                    onPress={() => setBookingDoctor(doctor)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* 6. Health Article */}
            <View style={styles.section}>
              <SectionHeader
                title="Health article"
                onSeeAllPress={() => handleGoSeeAll('article')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {ARTICLES_DATA.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    image={article.image}
                    date={article.date}
                    readTime={article.readTime}
                    onPress={() => setSelectedArticle(article)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* 7. Pharmacy */}
            <View style={styles.section}>
              <SectionHeader
                title="Pharmacy"
                onSeeAllPress={() => handleGoSeeAll('pharmacy')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {PHARMACIES_DATA.slice(0, 3).map((pharmacy) => (
                  <PharmacyCard
                    key={pharmacy.id}
                    name={pharmacy.name}
                    image={pharmacy.image}
                    rating={pharmacy.rating}
                    distance={pharmacy.distance}
                    onPress={() => {
                      setOrderingPharmacy(pharmacy);
                      setPharmacyModalMode('catalog');
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* 8. Nearby Hospital */}
            <View style={styles.section}>
              <SectionHeader
                title="Nearby Hospital"
                onSeeAllPress={() => handleGoSeeAll('hospital')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {HOSPITALS_DATA.slice(0, 3).map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    name={hospital.name}
                    image={hospital.image}
                    rating={hospital.rating}
                    distance={hospital.distance}
                    onPress={() => setDirectionsHospital(hospital)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* 9. Emergency Care */}
            <View style={styles.section}>
              <SectionHeader title="Emergency Care" showSeeAll={false} />
              <EmergencyCareCard onGetHelpPress={handleGoAmbulance} />
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <HomeProfileModal
        visible={showHomeProfileModal}
        userName={userName}
        userEmail={effectiveEmail}
        avatarUri={avatarUri}
        onClose={() => setShowHomeProfileModal(false)}
        onNavigateToProfile={() => {
          setShowHomeProfileModal(false);
          if (onNavigateToProfile) onNavigateToProfile();
          else navigation?.navigate('Main', { screen: 'ProfileTab' });
        }}
        onLogout={() => {
          setShowHomeProfileModal(false);
          setShowLogoutModal(true);
        }}
      />

      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNavigateToSchedule={() => {
          if (onNavigateToSchedule) onNavigateToSchedule();
          else navigation?.navigate('Main', { screen: 'ScheduleTab' });
        }}
        onNavigateToAmbulance={handleGoAmbulance}
        onNavigateToPharmacy={() => handleGoSeeAll('pharmacy')}
        onNavigateToMessages={() => {
          if (onNavigateToMessages) onNavigateToMessages();
          else navigation?.navigate('Main', { screen: 'MessagesTab' });
        }}
      />

      <BookDoctorModal
        visible={!!bookingDoctor}
        doctor={bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        onNavigateToSchedule={() => {
          setBookingDoctor(null);
          if (onNavigateToSchedule) onNavigateToSchedule();
          else navigation?.navigate('Main', { screen: 'ScheduleTab' });
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
        onAmbulancePress={handleGoAmbulance}
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
                  <Text style={styles.articleCategory}>{selectedArticle.category}</Text>
                  <Text style={styles.articleHeadline}>{selectedArticle.title}</Text>
                  <Text style={styles.articleMeta}>{selectedArticle.author || 'Medical Staff'} • {selectedArticle.date} • {selectedArticle.readTime}</Text>
                  <Text style={styles.articleContent}>{selectedArticle.summary || selectedArticle.title}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchHeaderLeft: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 12.5,
    color: Colors.secondary,
    fontWeight: '500',
  },
  clearBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabsWrapper: {
    marginBottom: 18,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tabChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 45,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySearchSub: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  clearSearchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
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
    padding: 20,
    paddingBottom: 40,
  },
  articleImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    marginBottom: 14,
  },
  articleCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  articleHeadline: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 6,
    lineHeight: 24,
  },
  articleMeta: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 14,
  },
  articleContent: {
    fontSize: 14,
    lineHeight: 23,
    color: Colors.textDark,
  },
});

