import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * IMPORTANT: For physical devices (not emulator/simulator):
 * - Replace DEVICE_IP with your computer's local IP address
 * - Find your IP: Windows: `ipconfig` | Mac/Linux: `ifconfig` or `ip addr`
 * - Look for IPv4 Address (usually 192.168.x.x or 10.x.x.x)
 * - Make sure your phone and computer are on the same WiFi network
 * 
 * For emulator/simulator:
 * - Android emulator: Uses 10.0.2.2 (already configured)
 * - iOS simulator: Uses localhost (already configured)
 */

// ============================================
// CONFIGURATION: Set this for physical devices
// ============================================
// Replace with your computer's IP address when using a physical device
// Example: '192.168.1.100' or '10.232.243.165'
// Leave empty to use emulator/simulator defaults
// 
// Your detected IPs:
// - 172.18.80.1 (likely Docker/virtual network)
// - 10.232.243.165 (likely your main network - USE THIS ONE)
//
// IMPORTANT: Make sure your phone and computer are on the same WiFi network!
const DEVICE_IP = '10.11.22.165'; // <-- SET YOUR COMPUTER'S IP HERE FOR PHYSICAL DEVICES

// ============================================

const getApiUrl = (): string => {
  if (__DEV__) {
    // Development mode
    const platform = Platform.OS;
    console.log(`[API Config] Platform detected: ${platform}`);
    
    // If DEVICE_IP is set, use it for physical devices
    if (DEVICE_IP) {
      const url = `http://${DEVICE_IP}:3000/api`;
      console.log(`[API Config] Using physical device IP: ${url}`);
      return url;
    }
    
    // Default to emulator/simulator settings
    if (platform === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      const url = 'http://10.0.2.2:3000/api';
      console.log(`[API Config] Using Android emulator URL: ${url}`);
      return url;
    } else {
      // iOS simulator can use localhost
      const url = 'http://localhost:3000/api';
      console.log(`[API Config] Using iOS simulator URL: ${url}`);
      return url;
    }
  } else {
    // Production mode - update with your production API URL
    return 'https://your-production-api.com/api';
  }
};

export const API_URL = getApiUrl();

