import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export type SeeAllCategory = 'doctor' | 'article' | 'pharmacy' | 'hospital';

interface SeeAllScreenProps {
  category: SeeAllCategory;
  onBack: () => void;
}

// 1. Doctors List Data (Unique Photos for each doctor)
const doctorsData = [
  {
    id: '1',
    name: 'Dr. Marcus Horizon',
    specialization: 'Cardiologist',
    image: require('../assets/images/home/doctors/marcus-horizon.png'),
    rating: '4.7',
    reviews: '150 Reviews',
    distance: '800m away',
    availableTime: '10:00 AM - 4:00 PM',
  },
  {
    id: '2',
    name: 'Dr. Maria Elena',
    specialization: 'Psychologist',
    image: require('../assets/images/home/doctors/maria-elena.png'),
    rating: '4.9',
    reviews: '210 Reviews',
    distance: '1.5km away',
    availableTime: '11:00 AM - 6:00 PM',
  },
  {
    id: '3',
    name: 'Dr. Stefi Jessi',
    specialization: 'Orthopedist',
    image: require('../assets/images/home/doctors/stefi-jessi.png'),
    rating: '4.8',
    reviews: '180 Reviews',
    distance: '2km away',
    availableTime: '09:00 AM - 3:00 PM',
  },
  {
    id: '4',
    name: 'Dr. Gerty Cori',
    specialization: 'Pediatrician',
    image: require('../assets/images/home/doctors/doctor-gerty.png'),
    rating: '4.6',
    reviews: '95 Reviews',
    distance: '2.8km away',
    availableTime: '10:00 AM - 2:00 PM',
  },
  {
    id: '5',
    name: 'Dr. Diandra Paramitha',
    specialization: 'Dentist',
    image: require('../assets/images/home/doctors/doctor-diandra.png'),
    rating: '4.9',
    reviews: '320 Reviews',
    distance: '3.1km away',
    availableTime: '01:00 PM - 8:00 PM',
  },
];

// 2. Health Articles List Data (Unique Photos for each article)
const articlesData = [
  {
    id: '1',
    title: 'The 25 Healthiest Fruits You Can Eat',
    image: require('../assets/images/home/articles/healthy-fruits.png'),
    date: 'Jun 10, 2026',
    readTime: '5 min read',
    category: 'Nutrition',
  },
  {
    id: '2',
    title: '10 Tips To Improve Your Immune System',
    image: require('../assets/images/home/articles/immune-system.png'),
    date: 'Jun 8, 2026',
    readTime: '4 min read',
    category: 'Wellness',
  },
  {
    id: '3',
    title: 'How To Manage Stress Naturally',
    image: require('../assets/images/home/articles/stress-management.png'),
    date: 'Jun 5, 2026',
    readTime: '6 min read',
    category: 'Mental Health',
  },
  {
    id: '4',
    title: 'The Importance of Regular Health Checkups',
    image: require('../assets/images/home/articles/checkup.png'),
    date: 'Jun 1, 2026',
    readTime: '5 min read',
    category: 'Prevention',
  },
  {
    id: '5',
    title: 'Superfoods to Boost Brain Function & Memory',
    image: require('../assets/images/home/articles/brain-health.png'),
    date: 'May 28, 2026',
    readTime: '7 min read',
    category: 'Brain Health',
  },
];

// 3. Pharmacy List Data (Unique Photos for each pharmacy)
const pharmaciesData = [
  {
    id: '1',
    name: 'HealthPlus Pharmacy',
    image: require('../assets/images/home/pharmacies/healthplus.png'),
    rating: '4.6',
    distance: '800m away',
    status: 'Open 24 Hours',
  },
  {
    id: '2',
    name: 'WellCare Pharmacy',
    image: require('../assets/images/home/pharmacies/wellcare.png'),
    rating: '4.7',
    distance: '1.2km away',
    status: 'Open 08:00 AM - 10:00 PM',
  },
  {
    id: '3',
    name: 'MediLife Pharmacy',
    image: require('../assets/images/home/pharmacies/medilife.png'),
    rating: '4.5',
    distance: '2km away',
    status: 'Open 24 Hours',
  },
  {
    id: '4',
    name: 'CarePharma Express',
    image: require('../assets/images/home/pharmacies/carepharma.png'),
    rating: '4.8',
    distance: '2.7km away',
    status: 'Open 09:00 AM - 11:00 PM',
  },
  {
    id: '5',
    name: 'Apollo Pharmacy',
    image: require('../assets/images/home/pharmacies/apollopharmacy.png'),
    rating: '4.9',
    distance: '3.2km away',
    status: 'Open 24 Hours',
  },
];

// 4. Hospitals List Data (Unique Photos for each hospital)
const hospitalsData = [
  {
    id: '1',
    name: 'City Care Hospital',
    image: require('../assets/images/home/hospitals/city-care.png'),
    rating: '4.6',
    distance: '1.2km away',
    type: 'Emergency & Multi-Specialty',
  },
  {
    id: '2',
    name: 'Sunrise Hospital',
    image: require('../assets/images/home/hospitals/sunrise.png'),
    rating: '4.7',
    distance: '1.8km away',
    type: 'General & Cardiology',
  },
  {
    id: '3',
    name: 'Apollo Hospital',
    image: require('../assets/images/home/hospitals/apollo.png'),
    rating: '4.5',
    distance: '2.5km away',
    type: 'Super Specialty Hospital',
  },
  {
    id: '4',
    name: 'Metro Health Medical Center',
    image: require('../assets/images/home/hospitals/metro-health.png'),
    rating: '4.8',
    distance: '3.5km away',
    type: 'Emergency & Trauma Care',
  },
  {
    id: '5',
    name: 'Grace Memorial Hospital',
    image: require('../assets/images/home/hospitals/grace-memorial.png'),
    rating: '4.6',
    distance: '4.2km away',
    type: 'Pediatric & Maternity Care',
  },
];

export default function SeeAllScreen({ category, onBack }: SeeAllScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getTitle = () => {
    switch (category) {
      case 'doctor':
        return 'Top Doctors';
      case 'article':
        return 'Health Articles';
      case 'pharmacy':
        return 'Pharmacies';
      case 'hospital':
        return 'Nearby Hospitals';
      default:
        return 'All Items';
    }
  };

  const getSearchPlaceholder = () => {
    switch (category) {
      case 'doctor':
        return 'Search doctors by name or specialty...';
      case 'article':
        return 'Search health articles...';
      case 'pharmacy':
        return 'Search pharmacies...';
      case 'hospital':
        return 'Search nearby hospitals...';
    }
  };

  const renderDoctorItem = ({ item }: { item: typeof doctorsData[0] }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.doctorAvatar} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.specialization}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={11} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.timeBadge}>
          <Feather name="clock" size={11} color={Colors.primary} />
          <Text style={styles.timeText}>{item.availableTime}</Text>
        </View>
      </View>
    </View>
  );

  const renderArticleItem = ({ item }: { item: typeof articlesData[0] }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.articleThumb} />
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.metaText}>{item.date} • {item.readTime}</Text>
      </View>
    </View>
  );

  const renderPharmacyItem = ({ item }: { item: typeof pharmaciesData[0] }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.storeThumb} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={11} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHospitalItem = ({ item }: { item: typeof hospitalsData[0] }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.storeThumb} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.type}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={Colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={11} color={Colors.secondary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getData = () => {
    switch (category) {
      case 'doctor':
        return doctorsData.filter((d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'article':
        return articlesData.filter((a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'pharmacy':
        return pharmaciesData.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'hospital':
        return hospitalsData.filter((h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };

  const renderItem = (itemProps: any) => {
    switch (category) {
      case 'doctor':
        return renderDoctorItem(itemProps);
      case 'article':
        return renderArticleItem(itemProps);
      case 'pharmacy':
        return renderPharmacyItem(itemProps);
      case 'hospital':
        return renderHospitalItem(itemProps);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
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
          placeholder={getSearchPlaceholder()}
          placeholderTextColor={Colors.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Items List */}
      <FlatList
        data={getData()}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
          </View>
        }
      />
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
    marginVertical: 14,
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
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
  },
  articleThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
  },
  storeThumb: {
    width: 80,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: Colors.secondary,
  },
  metaText: {
    fontSize: 10.5,
    color: Colors.secondary,
    marginTop: 4,
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
});
