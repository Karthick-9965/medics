import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import ModalHeader from '../../common/ModalHeader';
import MedicalAlertModal from '../../modals/MedicalAlertModal';

interface LeaveReviewModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onReviewSubmitted?: (rating: number, review: string) => void;
  onSubmit?: () => void;
}

export default function LeaveReviewModal({
  visible,
  appointment,
  onClose,
  onReviewSubmitted,
  onSubmit,
}: LeaveReviewModalProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  if (!appointment) return null;

  const handleSubmit = () => {
    if (onReviewSubmitted) {
      onReviewSubmitted(rating, review);
      if (onSubmit) onSubmit();
      onClose();
    } else {
      if (onSubmit) onSubmit();
      setAlertConfig({
        visible: true,
        title: 'Review Submitted',
        message: 'Thank you for your valuable consultation feedback!',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <ModalHeader title="Rate Consultation" subtitle={appointment.doctorName} onClose={onClose} />
          <View style={{ padding: 16 }}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name="star" size={32} color={rating >= star ? Colors.warningAmber : Colors.borderLight} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Your Feedback (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="How was your consultation experience?"
              value={review}
              onChangeText={setReview}
              multiline
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Project Themed Medical Alert Modal */}
      <MedicalAlertModal
        visible={alertConfig.visible}
        type="success"
        icon="star"
        iconColor={Colors.warningAmber}
        iconBg={Colors.warningBgLight}
        title={alertConfig.title}
        message={alertConfig.message}
        onPrimaryPress={() => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          onClose();
        }}
        onClose={() => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          onClose();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
