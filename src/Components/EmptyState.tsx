import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../Themes/Colorpath';
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
}: EmptyStateProps) => (
    <View style={styles.container}>
        <View style={styles.iconWrap}>
            <Icon name={icon} size={normalize(24)} color={Colorpath.Primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction ? (
            <Pressable style={styles.button} onPress={onAction}>
                <Text style={styles.buttonText}>{actionLabel}</Text>
            </Pressable>
        ) : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        paddingHorizontal: normalize(22),
        paddingVertical: verticalScale(28),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 4,
    },
    iconWrap: {
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    title: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(6),
        textAlign: 'center',
    },
    message: {
        fontSize: normalize(13),
        color: '#64748B',
        lineHeight: normalize(20),
        textAlign: 'center',
    },
    button: {
        marginTop: verticalScale(18),
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(999),
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(10),
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: normalize(13),
        fontWeight: '700',
    },
});

export default memo(EmptyState);
