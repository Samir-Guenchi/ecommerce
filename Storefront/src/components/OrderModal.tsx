import React, { useState, useEffect } from 'react';
import './OrderModal.css';
import algeriaCities from '../../../static/willayas/algeria_cities.json';
import shippingPrices from '../../../static/shipping prices/shipping_prices.json';

interface OrderModalProps {
  product: any;
  domain: string;
  onClose: () => void;
  onOrder: (orderData: any) => void;
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

  const wilayas = [...new Set(algeriaCities.map((city: any) => city.wilaya_name))];

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

  const handleSubmit = () => {
    if (!fullName || !phone || !wilaya || !commune) {
      alert('Please fill all fields');
      return;
    }
    onOrder({
      productId: product.id,
      quantity: 1,
      fullName,
      phone,
      wilaya,
      commune,
      deliveryType,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Order {product.name}</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="form-group">
          <label>Wilaya</label>
          <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
            <option value="">Select Wilaya</option>
            {wilayas.map((w: string) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Commune</label>
          <select value={commune} onChange={(e) => setCommune(e.target.value)} disabled={!wilaya}>
            <option value="">Select Commune</option>
            {communes.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Delivery Type</label>
          <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as 'stop_desk' | 'domicile')}>
            <option value="domicile">À Domicile</option>
            <option value="stop_desk">Stop Desk</option>
          </select>
        </div>
        <div className="order-summary">
          <p>Product Price: {(typeof product.price === 'number' ? product.price : parseFloat(product.price))} DZD</p>
          <p>Shipping: {shippingCost} DZD</p>
          <p>Total: {total} DZD</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Place Order</button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;