import React from 'react';
import { StyleSheet, View, Text, Modal, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { ArticleItem } from '../../constants/articlesData';
import ModalHeader from '../common/ModalHeader';

export interface ArticleDetailModalProps {
  visible: boolean;
  article: ArticleItem | null;
  onClose: () => void;
}

/**
 * Reusable modal for displaying full article content.
 * Used in both HomeScreen and SeeAllScreen.
 */
export default function ArticleDetailModal({
  visible,
  article,
  onClose,
}: ArticleDetailModalProps) {
  const insets = useSafeAreaInsets();
  if (!article) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header */}
          <ModalHeader
            title={article.title || 'Article'}
            onClose={onClose}
          />

          {/* Article Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.articleBody}
          >
            <Image source={article.image} style={styles.articleImage} />
            <Text style={styles.articleCategory}>{article.category}</Text>
            <Text style={styles.articleHeadline}>{article.title}</Text>
            <Text style={styles.articleMeta}>
              {article.author || 'Medical Staff'} • {article.date} • {article.readTime}
            </Text>
            <Text style={styles.articleContent}>
              {article.summary || article.title}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
