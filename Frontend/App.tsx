/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './src/theme';
import { I18nProvider } from './src/i18n';
import { ThemeProvider } from './src/theme/ThemeContext';

import {
  AccountTypeSelectorScreen,
  LoginSignUpScreen,
  EmailVerificationScreen,
  WelcomeScreen,
  UserSettingsScreen,
  SellerRegistrationScreen,
  ProfileSettingsScreen,
  AccountTypeScreen,
  AccountStatusScreen,
  TrackingSystemScreen,
  StoresDetailsScreen,
  PlanBillingScreen,
  PaymentsScreen,
  DeliveryScreen,
  TaxesDutiesScreen,
  LocationsScreen,
  DomainsScreen,
  NotificationsScreen,
  LanguagesScreen,
  PoliciesScreen,
  PolicyDetailScreen,
  UsersPermissionsScreen,
  StoreSettingsScreen,
  ThemesScreen,
  ProductsScreen,
  OrdersScreen,
  OrderTrackingScreen,
  AnalyticsScreen,
  StoresScreen,
  AddEditProductScreen,
  AddEditStoreScreen,
  DashboardScreen,
} from './src/screens';

type ScreenConfig = {
  title: string;
  description: string;
  component: React.ComponentType;
  showInGallery?: boolean;
};

const SCREEN_REGISTRY = {
  welcome: {
    title: 'Welcome Screen',
    description: 'Marketing hero with CTA and headline carousel.',
    component: WelcomeScreen,
    showInGallery: true,
  },
  loginSignup: {
    title: 'Login / Sign Up',
    description: 'Email + password form with social entry points.',
    component: LoginSignUpScreen,
    showInGallery: true,
  },
  emailVerification: {
    title: 'Email Verification',
    description: 'Verify email address with code sent to user.',
    component: EmailVerificationScreen,
    showInGallery: false,
  },
  accountType: {
    title: 'Account Type Selector',
    description: 'Choose between buyer and seller onboarding flows.',
    component: AccountTypeSelectorScreen,
    showInGallery: true,
  },
  userSettings: {
    title: 'User Settings',
    description: 'Manage profile, account, billing, and app preferences.',
    component: UserSettingsScreen,
    showInGallery: true,
  },
  sellerRegistration: {
    title: 'Seller Registration',
    description: 'Upload seller information and required documents.',
    component: SellerRegistrationScreen,
    showInGallery: true,
  },
  products: {
    title: 'Products',
    description: 'Manage your store products and inventory.',
    component: ProductsScreen,
    showInGallery: true,
  },
  dashboard: {
    title: 'Dashboard',
    description: 'View your store performance and analytics.',
    component: DashboardScreen,
    showInGallery: true,
  },
  profileSettings: {
    title: 'Profile Settings',
    description: 'Manage your personal information and profile details.',
    component: ProfileSettingsScreen,
    showInGallery: false,
  },
  userAccountType: {
    title: 'Account Type',
    description: 'View and manage your account type settings.',
    component: AccountTypeScreen,
    showInGallery: false,
  },
  accountStatus: {
    title: 'Account Status',
    description: 'View your account status and verification details.',
    component: AccountStatusScreen,
    showInGallery: false,
  },
  trackingSystem: {
    title: 'Tracking System',
    description: 'Configure your tracking system preferences and settings.',
    component: TrackingSystemScreen,
    showInGallery: false,
  },
  storesDetails: {
    title: 'Stores Details',
    description: 'Manage your store information and details.',
    component: StoresDetailsScreen,
    showInGallery: false,
  },
  planBilling: {
    title: 'Plan & Billing',
    description: 'View your current plan and manage billing information.',
    component: PlanBillingScreen,
    showInGallery: false,
  },
  payments: {
    title: 'Payments',
    description: 'Manage your payment methods and transaction history.',
    component: PaymentsScreen,
    showInGallery: false,
  },
  delivery: {
    title: 'Delivery',
    description: 'Configure delivery settings and preferences.',
    component: DeliveryScreen,
    showInGallery: false,
  },
  taxesDuties: {
    title: 'Taxes & Duties',
    description: 'Manage tax settings and duty configurations.',
    component: TaxesDutiesScreen,
    showInGallery: false,
  },
  locations: {
    title: 'Locations',
    description: 'Manage your locations and addresses.',
    component: LocationsScreen,
    showInGallery: false,
  },
  domains: {
    title: 'Domains',
    description: 'Manage your domain settings and configurations.',
    component: DomainsScreen,
    showInGallery: false,
  },
  notifications: {
    title: 'Notifications',
    description: 'Configure your notification preferences.',
    component: NotificationsScreen,
    showInGallery: false,
  },
  languages: {
    title: 'Languages',
    description: 'Select your preferred language for the application.',
    component: LanguagesScreen,
    showInGallery: false,
  },
  policies: {
    title: 'Policies',
    description: 'View and manage your policies and terms.',
    component: PoliciesScreen,
    showInGallery: false,
  },
  policyDetail: {
    title: 'Policy Detail',
    description: 'View detailed policy document.',
    component: PolicyDetailScreen,
    showInGallery: false,
  },
  usersPermissions: {
    title: 'Users & Permissions',
    description: 'Manage users and their permissions for your account.',
    component: UsersPermissionsScreen,
    showInGallery: false,
  },
  storeSettings: {
    title: 'Store Settings',
    description: 'Manage store themes, products, orders, analytics, and domains.',
    component: StoreSettingsScreen,
    showInGallery: true,
  },
  themes: {
    title: 'Themes',
    description: 'Choose a theme for your store appearance.',
    component: ThemesScreen,
    showInGallery: false,
  },
  orders: {
    title: 'Orders',
    description: 'View and manage your store orders.',
    component: OrdersScreen,
    showInGallery: false,
  },
  orderTracking: {
    title: 'Order Tracking',
    description: 'Track your order through wilayas.',
    component: OrderTrackingScreen,
    showInGallery: false,
  },
  analytics: {
    title: 'Analytics',
    description: 'View your store performance and statistics.',
    component: AnalyticsScreen,
    showInGallery: false,
  },
  stores: {
    title: 'Stores',
    description: 'Manage your store information and details.',
    component: StoresScreen,
    showInGallery: true,
  },
  addEditProduct: {
    title: 'Add/Edit Product',
    description: 'Add or edit product information.',
    component: AddEditProductScreen,
    showInGallery: false,
  },
  addEditStore: {
    title: 'Add/Edit Store',
    description: 'Create or edit store information.',
    component: AddEditStoreScreen,
    showInGallery: false,
  },
} satisfies Record<string, ScreenConfig>;

type ScreenId = keyof typeof SCREEN_REGISTRY;

const LOGO_IMAGE = require('./src/screens/logo.png');

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong.</Text>
          <Text style={{ color: 'red' }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider>
        <I18nProvider>
          <ErrorBoundary>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <RootNavigator />
          </ErrorBoundary>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

type ScreenStackItem = {
  screenId: ScreenId;
  params?: Record<string, any>;
};

function RootNavigator() {
  const [screenStack, setScreenStack] = useState<ScreenStackItem[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const activeScreen = screenStack.length > 0 ? screenStack[screenStack.length - 1] : null;
  const ScreenComponent = activeScreen
    ? SCREEN_REGISTRY[activeScreen.screenId].component
    : WelcomeScreen;

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setScreenStack([{ screenId: 'dashboard' }]);
        } else {
          setScreenStack([{ screenId: 'welcome' }]);
        }
      } catch (error) {
        console.warn('Failed to load auth token', error);
        setScreenStack([{ screenId: 'welcome' }]);
      } finally {
        setAuthChecked(true);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (screenStack.length > 1) {
          setScreenStack(prev => prev.slice(0, -1));
          return true;
        }
        return false;
      },
    );

    return () => subscription.remove();
  }, [screenStack]);

  const navigate = (screenId: ScreenId, params?: Record<string, any>) => {
    setScreenStack(prev => [...prev, { screenId, params }]);
  };

  const goBack = () => {
    setScreenStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const resetTo = (screenId: ScreenId, params?: Record<string, any>) => {
    setScreenStack([{ screenId, params }]);
  };

  const handleAuthenticated = () => {
    resetTo('accountType');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to clear auth token', error);
    }
    resetTo('welcome');
  };

  // Pass navigation function and params to screens
  const navigationProps = activeScreen
    ? {
      navigate,
      goBack,
      resetTo,
      onAuthenticated: handleAuthenticated,
      onLogout: handleLogout,
      ...activeScreen.params,
    }
    : {
      navigate,
      goBack,
      resetTo,
      onAuthenticated: handleAuthenticated,
      onLogout: handleLogout,
    };

  if (!authChecked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.viewerContainer}>
          <View style={[styles.viewerScreen, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text>Loading...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.viewerContainer}>
        <View style={styles.viewerScreen}>
          <ScreenComponent {...navigationProps} />
        </View>
      </View>
    </SafeAreaView>
  );
}

type ScreenGalleryProps = {
  onSelectScreen: (screenId: ScreenId) => void;
};

function ScreenGallery({ onSelectScreen }: ScreenGalleryProps) {
  const screens = useMemo(
    () =>
      Object.entries(SCREEN_REGISTRY).filter(
        ([, config]) => config.showInGallery !== false
      ),
    []
  );

  return (
    <ScrollView
      contentContainerStyle={styles.galleryContent}
      showsVerticalScrollIndicator={false}
    >
      <Image source={LOGO_IMAGE} style={styles.galleryLogo} />
      <Text style={styles.galleryHeading}>Screen Playground</Text>
      <Text style={styles.gallerySubheading}>
        Tap any card to preview the corresponding UI screen. Use your device
        back button to return here.
      </Text>

      {screens.map(([screenId, config]) => (
        <TouchableOpacity
          key={screenId}
          style={styles.galleryCard}
          onPress={() => onSelectScreen(screenId as ScreenId)}
        >
          <Text style={styles.cardTitle}>{config.title}</Text>
          <Text style={styles.cardDescription}>{config.description}</Text>
          <Text style={styles.cardLink}>Open screen →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: '100%',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: COLORS.background, // Dark background
    minHeight: '100%',
  },
  viewerScreen: {
    flex: 1,
  },
  galleryContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
    backgroundColor: COLORS.background,
  },
  galleryLogo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 8,
    resizeMode: 'contain',
    tintColor: COLORS.primary, // Gold logo
  },
  galleryHeading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.primary, // Gold heading
  },
  gallerySubheading: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  galleryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // Darker shadow
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text, // Light text
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  cardLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary, // Gold link
  },
});

export default App;
