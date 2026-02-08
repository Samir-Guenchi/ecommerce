import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { productAPI, storeAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';

// Product Icon
const ProductIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 6H21"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Image Upload Icon
const ImageIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 19V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19Z"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 15L16 10L5 21"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AddEditProductScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
  productId?: string;
}

const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({ navigate, goBack, productId }) => {
  const isEditMode = !!productId;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stores
        const storesResponse = await storeAPI.getAllStores();
        setStores(storesResponse.stores);
        if (storesResponse.stores.length > 0) {
          setSelectedStoreId(storesResponse.stores[0].id);
        }

        // Load product if editing
        if (isEditMode && productId) {
          setLoading(true);
          const productResponse = await productAPI.getProductById(parseInt(productId, 10));
          const product = productResponse.product;
          setProductName(product.name);
          setProductPrice(product.price.toString());
          setProductDescription(product.description || '');
          setProductStock(product.stock.toString());
          setProductCategory(product.category || '');
          setProductImage(product.imagePath);
          setSelectedStoreId(product.storeId);
        }
      } catch (error: any) {
        showError(error.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditMode, productId]);

  const handleImageUpload = async () => {
    const confirmed = await confirmAction('Upload Image', 'Image upload functionality will be available soon. Simulate upload?');
    if (!confirmed) return;
    setProductImage('product_image.jpg');
  };

  const handleSave = async () => {
    if (!productName || !productPrice) {
      showError('Please fill in product name and price');
      return;
    }

    if (!selectedStoreId) {
      showError('Please select a store');
      return;
    }

    try {
      setSaving(true);
      const productData = {
        storeId: selectedStoreId,
        name: productName,
        description: productDescription || undefined,
        price: parseFloat(productPrice),
        stock: productStock ? parseInt(productStock, 10) : 0,
        category: productCategory || undefined,
        imagePath: productImage || undefined,
        status: 'active',
      };

      if (isEditMode && productId) {
        await productAPI.updateProduct(parseInt(productId, 10), productData);
        showSuccess('Product updated successfully.');
      } else {
        await productAPI.createProduct(productData);
        showSuccess('Product added successfully.');
      }

      if (goBack) {
        goBack();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (stores.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No stores found</Text>
        <Text style={styles.loadingSubtext}>Please create a store first</Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigate?.('stores')}
        >
          <Text style={styles.submitButtonText}>Go to Stores</Text>
        </TouchableOpacity>
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
          <ProductIcon />
        </View>
      </View>
      <Text style={styles.heading}>{isEditMode ? 'Edit Product' : 'Add Product'}</Text>
      <Text style={styles.subheading}>
        {isEditMode ? 'Update product information.' : 'Add a new product to your store.'}
      </Text>
      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

      <View style={styles.formSection}>
        <View style={styles.imageUploadContainer}>
          <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
            {productImage ? (
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>Image</Text>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon />
                <Text style={styles.imagePlaceholderText}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Store *</Text>
          <View style={styles.storeSelector}>
            {stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeOption,
                  selectedStoreId === store.id && styles.storeOptionActive,
                ]}
                onPress={() => setSelectedStoreId(store.id)}
              >
                <Text
                  style={[
                    styles.storeOptionText,
                    selectedStoreId === store.id && styles.storeOptionTextActive,
                  ]}
                >
                  {store.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor={COLORS.textMuted}
            value={productName}
            onChangeText={setProductName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor={COLORS.textMuted}
            value={productPrice}
            onChangeText={setProductPrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stock Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter stock quantity"
            placeholderTextColor={COLORS.textMuted}
            value={productStock}
            onChangeText={setProductStock}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={productCategory}
            onChangeText={setProductCategory}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            placeholderTextColor={COLORS.textMuted}
            value={productDescription}
            onChangeText={setProductDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Update Product' : 'Add Product'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        {isEditMode ? 'Changes will be saved immediately.' : 'Product will be added to your store catalog.'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  formSection: {
    marginBottom: 8,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageUploadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  storeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  storeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  storeOptionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  storeOptionTextActive: {
    color: COLORS.background,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});

export default AddEditProductScreen;

