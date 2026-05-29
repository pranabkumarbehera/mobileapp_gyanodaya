import React, { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { normalize } from '../Utils/Helpers/normalize';
import { getAvatarBackgroundColor, getInitials } from '../Utils/Helpers/home';

type AvatarProps = {
    imageUri?: string | null;
    name?: string | null;
    size?: number;
    textSize?: number;
};

const Avatar = ({ imageUri, name, size = normalize(44), textSize }: AvatarProps) => {
    const initials = useMemo(() => getInitials(name), [name]);
    const backgroundColor = useMemo(() => getAvatarBackgroundColor(name), [name]);
    const resolvedTextSize = textSize ?? Math.max(size * 0.36, normalize(14));

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
            ]}
        >
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
                <Text style={[styles.initials, { fontSize: resolvedTextSize }]}>{initials}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initials: {
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: 0.4,
    },
});

export default memo(Avatar);
