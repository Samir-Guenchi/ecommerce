import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Upload Icon Component
const UploadIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 8L12 3L7 8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3V15"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Document Icon Component
const DocumentIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 13H8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17H8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 9H9H8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Check Icon Component
const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Seller Registration Icon Component
const SellerIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface DocumentUploadProps {
  label: string;
  fileName?: string;
  onPress: () => void;
  style?: object;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  fileName,
  onPress,
  style,
}) => (
  <TouchableOpacity style={[styles.documentUpload, style]} onPress={onPress}>
    <View style={styles.documentIconContainer}>
      {fileName ? <CheckIcon /> : <DocumentIcon />}
    </View>
    <View style={styles.documentTextContainer}>
      <Text style={styles.documentLabel}>{label}</Text>
      {fileName ? (
        <Text style={styles.documentFileName} numberOfLines={1}>
          {fileName}
        </Text>
      ) : (
        <Text style={styles.documentPlaceholder}>Tap to upload</Text>
      )}
    </View>
    <View style={styles.uploadIconContainer}>
      <UploadIcon />
    </View>
  </TouchableOpacity>
);

interface SellerRegistrationScreenProps {
  navigate?: (screenId: string) => void;
}

const SellerRegistrationScreen = ({ navigate }: SellerRegistrationScreenProps) => {
  const [fullName, setFullName] = useState('');
  const [ssid, setSsid] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [document1, setDocument1] = useState<string | undefined>(undefined);
  const [document2, setDocument2] = useState<string | undefined>(undefined);
  const [document3, setDocument3] = useState<string | undefined>(undefined);

  const handleDocumentUpload = (
    setter: (value: string) => void,
    documentNumber: number,
  ) => {
    // In a real app, this would open a document picker
    // For now, we'll simulate it with an alert
    Alert.alert(
      'Upload Document',
      `This would open a document picker for document ${documentNumber}. In production, integrate with react-native-document-picker or similar.`,
      [
        {
          text: 'Simulate Upload',
          onPress: () => {
            setter(`document_${documentNumber}.pdf`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleSubmit = () => {
    if (!fullName || !ssid || !businessId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!document1 || !document2 || !document3) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }

    // Handle form submission
    Alert.alert(
      'Success',
      'Your seller registration information has been submitted for review.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (navigate) {
              navigate('dashboard');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <SellerIcon />
        </View>
      </View>

      {/* Header */}
      <Text style={styles.heading}>Seller Registration</Text>
      <Text style={styles.subheading}>
        Please provide your information and required documents to complete your
        seller account setup.
      </Text>

      {/* Form Fields */}
      <View style={styles.formSection}>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Full Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* SSID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            SSID
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your SSID"
            placeholderTextColor="#999"
            value={ssid}
            onChangeText={setSsid}
            keyboardType="numeric"
          />
        </View>

        {/* Business ID */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Business ID
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your business ID"
            placeholderTextColor="#999"
            value={businessId}
            onChangeText={setBusinessId}
          />
        </View>
      </View>

      {/* Documents Section */}
      <View style={styles.formSection}>
        <View style={styles.documentsRow}>
          <DocumentUpload
            label="Document 1"
            fileName={document1}
            onPress={() => handleDocumentUpload(setDocument1, 1)}
          />

          <DocumentUpload
            label="Document 2"
            fileName={document2}
            onPress={() => handleDocumentUpload(setDocument2, 2)}
          />

          <DocumentUpload
            label="Document 3"
            fileName={document3}
            onPress={() => handleDocumentUpload(setDocument3, 3)}
            style={styles.documentUploadLast}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Registration</Text>
      </TouchableOpacity>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Your information will be reviewed and verified. You will be notified
        once your seller account is approved.
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
  formSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
    lineHeight: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#FF0000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000000',
  },
  documentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentUpload: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginRight: 8,
  },
  documentUploadLast: {
    marginRight: 0,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  documentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  documentFileName: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'center',
  },
  documentPlaceholder: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  uploadIconContainer: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SellerRegistrationScreen;

