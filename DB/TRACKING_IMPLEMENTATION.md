# Order Tracking Implementation

## Overview

This document describes the order tracking feature that allows users to track their orders as they move through different wilayas (Algerian provinces) from origin to destination.

## Database Schema

### Orders Table Update

The `orders` table now includes a `tracking_history` column:

```sql
tracking_history JSONB DEFAULT '[]'::jsonb
```

### Tracking History Structure

The `tracking_history` field stores an array of tracking events in JSONB format:

```json
[
  {
    "wilaya": "Algiers",
    "wilayaCode": "16",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "arrived",
    "description": "Package picked up from store"
  },
  {
    "wilaya": "Blida",
    "wilayaCode": "9",
    "timestamp": "2024-01-15T14:20:00Z",
    "status": "in_transit",
    "description": "Package in transit to Blida"
  }
]
```

### Tracking Event Status Values

- `arrived` - Package has arrived at the wilaya
- `departed` - Package has left the wilaya
- `in_transit` - Package is currently in transit
- `delivered` - Package has been delivered (final event)

## Backend Implementation

### TypeScript Interface

```typescript
export interface TrackingEvent {
  wilaya: string;
  wilayaCode: string;
  timestamp: string;
  status: 'in_transit' | 'arrived' | 'departed' | 'delivered';
  description?: string;
}
```

### Order Entity

The `Order` entity includes:

```typescript
@Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb", name: 'tracking_history' })
trackingHistory: TrackingEvent[] | null;
```

## Frontend Implementation

### OrderTrackingScreen

A new screen component (`OrderTrackingScreen.tsx`) displays:

1. **Order Information Card**
   - Customer name
   - Order status
   - Order number

2. **Wilaya Path Visualization**
   - Visual representation showing:
     - Origin wilaya (green circle)
     - Intermediate wilayas (connected with arrows)
     - Current location (blue circle)
     - Destination wilaya (orange circle)
   - Each wilaya shows:
     - Wilaya code
     - Wilaya name
     - Status label (Origin/Current Location/Destination)

3. **Tracking Timeline**
   - Chronological list of all tracking events
   - Shows wilaya name, timestamp, and description
   - Visual timeline with dots

### Navigation Flow

1. User views orders in `OrdersScreen`
2. User taps on an order card
3. Navigates to `OrderTrackingScreen` with order details
4. User can see the complete tracking path

## Usage Example

### Adding Tracking Events (Backend)

```typescript
import { AppDataSource } from './config/database';
import { Order, TrackingEvent } from './entities';

async function addTrackingEvent(orderId: number, event: TrackingEvent) {
  const orderRepository = AppDataSource.getRepository(Order);
  const order = await orderRepository.findOne({ where: { id: orderId } });
  
  if (!order) throw new Error('Order not found');
  
  const history = order.trackingHistory || [];
  history.push(event);
  
  order.trackingHistory = history;
  await orderRepository.save(order);
}

// Example usage
await addTrackingEvent(1, {
  wilaya: 'Blida',
  wilayaCode: '9',
  timestamp: new Date().toISOString(),
  status: 'arrived',
  description: 'Package arrived at Blida distribution center'
});
```

### Querying Tracking History (Backend)

```typescript
// Get order with tracking history
const order = await orderRepository.findOne({
  where: { id: orderId },
  relations: ['shippingAddress']
});

if (order?.trackingHistory) {
  const currentLocation = order.trackingHistory[order.trackingHistory.length - 1];
  console.log(`Current location: ${currentLocation.wilaya}`);
}
```

## Migration

To add the tracking_history column to an existing database:

```bash
psql -U postgres -d algerie_post -f DB/migration_add_tracking_history.sql
```

Or if using a fresh database, the column is already included in `DB/schema.sql`.

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live tracking updates
2. **Map Integration**: Show actual map with wilaya locations
3. **Estimated Delivery**: Calculate ETA based on wilaya distances
4. **Push Notifications**: Notify users when order reaches new wilaya
5. **Tracking API Integration**: Connect with actual delivery service APIs

## Notes

- The tracking history is stored as JSONB for flexibility and query performance
- Wilaya codes follow the standard Algerian administrative division codes (1-58)
- Timestamps should be stored in ISO 8601 format (UTC)
- The visualization shows a simplified path - actual routes may vary

