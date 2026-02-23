import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { addressAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';

interface LocationsScreenProps { goBack?: () => void; }

const SunIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LocationsScreen = ({ goBack }: LocationsScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Algeria');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const loadLocations = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      // Try to fetch from backend
      try {
        const r = await addressAPI.getAllAddresses();
        const backendLocations = r.addresses || [];
        
        // If backend returns data, use it
        if (backendLocations.length > 0) {
          setLocations(backendLocations);
          console.log(`✅ Loaded ${backendLocations.length} locations from backend - USER-SPECIFIC`);
          return;
        }
        
        console.log('📝 No locations from backend, using dummy data for testing');
      } catch (e: any) {
        console.log('⚠️ Backend API failed, using dummy data:', e.message);
      }
      
      // Add dummy data if no backend data
      const dummyLocations = [
        {
          id: 'dummy-1',
          name: 'Main Warehouse',
          addressLine1: '123 Industrial Zone',
          addressLine2: 'Building A',
          city: 'Algiers',
          stateProvince: 'Algiers',
          postalCode: '16000',
          country: 'Algeria',
          isDefault: true,
          userId: 'current-user',
        },
        {
          id: 'dummy-2',
          name: 'Downtown Store',
          addressLine1: '45 Didouche Mourad Street',
          addressLine2: null,
          city: 'Algiers',
          stateProvince: 'Algiers',
          postalCode: '16001',
          country: 'Algeria',
          isDefault: false,
          userId: 'current-user',
        },
        {
          id: 'dummy-3',
          name: 'Oran Branch',
          addressLine1: '78 Boulevard de la Revolution',
          addressLine2: 'Floor 2',
          city: 'Oran',
          stateProvince: 'Oran',
          postalCode: '31000',
          country: 'Algeria',
          isDefault: false,
          userId: 'current-user',
        },
      ];
      
      setLocations(dummyLocations);
      console.log(`📝 Loaded ${dummyLocations.length} dummy locations (user-specific simulation)`);
      
    } catch (e: any) { 
      console.error('Failed to load locations:', e); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const resetForm = () => { 
    setName(''); 
    setAddressLine1(''); 
    setAddressLine2(''); 
    setCity(''); 
    setStateProvince(''); 
    setPostalCode(''); 
    setCountry('Algeria'); 
  };

  const handleAddLocation = async () => {
    if (!name.trim()) { showError(t('locations_errName')); return; }
    if (!addressLine1.trim()) { showError(t('locations_errAddr')); return; }
    if (!city.trim()) { showError(t('locations_errCity')); return; }
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
        isDefault: locations.length === 0 
      });
      showSuccess(t('locations_added'));
      setShowAddModal(false); 
      resetForm();
      await loadLocations();
    } catch (e: any) { 
      showError(e.message || t('common_error')); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14 }}>{t('common_loading')}</Text>
      </View>
    );
  }

  const Field = ({ label, value, set, placeholder, flex }: { label: string; value: string; set: (v: string) => void; placeholder: string; flex?: number }) => (
    <View style={{ marginBottom: 14, flex: flex || undefined }}>
      <Text style={[s.fieldLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <TextInput 
        style={[s.fieldInput, { 
          backgroundColor: COLORS.background, 
          borderColor: COLORS.border, 
          color: COLORS.text,
          textAlign: isRTL ? 'right' : 'left',
        }]}
        placeholder={placeholder} 
        placeholderTextColor={COLORS.textMuted} 
        value={value} 
        onChangeText={set} 
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLocations(true); }} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('locations_title')} onBack={goBack} />
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Stats */}
        <View style={[s.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {[
            { val: locations.length, label: t('locations_total'), color: COLORS.text },
            { val: locations.filter(l => l.isDefault).length, label: t('locations_default'), color: COLORS.success },
          ].map((item, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={[s.statLabel, { color: COLORS.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Location cards */}
        {locations.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📍</Text>
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>{t('locations_noLocations')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textMuted, textAlign: 'center' }]}>{t('locations_noLocationsDesc')}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {locations.map(loc => (
              <View key={loc.id} style={[s.locCard, { 
                backgroundColor: COLORS.surface, 
                borderColor: loc.isDefault ? COLORS.primary + '60' : COLORS.border, 
                borderWidth: loc.isDefault ? 2 : 1 
              }]}>
                <View style={[s.locTop, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[s.locIcon, { backgroundColor: COLORS.primary + '15' }]}>
                    <Text style={{ fontSize: 18 }}>📍</Text>
                  </View>
                  <View style={{ 
                    flex: 1, 
                    marginLeft: isRTL ? 0 : 12, 
                    marginRight: isRTL ? 12 : 0 
                  }}>
                    <Text style={[s.locName, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                      {loc.name || t('common_noName')}
                    </Text>
                    <Text style={[s.locAddr, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                      {[loc.addressLine1, loc.addressLine2, loc.city, loc.stateProvince, loc.postalCode, loc.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  {loc.isDefault && (
                    <View style={[s.defaultBadge, { backgroundColor: COLORS.success + '18' }]}>
                      <Text style={[s.defaultText, { color: COLORS.success }]}>{t('locations_default')}</Text>
                    </View>
                  )}
                </View>
                <View style={[s.locActions, isRTL && { flexDirection: 'row-reverse' }]}>
                  {!loc.isDefault && (
                    <TouchableOpacity style={[s.locBtn, { borderColor: COLORS.border }]} onPress={async () => {
                      try {
                        await addressAPI.updateAddress(loc.id, { isDefault: true });
                        showSuccess(t('locations_defaultUpdated')); 
                        loadLocations();
                      } catch (e: any) {
                        showError(e.message || t('common_error'));
                      }
                    }}>
                      <Text style={[s.locBtnText, { color: COLORS.text }]}>{t('locations_setDefault')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[s.locBtn, { borderColor: COLORS.error + '30' }]} onPress={async () => {
                    const ok = await confirmAction(t('locations_removeTitle'), t('locations_removeConfirm'));
                    if (!ok) return;
                    try {
                      await addressAPI.deleteAddress(loc.id);
                      showSuccess(t('locations_removed')); 
                      loadLocations();
                    } catch (e: any) {
                      showError(e.message || t('common_error'));
                    }
                  }}>
                    <Text style={[s.locBtnText, { color: COLORS.error }]}>{t('locations_remove')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[s.addBtn, { backgroundColor: COLORS.primary }]} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
          <Text style={s.addBtnText}>{t('locations_addLocation')}</Text>
        </TouchableOpacity>
        <Text style={[s.footerNote, { color: COLORS.textMuted, textAlign: 'center' }]}>
          {t('locations_footerNote')}
        </Text>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[s.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.modalTitle, { color: COLORS.text }]}>{t('locations_addModal')}</Text>
              <TouchableOpacity style={[s.closeBtn, { backgroundColor: COLORS.background }]} onPress={() => { setShowAddModal(false); resetForm(); }}>
                <CloseIcon color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Field label={t('locations_nameLabel')} placeholder={t('locations_namePlaceholder')} value={name} set={setName} />
              <Field label={t('locations_addr1Label')} placeholder={t('locations_addr1Placeholder')} value={addressLine1} set={setAddressLine1} />
              <Field label={t('locations_addr2Label')} placeholder={t('locations_addr2Placeholder')} value={addressLine2} set={setAddressLine2} />
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
                <Field label={t('locations_cityLabel')} placeholder={t('locations_cityPlaceholder')} value={city} set={setCity} flex={1} />
                <Field label={t('locations_stateLabel')} placeholder={t('locations_statePlaceholder')} value={stateProvince} set={setStateProvince} flex={1} />
              </View>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
                <Field label={t('locations_postalLabel')} placeholder={t('locations_postalPlaceholder')} value={postalCode} set={setPostalCode} flex={1} />
                <Field label={t('locations_countryLabel')} placeholder={t('locations_countryPlaceholder')} value={country} set={setCountry} flex={1} />
              </View>
            </ScrollView>
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]} onPress={handleAddLocation} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>{t('locations_addLocation')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 13, maxWidth: 220, lineHeight: 20 },
  locCard: { borderRadius: 18, padding: 16, gap: 12 },
  locTop: { flexDirection: 'row', alignItems: 'center' },
  locIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  locName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  locAddr: { fontSize: 12, lineHeight: 18 },
  defaultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  defaultText: { fontSize: 10, fontWeight: '700' },
  locActions: { flexDirection: 'row', gap: 8 },
  locBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  locBtnText: { fontSize: 12, fontWeight: '700' },
  addBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerNote: { fontSize: 12, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

export default LocationsScreen;
