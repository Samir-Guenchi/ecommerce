import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { addressAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';

interface LocationsScreenProps {
  goBack?: () => void;
}

const LocationIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19" stroke={COLORS.background} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12H19" stroke={COLORS.background} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 6L18 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LocationsScreen = ({ goBack }: LocationsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  // Form
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Algeria');

  const loadLocations = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await addressAPI.getAllAddresses();
      setLocations(response.addresses || []);
    } catch (error: any) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadLocations(); }, []);

  const resetForm = () => {
    setName(''); setAddressLine1(''); setAddressLine2('');
    setCity(''); setStateProvince(''); setPostalCode(''); setCountry('Algeria');
  };

  const handleAddLocation = async () => {
    if (!name.trim()) { showError('Please enter a location name.'); return; }
    if (!addressLine1.trim()) { showError('Please enter an address.'); return; }
    if (!city.trim()) { showError('Please enter a city.'); return; }

    try {
      setSaving(true);
      await addressAPI.createAddress({
        name: name.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        stateProvince: stateProvince.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim(),
        isDefault: locations.length === 0,
      });
      showSuccess('Location added successfully.');
      setShowAddModal(false);
      resetForm();
      await loadLocations();
    } catch (error: any) {
      showError(error.message || 'Failed to add location.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressAPI.updateAddress(id, { isDefault: true });
      showSuccess('Location set as default.');
      await loadLocations();
    } catch (error: any) {
      showError(error.message || 'Failed to set default location.');
    }
  };

  const handleRemove = async (id: number) => {
    const confirmed = await confirmAction('Remove Location', 'Are you sure you want to remove this location?');
    if (!confirmed) return;
    try {
      await addressAPI.deleteAddress(id);
      showSuccess('Location removed.');
      await loadLocations();
    } catch (error: any) {
      showError(error.message || 'Failed to remove location.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLocations(true); }} tintColor={COLORS.primary} />}
      >
        <BackHeader title="Locations" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{locations.length}</Text>
            <Text style={styles.summaryLabel}>Locations</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{locations.filter(l => l.isDefault).length}</Text>
            <Text style={styles.summaryLabel}>Default</Text>
          </View>
        </View>

        {locations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}><LocationIcon /></View>
            <Text style={styles.emptyTitle}>No Locations</Text>
            <Text style={styles.emptySubtitle}>Add a location to manage inventory and shipping.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {locations.map((loc) => (
              <View key={loc.id} style={[styles.locCard, loc.isDefault && styles.locCardDefault]}>
                <View style={styles.locHeader}>
                  <View style={styles.locIconCircle}><LocationIcon /></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.locName}>{loc.name || 'Unnamed'}</Text>
                    <Text style={styles.locAddress} numberOfLines={2}>
                      {[loc.addressLine1, loc.addressLine2, loc.city, loc.stateProvince, loc.postalCode, loc.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  {loc.isDefault && (
                    <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
                  )}
                </View>
                <View style={styles.locActions}>
                  {!loc.isDefault && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(loc.id)}>
                      <Text style={styles.actionBtnText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(loc.id)}>
                    <Text style={[styles.actionBtnText, styles.removeBtnText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <PlusIcon />
          <Text style={styles.addBtnText}>Add Location</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Add multiple locations to manage inventory and shipping from different warehouses or stores.
        </Text>
      </ScrollView>

      {/* Add Location Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Location</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => { setShowAddModal(false); resetForm(); }}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location Name *</Text>
                <TextInput style={styles.formInput} placeholder="e.g. Main Warehouse" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Line 1 *</Text>
                <TextInput style={styles.formInput} placeholder="Street address" placeholderTextColor={COLORS.textMuted} value={addressLine1} onChangeText={setAddressLine1} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Line 2</Text>
                <TextInput style={styles.formInput} placeholder="Apt, suite, floor (optional)" placeholderTextColor={COLORS.textMuted} value={addressLine2} onChangeText={setAddressLine2} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>City *</Text>
                  <TextInput style={styles.formInput} placeholder="City" placeholderTextColor={COLORS.textMuted} value={city} onChangeText={setCity} />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>State/Province</Text>
                  <TextInput style={styles.formInput} placeholder="State" placeholderTextColor={COLORS.textMuted} value={stateProvince} onChangeText={setStateProvince} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Postal Code</Text>
                  <TextInput style={styles.formInput} placeholder="Postal" placeholderTextColor={COLORS.textMuted} value={postalCode} onChangeText={setPostalCode} />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Country</Text>
                  <TextInput style={styles.formInput} placeholder="Country" placeholderTextColor={COLORS.textMuted} value={country} onChangeText={setCountry} />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAddLocation} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>Add Location</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500', textTransform: 'uppercase' as any },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  locCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  locCardDefault: { borderColor: COLORS.primary, borderWidth: 2 },
  locHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  locName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  locAddress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  defaultBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  defaultText: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  locActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  removeBtn: { borderColor: COLORS.error + '30' },
  removeBtnText: { color: COLORS.error },
  addBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, marginTop: SPACING.lg, gap: 8 },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: SPACING.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  formGroup: { marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default LocationsScreen;
