import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText, G } from 'react-native-svg';
import { orderAPI, productAPI, storeAPI, eventAPI } from '../services/api.service';

const { width: screenWidth } = Dimensions.get('window');

// Top Header Icons with Modern Design
const NotificationIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3C9.79086 3 8 4.79086 8 7V8.2C8 9.05359 7.70711 9.87868 7.17157 10.5355L6.29289 11.5858C5.48236 12.5562 6.17452 14 7.41421 14H16.5858C17.8255 14 18.5176 12.5562 17.7071 11.5858L16.8284 10.5355C16.2929 9.87868 16 9.05359 16 8.2V7C16 4.79086 14.2091 3 12 3Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 17C10.7761 17.7725 11.529 18.3333 12.4 18.3333C13.271 18.3333 14.0239 17.7725 14.3 17"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="9"
      r="3.5"
      stroke="#000000"
      strokeWidth="1.5"
      fill="none"
    />
    <Path
      d="M6 18C7.2 15.5 9.4 14 12 14C14.6 14 16.8 15.5 18 18"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bottom Navigation Icons with Modern Design
const DashboardIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M9 22V12H15V22"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProductsIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M3 6H21"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 10C16 10.7956 15.6839 11.5587 15.1213 12.1213C14.5587 12.6839 13.7956 13 13 13C12.2044 13 11.4413 12.6839 10.8787 12.1213C10.3161 11.5587 10 10.7956 10 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OrdersIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnalyticsIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 16L12 11L16 15L21 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 10H16V15"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.62343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01131 9.77251C4.28063 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Enhanced Professional Bar Chart Component with gradients and animations
const BarChart = ({ data, maxValue, previousTotal }: { data: number[]; maxValue: number; previousTotal: number }) => {
  const maxBarHeight = 140;
  const gridLines = 5;
  const currentTotal = data.reduce((a, b) => a + b, 0);
  const trend = currentTotal > previousTotal ? 'up' : currentTotal < previousTotal ? 'down' : 'neutral';
  const trendPercentage = previousTotal > 0 ? Math.abs(((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1) : '0';

  // Get day labels based on data length
  const getDayLabel = (index: number, total: number) => {
    if (total === 7) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
    return `D${index + 1}`;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Trend Indicator */}
      <View style={styles.trendContainer}>
        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>Weekly Trend</Text>
          <View style={[
            styles.trendBadge,
            trend === 'up' ? styles.trendBadgeUp : trend === 'down' ? styles.trendBadgeDown : styles.trendBadgeNeutral
          ]}>
            <Text style={styles.trendText}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendPercentage}%
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Grid */}
      <View style={styles.chartGrid}>
        {Array.from({ length: gridLines }).map((_, i) => {
          const value = Math.round((maxValue / (gridLines - 1)) * (gridLines - 1 - i));
          return (
            <View key={i} style={styles.gridLine}>
              <View style={styles.gridLineLine} />
              <Text style={styles.gridLineLabel}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Bars */}
      <View style={styles.chartBars}>
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * maxBarHeight : 0;
          const isHighest = value === Math.max(...data);
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={isHighest ? ['#0D112D', '#0D112D'] : ['#FDDB12', '#FDDB12']}
                  style={[styles.bar, { height: Math.max(height, 8) }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  {isHighest && (
                    <View style={styles.barHighlight}>
                      <Text style={styles.barHighlightText}>★</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
              <Text style={[styles.barLabel, isHighest && styles.barLabelHighest]}>
                {value}
              </Text>
              <Text style={styles.barDayLabel}>
                {getDayLabel(index, data.length)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Curved Line Chart Component for Events
const LineChart = ({ data, maxValue }: { data: number[]; maxValue: number }) => {
  const chartHeight = 140;
  const chartWidth = screenWidth - 80; // Responsive width
  const padding = 20;
  const pointRadius = 5;

  // Ensure we have valid data and maxValue
  const safeMaxValue = maxValue > 0 ? maxValue : 1;
  const safeData = data.length > 0 ? data : [0];
  const divisor = safeData.length > 1 ? safeData.length - 1 : 1;

  const points = safeData.map((value, index) => {
    const x = padding + (index / divisor) * (chartWidth - 2 * padding);
    const yValue = Math.max(0, Math.min(value, safeMaxValue)); // Clamp value
    const y = chartHeight - padding - (yValue / safeMaxValue) * (chartHeight - 2 * padding);
    return { x: isNaN(x) ? padding : x, y: isNaN(y) ? chartHeight - padding : y, value: yValue };
  });

  // Create smooth curve using quadratic bezier
  const createPath = () => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;

      if (i === 0) {
        path += ` Q ${current.x} ${current.y}, ${controlX} ${controlY}`;
      } else {
        path += ` T ${controlX} ${controlY}`;
      }
    }

    path += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    return path;
  };

  return (
    <View style={styles.lineChartContainer}>
      <Svg width={chartWidth} height={chartHeight} style={styles.lineChartSvg}>
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (i / 4) * (chartHeight - 2 * padding);
          const value = Math.round((maxValue / 4) * (4 - i));
          return (
            <React.Fragment key={i}>
              <Path
                d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <View key={`label-${i}`} style={[styles.lineChartYLabelContainer, { top: y - 6 }]}>
                <Text style={styles.lineChartYLabel}>
                  {value}
                </Text>
              </View>
            </React.Fragment>
          );
        })}

        {/* Gradient area under curve */}
        <Defs>
          <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
            <Stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
          </SvgLinearGradient>
        </Defs>

        {/* Area under curve */}
        {points.length > 0 && !isNaN(points[0].x) && !isNaN(points[points.length - 1].x) && (
          <Path
            d={`${createPath()} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
            fill="url(#areaGradient)"
          />
        )}

        {/* Curve line with gradient */}
        <Defs>
          <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="50%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#EC4899" />
          </SvgLinearGradient>
        </Defs>

        <Path
          d={createPath()}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points with glow effect */}
        {points.filter(p => !isNaN(p.x) && !isNaN(p.y)).map((point, index) => (
          <React.Fragment key={index}>
            {/* Glow effect */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={pointRadius + 2}
              fill="#6366F1"
              opacity={0.3}
            />
            {/* Main point */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={pointRadius}
              fill="#FFFFFF"
              stroke="#6366F1"
              strokeWidth="2"
            />
          </React.Fragment>
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={styles.lineChartXLabels}>
        {points.map((point, index) => (
          <Text key={index} style={styles.lineChartXLabel}>
            {index + 1}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Professional Pie Chart Component with gradients
const PieChart = ({ data }: { data: Array<{ category: string; count: number; color: string }> }) => {
  const size = 140;
  const radius = 55;
  const center = size / 2;
  const total = data.reduce((sum, item) => sum + Math.max(0, item.count || 0), 0);

  // If no data, show empty circle
  if (total === 0 || data.length === 0) {
    return (
      <View style={styles.pieChartContainer}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
        </Svg>
        <View style={styles.pieChartCenter}>
          <Text style={styles.pieChartTotal}>0</Text>
          <Text style={styles.pieChartLabel}>Products</Text>
        </View>
      </View>
    );
  }

  let currentAngle = -90; // Start from top

  const createSlice = (item: { category: string; count: number; color: string }, index: number) => {
    const safeCount = Math.max(0, item.count || 0);
    const percentage = safeCount / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    // Validate all values are numbers
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(angle)) {
      return null;
    }

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle += angle;

    return (
      <Path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#FFFFFF"
        strokeWidth="3"
      />
    );
  };

  const slices = data.map((item, index) => createSlice(item, index)).filter(Boolean);

  return (
    <View style={styles.pieChartContainer}>
      <Svg width={size} height={size}>
        {/* Pie slices */}
        {slices}

        {/* Inner circle for donut effect */}
        <Circle
          cx={center}
          cy={center}
          r={radius * 0.6}
          fill="#FFFFFF"
          stroke="#F1F5F9"
          strokeWidth="1"
        />
      </Svg>
      <View style={styles.pieChartCenter}>
        <Text style={styles.pieChartTotal}>{total}</Text>
        <Text style={styles.pieChartLabel}>Products</Text>
      </View>
    </View>
  );
};

interface DashboardScreenProps {
  navigate?: (screenId: string) => void;
}

const DashboardScreen = ({ navigate }: DashboardScreenProps = {}) => {
  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [durationFilter, setDurationFilter] = useState('7d');
  const [userStateFilter, setUserStateFilter] = useState('all');
  const [eventsTimeFilter, setEventsTimeFilter] = useState('7d');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersResponse, productsResponse, storesResponse] = await Promise.all([
          orderAPI.getAllOrders().catch(() => ({ orders: [] })),
          productAPI.getAllProducts().catch(() => ({ products: [] })),
          storeAPI.getAllStores().catch(() => ({ stores: [] })),
        ]);
        setOrders(ordersResponse.orders || []);
        setProducts(productsResponse.products || []);
        setStores(storesResponse.stores || []);

        // Fetch events for the first store if available
        if (storesResponse.stores && storesResponse.stores.length > 0) {
          const eventsResponse = await eventAPI.getEventsForStore(storesResponse.stores[0].id).catch(() => ({ events: [] }));
          setEvents(eventsResponse.events || []);
        }
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Reset animations when returning to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [activeTab, fadeAnim, slideAnim]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const durations = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  const userStates = [
    { id: 'all', label: 'All Users' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'new', label: 'New' },
  ];

  const eventsTimeFilters = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  const productCategoryFilters = [
    { id: 'all', label: 'All' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'home', label: 'Home' },
  ];

  // Calculate real order data from database
  const getOrderDataByPeriod = (period: string) => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate;
    });

    // Group by day
    const dailyCounts: Record<number, number> = {};
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const dayIndex = Math.floor((orderDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      dailyCounts[dayIndex] = (dailyCounts[dayIndex] || 0) + 1;
    });

    // Create array for chart (max 7 days shown)
    const maxDays = Math.min(days, 7);
    const chartData: number[] = [];
    for (let i = 0; i < maxDays; i++) {
      chartData.push(dailyCounts[i] || 0);
    }

    return chartData;
  };

  const currentOrderData = getOrderDataByPeriod(durationFilter);
  const previousOrderData = getOrderDataByPeriod(durationFilter === '7d' ? '7d' : durationFilter === '30d' ? '7d' : durationFilter === '90d' ? '30d' : '90d');
  const previousTotal = previousOrderData.reduce((a, b) => a + b, 0);
  const maxOrders = currentOrderData.length > 0 ? Math.max(...currentOrderData, 1) : 1;
  const totalOrders = currentOrderData.reduce((a, b) => a + b, 0);
  const averageOrders = currentOrderData.length > 0 ? Math.round(totalOrders / currentOrderData.length) : 0;
  const peakOrders = currentOrderData.length > 0 ? Math.max(...currentOrderData) : 0;
  const growthRate = previousTotal > 0 ? (((totalOrders - previousTotal) / previousTotal) * 100).toFixed(1) : '0';

  // Calculate real order status data
  const getOrderStatusData = () => {
    const total = orders.length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    
    // Filter by user state if needed
    let filteredOrders = orders;
    if (userStateFilter === 'active') {
      filteredOrders = orders.filter(o => o.status === 'processing' || o.status === 'shipped');
    } else if (userStateFilter === 'inactive') {
      filteredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
    } else if (userStateFilter === 'new') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.orderDate) >= sevenDaysAgo);
    }

    const filteredTotal = filteredOrders.length;
    const filteredProcessing = filteredOrders.filter(o => o.status === 'processing').length;
    const filteredShipped = filteredOrders.filter(o => o.status === 'shipped').length;
    const filteredDelivered = filteredOrders.filter(o => o.status === 'delivered').length;
    const filteredCancelled = filteredOrders.filter(o => o.status === 'cancelled').length;

    return {
      total: filteredTotal,
      active: filteredProcessing + filteredShipped,
      inactive: filteredDelivered + filteredCancelled,
      new: userStateFilter === 'new' ? filteredTotal : 0,
      completed: filteredDelivered,
      cancelled: filteredCancelled,
      upcoming: filteredProcessing + filteredShipped,
      activePercentage: filteredTotal > 0 ? Math.round(((filteredProcessing + filteredShipped) / filteredTotal) * 100) : 0,
      newPercentage: filteredTotal > 0 ? Math.round((filteredTotal / total) * 100) : 0,
    };
  };

  // Calculate event status data
  const getEventStatusData = () => {
    const total = events.length;
    const pageViews = events.filter(e => e.eventType === 'page_view').length;
    const viewContents = events.filter(e => e.eventType === 'view_content').length;
    const formFills = events.filter(e => e.eventType === 'form_fill').length;
    const productOrders = events.filter(e => e.eventType === 'product_order').length;

    // Filter by time period
    let filteredEvents = events;
    if (eventsTimeFilter !== 'all') {
      const days = eventsTimeFilter === '7d' ? 7 : eventsTimeFilter === '30d' ? 30 : eventsTimeFilter === '90d' ? 90 : 365;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filteredEvents = events.filter(e => new Date(e.createdAt) >= cutoffDate);
    }

    const filteredTotal = filteredEvents.length;
    const filteredPageViews = filteredEvents.filter(e => e.eventType === 'page_view').length;
    const filteredViewContents = filteredEvents.filter(e => e.eventType === 'view_content').length;
    const filteredFormFills = filteredEvents.filter(e => e.eventType === 'form_fill').length;
    const filteredProductOrders = filteredEvents.filter(e => e.eventType === 'product_order').length;

    return {
      total: filteredTotal,
      active: filteredPageViews + filteredViewContents,
      new: filteredFormFills,
      completed: filteredProductOrders,
      upcoming: filteredFormFills,
      activePercentage: filteredTotal > 0 ? Math.round(((filteredPageViews + filteredViewContents) / filteredTotal) * 100) : 0,
      newPercentage: filteredTotal > 0 ? Math.round((filteredFormFills / filteredTotal) * 100) : 0,
    };
  };

  const currentEventsData = getEventStatusData();

  // Events line chart data
  const getEventsLineData = (period: string) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.createdAt);
        return eventDate.toDateString() === date.toDateString();
      });
      data.push(dayEvents.length);
    }
    return data;
  };

  const currentEventsLineData = getEventsLineData(eventsTimeFilter);
  const maxEventsValue = currentEventsLineData.length > 0 ? Math.max(...currentEventsLineData, 1) : 1;

  // Calculate real product analytics
  const calculateProductAnalytics = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    // Calculate sales from orders
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
    const previousSales = totalSales * 0.9; // Approximate previous period
    
    // Get top selling product (simplified - would need order items in real implementation)
    const topSelling = products.length > 0 ? products[0].name : 'N/A';
    const topSellingUnits = 0; // Would need order items to calculate
    
    // Category breakdown
    const categoryMap: Record<string, { count: number; revenue: number }> = {};
    products.forEach(product => {
      const category = product.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, revenue: 0 };
      }
      categoryMap[category].count++;
      // Approximate revenue per category (simplified)
      categoryMap[category].revenue += parseFloat(product.price.toString()) * 10;
    });
    
    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      ...data,
    }));

    const averagePrice = products.length > 0
      ? products.reduce((sum, p) => sum + parseFloat(p.price.toString()), 0) / products.length
      : 0;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
      totalSales,
      previousSales,
      topSelling,
      topSellingUnits,
      categoryBreakdown,
      averagePrice,
      totalUnits,
    };
  };

  const productAnalytics = calculateProductAnalytics();
  const salesGrowth = productAnalytics.previousSales > 0 
    ? (((productAnalytics.totalSales - productAnalytics.previousSales) / productAnalytics.previousSales) * 100).toFixed(1)
    : '0';

  // Pie chart data for products
  const pieChartData = [
    { category: 'Active', count: productAnalytics.activeProducts, color: '#10B981' },
    { category: 'Low Stock', count: productAnalytics.lowStock, color: '#F59E0B' },
    { category: 'Out of Stock', count: productAnalytics.outOfStock, color: '#EF4444' },
  ];

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) return;

    // Keep bottom-nav state in sync
    setActiveTab(tab);

    // Let navigation stack handle the screen change without extra per-screen animations
    if (tab !== 'dashboard' && navigate) {
      if (tab === 'analytics') {
        navigate('stores');
      } else {
        navigate(tab as any);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyle}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Overview</Text>
          <Text style={styles.headerSubtitle}>Key metrics for your business</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.6}
            onPress={() => {
              if (navigate) {
                navigate('notifications');
              }
            }}
          >
            <View style={styles.headerIconContainer}>
              <NotificationIcon />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.6}
            onPress={() => {
              if (navigate) {
                navigate('profileSettings');
              }
            }}
          >
            <View style={styles.headerIconContainer}>
              <ProfileIcon />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.filterSegmentedContainer}>
          {durations.map((duration, index) => (
            <TouchableOpacity
              key={duration.id}
              style={[
                styles.filterSegmentedButton,
                index === 0 && styles.filterSegmentedButtonFirst,
                index === durations.length - 1 && styles.filterSegmentedButtonLast,
                durationFilter === duration.id && styles.filterSegmentedButtonActive,
              ]}
              onPress={() => setDurationFilter(duration.id)}
            >
              <Text
                style={[
                  styles.filterSegmentedButtonText,
                  durationFilter === duration.id && styles.filterSegmentedButtonTextActive,
                ]}
              >
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chartCard}>
          <BarChart data={currentOrderData.slice(0, 7)} maxValue={maxOrders} previousTotal={previousTotal} />
          <View style={styles.chartStatsSpacer} />
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>{totalOrders}</Text>
              <Text style={styles.statChange}>+{growthRate}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{averageOrders}</Text>
              <Text style={styles.statSubtext}>per period</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Peak</Text>
              <Text style={styles.statValue}>{peakOrders}</Text>
              <Text style={styles.statSubtext}>highest day</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Events Analytics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events Analytics</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>User Type</Text>
            <View style={styles.filterSegmentedContainer}>
              {userStates.map((state, index) => (
                <TouchableOpacity
                  key={state.id}
                  style={[
                    styles.filterSegmentedButton,
                    index === 0 && styles.filterSegmentedButtonFirst,
                    index === userStates.length - 1 && styles.filterSegmentedButtonLast,
                    userStateFilter === state.id && styles.filterSegmentedButtonActive,
                  ]}
                  onPress={() => setUserStateFilter(state.id)}
                >
                  <Text
                    style={[
                      styles.filterSegmentedButtonText,
                      userStateFilter === state.id && styles.filterSegmentedButtonTextActive,
                    ]}
                  >
                    {state.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Time Period</Text>
            <View style={styles.filterSegmentedContainer}>
              {eventsTimeFilters.map((filter, index) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterSegmentedButton,
                    index === 0 && styles.filterSegmentedButtonFirst,
                    index === eventsTimeFilters.length - 1 && styles.filterSegmentedButtonLast,
                    eventsTimeFilter === filter.id && styles.filterSegmentedButtonActive,
                  ]}
                  onPress={() => setEventsTimeFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterSegmentedButtonText,
                      eventsTimeFilter === filter.id && styles.filterSegmentedButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.eventsCard}>
          {/* Line Chart */}
          <View style={styles.eventsChartSection}>
            <Text style={styles.eventsChartTitle}>Events Trend</Text>
            <LineChart data={currentEventsLineData.slice(0, 7)} maxValue={maxEventsValue} />
          </View>
          
          <View style={styles.eventsAnalyticsDivider} />
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTotalLabel}>Total Events</Text>
            <Text style={styles.eventsTotalValue}>{currentEventsData.total}</Text>
          </View>
          
          <View style={styles.eventsGrid}>
            <View style={styles.eventsGridItem}>
              <View style={styles.eventsMetricRow}>
                <View style={[styles.eventsIndicator, styles.eventsIndicatorActive]} />
                <Text style={styles.eventsLabel}>Page Views</Text>
              </View>
              <Text style={[styles.eventsValue, styles.eventsValueActive]}>
                {currentEventsData.active}
              </Text>
              <Text style={styles.eventsPercentage}>{currentEventsData.activePercentage}%</Text>
            </View>
            
            <View style={styles.eventsGridItem}>
              <View style={styles.eventsMetricRow}>
                <View style={[styles.eventsIndicator, styles.eventsIndicatorNew]} />
                <Text style={styles.eventsLabel}>Form Fills</Text>
              </View>
              <Text style={[styles.eventsValue, styles.eventsValueNew]}>
                {currentEventsData.new}
              </Text>
              <Text style={styles.eventsPercentage}>{currentEventsData.newPercentage}%</Text>
            </View>
            
            <View style={styles.eventsGridItem}>
              <View style={styles.eventsMetricRow}>
                <View style={[styles.eventsIndicator, styles.eventsIndicatorCompleted]} />
                <Text style={styles.eventsLabel}>Orders</Text>
              </View>
              <Text style={[styles.eventsValue, styles.eventsValueCompleted]}>
                {currentEventsData.completed}
              </Text>
              <Text style={styles.eventsPercentage}>
                {Math.round((currentEventsData.completed / currentEventsData.total) * 100)}%
              </Text>
            </View>
            
            <View style={styles.eventsGridItem}>
              <View style={styles.eventsMetricRow}>
                <View style={[styles.eventsIndicator, styles.eventsIndicatorUpcoming]} />
                <Text style={styles.eventsLabel}>Engagements</Text>
              </View>
              <Text style={[styles.eventsValue, styles.eventsValueUpcoming]}>
                {currentEventsData.upcoming}
              </Text>
              <Text style={styles.eventsPercentage}>
                {Math.round((currentEventsData.upcoming / currentEventsData.total) * 100)}%
              </Text>
            </View>
          </View>
          
          {currentEventsData.inactive > 0 && (
            <View style={styles.eventsFooter}>
              <View style={styles.eventsMetricRow}>
                <View style={[styles.eventsIndicator, styles.eventsIndicatorInactive]} />
                <Text style={styles.eventsLabel}>Inactive</Text>
              </View>
              <Text style={[styles.eventsValue, styles.eventsValueInactive]}>
                {currentEventsData.inactive}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Product Analytics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Analytics</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Category</Text>
            <View style={styles.filterSegmentedContainer}>
              {productCategoryFilters.map((filter, index) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterSegmentedButton,
                    index === 0 && styles.filterSegmentedButtonFirst,
                    index === productCategoryFilters.length - 1 && styles.filterSegmentedButtonLast,
                    productCategoryFilter === filter.id && styles.filterSegmentedButtonActive,
                  ]}
                  onPress={() => setProductCategoryFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterSegmentedButtonText,
                      productCategoryFilter === filter.id && styles.filterSegmentedButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.productAnalyticsCard}>
          {/* Pie Chart */}
          <View style={styles.productPieChartSection}>
            <Text style={styles.productPieChartTitle}>Product Status</Text>
            <View style={styles.productPieChartWrapper}>
              <PieChart data={pieChartData} />
            </View>
            <View style={styles.productPieChartLegend}>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.productPieChartLegendItem}>
                  <View style={[styles.productPieChartLegendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.productPieChartLegendText}>
                    {item.category}: {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.productAnalyticsDivider} />
          {/* Overview Stats */}
          <View style={styles.productOverview}>
            <View style={styles.productOverviewItem}>
              <Text style={styles.productOverviewLabel}>Total Products</Text>
              <Text style={styles.productOverviewValue}>{productAnalytics.totalProducts}</Text>
            </View>
            <View style={styles.productOverviewItem}>
              <Text style={styles.productOverviewLabel}>Active</Text>
              <Text style={[styles.productOverviewValue, styles.productOverviewValueActive]}>
                {productAnalytics.activeProducts}
              </Text>
            </View>
            <View style={styles.productOverviewItem}>
              <Text style={styles.productOverviewLabel}>Low Stock</Text>
              <Text style={[styles.productOverviewValue, styles.productOverviewValueWarning]}>
                {productAnalytics.lowStock}
              </Text>
            </View>
            <View style={styles.productOverviewItem}>
              <Text style={styles.productOverviewLabel}>Out of Stock</Text>
              <Text style={[styles.productOverviewValue, styles.productOverviewValueError]}>
                {productAnalytics.outOfStock}
              </Text>
            </View>
          </View>

          <View style={styles.productAnalyticsDivider} />

          {/* Sales Metrics */}
          <View style={styles.productSalesSection}>
            <View style={styles.productSalesHeader}>
              <Text style={styles.productSalesTitle}>Sales Performance</Text>
              <View style={[styles.productSalesBadge, parseFloat(salesGrowth) > 0 ? styles.productSalesBadgeUp : styles.productSalesBadgeDown]}>
                <Text style={styles.productSalesBadgeText}>
                  {parseFloat(salesGrowth) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(salesGrowth))}%
                </Text>
              </View>
            </View>
            <View style={styles.productSalesRow}>
              <View style={styles.productSalesItem}>
                <Text style={styles.productSalesLabel}>Total Revenue</Text>
                <Text style={styles.productSalesValue}>
                  ${productAnalytics.totalSales.toLocaleString()}
                </Text>
              </View>
              <View style={styles.productSalesItem}>
                <Text style={styles.productSalesLabel}>Total Units</Text>
                <Text style={styles.productSalesValue}>
                  {productAnalytics.totalUnits.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.productSalesRow}>
              <View style={styles.productSalesItem}>
                <Text style={styles.productSalesLabel}>Avg. Price</Text>
                <Text style={styles.productSalesValue}>
                  ${productAnalytics.averagePrice}
                </Text>
              </View>
              <View style={styles.productSalesItem}>
                <Text style={styles.productSalesLabel}>Top Seller</Text>
                <Text style={styles.productSalesValue}>
                  {productAnalytics.topSelling}
                </Text>
                <Text style={styles.productSalesSubtext}>
                  {productAnalytics.topSellingUnits} units
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.productAnalyticsDivider} />

          {/* Category Breakdown */}
          <View style={styles.productCategorySection}>
            <Text style={styles.productCategoryTitle}>Revenue by Category</Text>
            {productAnalytics.categoryBreakdown.map((category, index) => {
              const percentage = Math.round((category.revenue / productAnalytics.totalSales) * 100);
              return (
                <View key={index} style={styles.productCategoryItem}>
                  <View style={styles.productCategoryHeader}>
                    <Text style={styles.productCategoryName}>{category.category}</Text>
                    <Text style={styles.productCategoryRevenue}>${category.revenue.toLocaleString()}</Text>
                  </View>
                  <View style={styles.productCategoryBarContainer}>
                    <View style={[styles.productCategoryBar, { width: `${percentage}%` }]} />
                  </View>
                  <View style={styles.productCategoryFooter}>
                    <Text style={styles.productCategoryCount}>{category.count} products</Text>
                    <Text style={styles.productCategoryPercentage}>{percentage}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Revenue Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>This Period</Text>
              <Text style={styles.revenueValue}>${productAnalytics.totalSales.toLocaleString()}</Text>
              <Text style={[styles.revenueChange, parseFloat(salesGrowth) > 0 ? styles.revenueChangeUp : styles.revenueChangeDown]}>
                {parseFloat(salesGrowth) > 0 ? '+' : ''}{salesGrowth}% vs previous
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Previous Period</Text>
              <Text style={styles.revenueValue}>${productAnalytics.previousSales.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Average Daily</Text>
              <Text style={styles.revenueValue}>
                ${Math.round(productAnalytics.totalSales / 30).toLocaleString()}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Projected Monthly</Text>
              <Text style={styles.revenueValue}>
                ${Math.round(productAnalytics.totalSales * 1.1).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('dashboard')}
          activeOpacity={0.7}
        >
          <DashboardIcon active={activeTab === 'dashboard'} />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'dashboard' && styles.navLabelActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('products')}
          activeOpacity={0.7}
        >
          <ProductsIcon active={activeTab === 'products'} />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'products' && styles.navLabelActive,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('orders')}
          activeOpacity={0.7}
        >
          <OrdersIcon active={activeTab === 'orders'} />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'orders' && styles.navLabelActive,
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('analytics')}
          activeOpacity={0.7}
        >
          <AnalyticsIcon active={activeTab === 'analytics'} />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'analytics' && styles.navLabelActive,
            ]}
          >
            Stores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('userSettings')}
          activeOpacity={0.7}
        >
          <SettingsIcon active={activeTab === 'userSettings'} />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'userSettings' && styles.navLabelActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modern Professional Color Palette
  colors: {
    primary: '#6366F1',      // Indigo - main brand color
    secondary: '#EC4899',    // Pink - accent color
    tertiary: '#8B5CF6',     // Purple - secondary accent
    success: '#10B981',      // Emerald - success states
    warning: '#F59E0B',      // Amber - warning states
    error: '#EF4444',        // Red - error states
    info: '#3B82F6',         // Blue - info states
    background: '#F8FAFC',   // Light gray background
    surface: '#FFFFFF',      // White surface
    surfaceSecondary: '#F1F5F9', // Light gray surface
    textPrimary: '#1E293B',  // Dark slate text
    textSecondary: '#64748B', // Medium gray text
    textTertiary: '#94A3B8',  // Light gray text
    border: '#E2E8F0',       // Light border
    borderSecondary: '#CBD5E1', // Medium border
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 24,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 14,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  navLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    marginLeft: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterSegmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSegmentedButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSegmentedButtonFirst: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  filterSegmentedButtonLast: {
    borderRightWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  filterSegmentedButtonActive: {
    backgroundColor: '#0D112D',
    shadowColor: '#0D112D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSegmentedButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  filterSegmentedButtonTextActive: {
    color: '#FDDB12',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  chartContainer: {
    height: 180,
    marginBottom: 16,
    position: 'relative',
  },
  trendContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendBadgeUp: {
    backgroundColor: '#10B981',
  },
  trendBadgeDown: {
    backgroundColor: '#EF4444',
  },
  trendBadgeNeutral: {
    backgroundColor: '#64748B',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  gridLine: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 1,
  },
  gridLineLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  gridLineLabel: {
    fontSize: 10,
    color: '#94A3B8',
    width: 32,
    textAlign: 'right',
    fontWeight: '500',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 2,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingBottom: 20,
  },
  bar: {
    width: '80%',
    borderRadius: 8,
    minHeight: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  barHighest: {
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  barHighlight: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barHighlightText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  barLabel: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 6,
  },
  barLabelHighest: {
    color: '#0D112D',
  },
  barDayLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  chartStatsSpacer: {
    height: 20,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  statChange: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '500',
  },
  eventsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  eventsHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  eventsTotalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  eventsTotalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  eventsGridItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  eventsMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  eventsLabel: {
    fontSize: 10,
    color: '#666',
  },
  eventsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 2,
  },
  eventsPercentage: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  eventsValueActive: {
    color: '#000000',
  },
  eventsValueInactive: {
    color: '#000000',
  },
  eventsValueNew: {
    color: '#000000',
  },
  eventsValueCompleted: {
    color: '#000000',
  },
  eventsValueUpcoming: {
    color: '#000000',
  },
  eventsIndicatorActive: {
    backgroundColor: '#28A745',
  },
  eventsIndicatorNew: {
    backgroundColor: '#FDDB12',
  },
  eventsIndicatorCompleted: {
    backgroundColor: '#6C757D',
  },
  eventsIndicatorUpcoming: {
    backgroundColor: '#0D112D',
  },
  eventsIndicatorInactive: {
    backgroundColor: '#DC3545',
  },
  eventsChartSection: {
    marginBottom: 16,
  },
  eventsChartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  eventsAnalyticsDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  lineChartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  lineChartSvg: {
    marginBottom: 8,
  },
  lineChartYLabelContainer: {
    position: 'absolute',
    left: 0,
    width: 30,
  },
  lineChartYLabel: {
    fontSize: 9,
    color: '#999',
    textAlign: 'right',
  },
  lineChartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 280,
    paddingHorizontal: 20,
  },
  lineChartXLabel: {
    fontSize: 9,
    color: '#999',
  },
  eventsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  productAnalyticsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  productOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  productOverviewItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  productOverviewLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  productOverviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  productOverviewValueActive: {
    color: '#28A745',
  },
  productOverviewValueWarning: {
    color: '#FD7E14',
  },
  productOverviewValueError: {
    color: '#DC3545',
  },
  productAnalyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productAnalyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  productAnalyticsLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  productAnalyticsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  productAnalyticsValueActive: {
    color: '#28A745',
  },
  productAnalyticsValueWarning: {
    color: '#FD7E14',
  },
  productAnalyticsValueError: {
    color: '#DC3545',
  },
  productAnalyticsDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  productSalesSection: {
    marginBottom: 8,
  },
  productSalesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productSalesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  productSalesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productSalesBadgeUp: {
    backgroundColor: '#28A745',
  },
  productSalesBadgeDown: {
    backgroundColor: '#DC3545',
  },
  productSalesBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productSalesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productSalesItem: {
    flex: 1,
    alignItems: 'center',
  },
  productSalesLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  productSalesValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  productSalesSubtext: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  productCategorySection: {
    marginTop: 8,
  },
  productCategoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  productCategoryItem: {
    marginBottom: 12,
  },
  productCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productCategoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  productCategoryRevenue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  productCategoryBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  productCategoryBar: {
    height: '100%',
    backgroundColor: '#FDDB12',
    borderRadius: 3,
  },
  productCategoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategoryCount: {
    fontSize: 9,
    color: '#999',
  },
  productCategoryPercentage: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  revenueLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  revenueChange: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  revenueChangeUp: {
    color: '#10B981',
  },
  revenueChangeDown: {
    color: '#EF4444',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterGroupLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  productPieChartSection: {
    marginBottom: 16,
  },
  productPieChartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  productPieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productPieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  pieChartLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  productPieChartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  productPieChartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPieChartLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  productPieChartLegendText: {
    fontSize: 11,
    color: '#000000',
  },
});

export default DashboardScreen;

