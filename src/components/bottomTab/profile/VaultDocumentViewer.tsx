import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { PrescriptionRecord } from './PrescriptionsVaultModal';

export interface VaultDocumentViewerProps {
  record: PrescriptionRecord | null;
  onClose: () => void;
}

/**
 * Reusable Fullscreen Viewer Overlay for inspecting verified prescriptions or lab diagnostic reports.
 */
export default function VaultDocumentViewer({
  record,
  onClose,
}: VaultDocumentViewerProps) {
  if (!record) return null;

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {record.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {record.doctorName}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Document Body */}
        <View style={styles.body}>
          {record.isPdf ? (
            <View style={styles.pdfFullBox}>
              <Ionicons name="document-text" size={70} color={Colors.error} />
              <Text style={styles.pdfFullTitle}>{record.title}</Text>
              <Text style={styles.pdfFullDoctor}>{record.doctorName}</Text>
              <View style={styles.pdfFullBadge}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.successGreen} />
                <Text style={styles.pdfFullBadgeText}>HIPAA Verified Medical Document</Text>
              </View>
              <Text style={styles.pdfFullDate}>Issued Date: {record.date}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: record.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    zIndex: 2000,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  pdfFullBox: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '90%',
  },
  pdfFullTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 12,
    textAlign: 'center',
  },
  pdfFullDoctor: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  pdfFullBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 14,
  },
  pdfFullBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.successDark,
  },
  pdfFullDate: {
    fontSize: 12,
    color: Colors.secondary,
  },
});
