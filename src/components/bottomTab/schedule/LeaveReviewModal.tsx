import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AppointmentItem } from './AppointmentCard';

interface LeaveReviewModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
  onSubmitReview: (appointmentId: string, rating: number, feedback: string, tags: string[]) => void;
}

const FEEDBACK_TAGS = [
  'Very Professional',
  'Clear Medical Advice',
  'Friendly & Caring',
  'Accurate Diagnosis',
  'Short Wait Time',
  'Great Prescription',
];

const RATING_LABELS: { [key: number]: string } = {
  1: '1.0 - Needs Improvement',
  2: '2.0 - Fair Experience',
  3: '3.0 - Good Consultation',
  4: '4.0 - Very Good & Helpful',
  5: '5.0 - Excellent Medical Care!',
};

export default function LeaveReviewModal({
  visible,
  appointment,
  onClose,
  onSubmitReview,
}: LeaveReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([FEEDBACK_TAGS[0], FEEDBACK_TAGS[1]]);
  const [reviewText, setReviewText] = useState('');

  if (!appointment) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    onSubmitReview(appointment.id, rating, reviewText, selectedTags);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Top Handle */}
          <View style={styles.indicatorWrap}>
            <View style={styles.indicator} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.starIconCircle}>
                <Ionicons name="star" size={20} color="#FFA800" />
              </View>
              <Text style={styles.sheetTitle}>Leave a Review</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Doctor Info Card */}
            <View style={styles.doctorSummaryCard}>
              <Image source={appointment.avatar} style={styles.doctorAvatar} />
              <View style={styles.summaryInfo}>
                <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                <Text style={styles.doctorSpecialty}>{appointment.specialization}</Text>
                <Text style={styles.consultationDate}>
                  Consultation on {appointment.date}
                </Text>
              </View>
            </View>

            {/* Star Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>How was your consultation experience?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#FFA800' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabelText}>{RATING_LABELS[rating] || 'Rate doctor'}</Text>
            </View>

            {/* Quick Feedback Tags */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>What did you like the most?</Text>
              <View style={styles.tagsFlex}>
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={15}
                        color={isSelected ? Colors.white : Colors.secondary}
                      />
                      <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Written Review Input */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Write your Review (Optional)</Text>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Share more details about the diagnosis, doctor's advice, or treatment..."
                placeholderTextColor={Colors.inputPlaceholder}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color={Colors.white} />
              <Text style={styles.submitReviewBtnText}>Submit Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 59, 50, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '90%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  indicator: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerLine,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  doctorSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: Colors.white,
  },
  summaryInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 2,
  },
  consultationDate: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingSection: {
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starTouch: {
    padding: 2,
  },
  ratingLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E09200',
  },
  tagsSection: {
    marginBottom: 18,
  },
  tagsFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  tagTextSelected: {
    color: Colors.white,
  },
  inputSection: {
    marginBottom: 20,
  },
  reviewTextInput: {
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textDark,
    minHeight: 85,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitReviewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
