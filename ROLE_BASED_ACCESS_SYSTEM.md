# Role-Based Access Control System

## Date: February 9, 2026
## Status: ✅ Complete Implementation Plan

---

## Overview

Complete role-based access control system with buyer/seller separation, admin approval workflow, and seller rating system.

---

## User Roles

### 1. **Buyer** (Default)
- Can browse stores and products
- Can place orders
- Can track orders
- Can rate sellers after purchase
- **Cannot** access Products page (no inventory management)
- **Cannot** create stores

**Navigation Tabs**:
- Dashboard (Home)
- Stores (Browse)
- Orders (My Orders)
- Settings

### 2. **Seller** (Requires Approval)
- All buyer capabilities
- Can create and manage stores
- Can add/edit products
- Can manage inventory
- Can view sales analytics
- Can respond to ratings

**Navigation Tabs**:
- Dashboard (Home)
- Products (Inventory)
- Orders (Sales)
- Stores (My Stores)
- Settings

### 3. **Admin**
- All seller capabilities
- Can approve/reject seller applications
- Can view all users
- Can moderate ratings
- Can manage platform settings

**Navigation Tabs**:
- Dashboard (Admin Overview)
- Products (All Products)
- Orders (All Orders)
- Stores (All Stores)
- Settings (Platform Settings)

---

## Seller Verification Workflow

### Step 1: User Requests Seller Status
**Location**: Settings > Account Type

**Process**:
1. User clicks "Become a Seller"
2. Redirected to Seller Registration Screen
3. Must provide:
   - Full Name
   - SSID (Social Security ID)
   - Business Registration Number
   - **Required Documents**:
     - Commercial Register (RC)
     - Tax Certificate (NIF)
     - Identity Document (National ID/Passport)

### Step 2: Document Upload
**Screen**: `SellerRegistrationScreen.tsx`

**Features**:
- Document picker for each required document
- File validation (PDF, JPG, PNG, max 5MB)
- Preview uploaded documents
- Submit button (disabled until all docs uploaded)

### Step 3: Admin Review
**Status**: `pending`

**Admin Dashboard**:
- View all pending seller applications
- Review uploaded documents
- Approve or Reject with reason
- Send notification to user

### Step 4: Approval/Rejection
**Approved**:
- User account type changes to `seller`
- Gains access to Products and Store management
- Navigation updates automatically
- Can start creating stores

**Rejected**:
- User receives rejection reason
- Can resubmit with corrected documents
- Remains as buyer until approved

---

## Seller Rating System

### When Can Buyers Rate?
- **Only after order is delivered**
- One rating per order
- Cannot rate own orders

### Rating Components

#### 1. Overall Rating (1-5 stars)
Main rating displayed prominently

#### 2. Category Ratings (1-5 stars each)
- **Product Quality**: Item matches description, quality as expected
- **Communication**: Seller responsiveness, helpfulness
- **Shipping Speed**: How fast item was shipped
- **Packaging**: Item packaging quality and protection

#### 3. Written Review (Optional)
Text review with buyer's experience

#### 4. Seller Response (Optional)
Seller can respond to ratings professionally

### Rating Display

**Seller Profile**:
```
★★★★☆ 4.5 (234 ratings)

Product Quality:    ★★★★★ 4.8
Communication:      ★★★★☆ 4.6
Shipping Speed:     ★★★★☆ 4.3
Packaging:          ★★★★☆ 4.4

Rating Distribution:
5 stars: ████████████████████ 150 (64%)
4 stars: ████████░░░░░░░░░░░░  50 (21%)
3 stars: ███░░░░░░░░░░░░░░░░░  20 (9%)
2 stars: ██░░░░░░░░░░░░░░░░░░  10 (4%)
1 star:  █░░░░░░░░░░░░░░░░░░░   4 (2%)
```

**Individual Rating Card**:
```
┌─────────────────────────────────────────┐
│ ★★★★★ 5.0                               │
│ John Doe • 2 days ago                   │
│                                         │
│ "Excellent seller! Product exactly as  │
│ described. Fast shipping and great     │
│ packaging. Highly recommended!"        │
│                                         │
│ Product Quality: ★★★★★                 │
│ Communication: ★★★★★                   │
│ Shipping: ★★★★★                        │
│ Packaging: ★★★★★                       │
│                                         │
│ ┌─ Seller Response ─────────────────┐ │
│ │ Thank you for your kind review!   │ │
│ │ We're glad you're satisfied.      │ │
│ │ - Store Owner • 1 day ago         │ │
│ └───────────────────────────────────┘ │
│                                         │
│ 👍 Helpful (23)                        │
└─────────────────────────────────────────┘
```

---

## Database Schema

### SellerRating Table
```sql
CREATE TABLE seller_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  store_id INT,
  order_id INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  review TEXT,
  product_quality DECIMAL(2,1),
  communication DECIMAL(2,1),
  shipping_speed DECIMAL(2,1),
  packaging DECIMAL(2,1),
  seller_response TEXT,
  seller_response_date TIMESTAMP,
  status ENUM('active', 'hidden', 'reported') DEFAULT 'active',
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  UNIQUE KEY unique_order_rating (order_id, buyer_id)
);
```

### User Table Updates
```sql
ALTER TABLE users 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN total_ratings INT DEFAULT 0,
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

---

## API Endpoints

### Rating Endpoints

#### Create Rating
```
POST /api/ratings
Body: {
  orderId: number,
  sellerId: number,
  storeId: number,
  rating: number (1-5),
  review: string,
  productQuality: number,
  communication: number,
  shippingSpeed: number,
  packaging: number
}
```

#### Get Seller Ratings
```
GET /api/ratings/seller/:sellerId?page=1&limit=10
Response: {
  ratings: Rating[],
  pagination: {...},
  stats: {
    averageRating: number,
    totalRatings: number,
    avgProductQuality: number,
    avgCommunication: number,
    avgShippingSpeed: number,
    avgPackaging: number
  },
  distribution: [
    { stars: 5, count: 150 },
    { stars: 4, count: 50 },
    ...
  ]
}
```

#### Seller Responds to Rating
```
POST /api/ratings/:ratingId/respond
Body: {
  response: string
}
```

#### Mark Rating as Helpful
```
POST /api/ratings/:ratingId/helpful
```

#### Check if Can Rate Order
```
GET /api/ratings/can-rate/:orderId
Response: {
  canRate: boolean,
  reason?: string
}
```

### Admin Endpoints

#### Get Pending Seller Applications
```
GET /api/admin/seller-applications?status=pending
```

#### Approve Seller Application
```
POST /api/admin/seller-applications/:id/approve
```

#### Reject Seller Application
```
POST /api/admin/seller-applications/:id/reject
Body: {
  reason: string
}
```

---

## Frontend Components

### 1. RoleBasedBottomNav
**File**: `Frontend/src/screens/BottomNav.tsx`

**Features**:
- Automatically detects user role from AsyncStorage
- Shows different tabs based on role:
  - Buyer: Dashboard, Stores, Orders, Settings (4 tabs)
  - Seller: Dashboard, Products, Orders, Stores, Settings (5 tabs)
  - Admin: All tabs with admin features

### 2. SellerRatingModal
**File**: `Frontend/src/components/SellerRatingModal.tsx` (To Create)

**Features**:
- Star rating input (1-5)
- Category ratings (Product Quality, Communication, etc.)
- Text review input
- Submit button
- Shows after order is delivered

### 3. SellerRatingsList
**File**: `Frontend/src/components/SellerRatingsList.tsx` (To Create)

**Features**:
- Display all ratings for a seller
- Show average rating and stats
- Rating distribution chart
- Individual rating cards
- Seller responses
- Helpful button

### 4. AdminSellerApprovalScreen
**File**: `Frontend/src/screens/AdminSellerApprovalScreen.tsx` (To Create)

**Features**:
- List of pending applications
- View uploaded documents
- Approve/Reject buttons
- Rejection reason input
- Application history

---

## Implementation Checklist

### Backend ✅
- [x] Create SellerRating entity
- [x] Create rating controller
- [x] Update User entity with rating fields
- [ ] Create rating routes
- [ ] Add admin approval endpoints
- [ ] Update seller registration to set status

### Frontend
- [x] Update BottomNav with role-based tabs
- [ ] Create SellerRatingModal component
- [ ] Create SellerRatingsList component
- [ ] Create AdminSellerApprovalScreen
- [ ] Update OrdersScreen to show "Rate Seller" button
- [ ] Update StoreDetailsScreen to show seller ratings
- [ ] Add rating notification system

### Database
- [ ] Run migration to add rating fields to users table
- [ ] Create seller_ratings table
- [ ] Add indexes for performance

---

## User Flow Examples

### Buyer Wants to Become Seller

1. **Navigate**: Settings > Account Type
2. **Click**: "Become a Seller" button
3. **Fill Form**: Personal info + business details
4. **Upload**: 3 required documents (RC, NIF, ID)
5. **Submit**: Application sent to admin
6. **Wait**: Status shows "Pending Review"
7. **Notification**: Approved or Rejected
8. **If Approved**: Navigation updates, can create stores
9. **If Rejected**: Can resubmit with corrections

### Buyer Rates Seller After Purchase

1. **Order Delivered**: Status changes to "delivered"
2. **Navigate**: Orders > View Order Details
3. **See Button**: "Rate Seller" (only if not rated)
4. **Click**: Opens rating modal
5. **Rate**: Overall + category ratings
6. **Write**: Optional review text
7. **Submit**: Rating saved
8. **View**: Rating appears on seller profile
9. **Seller**: Can respond to rating

### Admin Approves Seller

1. **Navigate**: Admin Dashboard > Seller Applications
2. **Filter**: Pending applications
3. **Click**: View application details
4. **Review**: Documents (RC, NIF, ID)
5. **Decision**: Approve or Reject
6. **If Reject**: Enter reason
7. **Submit**: User notified
8. **If Approved**: User becomes seller immediately

---

## Security Considerations

1. **Document Verification**: Admin must verify authenticity
2. **Rating Abuse**: One rating per order, cannot rate self
3. **Admin Access**: Only users with `isAdmin=true`
4. **Role Enforcement**: Backend validates user role for all actions
5. **Document Storage**: Secure storage with access control

---

## Future Enhancements

1. **Seller Badges**: "Top Rated", "Fast Shipper", "Verified"
2. **Rating Analytics**: Trends over time for sellers
3. **Dispute System**: Buyers can dispute ratings
4. **Automated Approval**: AI-based document verification
5. **Seller Tiers**: Bronze, Silver, Gold based on ratings
6. **Rating Incentives**: Discounts for leaving reviews

---

**Status**: Ready for Implementation
**Priority**: High
**Estimated Time**: 2-3 days for full implementation
