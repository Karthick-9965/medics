import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import HomeHeader from '../components/home/HomeHeader';
import HomeSearchBar from '../components/home/HomeSearchBar';
import QuickServices from '../components/home/QuickServices';
import HealthBanner from '../components/home/HealthBanner';
import SectionHeader from '../components/home/SectionHeader';
import DoctorCard from '../components/home/DoctorCard';
import ArticleCard from '../components/home/ArticleCard';
import FacilityCard from '../components/home/FacilityCard';
import EmergencyCareCard from '../components/home/EmergencyCareCard';
import HomeSectionCarousel from '../components/home/HomeSectionCarousel';
import HomeModalsContainer from '../components/home/HomeModalsContainer';
import HomeSearchResults, { SearchCategoryFilter } from '../components/home/HomeSearchResults';
import { SeeAllCategory } from './SeeAllScreen';
import { getLoginSession, clearLoginSession } from '../utils/storage';
import { DOCTORS_DATA, DoctorItem } from '../constants/doctorsData';
import { ARTICLES_DATA, ArticleItem } from '../constants/articlesData';
import { PHARMACIES_DATA, PharmacyItem } from '../constants/pharmaciesData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';
import { matchesDoctorSearch, matchesHospitalSearch } from '../utils/searchUtils';


interface HomeProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSeeAll?: (category: SeeAllCategory, query?: string) => void;
  onAmbulancePress?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToNotifications?: () => void;
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [storedName, setStoredName] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<SearchCategoryFilter>('all');

  // Booking & Service Modals
  const [bookingDoctor, setBookingDoctor] = useState<DoctorItem | null>(null);
  const [orderingPharmacy, setOrderingPharmacy] = useState<PharmacyItem | null>(null);
  const [pharmacyModalMode, setPharmacyModalMode] = useState<'prescription' | 'catalog'>('catalog');
  const [directionsHospital, setDirectionsHospital] = useState<HospitalItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const userName = (propName !== undefined && propName !== '') ? propName : (storedName || 'User');

  useEffect(() => {
    const init = async () => {
      const session = await getLoginSession();
      if (session) {
        setStoredName(session.name);
      }
      const av = await AsyncStorage.getItem('@user_avatar');
      if (av) setAvatarUri(av);
    };
    init();
  }, [propName, propEmail]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@user_avatar').then((av) => {
        setAvatarUri(av);
      });
      getLoginSession().then((session) => {
        if (session?.name) setStoredName(session.name);
      });
    }, [])
  );

  const handleGoSeeAll = (category: SeeAllCategory, query?: string) => {
    const q = query !== undefined ? query : (searchQuery.trim() ? searchQuery.trim() : undefined);
    if (onSeeAll) onSeeAll(category, q);
    else navigation?.navigate('SeeAll', { category, query: q });
  };

  const handleGoAmbulance = () => {
    if (onAmbulancePress) onAmbulancePress();
    else navigation?.navigate('Ambulance');
  };

  const handleGoProfile = () => {
    if (onNavigateToProfile) onNavigateToProfile();
    else navigation?.navigate('Main', { screen: 'ProfileTab' });
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
  const filteredDoctors = DOCTORS_DATA.filter((d) =>
    matchesDoctorSearch(d, searchQuery)
  ).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

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

  const filteredHospitals = HOSPITALS_DATA.filter((h) =>
    matchesHospitalSearch(h, searchQuery)
  );

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
        {/* 1. Header with Clickable Avatar / Quick Account -> Goes to My Profile */}
        <HomeHeader
          userName={userName}
          avatarUri={avatarUri}
          onProfilePress={handleGoProfile}
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
          <HomeSearchResults
            searchQuery={searchQuery}
            activeCategoryFilter={activeCategoryFilter}
            searchTabs={SEARCH_TABS}
            totalResults={totalResults}
            filteredDoctors={filteredDoctors}
            filteredPharmacies={filteredPharmacies}
            filteredArticles={filteredArticles}
            filteredHospitals={filteredHospitals}
            onSelectCategoryFilter={setActiveCategoryFilter}
            onClearSearch={() => {
              setSearchQuery('');
              setActiveCategoryFilter('all');
            }}
            onSeeAll={handleGoSeeAll}
            onSelectDoctor={(doctor) => setBookingDoctor(doctor)}
            onSelectPharmacy={(pharmacy) => setOrderingPharmacy(pharmacy)}
            onSelectArticle={(article) => setSelectedArticle(article)}
            onSelectHospital={(hospital) => setDirectionsHospital(hospital)}
          />
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
            <HomeSectionCarousel
              title="Specialists"
              onSeeAllPress={() => handleGoSeeAll('doctor')}
            >
              {DOCTORS_DATA.slice(0, 3).map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  name={doctor.name}
                  specialization={doctor.specialization}
                  image={doctor.image}
                  rating={doctor.rating}
                  distance={doctor.distance}
                  hospital={doctor.hospital}
                  onPress={() => setBookingDoctor(doctor)}
                />
              ))}
            </HomeSectionCarousel>

            {/* 6. Health Article */}
            <HomeSectionCarousel
              title="Health article"
              onSeeAllPress={() => handleGoSeeAll('article')}
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
            </HomeSectionCarousel>

            {/* 7. Pharmacy */}
            <HomeSectionCarousel
              title="Pharmacy"
              onSeeAllPress={() => handleGoSeeAll('pharmacy')}
            >
              {PHARMACIES_DATA.slice(0, 3).map((pharmacy) => (
                <FacilityCard
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
            </HomeSectionCarousel>

            {/* 8. Nearby Hospital */}
            <HomeSectionCarousel
              title="Nearby Hospital"
              onSeeAllPress={() => handleGoSeeAll('hospital')}
            >
              {HOSPITALS_DATA.slice(0, 3).map((hospital) => (
                <FacilityCard
                  key={hospital.id}
                  name={hospital.name}
                  image={hospital.image}
                  rating={hospital.rating}
                  distance={hospital.distance}
                  onPress={() => setDirectionsHospital(hospital)}
                />
              ))}
            </HomeSectionCarousel>

            {/* 9. Emergency Care */}
            <View style={styles.lastSection}>
              <SectionHeader title="Emergency Care" showSeeAll={false} />
              <EmergencyCareCard onGetHelpPress={handleGoAmbulance} />
            </View>
          </>
        )}
      </ScrollView>

      {/* Modular Modals Container */}
      <HomeModalsContainer
        showNotificationsModal={showNotificationsModal}
        onCloseNotificationsModal={() => setShowNotificationsModal(false)}
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

        bookingDoctor={bookingDoctor}
        onCloseBookingDoctor={() => setBookingDoctor(null)}

        orderingPharmacy={orderingPharmacy}
        pharmacyModalMode={pharmacyModalMode}
        onCloseOrderingPharmacy={() => setOrderingPharmacy(null)}

        directionsHospital={directionsHospital}
        onCloseDirectionsHospital={() => setDirectionsHospital(null)}

        selectedArticle={selectedArticle}
        onCloseSelectedArticle={() => setSelectedArticle(null)}

        showLogoutModal={showLogoutModal}
        onCloseLogoutModal={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
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
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
});

