/**
 * Geolocation Utilities
 * 
 * Functions for calculating distances, ETAs, and working with GPS coordinates
 */

const EARTH_RADIUS_KM = 6371;
const AVERAGE_DELIVERY_SPEED_KMH = 30; // Default: 30 km/h for urban delivery

interface Coordinates {
    lat: number;
    lon: number;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lon - point1.lon);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;

    return distance;
}

/**
 * Calculate ETA (Estimated Time of Arrival)
 * Returns Date object with estimated arrival time
 */
export function calculateETA(
    current: Coordinates,
    destination: Coordinates,
    currentSpeed: number = AVERAGE_DELIVERY_SPEED_KMH
): Date {
    const distance = calculateDistance(current, destination);

    // If speed is 0 or very low, use average delivery speed
    const speed = currentSpeed > 5 ? currentSpeed : AVERAGE_DELIVERY_SPEED_KMH;

    // Calculate time in hours
    const timeInHours = distance / speed;

    // Add buffer time (10% for traffic/stops)
    const bufferTime = timeInHours * 0.1;
    const totalTime = timeInHours + bufferTime;

    // Calculate ETA
    const eta = new Date();
    eta.setHours(eta.getHours() + Math.floor(totalTime));
    eta.setMinutes(eta.getMinutes() + Math.round((totalTime % 1) * 60));

    return eta;
}

/**
 * Calculate estimated remaining time in minutes
 */
export function calculateRemainingMinutes(
    current: Coordinates,
    destination: Coordinates,
    currentSpeed: number = AVERAGE_DELIVERY_SPEED_KMH
): number {
    const distance = calculateDistance(current, destination);
    const speed = currentSpeed > 5 ? currentSpeed : AVERAGE_DELIVERY_SPEED_KMH;

    // Time in hours, with 10% buffer
    const timeInHours = (distance / speed) * 1.1;

    return Math.round(timeInHours * 60);
}

/**
 * Check if a point is within a certain radius of another point
 * Used to detect when delivery person is near destination
 */
export function isWithinRadius(
    point1: Coordinates,
    point2: Coordinates,
    radiusKm: number = 0.1 // Default: 100 meters
): boolean {
    const distance = calculateDistance(point1, point2);
    return distance <= radiusKm;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: Coordinates): string {
    return `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`;
}

/**
 * Parse address to get approximate coordinates (for Algeria)
 * This is a placeholder - in production, use a geocoding API
 */
export async function geocodeAddress(_address: string, wilaya: string): Promise<Coordinates | null> {
    // Approximate coordinates for Algerian wilayas (capital cities)
    const wilayaCoords: { [key: string]: Coordinates } = {
        'Alger': { lat: 36.7538, lon: 3.0588 },
        'Oran': { lat: 35.6969, lon: -0.6331 },
        'Constantine': { lat: 36.365, lon: 6.6147 },
        'Annaba': { lat: 36.9000, lon: 7.7667 },
        'Blida': { lat: 36.4703, lon: 2.8277 },
        'Batna': { lat: 35.5559, lon: 6.1741 },
        'Sétif': { lat: 36.1905, lon: 5.4130 },
        'Sidi Bel Abbès': { lat: 35.1908, lon: -0.6388 },
        'Biskra': { lat: 34.8487, lon: 5.7282 },
        'Tébessa': { lat: 35.4040, lon: 8.1176 },
        'Tlemcen': { lat: 34.8780, lon: -1.3150 },
        'Béjaïa': { lat: 36.7525, lon: 5.0689 },
        'Tiaret': { lat: 35.3712, lon: 1.3176 },
        'Béchar': { lat: 31.6233, lon: -2.2250 },
        'Tamanrasset': { lat: 22.7850, lon: 5.5225 },
    };

    // Return approximate coordinates based on wilaya
    return wilayaCoords[wilaya] || null;
}

/**
 * Calculate bearing (direction) between two points
 * Returns angle in degrees (0-360)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
    const dLon = toRad(to.lon - from.lon);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    const bearingDegrees = (bearing * 180) / Math.PI;

    return (bearingDegrees + 360) % 360;
}

/**
 * Get direction text from bearing (for UI display)
 */
export function bearingToDirection(bearing: number): string {
    const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}
