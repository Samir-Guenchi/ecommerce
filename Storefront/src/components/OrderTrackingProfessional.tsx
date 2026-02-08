import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTrackingProfessional.css';

interface TrackingData {
    orderId: number;
    orderNumber: string;
    status: string;
    createdAt: string;
    estimatedDelivery: {
        minDate: string;
        maxDate: string;
        businessDays: string;
        formatted: string;
    };
    timeline: Array<{
        status: string;
        label: string;
        completed: boolean;
        date: string | null;
        icon: string;
    }>;
    items: {
        count: number;
        total: number;
    };
    shipping: {
        from: string;
        to: string;
        address: string;
    };
    store: {
        name: string;
        phone: string;
    };
}

interface Props {
    orderId: number;
}

export const OrderTrackingProfessional: React.FC<Props> = ({ orderId }) => {
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTracking();
        // Refresh every 30 seconds
        const interval = setInterval(fetchTracking, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchTracking = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/orders/${orderId}/tracking`);
            setTracking(response.data);
            setError(null);
        } catch (err) {
            setError('Impossible de charger les informations de suivi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('fr-DZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="tracking-professional-loading">
                <div className="spinner"></div>
                <p>Chargement du suivi...</p>
            </div>
        );
    }

    if (error || !tracking) {
        return (
            <div className="tracking-professional-error">
                <p>{error || 'Commande non trouvée'}</p>
            </div>
        );
    }

    return (
        <div className="tracking-professional">
            {/* Header */}
            <div className="tracking-header">
                <div className="tracking-header-content">
                    <h1>Suivi de commande</h1>
                    <p className="order-number">N° {tracking.orderNumber}</p>
                </div>
            </div>

            {/* Delivery Estimate - Prominent Display */}
            <div className="delivery-estimate-card">
                <div className="estimate-icon">📦</div>
                <div className="estimate-content">
                    <h2>Livraison estimée</h2>
                    <p className="estimate-date">{tracking.estimatedDelivery.formatted}</p>
                    <p className="estimate-days">({tracking.estimatedDelivery.businessDays})</p>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="status-timeline">
                <h3>État de la commande</h3>
                <div className="timeline">
                    {tracking.timeline.map((step, index) => (
                        <div
                            key={step.status}
                            className={`timeline-step ${step.completed ? 'completed' : 'pending'}`}
                        >
                            <div className="timeline-marker">
                                <span className="timeline-icon">{step.icon}</span>
                                {index < tracking.timeline.length - 1 && (
                                    <div className={`timeline-line ${step.completed ? 'completed' : ''}`} />
                                )}
                            </div>
                            <div className="timeline-content">
                                <h4>{step.label}</h4>
                                {step.date && (
                                    <p className="timeline-date">{formatDate(step.date)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Details */}
            <div className="order-details-grid">
                <div className="detail-card">
                    <h4>Informations de livraison</h4>
                    <div className="detail-row">
                        <span className="detail-label">De:</span>
                        <span className="detail-value">{tracking.shipping.from}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Vers:</span>
                        <span className="detail-value">{tracking.shipping.to}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Adresse:</span>
                        <span className="detail-value">{tracking.shipping.address}</span>
                    </div>
                </div>

                <div className="detail-card">
                    <h4>Détails de la commande</h4>
                    <div className="detail-row">
                        <span className="detail-label">Articles:</span>
                        <span className="detail-value">{tracking.items.count}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value total-price">{formatPrice(tracking.items.total)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(tracking.createdAt)}</span>
                    </div>
                </div>

                <div className="detail-card">
                    <h4>Boutique</h4>
                    <div className="detail-row">
                        <span className="detail-label">Nom:</span>
                        <span className="detail-value">{tracking.store.name}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">
                            <a href={`tel:${tracking.store.phone}`} className="phone-link">
                                {tracking.store.phone}
                            </a>
                        </span>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="help-section">
                <p>
                    <strong>Besoin d'aide?</strong> Contactez le service client Algérie Poste au{' '}
                    <a href="tel:3000">3000</a> ou la boutique directement.
                </p>
            </div>
        </div>
    );
};

export default OrderTrackingProfessional;
