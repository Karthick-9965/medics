import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface FAQItem {
  id: string;
  category: 'consultation' | 'prescriptions' | 'pharmacy' | 'emergency';
  question: string;
  answer: string;
}

export interface FaqAccordionItemProps {
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Reusable FAQ Accordion Item.
 * Displays expandable question row with rotating chevron indicator and detailed answer box.
 */
export default function FaqAccordionItem({
  faq,
  isExpanded,
  onToggle,
}: FaqAccordionItemProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.questionRow}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.questionLeft}>
          <View style={styles.questionBullet}>
            <Ionicons
              name="help-circle"
              size={16}
              color={isExpanded ? Colors.primary : Colors.secondary}
            />
          </View>
          <Text style={[styles.questionText, isExpanded && styles.questionTextActive]}>
            {faq.question}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={isExpanded ? Colors.primary : Colors.secondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  questionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    lineHeight: 19,
  },
  questionTextActive: {
    color: Colors.primary,
  },
  answerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerLine,
    backgroundColor: Colors.categoryBg,
  },
  answerText: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 20,
  },
});
