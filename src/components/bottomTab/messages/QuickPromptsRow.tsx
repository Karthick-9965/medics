import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export interface QuickPromptItem {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  isUpload?: boolean;
}

export interface QuickPromptsRowProps {
  prompts: QuickPromptItem[];
  onSelectPrompt: (prompt: QuickPromptItem) => void;
}

/**
 * Reusable horizontal chips row for quick chat suggestions/queries.
 */
export default function QuickPromptsRow({ prompts, onSelectPrompt }: QuickPromptsRowProps) {
  return (
    <View style={styles.quickPromptsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickPromptsRow}
      >
        {prompts.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.promptChip, item.isUpload && styles.promptChipUpload]}
            onPress={() => onSelectPrompt(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={13}
              color={item.isUpload ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.promptChipText,
                item.isUpload && styles.promptChipTextUpload,
              ]}
            >
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  quickPromptsWrapper: {
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  quickPromptsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  promptChipUpload: {
    backgroundColor: Colors.primary,
  },
  promptChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  promptChipTextUpload: {
    color: Colors.white,
    fontWeight: '700',
  },
});
