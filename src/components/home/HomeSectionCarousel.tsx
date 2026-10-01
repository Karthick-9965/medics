import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import SectionHeader from './SectionHeader';

export interface HomeSectionCarouselProps {
  title: string;
  onSeeAllPress?: () => void;
  showSeeAll?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable horizontal carousel container for Home screen sections.
 * Automatically wraps SectionHeader and a horizontally scrollable row.
 */
export default function HomeSectionCarousel({
  title,
  onSeeAllPress,
  showSeeAll = true,
  children,
}: HomeSectionCarouselProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        onSeeAllPress={onSeeAllPress}
        showSeeAll={showSeeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
});
