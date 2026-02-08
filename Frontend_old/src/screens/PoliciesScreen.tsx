import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PoliciesScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
}

// Policy Icon
const PolicyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6V12L16 14"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PoliciesScreen: React.FC<PoliciesScreenProps> = ({ navigate, goBack }) => {
  const policies = [
    { id: '1', title: 'Terms of Service', lastUpdated: '2024-01-01' },
    { id: '2', title: 'Privacy Policy', lastUpdated: '2024-01-01' },
    { id: '3', title: 'Refund Policy', lastUpdated: '2023-12-15' },
    { id: '4', title: 'Shipping Policy', lastUpdated: '2023-12-15' },
    { id: '5', title: 'Cookie Policy', lastUpdated: '2024-01-01' },
  ];

  const handleViewPolicy = (policyId: string, policyTitle: string) => {
    if (navigate) {
      navigate('policyDetail', { policyId, policyTitle });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <PolicyIcon />
        </View>
      </View>
      <Text style={styles.heading}>Policies</Text>
      <Text style={styles.subheading}>
        View and manage your policies and terms.
      </Text>

      <View style={styles.formSection}>
        {policies.map((policy) => (
          <TouchableOpacity
            key={policy.id}
            style={styles.policyCard}
            onPress={() => handleViewPolicy(policy.id, policy.title)}
          >
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.policyDate}>Last updated: {policy.lastUpdated}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.infoText}>
        Tap on any policy to view the full document. These policies govern your use of our platform.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  policyDate: {
    fontSize: 11,
    color: '#666',
  },
  chevron: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PoliciesScreen;
