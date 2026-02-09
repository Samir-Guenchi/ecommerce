# i18n and Settings Pages Update Plan

## Date: February 9, 2026

## Status: ✅ i18n Complete | ⏳ Settings Pages Pending

---

## Part 1: i18n Translations ✅ COMPLETE

### Added Translation Keys

All three languages (EN, FR, AR) now include:

#### Seller Verification Keys:
- `seller_restrictedTitle` - "Seller Account Required"
- `seller_restrictedMessage` - Explanation for buyers
- `seller_goToSettings` - "Go to Settings" button
- `seller_restrictedFooter` - Additional info
- `seller_notSubmittedTitle` - "Complete Seller Registration"
- `seller_notSubmittedMessage` - Registration instructions
- `seller_startRegistration` - "Start Registration" button
- `seller_pendingTitle` - "Registration Under Review"
- `seller_pendingMessage` - Pending status explanation
- `seller_pendingBadge` - "⏱ Pending Review"
- `seller_rejectedTitle` - "Registration Rejected"
- `seller_rejectedMessage` - Rejection explanation
- `seller_rejectionLabel` - "Rejection Reason:"
- `seller_resubmit` - "Resubmit Documents" button

#### Seller Registration Form Keys:
- `sellerReg_title` - "Seller Registration"
- `sellerReg_subtitle` - Form description
- `sellerReg_personalInfo` - "Personal Information"
- `sellerReg_fullName` - "Full Name"
- `sellerReg_fullNamePlaceholder` - Input placeholder
- `sellerReg_ssid` - "SSID (Social Security ID)"
- `sellerReg_ssidPlaceholder` - Input placeholder
- `sellerReg_businessId` - "Business Registration Number"
- `sellerReg_businessIdPlaceholder` - Input placeholder
- `sellerReg_requiredDocs` - "Required Documents"
- `sellerReg_docsDescription` - Document upload instructions
- `sellerReg_commercialRegister` - "Commercial Register (RC)"
- `sellerReg_commercialRegisterDesc` - Document description
- `sellerReg_taxCertificate` - "Tax Certificate (NIF)"
- `sellerReg_taxCertificateDesc` - Document description
- `sellerReg_identityDoc` - "Identity Document"
- `sellerReg_identityDocDesc` - Document description
- `sellerReg_tapToUpload` - "Tap to upload"
- `sellerReg_infoMessage` - Review timeline info
- `sellerReg_submit` - "Submit for Review"
- `sellerReg_required` - "*" (required field indicator)

---

## Part 2: Settings Sub-Pages Color Update ⏳ PENDING

### Screens Needing Updates:

All screens below use static `COLORS` import and need to be updated to use dynamic `getColors(mode)`:

#### High Priority (User-Facing):
1. ✅ **UserSettingsScreen.tsx** - DONE
2. ⏳ **ProfileSettingsScreen.tsx** - Main profile editing
3. ⏳ **NotificationsScreen.tsx** - Notification settings
4. ⏳ **PaymentsScreen.tsx** - Payment methods
5. ⏳ **LanguagesScreen.tsx** - Language selection
6. ⏳ **AccountStatusScreen.tsx** - Account verification status
7. ⏳ **AccountTypeScreen.tsx** - Account type management

#### Medium Priority (Store Management):
8. ⏳ **DeliveryScreen.tsx** - Delivery settings
9. ⏳ **LocationsScreen.tsx** - Warehouse locations
10. ⏳ **TaxesDutiesScreen.tsx** - Tax configuration
11. ⏳ **TrackingSystemScreen.tsx** - Order tracking setup
12. ⏳ **PlanBillingScreen.tsx** - Subscription management
13. ⏳ **StoreSettingsScreen.tsx** - Individual store settings
14. ⏳ **ThemesScreen.tsx** - Store theme customization
15. ⏳ **DomainsScreen.tsx** - Custom domain management

#### Lower Priority (Admin/Advanced):
16. ⏳ **UsersPermissionsScreen.tsx** - Team management
17. ⏳ **PoliciesScreen.tsx** - Policy management
18. ⏳ **PolicyDetailScreen.tsx** - Individual policy view
19. ⏳ **UserNotificationsScreen.tsx** - User notification list
20. ⏳ **StoresDetailsScreen.tsx** - Store details view

#### Product/Order Screens:
21. ⏳ **ProductsScreen.tsx** - Product listing
22. ⏳ **OrdersScreen.tsx** - Order listing
23. ⏳ **AddEditProductScreen.tsx** - Product form
24. ⏳ **AddEditStoreScreen.tsx** - Store form
25. ⏳ **OrderTrackingScreen.tsx** - Order tracking view
26. ⏳ **AnalyticsScreen.tsx** - Analytics dashboard

---

## Update Pattern for Each Screen

### Step 1: Update Imports
```typescript
// OLD:
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

// NEW:
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';
```

### Step 2: Add Theme Hooks
```typescript
const ScreenName = ({ goBack }: Props) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  // ... rest of component
```

### Step 3: Add Header with Logo and Theme Toggle
```typescript
{/* Header with Logo and Theme Toggle */}
<View style={styles.topHeader}>
  <TouchableOpacity onPress={goBack} activeOpacity={0.7}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </TouchableOpacity>
  <Logo variant="icon" size={36} />
  <TouchableOpacity
    style={[styles.themeToggle, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
    onPress={toggleTheme}
    activeOpacity={0.7}
  >
    {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
  </TouchableOpacity>
</View>
```

### Step 4: Update Icon Components
```typescript
// OLD:
const IconName = () => (
  <Svg>
    <Path stroke={COLORS.primary} />
  </Svg>
);

// NEW:
const IconName = ({ color }: { color: string }) => (
  <Svg>
    <Path stroke={color} />
  </Svg>
);
```

### Step 5: Update Styles
```typescript
// Remove all color references from StyleSheet.create
// Apply colors inline using COLORS variable

// OLD:
const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  text: { color: COLORS.text },
});

// NEW:
const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 14 },
});

// In JSX:
<View style={[styles.container, { backgroundColor: COLORS.background }]}>
  <Text style={[styles.text, { color: COLORS.text }]}>Text</Text>
</View>
```

### Step 6: Add Sun/Moon Icons
```typescript
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="#FDB913" strokeWidth="2" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
```

---

## Estimated Work

- **Total Screens**: 26 screens
- **Time per Screen**: ~10-15 minutes
- **Total Estimated Time**: 4-6 hours
- **Priority**: High (affects user experience in dark mode)

---

## Benefits After Completion

1. ✅ **Consistent Design**: All screens match the modern design system
2. ✅ **Dark/Light Mode**: Full theme support across entire app
3. ✅ **Professional Look**: Logo and theme toggle on every screen
4. ✅ **Better UX**: Consistent navigation and visual hierarchy
5. ✅ **Maintainability**: Easier to update colors globally
6. ✅ **Brand Consistency**: Algerie Poste branding throughout

---

## Next Steps

1. **Commit Current Changes** ✅
   - i18n translations added
   - Seller verification system complete
   - StoresScreen, UserSettingsScreen, SellerRegistrationScreen updated

2. **Update Settings Sub-Pages** (Next Session)
   - Start with high-priority user-facing screens
   - Then store management screens
   - Finally admin/advanced screens

3. **Update Product/Order Screens** (Future)
   - ProductsScreen
   - OrdersScreen
   - Related forms and detail views

4. **Testing**
   - Test dark/light mode on all screens
   - Verify translations work correctly
   - Check navigation flow

---

## Files Modified (Current Session)

1. `Frontend/src/i18n/en.ts` - Added seller verification keys
2. `Frontend/src/i18n/fr.ts` - Added French translations
3. `Frontend/src/i18n/ar.ts` - Added Arabic translations
4. `Frontend/src/screens/StoresScreen.tsx` - Updated with verification system
5. `Frontend/src/screens/UserSettingsScreen.tsx` - Updated with theme support
6. `Frontend/src/screens/SellerRegistrationScreen.tsx` - Complete redesign

---

**Status**: Ready to commit and push
**Next**: Update remaining settings sub-pages in next session
