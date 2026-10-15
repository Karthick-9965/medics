import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getDynamicBookingDates, MORNING_SLOTS, AFTERNOON_SLOTS, EVENING_SLOTS } from '../../constants/appData';

interface SlotPickerProps {
  selectedDateIndex: number;
  onSelectDate: (index: number) => void;
  selectedTimeSlot: string;
  onSelectTime: (slot: string) => void;
  disablePastSlots?: boolean;
}

/**
 * Checks whether a given slot time (e.g. "09:00 AM" or "04:15 PM")
 * is strictly before current local device time for today.
 */
export const isSlotInPast = (slotStr: string, isToday: boolean): boolean => {
  if (!isToday) return false;
  const match = slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const now = new Date();
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() <= now.getTime();
};

export default function SlotPicker({
  selectedDateIndex,
  onSelectDate,
  selectedTimeSlot,
  onSelectTime,
  disablePastSlots = true,
}: SlotPickerProps) {
  const bookingDates = useMemo(() => getDynamicBookingDates(14), []);
  const isToday = selectedDateIndex === 0;

  const allSlots = useMemo(() => [...MORNING_SLOTS, ...AFTERNOON_SLOTS, ...EVENING_SLOTS], []);

  // When viewing today, if current selection is in the past, auto-switch to first available future slot
  useEffect(() => {
    if (disablePastSlots && isToday) {
      if (isSlotInPast(selectedTimeSlot, true)) {
        const nextAvailable = allSlots.find((s) => !isSlotInPast(s, true));
        if (nextAvailable) {
          onSelectTime(nextAvailable);
        }
      }
    }
  }, [isToday, disablePastSlots, selectedTimeSlot]);

  const areAllSlotsPast = useMemo(() => {
    if (!isToday || !disablePastSlots) return false;
    return allSlots.every((s) => isSlotInPast(s, true));
  }, [isToday, disablePastSlots, allSlots]);

  const handleDateSelect = (index: number) => {
    onSelectDate(index);
    if (disablePastSlots && index === 0) {
      if (isSlotInPast(selectedTimeSlot, true)) {
        const nextAvailable = allSlots.find((s) => !isSlotInPast(s, true));
        if (nextAvailable) {
          onSelectTime(nextAvailable);
        }
      }
    }
  };

  const renderSlotGroup = (title: string, icon: keyof typeof Ionicons.glyphMap, slots: string[]) => (
    <View style={styles.slotGroup}>
      <View style={styles.slotGroupHeader}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        <Text style={styles.slotGroupTitle}>{title}</Text>
      </View>
      <View style={styles.slotsGrid}>
        {slots.map((slot) => {
          const isSelected = selectedTimeSlot === slot;
          const isPast = disablePastSlots && isSlotInPast(slot, isToday);

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotChip,
                isSelected && !isPast && styles.slotChipSelected,
                isPast && styles.slotChipDisabled,
              ]}
              onPress={() => {
                if (!isPast) {
                  onSelectTime(slot);
                }
              }}
              disabled={isPast}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.slotText,
                  isSelected && !isPast && styles.slotTextSelected,
                  isPast && styles.slotTextDisabled,
                ]}
              >
                {slot}
              </Text>
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
              onPress={() => handleDateSelect(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{item.day}</Text>
              <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.timeSectionHeaderRow}>
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Select Available Time Slot</Text>
        {isToday && (
          <Text style={styles.timePastNoticeText}>Past hours disabled for today</Text>
        )}
      </View>

      {areAllSlotsPast && (
        <View style={styles.allPastBanner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.logoutRed} />
          <Text style={styles.allPastBannerText}>
            All appointment slots for today have passed. Please select Tomorrow or another upcoming date above.
          </Text>
        </View>
      )}

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
  timeSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  timePastNoticeText: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 12,
    fontWeight: '500',
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
  allPastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerBgLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  allPastBannerText: {
    fontSize: 12,
    color: Colors.logoutRed,
    fontWeight: '600',
    flex: 1,
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
  slotChipDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.45,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  slotTextSelected: {
    color: Colors.white,
  },
  slotTextDisabled: {
    color: '#9CA3AF',
  },
});
