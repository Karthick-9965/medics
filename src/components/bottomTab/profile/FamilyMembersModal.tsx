import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../constants/Colors';
import ModalHeader from '../../common/ModalHeader';
import MedicalAlertModal, { MedicalAlertType } from '../../modals/MedicalAlertModal';

export type RelationshipType =
  | 'Self'
  | 'Spouse'
  | 'Son'
  | 'Daughter'
  | 'Father'
  | 'Mother'
  | 'Brother'
  | 'Sister'
  | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: RelationshipType;
  gender: 'Male' | 'Female' | 'Other';
  age: string;
  phone?: string;
  bloodGroup?: string;
  isDefault?: boolean;
}

export interface FamilyMembersModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userPhone?: string;
  userGender?: string;
}

const RELATIONSHIPS: RelationshipType[] = [
  'Self',
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Other',
];

const GENDERS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

export default function FamilyMembersModal({
  visible,
  onClose,
  userName = 'User',
  userPhone = '',
  userGender = 'Male',
}: FamilyMembersModalProps) {
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Other');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Form Error
  const [errorMessage, setErrorMessage] = useState('');

  // Delete Confirmation State
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: MedicalAlertType;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Load members on visible
  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible]);

  const loadMembers = async () => {
    try {
      const stored = await AsyncStorage.getItem('@app_family_members');
      if (stored) {
        const parsed: FamilyMember[] = JSON.parse(stored);
        setMembers(parsed);
      } else {
        // Seed initial with Self
        const initialSelf: FamilyMember = {
          id: 'self_' + Date.now(),
          name: userName || 'Self',
          relationship: 'Self',
          gender: (userGender as any) || 'Male',
          age: '28',
          phone: userPhone || '',
          bloodGroup: 'O+',
          isDefault: true,
        };
        setMembers([initialSelf]);
        await AsyncStorage.setItem('@app_family_members', JSON.stringify([initialSelf]));
      }
    } catch (e) {
      console.log('Error loading family members:', e);
    }
  };

  const saveMembersList = async (updated: FamilyMember[]) => {
    setMembers(updated);
    try {
      await AsyncStorage.setItem('@app_family_members', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving family members:', e);
    }
  };

  const handleOpenAddForm = () => {
    setEditingMemberId(null);
    setName('');
    setRelationship('Spouse');
    setGender('Female');
    setAge('');
    setPhone('');
    setBloodGroup('');
    setIsDefault(members.length === 0);
    setErrorMessage('');
    setIsFormVisible(true);
  };

  const handleOpenEditForm = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setRelationship(member.relationship);
    setGender(member.gender);
    setAge(member.age || '');
    setPhone(member.phone || '');
    setBloodGroup(member.bloodGroup || '');
    setIsDefault(!!member.isDefault);
    setErrorMessage('');
    setIsFormVisible(true);
  };

  const handleSaveMember = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter the person full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      setErrorMessage('Please enter a valid age (1-120).');
      return;
    }

    setErrorMessage('');

    let updatedList: FamilyMember[] = [];

    if (editingMemberId) {
      // Edit existing
      updatedList = members.map((m) => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name: name.trim(),
            relationship,
            gender,
            age: age.trim(),
            phone: phone.trim(),
            bloodGroup: bloodGroup || undefined,
            isDefault: isDefault ? true : isDefault ? false : m.isDefault,
          };
        }
        return isDefault ? { ...m, isDefault: false } : m;
      });
    } else {
      // Add new
      const newMember: FamilyMember = {
        id: 'member_' + Date.now(),
        name: name.trim(),
        relationship,
        gender,
        age: age.trim(),
        phone: phone.trim(),
        bloodGroup: bloodGroup || undefined,
        isDefault: isDefault || members.length === 0,
      };

      if (isDefault) {
        updatedList = members.map((m) => ({ ...m, isDefault: false }));
        updatedList.push(newMember);
      } else {
        updatedList = [...members, newMember];
      }
    }

    await saveMembersList(updatedList);
    setIsFormVisible(false);

    setAlertConfig({
      visible: true,
      type: 'success',
      title: editingMemberId ? 'Member Updated' : 'Person Added',
      message: `${name.trim()} has been saved to your family members.`,
    });
  };

  const confirmDeleteMember = (member: FamilyMember) => {
    setMemberToDelete(member);
  };

  const executeDeleteMember = async () => {
    if (!memberToDelete) return;
    const filtered = members.filter((m) => m.id !== memberToDelete.id);
    await saveMembersList(filtered);
    setMemberToDelete(null);
    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Member Removed',
      message: `${memberToDelete.name} has been removed.`,
    });
  };

  const handleSetDefault = async (member: FamilyMember) => {
    const updated = members.map((m) => ({
      ...m,
      isDefault: m.id === member.id,
    }));
    await saveMembersList(updated);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'P';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getRelationshipColor = (rel: RelationshipType) => {
    switch (rel) {
      case 'Self':
        return Colors.primary;
      case 'Spouse':
        return '#8B5CF6';
      case 'Son':
      case 'Daughter':
      case 'Child' as any:
        return '#0284C7';
      case 'Father':
      case 'Mother':
        return '#EA580C';
      default:
        return '#4B5563';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ModalHeader title="Family Members & Patients" onClose={onClose} />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconWrapper}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Manage Family & Patients</Text>
              <Text style={styles.bannerSubtitle}>
                Add members to quickly select them when booking doctor appointments and managing health records.
              </Text>
            </View>
          </View>

          {/* Action Header */}
          <View style={styles.actionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Saved Persons</Text>
              <Text style={styles.sectionSubtitle}>
                {members.length} {members.length === 1 ? 'member' : 'members'} registered
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleOpenAddForm}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Person</Text>
            </TouchableOpacity>
          </View>

          {/* Members List */}
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="people-outline" size={42} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No members added yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the "Add Person" button above to add family members or dependents for faster consultation booking.
              </Text>
            </View>
          ) : (
            members.map((member) => {
              const relColor = getRelationshipColor(member.relationship);
              return (
                <View key={member.id} style={styles.memberCard}>
                  {/* Left Avatar */}
                  <View style={[styles.avatarBox, { backgroundColor: relColor + '18' }]}>
                    <Text style={[styles.avatarText, { color: relColor }]}>
                      {getInitials(member.name)}
                    </Text>
                  </View>

                  {/* Middle Info */}
                  <View style={styles.memberInfoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {member.name}
                      </Text>
                      {member.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.tagsRow}>
                      <View style={[styles.relationBadge, { backgroundColor: relColor + '15' }]}>
                        <Text style={[styles.relationText, { color: relColor }]}>
                          {member.relationship}
                        </Text>
                      </View>

                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={styles.metaText}>{member.gender}</Text>

                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={styles.metaText}>{member.age} yrs</Text>

                      {member.bloodGroup && (
                        <>
                          <Text style={styles.metaDivider}>•</Text>
                          <View style={styles.bloodBadge}>
                            <Text style={styles.bloodBadgeText}>{member.bloodGroup}</Text>
                          </View>
                        </>
                      )}
                    </View>

                    {member.phone ? (
                      <View style={styles.phoneRow}>
                        <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.phoneText}>{member.phone}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Right Actions */}
                  <View style={styles.actionsCol}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleOpenEditForm(member)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="create-outline" size={19} color={Colors.textDark} />
                    </TouchableOpacity>

                    {member.relationship !== 'Self' && (
                      <TouchableOpacity
                        style={styles.iconActionBtn}
                        onPress={() => confirmDeleteMember(member)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.logoutRed} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Add / Edit Member Modal Form */}
        <Modal
          visible={isFormVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsFormVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalCardHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={styles.modalHeaderIconBg}>
                    <Ionicons
                      name={editingMemberId ? 'create-outline' : 'person-add-outline'}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.modalCardTitle}>
                    {editingMemberId ? 'Edit Person Details' : 'Add New Person'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsFormVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScrollView}
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {errorMessage ? (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle" size={16} color={Colors.error} />
                    <Text style={styles.errorAlertText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Full Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>
                    Full Name <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter full name"
                    placeholderTextColor={Colors.inputPlaceholder}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </View>

                {/* Relationship Selector */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>
                    Relationship <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <View style={styles.chipsWrapper}>
                    {RELATIONSHIPS.map((rel) => {
                      const isSel = relationship === rel;
                      return (
                        <TouchableOpacity
                          key={rel}
                          style={[styles.choiceChip, isSel && styles.choiceChipActive]}
                          onPress={() => setRelationship(rel)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.choiceChipText,
                              isSel && styles.choiceChipTextActive,
                            ]}
                          >
                            {rel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Gender */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>
                    Gender <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <View style={styles.genderRow}>
                    {GENDERS.map((g) => {
                      const isSel = gender === g;
                      return (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderCard, isSel && styles.genderCardActive]}
                          onPress={() => setGender(g)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={
                              g === 'Male'
                                ? 'man-outline'
                                : g === 'Female'
                                ? 'woman-outline'
                                : 'person-outline'
                            }
                            size={18}
                            color={isSel ? Colors.primary : Colors.textMuted}
                          />
                          <Text
                            style={[
                              styles.genderCardText,
                              isSel && styles.genderCardTextActive,
                            ]}
                          >
                            {g}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Age & Blood Group Row */}
                <View style={styles.rowGroup}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.fieldLabel}>
                      Age (Years) <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. 26"
                      placeholderTextColor={Colors.inputPlaceholder}
                      value={age}
                      onChangeText={(val) => {
                        setAge(val);
                        if (errorMessage) setErrorMessage('');
                      }}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.fieldLabel}>Blood Group</Text>
                    <View style={styles.bloodSelectRow}>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g. O+"
                        placeholderTextColor={Colors.inputPlaceholder}
                        value={bloodGroup}
                        onChangeText={setBloodGroup}
                        maxLength={4}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>

                {/* Quick Blood Group Chips */}
                <View style={[styles.chipsWrapper, { marginTop: -4, marginBottom: 12 }]}>
                  {BLOOD_GROUPS.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.miniBloodChip,
                        bloodGroup === bg && styles.miniBloodChipActive,
                      ]}
                      onPress={() => setBloodGroup(bg === bloodGroup ? '' : bg)}
                    >
                      <Text
                        style={[
                          styles.miniBloodChipText,
                          bloodGroup === bg && styles.miniBloodChipTextActive,
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Phone Number */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Phone Number (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={Colors.inputPlaceholder}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>

                {/* Default Patient Checkbox */}
                <TouchableOpacity
                  style={styles.defaultCheckboxRow}
                  onPress={() => setIsDefault(!isDefault)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkboxBox, isDefault && styles.checkboxBoxActive]}>
                    {isDefault && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Set as default patient for quick appointment booking
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.formActionsRow}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveMember}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                    <Text style={styles.saveBtnText}>
                      {editingMemberId ? 'Update Person' : 'Save Person'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Confirmation Alert Modal */}
        <MedicalAlertModal
          visible={!!memberToDelete}
          type="warning"
          icon="trash-outline"
          iconColor={Colors.logoutRed}
          iconBg={Colors.dangerBgLight}
          title="Remove Family Member?"
          message={`Are you sure you want to remove ${memberToDelete?.name}? This action cannot be undone.`}
          primaryButtonText="Yes, Remove"
          secondaryButtonText="Keep"
          isDestructive
          onPrimaryPress={executeDeleteMember}
          onSecondaryPress={() => setMemberToDelete(null)}
          onClose={() => setMemberToDelete(null)}
        />

        {/* Success/Info Alert */}
        <MedicalAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          primaryButtonText="Done"
          onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  relationBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  bloodBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bloodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.bgLight,
  },
  // Form Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalHeaderIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 6,
  },
  formScrollView: {
    paddingHorizontal: 18,
  },
  formScrollContent: {
    paddingVertical: 16,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorAlertText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  rowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  reqStar: {
    color: Colors.error,
  },
  formInput: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textDark,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  choiceChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  choiceChipText: {
    fontSize: 12.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderCardActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  genderCardText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  genderCardTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bloodSelectRow: {
    position: 'relative',
  },
  miniBloodChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniBloodChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  miniBloodChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  miniBloodChipTextActive: {
    color: Colors.white,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 12.5,
    color: Colors.textDark,
    flex: 1,
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
