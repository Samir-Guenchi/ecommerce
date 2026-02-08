import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, AlertIcon, TruckIcon } from './icons/Icons';
import './OrderModal.css';
import algeriaCities from '../../../static/willayas/algeria_cities.json';
import shippingPrices from '../../../static/shipping prices/shipping_prices.json';

interface OrderModalProps {
  product: any;
  domain: string;
  onClose: () => void;
  onOrder: (orderData: any) => void;
}

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, onClose, onOrder }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'stop_desk' | 'domicile'>('domicile');
  const [communes, setCommunes] = useState<string[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(typeof product.price === 'number' ? product.price : parseFloat(product.price));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const wilayas = [...new Set(algeriaCities.map((city: any) => city.wilaya_name))];

  // Validation functions with helpful micro-copy
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          return 'Veuillez entrer votre nom complet pour la livraison';
        }
        if (value.length < 3) {
          return 'Votre nom doit contenir au moins 3 caractères';
        }
        return '';

      case 'phone':
        if (!value.trim()) {
          return 'Nous avons besoin de votre numéro pour vous contacter';
        }
        if (!/^0[567]\d{8}$/.test(value.replace(/\s/g, ''))) {
          return 'Le numéro doit commencer par 05, 06, ou 07 (10 chiffres)';
        }
        return '';

      case 'wilaya':
        if (!value) {
          return 'Sélectionnez votre wilaya pour calculer les frais de livraison';
        }
        return '';

      case 'commune':
        if (!value) {
          return 'Choisissez votre commune pour finaliser l\'adresse';
        }
        return '';

      default:
        return '';
    }
  };

  // Real-time validation
  const handleFieldChange = (field: string, value: string) => {
    // Update value
    switch (field) {
      case 'fullName':
        setFullName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'wilaya':
        setWilaya(value);
        break;
      case 'commune':
        setCommune(value);
        break;
    }

    // Validate only if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Focus trapping for accessibility
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (wilaya) {
      const filteredCommunes = algeriaCities
        .filter((city: any) => city.wilaya_name === wilaya)
        .map((city: any) => city.commune_name);
      setCommunes([...new Set(filteredCommunes)]);
      setCommune('');
    }
  }, [wilaya]);

  useEffect(() => {
    if (wilaya && deliveryType) {
      const key = deliveryType === 'stop_desk' ? 'Tarif Stop Desk Classique' : 'Tarif à Domicile Classique';
      const cost = (shippingPrices as any)[wilaya]?.[key] || 0;
      setShippingCost(cost);
      setTotal((typeof product.price === 'number' ? product.price : parseFloat(product.price)) + cost);
    }
  }, [wilaya, deliveryType, product.price]);

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: ValidationErrors = {
      fullName: validateField('fullName', fullName),
      phone: validateField('phone', phone),
      wilaya: validateField('wilaya', wilaya),
      commune: validateField('commune', commune),
    };

    setErrors(newErrors);
    setTouched({ fullName: true, phone: true, wilaya: true, commune: true });

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      // Focus first error field
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key as keyof ValidationErrors]);
      if (firstErrorField) {
        const input = modalRef.current?.querySelector(`#${firstErrorField}-input`) as HTMLElement;
        input?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onOrder({
        productId: product.id,
        quantity: 1,
        fullName,
        phone,
        wilaya,
        commune,
        deliveryType,
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const formattedPrice = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            Commander {product.name}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Fermer la fenêtre de commande"
            type="button"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="form-group">
            <label htmlFor="fullName-input" className="form-label">
              Nom complet <span className="required-asterisk" aria-label="requis">*</span>
            </label>
            <input
              id="fullName-input"
              ref={firstInputRef}
              type="text"
              value={fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => handleFieldBlur('fullName', fullName)}
              placeholder="Ex: Ahmed Benali"
              className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && (
              <div id="fullName-error" className="error-message" role="alert">
                <AlertIcon size={16} color="var(--color-error)" />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone-input" className="form-label">
              Numéro de téléphone <span className="required-asterisk" aria-label="requis">*</span>
            </label>
            <input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleFieldBlur('phone', phone)}
              placeholder="Ex: 0555123456"
              className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <div id="phone-error" className="error-message" role="alert">
                <AlertIcon size={16} color="var(--color-error)" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wilaya-input" className="form-label">
              Wilaya <span className="required-asterisk" aria-label="requis">*</span>
            </label>
            <select
              id="wilaya-input"
              value={wilaya}
              onChange={(e) => handleFieldChange('wilaya', e.target.value)}
              onBlur={() => handleFieldBlur('wilaya', wilaya)}
              className={`form-input ${errors.wilaya ? 'form-input--error' : ''}`}
              aria-invalid={!!errors.wilaya}
              aria-describedby={errors.wilaya ? "wilaya-error" : undefined}
            >
              <option value="">Sélectionnez votre wilaya</option>
              {wilayas.map((w: string) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.wilaya && (
              <div id="wilaya-error" className="error-message" role="alert">
                <AlertIcon size={16} color="var(--color-error)" />
                <span>{errors.wilaya}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="commune-input" className="form-label">
              Commune <span className="required-asterisk" aria-label="requis">*</span>
            </label>
            <select
              id="commune-input"
              value={commune}
              onChange={(e) => handleFieldChange('commune', e.target.value)}
              onBlur={() => handleFieldBlur('commune', commune)}
              disabled={!wilaya}
              className={`form-input ${errors.commune ? 'form-input--error' : ''}`}
              aria-invalid={!!errors.commune}
              aria-describedby={errors.commune ? "commune-error" : "commune-hint"}
            >
              <option value="">Sélectionnez votre commune</option>
              {communes.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {!wilaya && (
              <div id="commune-hint" className="hint-text">
                Veuillez d'abord sélectionner une wilaya
              </div>
            )}
            {errors.commune && (
              <div id="commune-error" className="error-message" role="alert">
                <AlertIcon size={16} color="var(--color-error)" />
                <span>{errors.commune}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Type de livraison <TruckIcon size={16} className="inline-icon" />
            </label>
            <div className="delivery-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="domicile"
                  checked={deliveryType === 'domicile'}
                  onChange={(e) => setDeliveryType(e.target.value as 'domicile')}
                  className="radio-input"
                />
                <span>À Domicile</span>
                {wilaya && (
                  <span className="delivery-price">
                    ({(shippingPrices as any)[wilaya]?.['Tarif à Domicile Classique'] || 0} DZD)
                  </span>
                )}
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="stop_desk"
                  checked={deliveryType === 'stop_desk'}
                  onChange={(e) => setDeliveryType(e.target.value as 'stop_desk')}
                  className="radio-input"
                />
                <span>Stop Desk</span>
                {wilaya && (
                  <span className="delivery-price">
                    ({(shippingPrices as any)[wilaya]?.['Tarif Stop Desk Classique'] || 0} DZD)
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="order-summary">
            <h3 className="summary-title">Récapitulatif</h3>
            <div className="summary-row">
              <span>Prix du produit:</span>
              <span className="summary-value">{formattedPrice} DZD</span>
            </div>
            <div className="summary-row">
              <span>Frais de livraison:</span>
              <span className="summary-value">{shippingCost.toFixed(2)} DZD</span>
            </div>
            <div className="summary-row summary-row--total">
              <span className="summary-total-label">Total:</span>
              <span className="summary-total-value">{total.toFixed(2)} DZD</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Traitement en cours...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;