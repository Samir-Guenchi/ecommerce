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
  StorefrontPreferencesScreen,
  ThemesScreen,
  ProductsScreen,
  OrdersScreen,
  OrderTrackingScreen,
  AnalyticsScreen,
  StoresScreen,
  AddEditProductScreen,
  AddEditStoreScreen,
  DashboardScreen,
  BuyerDashboardScreen,
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminStoresScreen,
  AdminSellersScreen,
  AdminDeliveryScreen,
  AdminProductsScreen,
  DocumentUploadScreen,
  AdminDocumentReviewScreen,
  DeliveryDashboardScreen,
  OAuthSetupScreen,
  OAuthPasswordScreen,
  OAuthRoleSelectionScreen,
  PasswordSetupScreen,
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
  storefrontPreferences: {
    title: 'Storefront Preferences',
    description: 'Control theme and language for customer-facing storefront.',
    component: StorefrontPreferencesScreen,
    showInGallery: false,
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
  buyerDashboard: {
    title: 'Buyer Dashboard',
    description: 'Shopping journey and orders for buyers.',
    component: BuyerDashboardScreen,
    showInGallery: true,
  },
  adminDashboard: {
    title: 'Admin Dashboard',
    description: 'Platform administration and user management.',
    component: AdminDashboardScreen,
    showInGallery: true,
  },
  adminUsers: {
    title: 'Admin Users',
    description: 'Manage platform users and verifications.',
    component: AdminUsersScreen,
    showInGallery: false,
  },
  adminStores: {
    title: 'Admin Stores',
    description: 'Manage all platform stores with suspend/activate options.',
    component: AdminStoresScreen,
    showInGallery: false,
  },
  adminSellers: {
    title: 'Admin Sellers',
    description: 'Manage sellers and their stores.',
    component: AdminSellersScreen,
    showInGallery: false,
  },
  adminDelivery: {
    title: 'Admin Delivery',
    description: 'Manage delivery personnel and requests.',
    component: AdminDeliveryScreen,
    showInGallery: false,
  },
  adminProducts: {
    title: 'Admin Products',
    description: 'View and manage all platform products.',
    component: AdminProductsScreen,
    showInGallery: false,
  },
  documentUpload: {
    title: 'Document Upload',
    description: 'Upload verification documents for sellers and delivery.',
    component: DocumentUploadScreen,
    showInGallery: true,
  },
  adminDocumentReview: {
    title: 'Document Review',
    description: 'Admin review of user documents with approve/reject.',
    component: AdminDocumentReviewScreen,
    showInGallery: false,
  },
  deliveryDashboard: {
    title: 'Delivery Dashboard',
    description: 'Dashboard for delivery personnel with stats and earnings.',
    component: DeliveryDashboardScreen,
    showInGallery: true,
  },
  oauthSetup: {
    title: 'OAuth Setup',
    description: 'Complete OAuth registration with password and account type.',
    component: OAuthSetupScreen,
    showInGallery: false,
  },
  oauthPassword: {
    title: 'OAuth Password',
    description: 'Set password for new OAuth users (Step 1).',
    component: OAuthPasswordScreen,
    showInGallery: false,
  },
  oauthRoleSelection: {
    title: 'OAuth Role Selection',
    description: 'Choose account type for new OAuth users (Step 2).',
    component: OAuthRoleSelectionScreen,
    showInGallery: false,
  },
  passwordSetup: {
    title: 'Password Setup',
    description: 'Set password for existing OAuth users.',
    component: PasswordSetupScreen,
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
  
  console.log('📱 Current screen stack:', screenStack.map(s => s.screenId));
  console.log('📱 Active screen:', activeScreen?.screenId);
  
  const ScreenComponent = activeScreen
    ? SCREEN_REGISTRY[activeScreen.screenId].component
    : WelcomeScreen;
    
  console.log('📱 Rendering component for:', activeScreen?.screenId || 'welcome');

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Check for OAuth callback parameters (web only)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          const oauthSuccess = urlParams.get('oauth');
          const oauthError = urlParams.get('error');
          const oauthSetup = urlParams.get('oauth_setup');
          const passwordSetup = urlParams.get('password_setup');
          const oauthData = urlParams.get('data');

          // New OAuth user needs to complete registration
          if (oauthSetup === 'true' && oauthData) {
            try {
              const data = JSON.parse(decodeURIComponent(oauthData));
              window.history.replaceState({}, document.title, window.location.pathname);
              // Step 1: Set password first
              setScreenStack([{ screenId: 'oauthPassword', params: { oauthData: data } }]);
              setAuthChecked(true);
              return;
            } catch (e) {
              console.error('Failed to parse OAuth data:', e);
            }
          }

          // Existing OAuth user needs to set password
          if (passwordSetup === 'true' && oauthData) {
            try {
              const data = JSON.parse(decodeURIComponent(oauthData));
              window.history.replaceState({}, document.title, window.location.pathname);
              setScreenStack([{ screenId: 'passwordSetup', params: { userData: data } }]);
              setAuthChecked(true);
              return;
            } catch (e) {
              console.error('Failed to parse password setup data:', e);
            }
          }

          // Successful OAuth login with token
          if (token && oauthSuccess === 'success') {
            // Save token from OAuth callback
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('accessToken', token);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Go to dashboard
            setScreenStack([{ screenId: 'dashboard' }]);
            setAuthChecked(true);
            return;
          } else if (oauthError) {
            console.error('OAuth error:', oauthError);
            // Clean URL and show welcome screen
            window.history.replaceState({}, document.title, window.location.pathname);
            setScreenStack([{ screenId: 'welcome' }]);
            setAuthChecked(true);
            return;
          }
        }

        // Handle deep links for mobile OAuth (React Native only, not web)
        if (typeof window === 'undefined' || (typeof window !== 'undefined' && typeof (window as any).ReactNativeWebView !== 'undefined')) {
          try {
            const { Linking } = require('react-native');
            
            const handleDeepLink = async (url: string) => {
              console.log('📱 Deep link received:', url);
              console.log('📱 URL type:', typeof url);
              console.log('📱 URL includes ap-ecom:', url.includes('ap-ecom'));
              
              if (url.includes('ap-ecom://oauth')) {
                try {
                  console.log('📱 Processing OAuth deep link...');
                  const urlObj = new URL(url);
                  console.log('📱 URL parsed:', urlObj.href);
                  const params = new URLSearchParams(urlObj.search);
                  
                  const setup = params.get('setup');
                  const passwordSetup = params.get('password_setup');
                  const token = params.get('token');
                  const success = params.get('success');
                  const error = params.get('error');
                  const data = params.get('data');
                  
                  console.log('📱 Params:', { setup, passwordSetup, token: token ? 'present' : 'missing', success, error, data: data ? 'present' : 'missing' });
                  
                  // New OAuth user needs to complete registration
                  if (setup === 'true' && data) {
                    try {
                      const oauthData = JSON.parse(decodeURIComponent(data));
                      console.log('📝 OAuth setup required:', oauthData);
                      setScreenStack([{ screenId: 'oauthPassword', params: { oauthData } }]);
                      setAuthChecked(true);
                      return true;
                    } catch (e) {
                      console.error('❌ Failed to parse OAuth data:', e);
                    }
                  }
                  
                  // Existing OAuth user needs to set password
                  if (passwordSetup === 'true' && data) {
                    try {
                      const userData = JSON.parse(decodeURIComponent(data));
                      console.log('🔑 Password setup required:', userData);
                      setScreenStack([{ screenId: 'passwordSetup', params: { userData } }]);
                      setAuthChecked(true);
                      return true;
                    } catch (e) {
                      console.error('❌ Failed to parse password setup data:', e);
                    }
                  }
                  
                  // Successful OAuth login with token
                  if (token && success === 'true') {
                    console.log('✅ OAuth success, saving token');
                    await AsyncStorage.setItem('authToken', token);
                    await AsyncStorage.setItem('accessToken', token);
                    setScreenStack([{ screenId: 'dashboard' }]);
                    setAuthChecked(true);
                    return true;
                  }
                  
                  // OAuth error
                  if (error) {
                    console.error('❌ OAuth error:', error);
                    setScreenStack([{ screenId: 'welcome' }]);
                    setAuthChecked(true);
                    return true;
                  }
                  
                  console.log('⚠️ No matching OAuth parameters found');
                } catch (e) {
                  console.error('❌ Failed to parse deep link:', e);
                }
              } else {
                console.log('📱 Not an OAuth deep link');
              }
              
              return false;
            };
            
            console.log('📱 Setting up deep link listeners...');
            
            // Check initial URL (for deep link on app launch)
            const initialUrl = await Linking.getInitialURL();
            console.log('📱 Initial URL:', initialUrl);
            if (initialUrl) {
              const handled = await handleDeepLink(initialUrl);
              console.log('📱 Initial URL handled:', handled);
              if (handled) return;
            }
            
            // Listen for deep links while app is running
            const linkingSubscription = Linking.addEventListener('url', async ({ url }: { url: string }) => {
              console.log('📱 Deep link event triggered');
              await handleDeepLink(url);
            });
            
            console.log('📱 Deep link listeners ready');
            
            // Store subscription for cleanup
            (bootstrapAuth as any).linkingSubscription = linkingSubscription;
          } catch (err) {
            console.error('❌ Deep linking error:', err);
            console.log('Deep linking not available on this platform');
          }
        }

        // Normal auth check
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Verify token is valid by checking with backend
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
              const data = await response.json();
              const user = data.user || data;
              
              console.log('🔐 Bootstrap auth - User type:', user.accountType);
              
              // Save user data
              await AsyncStorage.setItem('userData', JSON.stringify(user));
              
              // Route based on account type
              if (user.accountType === 'admin') {
                console.log('🔐 Routing to adminDashboard');
                setScreenStack([{ screenId: 'adminDashboard' }]);
              } else if (user.accountType === 'buyer') {
                console.log('🔐 Routing to buyerDashboard');
                setScreenStack([{ screenId: 'buyerDashboard' }]);
              } else if (user.accountType === 'delivery') {
                console.log('🔐 Routing to deliveryDashboard');
                setScreenStack([{ screenId: 'deliveryDashboard' }]);
              } else if (user.accountType === 'seller') {
                console.log('🔐 Routing to seller dashboard');
                setScreenStack([{ screenId: 'dashboard' }]);
              } else {
                console.log('🔐 Default routing to seller dashboard');
                // Default to seller dashboard
                setScreenStack([{ screenId: 'dashboard' }]);
              }
            } else {
              // Token is invalid, clear it and show welcome
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('userData');
              setScreenStack([{ screenId: 'welcome' }]);
            }
          } catch (error) {
            // Network error or token invalid, clear and show welcome
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userData');
            setScreenStack([{ screenId: 'welcome' }]);
          }
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
    console.log('🚀 NAVIGATE CALLED:', screenId, params);
    console.log('🚀 Current stack:', screenStack.map(s => s.screenId));
    setScreenStack(prev => {
      const newStack = [...prev, { screenId, params }];
      console.log('🚀 New stack:', newStack.map(s => s.screenId));
      return newStack;
    });
  };

  const goBack = () => {
    setScreenStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const resetTo = (screenId: ScreenId, params?: Record<string, any>) => {
    console.log('🔄 RESET TO:', screenId, params);
    console.log('🔄 Previous stack:', screenStack.map(s => s.screenId));
    setScreenStack([{ screenId, params }]);
    console.log('🔄 New stack should be:', [screenId]);
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
