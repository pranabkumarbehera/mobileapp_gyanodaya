import React, { memo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../Themes/hooks';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';

type EmptyStateProps = {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: string;
};

const EmptyState = ({
    title,
    message,
    actionLabel,
    onAction,
    icon = 'inbox',
}: EmptyStateProps) => {
    const { colors, tokens } = useTheme();
    const scale = useRef(new Animated.Value(0.95)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            })
        ]).start();
    }, [scale, opacity]);

    return (
        <Animated.View style={[
            styles.container,
            {
                backgroundColor: tokens.glassSurface,
                borderColor: tokens.glassBorder,
                borderRadius: normalize(tokens.radius.xl),
                shadowColor: tokens.shadow,
                shadowOpacity: tokens.shadowOpacity,
                opacity,
                transform: [{ scale }]
            },
        ]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.tagCyan }]}>
                <Icon name={icon} size={normalize(32)} color={colors.tagCyanText} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
            {actionLabel && onAction ? (
                <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }
                    ]}
                    onPress={onAction}
                >
                    <Text style={[styles.buttonText, { color: tokens.onAccent }]}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: normalize(28),
        paddingVertical: verticalScale(36),
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 16 },
        shadowRadius: 24,
        elevation: 6,
        marginVertical: verticalScale(20),
        marginHorizontal: normalize(16),
    },
    iconWrap: {
        width: normalize(72),
        height: normalize(72),
        borderRadius: normalize(36),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(18),
    },
    title: {
        fontSize: normalize(20),
        fontWeight: '800',
        marginBottom: verticalScale(8),
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    message: {
        fontSize: normalize(14),
        lineHeight: normalize(22),
        textAlign: 'center',
    },
    button: {
        marginTop: verticalScale(24),
        borderRadius: normalize(999),
        paddingHorizontal: normalize(24),
        paddingVertical: verticalScale(14),
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        shadowOpacity: 0.2,
        elevation: 3,
    },
    buttonText: {
        fontSize: normalize(14),
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default memo(EmptyState);
