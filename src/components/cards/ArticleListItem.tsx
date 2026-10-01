import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ArticleItem } from '../../constants/articlesData';

export interface ArticleListItemProps {
  article: ArticleItem;
  onPress: () => void;
}

/**
 * Reusable vertical card for displaying an Article in lists.
 */
export default function ArticleListItem({
  article,
  onPress,
}: ArticleListItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.thumbWrapper}>
        <Image source={article.image} style={styles.storeThumb} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{article.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{article.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          By {article.author || 'Medical Team'} • Health Guide
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="time-outline" size={10.5} color={Colors.primary} />
            <Text style={styles.ratingText}>{article.readTime}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="calendar-outline" size={10.5} color={Colors.secondary} />
            <Text style={styles.distanceText}>{article.date}</Text>
          </View>
        </View>
        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={12} color={Colors.white} />
            <Text style={styles.actionBtnText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  storeThumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
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
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
