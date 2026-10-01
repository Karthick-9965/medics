import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { PrescriptionRecord } from './PrescriptionsVaultModal';

export interface VaultRecordCardProps {
  record: PrescriptionRecord;
  onPress: (record: PrescriptionRecord) => void;
}

/**
 * Reusable Card component for displaying a single verified Prescription or Lab Report record.
 * Displays doctor specialization, prescription medicines, issue date, and view action.
 */
export default function VaultRecordCard({
  record,
  onPress,
}: VaultRecordCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(record)}
      activeOpacity={0.85}
    >
      {/* 1. Header with Doctor Info & Verified Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <Ionicons
            name={record.isPdf ? 'document-text' : 'medical'}
            size={22}
            color={record.isPdf ? Colors.error : Colors.primary}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={styles.cardDoctor} numberOfLines={1}>
            {record.doctorName} • {record.specialization}
          </Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.successGreen} />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      </View>

      {/* 2. Thumbnail / PDF Box */}
      <View style={styles.thumbWrapper}>
        {record.isPdf ? (
          <View style={styles.pdfCardPlaceholder}>
            <Ionicons name="document-attach" size={32} color={Colors.error} />
            <Text style={styles.pdfText}>Medical PDF Document</Text>
            <Text style={styles.pdfSubtext}>Tap to view digital report</Text>
          </View>
        ) : (
          <Image
            source={{ uri: record.uri }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* 3. Medicines / Findings List */}
      <View style={styles.medicinesBox}>
        <Text style={styles.medicinesHeading}>Prescribed Medicines & Advice:</Text>
        {record.medicines.map((m, idx) => (
          <View key={idx} style={styles.medicineRow}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
            <Text style={styles.medicineText} numberOfLines={1}>
              {m}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.secondary} />
          <Text style={styles.dateText}>{record.date}</Text>
        </View>

        <View style={styles.viewDocBtn}>
          <Ionicons name="eye-outline" size={14} color={Colors.primary} />
          <Text style={styles.viewDocText}>View Record</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  cardDoctor: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  thumbWrapper: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.bgLight,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  pdfCardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
    padding: 16,
    gap: 4,
  },
  pdfText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textDark,
  },
  pdfSubtext: {
    fontSize: 11.5,
    color: Colors.secondary,
  },
  medicinesBox: {
    backgroundColor: Colors.bgPage,
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  medicinesHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medicineText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerLine,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
  },
  viewDocText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
