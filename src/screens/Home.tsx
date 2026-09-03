import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import HomeHeader from '../components/home/HomeHeader';
import HomeSearchBar from '../components/home/HomeSearchBar';
import QuickServices from '../components/home/QuickServices';
import HealthBanner from '../components/home/HealthBanner';
import SectionHeader from '../components/home/SectionHeader';
import DoctorCard, { DoctorCardProps } from '../components/home/DoctorCard';
import ArticleCard, { ArticleCardProps } from '../components/home/ArticleCard';
import PharmacyCard, { PharmacyCardProps } from '../components/home/PharmacyCard';
import HospitalCard, { HospitalCardProps } from '../components/home/HospitalCard';
import EmergencyCareCard from '../components/home/EmergencyCareCard';
import Button from '../components/Button';
import { SeeAllCategory } from './SeeAllScreen';

interface DoctorData extends DoctorCardProps {
  id: string;
}

interface ArticleData extends ArticleCardProps {
  id: string;
}

interface PharmacyData extends PharmacyCardProps {
  id: string;
}

interface HospitalData extends HospitalCardProps {
  id: string;
}

interface HomeProps {
  userName?: string;
  onLogout?: () => void;
  onSeeAll?: (category: SeeAllCategory) => void;
}

// 1. Doctors Data
const doctors: DoctorData[] = [
  {
    id: '1',
    name: 'Dr. Marcus Horizon',
    specialization: 'Cardiologist',
    image: require('../assets/images/home/doctors/marcus-horizon.png'),
    rating: '4.7',
    distance: '800m away',
  },
  {
    id: '2',
    name: 'Dr. Maria Elena',
    specialization: 'Psychologist',
    image: require('../assets/images/home/doctors/maria-elena.png'),
    rating: '4.9',
    distance: '1.5km away',
  },
  {
    id: '3',
    name: 'Dr. Stefi Jessi',
    specialization: 'Orthopedist',
    image: require('../assets/images/home/doctors/stefi-jessi.png'),
    rating: '4.8',
    distance: '2km away',
  },
];

// 2. Health Articles Data
const articles: ArticleData[] = [
  {
    id: '1',
    title: 'The 25 Healthiest Fruits You Can Eat',
    image: require('../assets/images/home/articles/healthy-fruits.png'),
    date: 'Jun 10, 2026',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: '10 Tips To Improve Your Immune System',
    image: require('../assets/images/home/articles/immune-system.png'),
    date: 'Jun 8, 2026',
    readTime: '4 min read',
  },
  {
    id: '3',
    title: 'How To Manage Stress Naturally',
    image: require('../assets/images/home/articles/stress-management.png'),
    date: 'Jun 5, 2026',
    readTime: '6 min read',
  },
];

// 3. Pharmacy Data
const pharmacies: PharmacyData[] = [
  {
    id: '1',
    name: 'HealthPlus Pharmacy',
    image: require('../assets/images/home/pharmacies/healthplus.png'),
    rating: '4.6',
    distance: '800m away',
  },
  {
    id: '2',
    name: 'WellCare Pharmacy',
    image: require('../assets/images/home/pharmacies/wellcare.png'),
    rating: '4.7',
    distance: '1.2km away',
  },
  {
    id: '3',
    name: 'MediLife Pharmacy',
    image: require('../assets/images/home/pharmacies/medilife.png'),
    rating: '4.5',
    distance: '2km away',
  },
];

// 4. Nearby Hospitals Data
const hospitals: HospitalData[] = [
  {
    id: '1',
    name: 'City Care Hospital',
    image: require('../assets/images/home/hospitals/city-care.png'),
    rating: '4.6',
    distance: '1.2km away',
  },
  {
    id: '2',
    name: 'Sunrise Hospital',
    image: require('../assets/images/home/hospitals/sunrise.png'),
    rating: '4.7',
    distance: '1.8km away',
  },
  {
    id: '3',
    name: 'Apollo Hospital',
    image: require('../assets/images/home/hospitals/apollo.png'),
    rating: '4.5',
    distance: '2.5km away',
  },
];

export default function Home({ userName, onLogout, onSeeAll }: HomeProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <HomeHeader userName={userName} />

        {/* 2. Search Bar */}
        <HomeSearchBar />

        {/* 3. Quick Services */}
        <QuickServices />

        {/* 4. Health Promotion Banner */}
        <HealthBanner />

        {/* 5. Top Doctor */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Doctor"
            onSeeAllPress={() => onSeeAll?.('doctor')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                name={doctor.name}
                specialization={doctor.specialization}
                image={doctor.image}
                rating={doctor.rating}
                distance={doctor.distance}
              />
            ))}
          </ScrollView>
        </View>

        {/* 6. Health Article */}
        <View style={styles.section}>
          <SectionHeader
            title="Health article"
            onSeeAllPress={() => onSeeAll?.('article')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                image={article.image}
                date={article.date}
                readTime={article.readTime}
              />
            ))}
          </ScrollView>
        </View>

        {/* 7. Pharmacy */}
        <View style={styles.section}>
          <SectionHeader
            title="Pharmacy"
            onSeeAllPress={() => onSeeAll?.('pharmacy')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {pharmacies.map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                name={pharmacy.name}
                image={pharmacy.image}
                rating={pharmacy.rating}
                distance={pharmacy.distance}
              />
            ))}
          </ScrollView>
        </View>

        {/* 8. Nearby Hospital */}
        <View style={styles.section}>
          <SectionHeader
            title="Nearby Hospital"
            onSeeAllPress={() => onSeeAll?.('hospital')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                name={hospital.name}
                image={hospital.image}
                rating={hospital.rating}
                distance={hospital.distance}
              />
            ))}
          </ScrollView>
        </View>

        {/* 9. Emergency Care */}
        <View style={styles.section}>
          <SectionHeader title="Emergency Care" showSeeAll={false} />
          <EmergencyCareCard />
        </View>

        {/* 10. Log Out Button */}
        {onLogout && (
          <View style={styles.logoutSection}>
            <Button
              title="Log Out"
              variant="outline"
              onPress={onLogout}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
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
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
});
