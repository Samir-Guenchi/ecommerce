import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { storeAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

// Domain Icon
const DomainIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
      fill={COLORS.textSecondary}
    />
  </Svg>
);

interface DomainsScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  storeId?: string;
}

const DomainsScreen: React.FC<DomainsScreenProps> = ({ navigate, goBack, storeId }) => {
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    const loadStoreDomain = async () => {
      if (!storeId) {
        // If no storeId, try to get first store
        try {
          const response = await storeAPI.getAllStores();
          if (response.stores.length > 0) {
            const store = response.stores[0];
            setCurrentDomain(store.domain || '');
            setCustomDomain(store.domain || '');
          }
        } catch (error: any) {
          console.error('Error loading stores:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await storeAPI.getStoreById(parseInt(storeId, 10));
        const store = response.store;
        setCurrentDomain(store.domain || '');
        setCustomDomain(store.domain || '');
      } catch (error: any) {
        showError(error.message || 'Failed to load domain.');
      } finally {
        setLoading(false);
      }
    };

    loadStoreDomain();
  }, [storeId]);

  const handleSave = async () => {
    if (!storeId) {
      showError('Store ID is required');
      return;
    }

    if (!customDomain) {
      showError('Please enter a domain');
      return;
    }

    try {
      setSaving(true);
      await storeAPI.updateStore(parseInt(storeId, 10), {
        domain: customDomain,
      });
      setCurrentDomain(customDomain);
      showSuccess('Your domain settings have been saved. DNS configuration may take up to 48 hours.');
    } catch (error: any) {
      showError(error.message || 'Failed to save domain.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textSecondary }}>Loading domain...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <DomainIcon />
        </View>
      </View>
      <BackHeader title="Domains" onBack={goBack} />
      <Text style={styles.subheading}>
        Manage your domain settings and configurations.
      </Text>

      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

      <View style={styles.formSection}>
        <View style={styles.domainCard}>
          <Text style={styles.domainLabel}>Current Domain</Text>
          <Text style={styles.domainValue}>{currentDomain}</Text>
          <Text style={styles.domainStatus}>Active</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Custom Domain</Text>
          <TextInput
            style={styles.input}
            placeholder="example.com"
            placeholderTextColor={COLORS.textMuted}
            value={customDomain}
            onChangeText={setCustomDomain}
            autoCapitalize="none"
            keyboardType="default"
          />
          <Text style={styles.helpText}>
            Enter your custom domain name. Make sure to configure your DNS settings.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={handleSave}
        disabled={saving || !storeId}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.submitButtonText}>Save Domain</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>DNS Configuration</Text>
        <Text style={styles.infoText}>
          To use a custom domain, you need to add the following DNS records:
        </Text>
        <View style={styles.dnsRecord}>
          <Text style={styles.dnsType}>A Record:</Text>
          <Text style={styles.dnsValue}>@ → 192.0.2.1</Text>
        </View>
        <View style={styles.dnsRecord}>
          <Text style={styles.dnsType}>CNAME:</Text>
          <Text style={styles.dnsValue}>www → yourstore.example.com</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 35,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  domainCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  domainLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  domainValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  domainStatus: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  dnsRecord: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  dnsType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    width: 80,
  },
  dnsValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});

export default DomainsScreen;
