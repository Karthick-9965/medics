import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';

export type SupportedLanguage = 'en' | 'ta';

interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
  tag: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (US/UK)',
    region: 'International English',
    tag: 'Default',
    flag: '🌐',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'தமிழ்நாடு, இந்தியா',
    tag: 'தமிழ்',
    flag: '🇮🇳',
  },
];

interface LanguageSelectModalProps {
  visible: boolean;
  currentLanguage?: SupportedLanguage;
  onClose: () => void;
  onLanguageChanged?: (lang: SupportedLanguage) => void;
}

export default function LanguageSelectModal({
  visible,
  currentLanguage = 'en',
  onClose,
  onLanguageChanged,
}: LanguageSelectModalProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem('@app_language').then((stored) => {
        if (stored === 'ta' || stored === 'en') {
          setSelectedLang(stored);
        } else {
          setSelectedLang(currentLanguage);
        }
      });
    }
  }, [visible, currentLanguage]);

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem('@app_language', selectedLang);
      onLanguageChanged?.(selectedLang);
    } catch (e) {
      console.log('Error saving language:', e);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="language" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Select App Language</Text>
                  <Text style={styles.subtitle}>மொழியைத் தேர்ந்தெடுக்கவும்</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionNotice}>
                Choose your preferred interface language. Telemedicine alerts, menus, and consult notifications will be customized accordingly.
              </Text>

              {/* Language List */}
              <View style={styles.listContainer}>
                {LANGUAGE_OPTIONS.map((item) => {
                  const isSelected = selectedLang === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.langCard,
                        isSelected && styles.langCardSelected,
                      ]}
                      onPress={() => setSelectedLang(item.id)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.flagBox}>
                        <Text style={styles.flagEmoji}>{item.flag}</Text>
                      </View>

                      <View style={styles.langInfo}>
                        <View style={styles.langNameRow}>
                          <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                            {item.nativeName}
                          </Text>
                          <View style={[styles.badgePill, isSelected && styles.badgePillActive]}>
                            <Text style={[styles.badgePillText, isSelected && styles.badgePillTextActive]}>
                              {item.tag}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.langRegion}>{item.region}</Text>
                      </View>

                      {/* Custom Radio Circle */}
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApply}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                  <Text style={styles.applyBtnText}>
                    {selectedLang === 'ta' ? 'தேர்ந்தெடு' : 'Apply Language'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.blackOverlay55,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: Colors.bgLight,
  },
  sectionNotice: {
    fontSize: 12.5,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 4,
  },
  listContainer: {
    gap: 10,
    marginBottom: 20,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    borderWidth: 1.5,
    borderColor: Colors.transparent,
    gap: 12,
  },
  langCardSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary,
  },
  flagBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
  },
  langInfo: {
    flex: 1,
  },
  langNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  langNameSelected: {
    color: Colors.primary,
  },
  badgePill: {
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillActive: {
    backgroundColor: Colors.primary,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.secondary,
  },
  badgePillTextActive: {
    color: Colors.white,
  },
  langRegion: {
    fontSize: 11.5,
    color: Colors.secondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  applyBtn: {
    flex: 1.4,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
