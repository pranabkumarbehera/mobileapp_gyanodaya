import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on standard ~5" screen mobile device (iPhone 8 / standard Android)
const scale = SCREEN_WIDTH / 375;

export function normalize(size: number) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

export function verticalScale(size: number) {
    const scale = SCREEN_HEIGHT / 812;
    return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}
