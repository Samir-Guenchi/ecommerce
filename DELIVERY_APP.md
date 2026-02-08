# Delivery App - React Native

Complete mobile app for delivery personnel to broadcast GPS location and manage deliveries.

## Setup

```bash
# Create React Native project
npx react-native init DeliveryApp
cd DeliveryApp

# Install dependencies
npm install @react-native-community/geolocation
npm install socket.io-client
npm install react-native-maps
npm install @react-navigation/native
npm install @react-navigation/native-stack
```

## File Structure

```
DeliveryApp/
├── src/
│   ├── services/
│   │   └── GPSService.ts          # GPS broadcasting service
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Delivery person login
│   │   ├── ActiveDeliveriesScreen.tsx  # List of deliveries
│   │   └── DeliveryTrackingScreen.tsx  # Active delivery with map
│   └── App.tsx
└── package.json
```

## Key Implementation Files

### services/GPSService.ts

```typescript
import Geolocation from '@react-native-community/geolocation';
import { io, Socket } from 'socket.io-client';

export class DeliveryGPSService {
  private socket: Socket;
  private watchId: number | null = null;
  private orderId: number;
  private deliveryPersonId: number;

  constructor(orderId: number, deliveryPersonId: number, serverUrl: string) {
    this.orderId = orderId;
    this.deliveryPersonId = deliveryPersonId;
    
    // Connect to WebSocket server
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to tracking server');
      
      // Authenticate as delivery person
      this.socket.emit('auth:delivery_person', {
        userId: this.deliveryPersonId,
        token: 'JWT_TOKEN_HERE', // Get from auth
      });
    });

    this.socket.on('disconnect', () => {
      console.log('⚠️ Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Start broadcasting GPS location
   */
  public startTracking() {
    if (this.watchId !== null) {
      console.warn('GPS tracking already started');
      return;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading, accuracy } = position.coords;

        // Broadcast location to backend
        this.socket.emit('delivery:location', {
          orderId: this.orderId,
          latitude,
          longitude,
          speed: speed ? speed * 3.6 : 0, // Convert m/s to km/h
          heading: heading || 0,
          accuracy: accuracy || 0,
        });

        console.log(`📍 Location sent: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 10000, // Update every 10 seconds
        fastestInterval: 5000, // Fastest update: 5 seconds
      }
    );

    console.log('📡 GPS tracking started');
  }

  /**
   * Stop broadcasting GPS location
   */
  public stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('🛑 GPS tracking stopped');
    }
  }

  /**
   * Update delivery status
   */
  public updateStatus(status: 'picked_up' | 'out_for_delivery' | 'delivered') {
    this.socket.emit('delivery:status', {
      orderId: this.orderId,
      status,
    });
    console.log(`📦 Status updated: ${status}`);
  }

  /**
   * Disconnect from server
   */
  public disconnect() {
    this.stopTracking();
    this.socket.disconnect();
  }
}
```

### screens/DeliveryTrackingScreen.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DeliveryGPSService } from '../services/GPSService';

interface Props {
  route: {
    params: {
      orderId: number;
      deliveryPersonId: number;
      customerAddress: {
        latitude: number;
        longitude: number;
        fullAddress: string;
      };
    };
  };
  navigation: any;
}

export default function DeliveryTrackingScreen({ route, navigation }: Props) {
  const { orderId, deliveryPersonId, customerAddress } = route.params;
  const [gpsService] = useState(
    () => new DeliveryGPSService(orderId, deliveryPersonId, 'http://YOUR_SERVER_IP:3000')
  );
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 36.7538,
    longitude: 3.0588,
  });

  useEffect(() => {
    // Start GPS tracking
    gpsService.startTracking();

    // Get initial location
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );

    // Cleanup on unmount
    return () => {
      gpsService.disconnect();
    };
  }, []);

  const handlePickedUp = () => {
    gpsService.updateStatus('picked_up');
    Alert.alert('Statut mis à jour', 'Colis récupéré');
  };

  const handleOutForDelivery = () => {
    gpsService.updateStatus('out_for_delivery');
    Alert.alert('Statut mis à jour', 'En cours de livraison');
  };

  const handleDelivered = () => {
    gpsService.updateStatus('delivered');
    Alert.alert(
      'Livraison terminée',
      'Merci! La livraison a été marquée comme terminée.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Customer location marker */}
        <Marker
          coordinate={{
            latitude: customerAddress.latitude,
            longitude: customerAddress.longitude,
          }}
          title="Adresse client"
          description={customerAddress.fullAddress}
          pinColor="red"
        />
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.orderLabel}>Commande #{orderId}</Text>
        <Text style={styles.addressLabel}>{customerAddress.fullAddress}</Text>

        <View style={styles.buttons}>
          <Button title="Colis récupéré" onPress={handlePickedUp} color="#f59e0b" />
          <Button title="En route" onPress={handleOutForDelivery} color="#3b82f6" />
          <Button title="Livré ✓" onPress={handleDelivered} color="#22c55e" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttons: {
    gap: 12,
  },
});
```

## Testing

1. **Install app on Android device**
2. **Enable location permissions**
3. **Start delivery tracking**
4. **Move around - GPS will broadcast every 10-20 meters**
5. **Customer sees live updates on OrderTracking component**

## Production Checklist

- [ ] Add JWT authentication
- [ ] Request location permissions
- [ ] Handle background tracking (requires special permissions)
- [ ] Add offline queue for failed broadcasts
- [ ] Implement battery optimization
- [ ] Add push notifications for new deliveries
- [ ] Test on iOS (requires additional setup)
