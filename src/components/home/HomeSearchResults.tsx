import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import SectionHeader from './SectionHeader';
import EmptyState from '../common/EmptyState';
import DoctorCard from './DoctorCard';
import ArticleCard from './ArticleCard';
import FacilityCard from './FacilityCard';
import { DoctorItem } from '../../constants/doctorsData';
import { PharmacyItem } from '../../constants/pharmaciesData';
import { ArticleItem } from '../../constants/articlesData';
import { HospitalItem } from '../../constants/hospitalsData';
import { SeeAllCategory } from '../../screens/SeeAllScreen';

export type SearchCategoryFilter = 'all' | 'doctor' | 'pharmacy' | 'article' | 'hospital';

export interface SearchTabItem {
  key: SearchCategoryFilter;
  label: string;
  count: number;
}

export interface HomeSearchResultsProps {
  searchQuery: string;
  activeCategoryFilter: SearchCategoryFilter;
  searchTabs: SearchTabItem[];
  totalResults: number;
  filteredDoctors: DoctorItem[];
  filteredPharmacies: PharmacyItem[];
  filteredArticles: ArticleItem[];
  filteredHospitals: HospitalItem[];
  onSelectCategoryFilter: (filter: SearchCategoryFilter) => void;
  onClearSearch: () => void;
  onSeeAll: (category: SeeAllCategory, query?: string) => void;
  onSelectDoctor: (doctor: DoctorItem) => void;
  onSelectPharmacy: (pharmacy: PharmacyItem) => void;
  onSelectArticle: (article: ArticleItem) => void;
  onSelectHospital: (hospital: HospitalItem) => void;
}

/**
 * Reusable HomeSearchResults component.
 * Displays category tabs, empty state, and result sections for doctors, pharmacies, articles, and hospitals.
 */
export default function HomeSearchResults({
  searchQuery,
  activeCategoryFilter,
  searchTabs,
  totalResults,
  filteredDoctors,
  filteredPharmacies,
  filteredArticles,
  filteredHospitals,
  onSelectCategoryFilter,
  onClearSearch,
  onSeeAll,
  onSelectDoctor,
  onSelectPharmacy,
  onSelectArticle,
  onSelectHospital,
}: HomeSearchResultsProps) {
  const trimmed = searchQuery.trim();

  return (
    <>
      {/* Search Summary Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchHeaderLeft}>
          <Text style={styles.searchTitle}>Search Results</Text>
          <Text style={styles.searchSubtitle}>
            {totalResults > 0
              ? `Found ${totalResults} result${totalResults > 1 ? 's' : ''} for "${trimmed}"`
              : `No results for "${trimmed}"`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClearSearch}
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
          {searchTabs.map((tab) => {
            const isSelected = activeCategoryFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => onSelectCategoryFilter(tab.key)}
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
        <EmptyState
          icon="search-outline"
          title="No results found"
          subtitle={`We couldn't find any doctor, drug/pharmacy, article, or hospital matching "${trimmed}".`}
          actionLabel="Clear Search"
          onAction={onClearSearch}
        />
      ) : null}

      {/* 1. Doctors Results */}
      {(activeCategoryFilter === 'all' || activeCategoryFilter === 'doctor') &&
      filteredDoctors.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title={`Doctors (${filteredDoctors.length})`}
            onSeeAllPress={() => onSeeAll('doctor', trimmed)}
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
                hospital={doctor.hospital}
                onPress={() => onSelectDoctor(doctor)}
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
            onSeeAllPress={() => onSeeAll('pharmacy', trimmed)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {filteredPharmacies.map((pharmacy) => (
              <FacilityCard
                key={pharmacy.id}
                name={pharmacy.name}
                image={pharmacy.image}
                rating={pharmacy.rating}
                distance={pharmacy.distance}
                onPress={() => onSelectPharmacy(pharmacy)}
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
            onSeeAllPress={() => onSeeAll('article', trimmed)}
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
                onPress={() => onSelectArticle(article)}
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
            onSeeAllPress={() => onSeeAll('hospital', trimmed)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {filteredHospitals.map((hospital) => (
              <FacilityCard
                key={hospital.id}
                name={hospital.name}
                image={hospital.image}
                rating={hospital.rating}
                distance={hospital.distance}
                onPress={() => onSelectHospital(hospital)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 14,
  },
  clearBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textDark,
  },
  tabChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
