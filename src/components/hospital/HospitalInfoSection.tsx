import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HospitalItem } from '../../constants/hospitalsData';

export interface HospitalInfoSectionProps {
  hospital: HospitalItem;
  onCallReception: () => void;
  onCallEmergency: () => void;
  onAmbulanceDispatch: () => void;
  onSwitchToBook: () => void;
  onOpenGPS: () => void;
}

/**
 * Reusable Hospital Info & Details component.
 * Displays hero image, reception calling desk, emergency helpline, departments, and GPS directions.
 */
export default function HospitalInfoSection({
  hospital,
  onCallReception,
  onCallEmergency,
  onAmbulanceDispatch,
  onSwitchToBook,
  onOpenGPS,
}: HospitalInfoSectionProps) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Image source={hospital.image} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{hospital.name}</Text>
            <Text style={styles.heroAddress}>{hospital.address}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.successGreen} />
                <Text style={styles.badgeText}>Verified 24/7 Hospital</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="navigate" size={13} color={Colors.primary} />
                <Text style={[styles.badgeText, { color: Colors.primary }]}>{hospital.distance}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1. Direct Hospital Reception & Helpdesk Card */}
        <View style={styles.receptionCard}>
          <View style={styles.receptionHeader}>
            <View style={styles.receptionIconCircle}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.receptionTitle}>Hospital Reception & Helpdesk</Text>
              <Text style={styles.receptionPhone}>{hospital.receptionPhone || '+1 (555) 012-4000'}</Text>
              <Text style={styles.receptionSub}>OPD enquiries, doctor schedule & billing</Text>
            </View>
            <TouchableOpacity style={styles.receptionCallBtn} onPress={onCallReception} activeOpacity={0.8}>
              <Ionicons name="call" size={16} color={Colors.white} />
              <Text style={styles.receptionCallBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Direct Emergency SOS & Ambulance Card */}
        <View style={styles.emergencyDeskCard}>
          <View style={styles.emergencyDeskHeader}>
            <View style={styles.deskIconCircle}>
              <Ionicons name="medical" size={20} color={Colors.error} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.emergencyDeskTitle}>24/7 Emergency & Trauma Desk</Text>
              <Text style={styles.emergencyDeskNumber}>{hospital.emergencyPhone || '1066 / 108'}</Text>
            </View>
            <TouchableOpacity style={styles.emergencyCallBtn} onPress={onCallEmergency} activeOpacity={0.8}>
              <Ionicons name="flash" size={15} color={Colors.white} />
              <Text style={styles.emergencyCallBtnText}>Emergency</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.ambulanceDispatchLink}
            onPress={onAmbulanceDispatch}
            activeOpacity={0.8}
          >
            <Ionicons name="medical" size={16} color={Colors.error} />
            <Text style={styles.ambulanceDispatchLinkText}>
              Need an Ambulance? Dispatch now to {hospital.name.split(' ')[0]}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* 3. Quick CTA to Book Visit */}
        <TouchableOpacity
          style={styles.bookVisitPromoBanner}
          onPress={onSwitchToBook}
          activeOpacity={0.85}
        >
          <View style={styles.bookVisitPromoIcon}>
            <Ionicons name="calendar" size={20} color={Colors.white} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bookVisitPromoTitle}>Book OPD Visit / Hospital Token</Text>
            <Text style={styles.bookVisitPromoSub}>Skip the queue • Instant hospital appointment token</Text>
          </View>
          <View style={styles.bookVisitPromoBtn}>
            <Text style={styles.bookVisitPromoBtnText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* 4. Departments Available */}
        {hospital.departments && hospital.departments.length > 0 && (
          <View style={styles.departmentsSection}>
            <Text style={styles.sectionHeading}>Specialty & Super Specialty Departments</Text>
            <View style={styles.deptWrap}>
              {hospital.departments.map((dept, i) => (
                <View key={i} style={styles.deptChip}>
                  <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                  <Text style={styles.deptText}>{dept}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. Location Card */}
        <View style={styles.infoBox}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoBoxTitle}>Location & Address</Text>
            <Text style={styles.infoBoxDesc}>{hospital.address}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.receptionFooterBtn} onPress={onCallReception} activeOpacity={0.8}>
          <Ionicons name="call" size={17} color={Colors.white} />
          <Text style={styles.receptionFooterBtnText}>Call Reception</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigateBtn} onPress={onOpenGPS} activeOpacity={0.8}>
          <Ionicons name="navigate" size={17} color={Colors.primary} />
          <Text style={styles.navigateBtnText}>GPS Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    height: 190,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 14,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  heroAddress: {
    fontSize: 12,
    color: Colors.borderLight,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBgLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.successDark,
  },
  receptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  receptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receptionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.black,
  },
  receptionPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 1,
  },
  receptionSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  receptionCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  receptionCallBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyDeskCard: {
    backgroundColor: Colors.dangerBgLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.dangerBorder,
  },
  emergencyDeskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deskIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.dangerBgTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyDeskTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.error,
  },
  emergencyDeskNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.error,
    marginTop: 1,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  emergencyCallBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  ambulanceDispatchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dangerBgTint,
    gap: 6,
  },
  ambulanceDispatchLinkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  bookVisitPromoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  bookVisitPromoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookVisitPromoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  bookVisitPromoSub: {
    fontSize: 11,
    color: Colors.successBgTint,
    marginTop: 2,
  },
  bookVisitPromoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  bookVisitPromoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  departmentsSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 10,
  },
  deptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  deptText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.bgPage,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 2,
  },
  infoBoxDesc: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 17,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  receptionFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  receptionFooterBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  navigateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  navigateBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
