import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getDynamicBookingDates, MORNING_SLOTS, AFTERNOON_SLOTS, EVENING_SLOTS } from '../../constants/appData';

interface SlotPickerProps {
  selectedDateIndex: number;
  onSelectDate: (index: number) => void;
  selectedTimeSlot: string;
  onSelectTime: (slot: string) => void;
}

export default function SlotPicker({
  selectedDateIndex,
  onSelectDate,
  selectedTimeSlot,
  onSelectTime,
}: SlotPickerProps) {
  const bookingDates = useMemo(() => getDynamicBookingDates(14), []);

  const renderSlotGroup = (title: string, icon: keyof typeof Ionicons.glyphMap, slots: string[]) => (
    <View style={styles.slotGroup}>
      <View style={styles.slotGroupHeader}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        <Text style={styles.slotGroupTitle}>{title}</Text>
      </View>
      <View style={styles.slotsGrid}>
        {slots.map((slot) => {
          const isSelected = selectedTimeSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotChip, isSelected && styles.slotChipSelected]}
              onPress={() => onSelectTime(slot)}
              activeOpacity={0.7}
            >
              <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>{slot}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Select Consultation Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesRow}
        keyboardShouldPersistTaps="handled"
      >
        {bookingDates.map((item, index) => {
          const isSelected = selectedDateIndex === index;
          return (
            <TouchableOpacity
              key={item.fullDate}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => onSelectDate(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{item.day}</Text>
              <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Select Available Time Slot</Text>
      {renderSlotGroup('Morning Slots', 'sunny-outline', MORNING_SLOTS)}
      {renderSlotGroup('Afternoon Slots', 'partly-sunny-outline', AFTERNOON_SLOTS)}
      {renderSlotGroup('Evening Slots', 'moon-outline', EVENING_SLOTS)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  datesRow: {
    gap: 10,
    paddingBottom: 4,
    paddingRight: 10,
  },
  dateCard: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  dateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  dayText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  dateTextSelected: {
    color: Colors.primary,
  },
  slotGroup: {
    marginTop: 14,
  },
  slotGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  slotGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  slotChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  slotTextSelected: {
    color: Colors.white,
  },
});
