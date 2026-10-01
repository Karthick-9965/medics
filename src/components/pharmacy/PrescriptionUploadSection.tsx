import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { PharmacyItem } from '../../constants/pharmaciesData';
import PrescriptionUploadPlaceholder from './PrescriptionUploadPlaceholder';
import PrescriptionAttachedCard from './PrescriptionAttachedCard';
import PharmacyGuaranteeCard from './PharmacyGuaranteeCard';

export interface PrescriptionUploadSectionProps {
  pharmacy: PharmacyItem;
  prescriptionUri: string | null;
  prescriptionNote: string;
  selectedDuration: string;
  requestCall: boolean;
  courseDurations: string[];
  onScanCamera: () => void;
  onUploadGallery: () => void;
  onUploadDocument?: () => void;
  onRemovePrescription: () => void;
  onDurationChange: (duration: string) => void;
  onNoteChange: (note: string) => void;
  onRequestCallToggle: () => void;
  onProceedToCheckout: () => void;
}

/**
 * Fresher-friendly Prescription Upload Section.
 * Coordinates PrescriptionUploadPlaceholder, PrescriptionAttachedCard, and PharmacyGuaranteeCard.
 */
export default function PrescriptionUploadSection({
  pharmacy,
  prescriptionUri,
  prescriptionNote,
  selectedDuration,
  requestCall,
  courseDurations,
  onScanCamera,
  onUploadGallery,
  onUploadDocument,
  onRemovePrescription,
  onDurationChange,
  onNoteChange,
  onRequestCallToggle,
  onProceedToCheckout,
}: PrescriptionUploadSectionProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {!prescriptionUri ? (
        <PrescriptionUploadPlaceholder
          pharmacyName={pharmacy.name}
          onScanCamera={onScanCamera}
          onUploadGallery={onUploadGallery}
          onUploadDocument={onUploadDocument}
        />
      ) : (
        <PrescriptionAttachedCard
          prescriptionUri={prescriptionUri}
          prescriptionNote={prescriptionNote}
          selectedDuration={selectedDuration}
          requestCall={requestCall}
          pharmacyName={pharmacy.name}
          courseDurations={courseDurations}
          onScanCamera={onScanCamera}
          onUploadGallery={onUploadGallery}
          onRemovePrescription={onRemovePrescription}
          onDurationChange={onDurationChange}
          onNoteChange={onNoteChange}
          onRequestCallToggle={onRequestCallToggle}
          onProceedToCheckout={onProceedToCheckout}
        />
      )}

      {/* Safety & Express Delivery Assurance */}
      <PharmacyGuaranteeCard
        pharmacyName={pharmacy.name}
        deliveryTime={pharmacy.deliveryTime}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
});
