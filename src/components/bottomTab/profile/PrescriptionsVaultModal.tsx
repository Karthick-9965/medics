import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import VaultRecordCard from './VaultRecordCard';
import VaultDocumentViewer from './VaultDocumentViewer';

export interface PrescriptionRecord {
  id: string;
  title: string;
  doctorName: string;
  specialization: string;
  date: string;
  uri: string;
  isPdf?: boolean;
  medicines: string[];
  diagnosis?: string;
}

const DEFAULT_RECORDS: PrescriptionRecord[] = [
  {
    id: 'rx_1',
    title: 'General Consultation Rx Sheet',
    doctorName: 'Dr. Marcus Horizon',
    specialization: 'Cardiologist',
    date: '28 Sep 2026',
    uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    isPdf: false,
    medicines: ['Paracetamol 650mg (1-0-1)', 'Amoxicillin 500mg (1-0-1)', 'Vitamin C 500mg'],
    diagnosis: 'Mild Flu & Respiratory Infection',
  },
  {
    id: 'rx_2',
    title: 'Cardio Diagnostic Health Report',
    doctorName: 'Dr. Diandra',
    specialization: 'Cardiologist',
    date: '15 Sep 2026',
    uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    isPdf: false,
    medicines: ['Atorvastatin 10mg (0-0-1)', 'Aspirin 75mg (1-0-0)'],
    diagnosis: 'Routine Lipid Profile & ECG Review',
  },
  {
    id: 'rx_3',
    title: 'Complete Blood Count (CBC) Lab Report',
    doctorName: 'City Care Diagnostics Lab',
    specialization: 'Pathology & Diagnostics',
    date: '02 Sep 2026',
    uri: 'cbc_report.pdf',
    isPdf: true,
    medicines: ['Hemoglobin 14.2 g/dL (Normal)', 'WBC Count 7,200 /mcL (Normal)'],
    diagnosis: 'Annual Routine Health Checkup',
  },
];

interface PrescriptionsVaultModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Main Prescriptions & Lab Reports Vault Modal.
 * Clean, modular architecture composed of VaultRecordCard and VaultDocumentViewer.
 */
export default function PrescriptionsVaultModal({
  visible,
  onClose,
}: PrescriptionsVaultModalProps) {
  const [records, setRecords] = useState<PrescriptionRecord[]>(DEFAULT_RECORDS);
  const [activeTab, setActiveTab] = useState<'all' | 'rx' | 'lab'>('all');
  const [previewItem, setPreviewItem] = useState<PrescriptionRecord | null>(null);

  useEffect(() => {
    if (visible) {
      loadVaultRecords();
    }
  }, [visible]);

  const loadVaultRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem('@app_prescriptions_vault');
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        setRecords(DEFAULT_RECORDS);
      }
    } catch (e) {
      console.log('Error loading prescriptions vault:', e);
    }
  };

  const saveVaultRecords = async (newRecords: PrescriptionRecord[]) => {
    setRecords(newRecords);
    try {
      await AsyncStorage.setItem('@app_prescriptions_vault', JSON.stringify(newRecords));
    } catch (e) {
      console.log('Error saving vault:', e);
    }
  };

  const handleAddNewRecord = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        const newRecord: PrescriptionRecord = {
          id: 'rx_user_' + Date.now(),
          title: 'Prescription Upload',
          doctorName: 'Dr. Consultation',
          specialization: 'Patient Medical Record',
          date: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          uri,
          isPdf: false,
          medicines: ['Uploaded by patient for consultation review'],
          diagnosis: 'General Health Care',
        };
        const updated = [newRecord, ...records];
        saveVaultRecords(updated);
      }
    } catch (e) {
      console.log('Upload record error:', e);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (activeTab === 'rx') return !r.isPdf;
    if (activeTab === 'lab') return !!r.isPdf;
    return true;
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Prescriptions</Text>
            <Text style={styles.headerSubtitle}>Verified Medical Records & Lab Reports</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddNewRecord}
            style={styles.addBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'all' && styles.tabChipActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({records.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'rx' && styles.tabChipActive]}
            onPress={() => setActiveTab('rx')}
          >
            <Text style={[styles.tabText, activeTab === 'rx' && styles.tabTextActive]}>
              Prescriptions ({records.filter((r) => !r.isPdf).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'lab' && styles.tabChipActive]}
            onPress={() => setActiveTab('lab')}
          >
            <Text style={[styles.tabText, activeTab === 'lab' && styles.tabTextActive]}>
              Lab Reports ({records.filter((r) => !!r.isPdf).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prescription Cards List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRecords.map((item) => (
            <VaultRecordCard
              key={item.id}
              record={item}
              onPress={(rec) => setPreviewItem(rec)}
            />
          ))}
        </ScrollView>

        {/* Reusable Full-Screen Document Preview Overlay */}
        <VaultDocumentViewer
          record={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
