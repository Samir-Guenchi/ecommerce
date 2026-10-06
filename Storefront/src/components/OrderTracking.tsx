import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { TruckIcon, PackageIcon, ClockIcon } from './icons/Icons';
import 'leaflet/dist/leaflet.css';
import './OrderTracking.css';

interface TrackingData {
    orderId: number;
    latitude: number;
    longitude: number;
    speed: number;
    distance: string;
    eta: string;
    timestamp: string;
}

interface DeliveryPersonInfo {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    photo?: string;
}

interface OrderTrackingProps {
    orderId: number;
    deliveryAddress: {
        latitude: number;
        longitude: number;
        fullAddress: string;
    };
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, deliveryAddress }) => {
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPersonInfo | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Connect to WebSocket server
        const socket = io('http://localhost:3000', {
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('📡 Connected to tracking server');
            setIsConnected(true);
            setError(null);

            // Subscribe to order tracking
            socket.emit('subscribe:order', orderId);
        });

        socket.on('disconnect', () => {
            console.log('📴 Disconnected from tracking server');
            setIsConnected(false);
        });

        socket.on('tracking:update', (data: TrackingData) => {
            console.log('📍 Location update:', data);
            setTracking(data);
        });

        socket.on('tracking:status', (data: any) => {
            console.log('📦 Status update:', data);
        });

        socket.on('delivery:status_changed', (data: any) => {
            console.log('🔔 Delivery status changed:', data.status);
        });

        socket.on('delivery:offline', (data: any) => {
            setError(data.message);
        });

        socket.on('error', (data: any) => {
            console.error('❌ Tracking error:', data);
            setError(data.message);
        });

        // Fetch initial tracking data
        fetchTrackingInfo();

        return () => {
            socket.disconnect();
        };
    }, [orderId]);

    const fetchTrackingInfo = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tracking/${orderId}`);
            const data = await response.json();

            if (data.hasTracking && data.location) {
                setTracking({
                    orderId: data.orderId,
                    latitude: parseFloat(data.location.latitude),
                    longitude: parseFloat(data.location.longitude),
                    speed: data.location.speed || 0,
                    distance: data.eta?.distanceRemaining || '0',
                    eta: data.eta?.estimatedArrival || new Date().toISOString(),
                    timestamp: data.location.timestamp,
                });
            }

            if (data.deliveryPerson) {
                setDeliveryPerson(data.deliveryPerson);
            }
        } catch (error) {
            console.error('Failed to fetch tracking info:', error);
            setError('Impossible de charger les informations de suivi');
        }
    };

    const formatETA = (etaString: string): string => {
        const eta = new Date(etaString);
        const now = new Date();
        const diffMs = eta.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 0) return 'Arrivée imminente';
        if (diffMins < 60) return `${diffMins} min`;

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h${mins.toString().padStart(2, '0')}`;
    };

    if (error && !tracking) {
        return (
            <div className="tracking-error">
                <PackageIcon size={48} />
                <h3>Suivi non disponible</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="tracking-loading">
                <TruckIcon size={48} className="truck-icon-animated" />
                <h3>Chargement du suivi...</h3>
                <p>En attente de mises à jour de livraison</p>
            </div>
        );
    }

    const center: [number, number] = [
        (tracking.latitude + deliveryAddress.latitude) / 2,
        (tracking.longitude + deliveryAddress.longitude) / 2,
    ];

    return (
        <div className="order-tracking">
            {/* Tracking Header */}
            <div className="tracking-header">
                <div className="tracking-title">
                    <TruckIcon size={32} />
                    <h2>Suivi de Livraison</h2>
                    <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? 'En direct' : 'Hors ligne'}
                    </span>
                </div>

                <div className="eta-display">
                    <ClockIcon size={24} />
                    <div className="eta-info">
                        <span className="eta-label">Arrivée estimée</span>
                        <span className="eta-time">{formatETA(tracking.eta)}</span>
                    </div>
                </div>
            </div>

            {/* Delivery Person Info */}
            {deliveryPerson && (
                <div className="delivery-person-card">
                    <div className="delivery-person-avatar">
                        {deliveryPerson.photo ? (
                            <img src={deliveryPerson.photo} alt={deliveryPerson.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {deliveryPerson.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="delivery-person-info">
                        <h4>{deliveryPerson.name}</h4>
                        <p>{deliveryPerson.vehicle} • Note {deliveryPerson.rating.toFixed(1)}/5</p>
                    </div>
                    <a href={`tel:${deliveryPerson.phone}`} className="call-button">
                        Appeler
                    </a>
                </div>
            )}

            {/* Map */}
            <div className="tracking-map-container">
                <MapContainer
                    center={center as [number, number]}
                    zoom={14}
                    style={{ height: '400px', width: '100%', borderRadius: '16px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Delivery person marker */}
                    <Marker position={[tracking.latitude, tracking.longitude]}>
                        <Popup>
                            <div className="map-popup">
                                <strong>Livreur</strong>
                                <p>Vitesse: {tracking.speed.toFixed(0)} km/h</p>
                                <p>Dernière mise à jour: {new Date(tracking.timestamp).toLocaleTimeString('fr')}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Delivery address marker */}
                    <Marker position={[deliveryAddress.latitude, deliveryAddress.longitude]}>
                        <Popup>
                            <div className="map-popup">
                                <strong>Adresse de livraison</strong>
                                <p>{deliveryAddress.fullAddress}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Route line */}
                    <Polyline
                        positions={[
                            [tracking.latitude, tracking.longitude],
                            [deliveryAddress.latitude, deliveryAddress.longitude],
                        ]}
                        pathOptions={{ color: '#fecc0b', weight: 4 }}
                    />
                </MapContainer>
            </div>

            {/* Tracking Stats */}
            <div className="tracking-stats">
                <div className="stat-card">
                    <span className="stat-label">Distance restante</span>
                    <span className="stat-value">{tracking.distance} km</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Vitesse actuelle</span>
                    <span className="stat-value">{tracking.speed.toFixed(0)} km/h</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Temps estimé</span>
                    <span className="stat-value">{formatETA(tracking.eta)}</span>
                </div>
            </div>

            {error && (
                <div className="tracking-warning">
                    {error}
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
