import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';
import ModalHeader from '../../common/ModalHeader';

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
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  if (!appointment) return null;

  const handleSubmit = () => {
    if (onReviewSubmitted) onReviewSubmitted(rating, review);
    if (onSubmit) onSubmit();
    Alert.alert('Review Submitted', 'Thank you for your feedback!');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ModalHeader title="Rate Consultation" subtitle={appointment.doctorName} onClose={onClose} />
          <View style={{ padding: 16 }}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name="star" size={32} color={rating >= star ? '#F59E0B' : Colors.border} />
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
