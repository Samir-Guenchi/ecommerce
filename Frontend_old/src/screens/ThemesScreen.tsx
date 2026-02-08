import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Theme Icon
const ThemeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69L5 6.69L12 10.69L19 6.69L12 2.69Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 12L12 16L19 12"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 17.31L12 21.31L19 17.31"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ThemesScreen = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>('light');

  const themes = [
    { id: 'light', name: 'Light', description: 'Clean and bright theme' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
    { id: 'auto', name: 'Auto', description: 'Follows system settings' },
  ];

  const handleSave = () => {
    if (!selectedTheme) {
      Alert.alert('Error', 'Please select a theme');
      return;
    }
    Alert.alert('Success', 'Your theme preference has been saved.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <ThemeIcon />
        </View>
      </View>
      <Text style={styles.heading}>Themes</Text>
      <Text style={styles.subheading}>
        Choose a theme for your store appearance.
      </Text>

      <View style={styles.formSection}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              selectedTheme === theme.id && styles.themeCardSelected,
            ]}
            onPress={() => setSelectedTheme(theme.id)}
          >
            <View style={styles.themeContent}>
              <Text
                style={[
                  styles.themeName,
                  selectedTheme === theme.id && styles.themeNameSelected,
                ]}
              >
                {theme.name}
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  selectedTheme === theme.id && styles.themeDescriptionSelected,
                ]}
              >
                {theme.description}
              </Text>
            </View>
            {selectedTheme === theme.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
        <Text style={styles.submitButtonText}>Save Theme</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        The theme will be applied to your store immediately. Customers will see the selected theme.
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
  themeCard: {
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
  themeCardSelected: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  themeContent: {
    flex: 1,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  themeNameSelected: {
    color: '#000000',
  },
  themeDescription: {
    fontSize: 12,
    color: '#666',
  },
  themeDescriptionSelected: {
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

export default ThemesScreen;

