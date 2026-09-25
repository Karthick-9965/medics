import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface ArticleCardProps {
  title: string;
  image: any;
  date: string;
  readTime: string;
  onPress?: () => void;
}

export default function ArticleCard({
  title,
  image,
  date,
  readTime,
  onPress,
}: ArticleCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.thumbnail} resizeMode="cover" />
        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={11} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {date} • {readTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 72,
    position: 'relative',
    backgroundColor: Colors.bgLight,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 15,
    marginBottom: 6,
    minHeight: 30,
  },
  meta: {
    fontSize: 9,
    color: Colors.secondary,
  },
});
