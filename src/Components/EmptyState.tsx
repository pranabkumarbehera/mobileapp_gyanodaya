import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: tokens.glassSurface,
                borderColor: tokens.glassBorder,
                borderRadius: normalize(tokens.radius.xl),
                shadowColor: tokens.shadow,
                shadowOpacity: tokens.shadowOpacity,
            },
        ]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.tagCyan }]}>
                <Icon name={icon} size={normalize(24)} color={colors.tagCyanText} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
            {actionLabel && onAction ? (
                <Pressable
                    accessibilityRole="button"
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={onAction}
                >
                    <Text style={[styles.buttonText, { color: tokens.onAccent }]}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: normalize(22),
        paddingVertical: verticalScale(28),
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 4,
    },
    iconWrap: {
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    title: {
        fontSize: normalize(18),
        fontWeight: '800',
        marginBottom: verticalScale(6),
        textAlign: 'center',
    },
    message: {
        fontSize: normalize(13),
        lineHeight: normalize(20),
        textAlign: 'center',
    },
    button: {
        marginTop: verticalScale(18),
        borderRadius: normalize(999),
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(10),
    },
    buttonText: {
        fontSize: normalize(13),
        fontWeight: '700',
    },
});

export default memo(EmptyState);
