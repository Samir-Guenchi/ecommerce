import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

interface PolicyDetailScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  policyId?: string;
  policyTitle?: string;
}

const PolicyDetailScreen: React.FC<PolicyDetailScreenProps> = ({ navigate, goBack, policyId, policyTitle }) => {
  // Policy content based on policyId
  const getPolicyContent = (id: string | undefined) => {
    switch (id) {
      case '1':
        return {
          title: 'Terms of Service',
          lastUpdated: '2024-01-01',
          content: `TERMS OF SERVICE

Last Updated: January 1, 2024

1. ACCEPTANCE OF TERMS
By accessing and using Algerie Post platform, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily access the materials on Algerie Post's website for personal, non-commercial transitory viewing only.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

4. PRODUCTS AND SERVICES
All products and services are subject to availability. We reserve the right to discontinue any product at any time.

5. PRICING AND PAYMENT
Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice.

6. SHIPPING AND DELIVERY
We will arrange for shipment of products to you. Please check the individual product page for specific delivery options and costs.

7. RETURNS AND REFUNDS
Our return policy is detailed in our Refund Policy. Please review it before making a purchase.

8. INTELLECTUAL PROPERTY
The Service and its original content, features, and functionality are and will remain the exclusive property of Algerie Post.

9. LIMITATION OF LIABILITY
In no event shall Algerie Post, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.

10. GOVERNING LAW
These Terms shall be interpreted and governed by the laws of Algeria.

11. CHANGES TO TERMS
We reserve the right, at our sole discretion, to modify or replace these Terms at any time.

12. CONTACT INFORMATION
If you have any questions about these Terms, please contact us at support@algeriepost.dz`,
        };
      case '2':
        return {
          title: 'Privacy Policy',
          lastUpdated: '2024-01-01',
          content: `PRIVACY POLICY

Last Updated: January 1, 2024

1. INFORMATION WE COLLECT
We collect information that you provide directly to us, including:
- Name and contact information
- Payment information
- Shipping address
- Account credentials

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Process and fulfill your orders
- Communicate with you about your orders
- Send you marketing communications (with your consent)
- Improve our services

3. INFORMATION SHARING
We do not sell, trade, or rent your personal information to third parties. We may share your information with:
- Service providers who assist us in operating our platform
- Legal authorities when required by law

4. DATA SECURITY
We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

5. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

6. COOKIES
We use cookies to enhance your experience. You can choose to disable cookies through your browser settings.

7. CHILDREN'S PRIVACY
Our service is not intended for children under 18. We do not knowingly collect personal information from children.

8. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

9. CONTACT US
If you have questions about this Privacy Policy, please contact us at privacy@algeriepost.dz`,
        };
      case '3':
        return {
          title: 'Refund Policy',
          lastUpdated: '2023-12-15',
          content: `REFUND POLICY

Last Updated: December 15, 2023

1. REFUND ELIGIBILITY
You may request a refund within 14 days of receiving your order, provided that:
- The product is unused and in its original packaging
- The product is not a perishable or custom-made item
- You have proof of purchase

2. REFUND PROCESS
To request a refund:
- Contact our customer service team
- Provide your order number and reason for return
- We will review your request within 5 business days
- If approved, we will process your refund within 10 business days

3. RETURN SHIPPING
Return shipping costs are the responsibility of the customer unless the product is defective or incorrect.

4. REFUND METHOD
Refunds will be issued to the original payment method used for the purchase.

5. NON-REFUNDABLE ITEMS
The following items are not eligible for refund:
- Perishable goods
- Custom-made or personalized products
- Digital products that have been downloaded
- Gift cards

6. PARTIAL REFUNDS
Partial refunds may be issued for:
- Products returned in used condition
- Missing accessories or parts
- Products damaged by the customer

7. EXCHANGES
We offer exchanges for defective or incorrect items. Please contact us within 7 days of receipt.

8. CONTACT INFORMATION
For refund requests, please contact us at refunds@algeriepost.dz`,
        };
      case '4':
        return {
          title: 'Shipping Policy',
          lastUpdated: '2023-12-15',
          content: `SHIPPING POLICY

Last Updated: December 15, 2023

1. SHIPPING AREAS
We currently ship to all regions within Algeria. International shipping may be available for select products.

2. SHIPPING METHODS
We offer the following shipping methods:
- Standard Shipping: 5-7 business days
- Express Shipping: 2-3 business days
- Same-Day Delivery: Available in select areas

3. SHIPPING COSTS
Shipping costs are calculated at checkout based on:
- Package weight and dimensions
- Shipping method selected
- Delivery destination

4. PROCESSING TIME
Orders are typically processed within 1-2 business days. Processing may take longer during peak seasons.

5. TRACKING INFORMATION
Once your order ships, you will receive a tracking number via email. You can track your package using our tracking system.

6. DELIVERY
Delivery is made to the address provided during checkout. Please ensure your address is correct and complete.

7. DELAYED ORDERS
If your order is delayed, we will notify you via email. We are not responsible for delays caused by:
- Incorrect address information
- Weather conditions
- Carrier delays

8. DAMAGED ORDERS
If your order arrives damaged, please contact us within 48 hours of delivery with photos of the damage.

9. UNDELIVERABLE PACKAGES
If a package cannot be delivered, it will be returned to us. You will be responsible for return shipping costs.

10. CONTACT INFORMATION
For shipping inquiries, please contact us at shipping@algeriepost.dz`,
        };
      case '5':
        return {
          title: 'Cookie Policy',
          lastUpdated: '2024-01-01',
          content: `COOKIE POLICY

Last Updated: January 1, 2024

1. WHAT ARE COOKIES
Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.

2. TYPES OF COOKIES WE USE
We use the following types of cookies:
- Essential Cookies: Required for the website to function
- Analytics Cookies: Help us understand how visitors use our site
- Marketing Cookies: Used to deliver relevant advertisements

3. HOW WE USE COOKIES
We use cookies to:
- Remember your preferences
- Analyze website traffic
- Improve our services
- Personalize your experience

4. THIRD-PARTY COOKIES
We may use third-party services that set cookies on your device. These services help us:
- Analyze website usage
- Provide customer support
- Process payments

5. MANAGING COOKIES
You can control cookies through your browser settings. However, disabling cookies may affect website functionality.

6. COOKIE CONSENT
By using our website, you consent to our use of cookies in accordance with this policy.

7. UPDATES TO THIS POLICY
We may update this Cookie Policy from time to time. Please review it periodically.

8. CONTACT INFORMATION
For questions about our use of cookies, please contact us at privacy@algeriepost.dz`,
        };
      default:
        return {
          title: policyTitle || 'Policy',
          lastUpdated: '2024-01-01',
          content: 'Policy content not available.',
        };
    }
  };

  const policy = getPolicyContent(policyId);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <PolicyIcon />
          </View>
        </View>
        <Text style={styles.heading}>{policy.title}</Text>
        <Text style={styles.lastUpdated}>Last Updated: {policy.lastUpdated}</Text>

        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{policy.content}</Text>
        </View>
      </ScrollView>

      {goBack && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  contentText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 22,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PolicyDetailScreen;



