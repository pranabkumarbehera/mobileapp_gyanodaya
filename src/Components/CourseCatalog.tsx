import React, { memo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { DesignTokens, withAlpha } from '../Themes/hooks';
import { ThemeColors } from '../Themes/themes';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';

export type CourseIcon = {
  name: string;
  type: string;
  backgroundColor: string;
  color: string;
};

type CourseCatalogCardProps = {
  title: string;
  icon: CourseIcon;
  mockCount: number;
  price: number;
  originalPrice?: number;
  isEnrolled: boolean;
  colors: ThemeColors;
  tokens: DesignTokens;
  onPress: () => void;
};

type CatalogSearchProps = {
  value: string;
  colors: ThemeColors;
  tokens: DesignTokens;
  onChangeText: (value: string) => void;
};

type CatalogMetricProps = {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  colors: ThemeColors;
  tokens: DesignTokens;
};

const CourseCatalogCard = memo(
  ({
    title,
    icon,
    mockCount,
    price,
    originalPrice,
    isEnrolled,
    colors,
    tokens,
    onPress,
  }: CourseCatalogCardProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const animateTo = (value: number) => {
      Animated.spring(scale, {
        toValue: value,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={[styles.cardShell, { transform: [{ scale }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}`}
          onPress={onPress}
          onPressIn={() => animateTo(0.96)}
          onPressOut={() => animateTo(1)}
          style={({ pressed }) => [
            styles.courseCard,
            {
              backgroundColor: tokens.glassSurface,
              borderColor: tokens.glassBorder,
              borderRadius: normalize(tokens.radius.xl),
              
              
              opacity: pressed ? 0.95 : 1,
            },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: tokens.isDark
                    ? withAlpha(colors.accent, 0.12)
                    : icon.backgroundColor,
                  borderRadius: normalize(tokens.radius.md),
                },
              ]}
            >
              {icon.type === 'FontAwesome5' ? (
                <FontAwesome5
                  name={icon.name}
                  size={normalize(22)}
                  color={tokens.isDark ? colors.accent : icon.color}
                />
              ) : (
                <Feather
                  name={icon.name}
                  size={normalize(22)}
                  color={tokens.isDark ? colors.accent : icon.color}
                />
              )}
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isEnrolled
                    ? colors.tagGreen
                    : price > 0
                      ? colors.tagCyan
                      : colors.tagOrange,
                  borderRadius: normalize(tokens.radius.pill),
                  borderColor: tokens.glassBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isEnrolled
                      ? colors.tagGreenText
                      : price > 0
                        ? colors.tagCyanText
                        : colors.tagOrangeText,
                  },
                ]}
              >
                {isEnrolled ? 'ENROLLED' : price > 0 ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.courseTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          <View style={styles.metaRow}>
            <Feather
              name="layers"
              size={normalize(14)}
              color={colors.textSecondary}
            />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {mockCount} mock test{mockCount === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceText, { color: colors.text }]}>
                {isEnrolled ? 'Continue' : price > 0 ? `₹${price}` : 'Free'}
              </Text>
              {!isEnrolled && originalPrice && originalPrice > price ? (
                <Text
                  style={[
                    styles.originalPrice,
                    { color: colors.textSecondary },
                  ]}
                >
                  ₹{originalPrice}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.arrowButton,
                {
                  backgroundColor: colors.accent,
                  borderRadius: normalize(tokens.radius.md),
                },
              ]}
            >
              <Feather
                name="arrow-right"
                size={normalize(16)}
                color={tokens.onAccent}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

const CatalogSearch = memo(
  ({ value, colors, tokens, onChangeText }: CatalogSearchProps) => (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: tokens.glassSurface,
          borderColor: tokens.glassBorder,
          borderRadius: normalize(tokens.radius.lg),
          
          
        },
      ]}
    >
      <Feather
        name="search"
        size={normalize(18)}
        color={colors.textSecondary}
      />
      <TextInput
        accessibilityLabel="Search courses"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        placeholder="Search by course or exam"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={[styles.searchInput, { color: colors.text }]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={[
            styles.clearButton,
            {
              backgroundColor: tokens.surfaceMuted,
              borderRadius: normalize(tokens.radius.pill),
            },
          ]}
        >
          <Feather name="x" size={normalize(14)} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  ),
);

const CatalogMetric = memo(
  ({ icon, label, value, color, colors, tokens }: CatalogMetricProps) => (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: tokens.glassSurface,
          borderColor: tokens.glassBorder,
          borderRadius: normalize(tokens.radius.lg),
        },
      ]}
    >
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: withAlpha(color, 0.12),
            borderRadius: normalize(tokens.radius.sm),
          },
        ]}
      >
        <Feather name={icon} size={normalize(15)} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text
        style={[styles.metricLabel, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  ),
);

const CatalogState = ({
  loading,
  hasSearch,
  colors,
  tokens,
}: {
  loading: boolean;
  hasSearch: boolean;
  colors: ThemeColors;
  tokens: DesignTokens;
}) => (
  <View style={styles.stateContainer}>
    {loading ? (
      <ActivityIndicator size="large" color={colors.accent} />
    ) : (
      <View
        style={[
          styles.stateIcon,
          {
            backgroundColor: colors.cardBackground,
            borderColor: tokens.glassBorder,
            borderRadius: normalize(tokens.radius.xl),
          },
        ]}
      >
        <Feather
          name={hasSearch ? 'search' : 'book-open'}
          size={normalize(24)}
          color={colors.textSecondary}
        />
      </View>
    )}
    <Text style={[styles.stateTitle, { color: colors.text }]}>
      {loading
        ? 'Loading courses'
        : hasSearch
          ? 'No matching courses'
          : 'No courses available'}
    </Text>
    <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
      {loading
        ? 'Preparing your learning catalog…'
        : hasSearch
          ? 'Try a shorter or different search.'
          : 'New learning content will appear here.'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  cardShell: {
    flex: 1,
    paddingHorizontal: normalize(8),
    marginBottom: verticalScale(16),
  },
  courseCard: {
    minHeight: verticalScale(230),
    borderWidth: 1,
    padding: normalize(16),
    
    
    
    display: 'flex',
    flexDirection: 'column',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  iconWrap: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: verticalScale(5),
    maxWidth: '58%',
  },
  statusText: {
    fontSize: normalize(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseTitle: {
    minHeight: normalize(44),
    fontSize: normalize(15),
    fontWeight: '800',
    lineHeight: normalize(22),
    marginBottom: verticalScale(12),
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  metaText: {
    flex: 1,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: verticalScale(14),
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: normalize(6),
  },
  priceText: {
    fontSize: normalize(14),
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: normalize(11),
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  arrowButton: {
    width: normalize(32),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
    
    
    
    
  },
  searchContainer: {
    height: verticalScale(52),
    borderWidth: 1,
    paddingHorizontal: normalize(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    
    
    
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: normalize(14),
    fontWeight: '500',
  },
  clearButton: {
    width: normalize(28),
    height: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    paddingHorizontal: normalize(10),
    paddingVertical: verticalScale(12),
  },
  metricIcon: {
    width: normalize(30),
    height: normalize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(9),
  },
  metricValue: {
    fontSize: normalize(18),
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: verticalScale(2),
    fontSize: normalize(10),
    fontWeight: '600',
  },
  stateContainer: {
    minHeight: verticalScale(260),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(30),
  },
  stateIcon: {
    width: normalize(58),
    height: normalize(58),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: verticalScale(14),
    fontSize: normalize(16),
    fontWeight: '800',
    textAlign: 'center',
  },
  stateSubtitle: {
    marginTop: verticalScale(6),
    fontSize: normalize(12),
    lineHeight: normalize(18),
    textAlign: 'center',
  },
});

export { CatalogMetric, CatalogSearch, CatalogState, CourseCatalogCard };
