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
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={[styles.cardShell, { transform: [{ scale }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}`}
          onPress={onPress}
          onPressIn={() => animateTo(0.97)}
          onPressOut={() => animateTo(1)}
          style={[
            styles.courseCard,
            {
              backgroundColor: tokens.glassSurface,
              borderColor: tokens.glassBorder,
              borderRadius: normalize(tokens.radius.xl),
              shadowColor: tokens.shadow,
              shadowOpacity: tokens.shadowOpacity,
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
                  size={normalize(20)}
                  color={tokens.isDark ? colors.accent : icon.color}
                />
              ) : (
                <Feather
                  name={icon.name}
                  size={normalize(21)}
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
                    : colors.tagCyan,
                  borderRadius: normalize(tokens.radius.pill),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isEnrolled
                      ? colors.tagGreenText
                      : colors.tagCyanText,
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
              size={normalize(13)}
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
                  borderRadius: normalize(tokens.radius.sm),
                },
              ]}
            >
              <Feather
                name="arrow-up-right"
                size={normalize(15)}
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
          shadowColor: tokens.shadow,
          shadowOpacity: tokens.shadowOpacity * 0.45,
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
    maxWidth: '50%',
    paddingHorizontal: normalize(6),
    marginBottom: verticalScale(12),
  },
  courseCard: {
    minHeight: verticalScale(220),
    borderWidth: 1,
    padding: normalize(14),
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  iconWrap: {
    width: normalize(44),
    height: normalize(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: normalize(7),
    paddingVertical: verticalScale(4),
    maxWidth: '58%',
  },
  statusText: {
    fontSize: normalize(8),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  courseTitle: {
    minHeight: normalize(42),
    fontSize: normalize(14),
    fontWeight: '800',
    lineHeight: normalize(20),
    marginBottom: verticalScale(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  metaText: {
    flex: 1,
    fontSize: normalize(11),
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: normalize(5),
  },
  priceText: {
    fontSize: normalize(13),
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: normalize(10),
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  arrowButton: {
    width: normalize(30),
    height: normalize(30),
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
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
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
