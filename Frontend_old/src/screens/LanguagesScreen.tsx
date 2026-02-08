import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { profileAPI } from '../services/api.service';

// Language Icon
const LanguageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12H22"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LanguagesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>('en');

  const languages = [
    { id: 'en', name: 'English', nativeName: 'English' },
    { id: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { id: 'fr', name: 'French', nativeName: 'Français' },
    { id: 'es', name: 'Spanish', nativeName: 'Español' },
  ];

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        const user = response.user;
        setSelectedLanguage(user.languagePreference || 'en');
      } catch (error: any) {
        console.error('Error loading language:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const handleSave = async () => {
    if (!selectedLanguage) {
      Alert.alert('Error', 'Please select a language');
      return;
    }
    
    try {
      setSaving(true);
      await profileAPI.updateProfile({ languagePreference: selectedLanguage });
      Alert.alert('Success', 'Your language preference has been saved.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save language preference.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading language...</Text>
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
          <LanguageIcon />
        </View>
      </View>
      <Text style={styles.heading}>Languages</Text>
      <Text style={styles.subheading}>
        Select your preferred language for the application.
      </Text>

      <View style={styles.formSection}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.id}
            style={[
              styles.languageCard,
              selectedLanguage === language.id && styles.languageCardSelected,
            ]}
            onPress={() => setSelectedLanguage(language.id)}
          >
            <View style={styles.languageContent}>
              <Text
                style={[
                  styles.languageName,
                  selectedLanguage === language.id && styles.languageNameSelected,
                ]}
              >
                {language.name}
              </Text>
              <Text
                style={[
                  styles.languageNative,
                  selectedLanguage === language.id && styles.languageNativeSelected,
                ]}
              >
                {language.nativeName}
              </Text>
            </View>
            {selectedLanguage === language.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Save Language</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        The application will restart to apply the new language. Make sure to save any unsaved work.
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
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageCardSelected: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  languageNameSelected: {
    color: '#000000',
  },
  languageNative: {
    fontSize: 13,
    color: '#666',
  },
  languageNativeSelected: {
    color: '#333',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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

export default LanguagesScreen;
