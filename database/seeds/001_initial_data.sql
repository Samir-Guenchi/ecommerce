-- ============================================
-- Algérie Poste E-Commerce Database Seeds
-- Development & Testing Data
-- PostgreSQL Version
-- ============================================

-- ============================================
-- WILAYAS (All 58 Algerian Provinces)
-- ============================================

INSERT INTO wilayas (code, name_ar, name_fr, shipping_zone) VALUES
('01', 'أدرار', 'Adrar', 'zone3'),
('02', 'الشلف', 'Chlef', 'zone1'),
('03', 'الأغواط', 'Laghouat', 'zone2'),
('04', 'أم البواقي', 'Oum El Bouaghi', 'zone2'),
('05', 'باتنة', 'Batna', 'zone2'),
('06', 'بجاية', 'Béjaïa', 'zone1'),
('07', 'بسكرة', 'Biskra', 'zone2'),
('08', 'بشار', 'Béchar', 'zone3'),
('09', 'البليدة', 'Blida', 'zone1'),
('10', 'البويرة', 'Bouira', 'zone1'),
('11', 'تمنراست', 'Tamanrasset', 'zone3'),
('12', 'تبسة', 'Tébessa', 'zone2'),
('13', 'تلمسان', 'Tlemcen', 'zone1'),
('14', 'تيارت', 'Tiaret', 'zone2'),
('15', 'تيزي وزو', 'Tizi Ouzou', 'zone1'),
('16', 'الجزائر', 'Alger', 'zone1'),
('17', 'الجلفة', 'Djelfa', 'zone2'),
('18', 'جيجل', 'Jijel', 'zone1'),
('19', 'سطيف', 'Sétif', 'zone1'),
('20', 'سعيدة', 'Saïda', 'zone2'),
('21', 'سكيكدة', 'Skikda', 'zone1'),
('22', 'سيدي بلعباس', 'Sidi Bel Abbès', 'zone1'),
('23', 'عنابة', 'Annaba', 'zone1'),
('24', 'قالمة', 'Guelma', 'zone2'),
('25', 'قسنطينة', 'Constantine', 'zone1'),
('26', 'المدية', 'Médéa', 'zone1'),
('27', 'مستغانم', 'Mostaganem', 'zone1'),
('28', 'المسيلة', 'M''Sila', 'zone2'),
('29', 'معسكر', 'Mascara', 'zone1'),
('30', 'ورقلة', 'Ouargla', 'zone3'),
('31', 'وهران', 'Oran', 'zone1'),
('32', 'البيض', 'El Bayadh', 'zone2'),
('33', 'إليزي', 'Illizi', 'zone3'),
('34', 'برج بوعريريج', 'Bordj Bou Arréridj', 'zone2'),
('35', 'بومرداس', 'Boumerdès', 'zone1'),
('36', 'الطارف', 'El Tarf', 'zone1'),
('37', 'تندوف', 'Tindouf', 'zone3'),
('38', 'تيسمسيلت', 'Tissemsilt', 'zone2'),
('39', 'الوادي', 'El Oued', 'zone2'),
('40', 'خنشلة', 'Khenchela', 'zone2'),
('41', 'سوق أهراس', 'Souk Ahras', 'zone2'),
('42', 'تيبازة', 'Tipaza', 'zone1'),
('43', 'ميلة', 'Mila', 'zone2'),
('44', 'عين الدفلى', 'Aïn Defla', 'zone1'),
('45', 'النعامة', 'Naâma', 'zone2'),
('46', 'عين تموشنت', 'Aïn Témouchent', 'zone1'),
('47', 'غرداية', 'Ghardaïa', 'zone2'),
('48', 'غليزان', 'Relizane', 'zone1'),
('49', 'تميمون', 'Timimoun', 'zone3'),
('50', 'برج باجي مختار', 'Bordj Badji Mokhtar', 'zone3'),
('51', 'أولاد جلال', 'Ouled Djellal', 'zone2'),
('52', 'بني عباس', 'Béni Abbès', 'zone3'),
('53', 'عين صالح', 'In Salah', 'zone3'),
('54', 'عين قزام', 'In Guezzam', 'zone3'),
('55', 'توقرت', 'Touggourt', 'zone2'),
('56', 'جانت', 'Djanet', 'zone3'),
('57', 'المغير', 'El M''Ghair', 'zone2'),
('58', 'المنيعة', 'El Meniaa', 'zone3')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- THEMES
-- ============================================

INSERT INTO themes (name, description, preview_image, is_active) VALUES
('Classic', 'Clean and professional theme suitable for all products', '/themes/classic.png', TRUE),
('Modern', 'Contemporary design with bold colors', '/themes/modern.png', TRUE),
('Minimal', 'Simple and elegant minimalist design', '/themes/minimal.png', TRUE),
('Traditional', 'Theme inspired by Algerian traditional patterns', '/themes/traditional.png', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================

INSERT INTO plans (name, description, price, billing_period, features, max_products, max_orders, commission_rate, is_active) VALUES
('Starter', 'Perfect for new sellers starting their journey', 0.00, 'monthly', 
  '{"features": ["Up to 10 products", "Basic analytics", "Email support", "Standard shipping rates"]}', 
  10, 50, 10.00, TRUE),

('Professional', 'For growing businesses with more needs', 2999.00, 'monthly', 
  '{"features": ["Up to 100 products", "Advanced analytics", "Priority support", "Reduced commission", "Custom domain"]}', 
  100, 500, 7.00, TRUE),

('Business', 'For established businesses with high volume', 7999.00, 'monthly', 
  '{"features": ["Unlimited products", "Full analytics suite", "Dedicated support", "Lowest commission", "Custom domain", "API access"]}', 
  -1, -1, 4.00, TRUE),

('Enterprise', 'Custom solutions for large enterprises', 19999.00, 'monthly', 
  '{"features": ["Everything in Business", "White-label option", "SLA guarantee", "Account manager", "Custom integrations"]}', 
  -1, -1, 2.50, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Electronics', 'electronics', NULL, 'Electronic devices and accessories', TRUE, 1),
('Fashion', 'fashion', NULL, 'Clothing, shoes, and accessories', TRUE, 2),
('Home & Garden', 'home-garden', NULL, 'Home decor and garden supplies', TRUE, 3),
('Health & Beauty', 'health-beauty', NULL, 'Health, beauty, and personal care', TRUE, 4),
('Sports & Outdoors', 'sports-outdoors', NULL, 'Sports equipment and outdoor gear', TRUE, 5),
('Books & Media', 'books-media', NULL, 'Books, music, and movies', TRUE, 6),
('Food & Groceries', 'food-groceries', NULL, 'Food products and groceries', TRUE, 7),
('Handmade & Crafts', 'handmade-crafts', NULL, 'Handmade and artisan products', TRUE, 8)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Electronics (parent_id = 1)
INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Smartphones', 'smartphones', 1, 'Mobile phones and accessories', TRUE, 1),
('Computers', 'computers', 1, 'Laptops, desktops, and accessories', TRUE, 2),
('Audio', 'audio', 1, 'Headphones, speakers, and audio equipment', TRUE, 3),
('Cameras', 'cameras', 1, 'Cameras and photography equipment', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Fashion (parent_id = 2)
INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Men''s Clothing', 'mens-clothing', 2, 'Clothing for men', TRUE, 1),
('Women''s Clothing', 'womens-clothing', 2, 'Clothing for women', TRUE, 2),
('Shoes', 'shoes', 2, 'Footwear for all', TRUE, 3),
('Accessories', 'accessories', 2, 'Fashion accessories', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DEMO USERS (Passwords: Test123!)
-- Password hash for 'Test123!' using bcrypt
-- ============================================

INSERT INTO users (email, password_hash, full_name, phone, account_type, account_status) VALUES
('admin@algerie-poste.dz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G8xG4Gs8xS5TA2', 'Admin System', '+213555000001', 'both', 'active'),
('seller@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G8xG4Gs8xS5TA2', 'Mohamed Seller', '+213555000002', 'seller', 'active'),
('buyer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G8xG4Gs8xS5TA2', 'Amina Buyer', '+213555000003', 'buyer', 'active')
ON CONFLICT (email) DO NOTHING;

-- Seller Registration for demo seller
INSERT INTO seller_registrations (user_id, full_name, ssid, business_id, cnrc_number, verification_status, verified_at, verified_by)
SELECT 2, 'Mohamed Seller', '123456789012345', 'BIZ-2024-001', 'CNRC-16-123456', 'approved', NOW(), 1
WHERE EXISTS (SELECT 1 FROM users WHERE id = 2);

-- Demo Store
INSERT INTO stores (user_id, name, status, location, wilaya, description, theme_id, trust_score, total_sales)
SELECT 2, 'Tech Algérie', 'active', 'Alger Centre', 'Alger', 'Your trusted source for electronics and gadgets in Algeria', 1, 4.50, 150
WHERE EXISTS (SELECT 1 FROM users WHERE id = 2);

-- Demo Products
INSERT INTO products (store_id, name, description, price, stock, status, category, category_id, rating, review_count) VALUES
(1, 'Smartphone Galaxy A54', 'Latest Samsung Galaxy A54 with 128GB storage', 85000.00, 25, 'active', 'smartphones', 9, 4.5, 45),
(1, 'Wireless Earbuds Pro', 'True wireless earbuds with active noise cancellation', 12500.00, 50, 'active', 'audio', 11, 4.3, 28),
(1, 'Laptop HP Pavilion', '15.6" Full HD, Intel Core i5, 8GB RAM, 512GB SSD', 145000.00, 10, 'active', 'computers', 10, 4.7, 15),
(1, 'Smart Watch X200', 'Fitness tracker with heart rate monitor and GPS', 18000.00, 35, 'active', 'electronics', 1, 4.2, 22),
(1, 'Portable Bluetooth Speaker', 'Waterproof speaker with 20-hour battery life', 8500.00, 40, 'active', 'audio', 11, 4.4, 33)
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO USER ADDRESSES
-- ============================================

INSERT INTO user_addresses (user_id, name, full_name, phone, wilaya, commune, street, postal_code, is_default, address_type)
SELECT 3, 'Home', 'Amina Buyer', '+213555000003', 'Alger', 'Hussein Dey', '123 Rue de la Liberté', '16000', TRUE, 'both'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 3);

-- ============================================
-- END OF SEEDS
-- ============================================
