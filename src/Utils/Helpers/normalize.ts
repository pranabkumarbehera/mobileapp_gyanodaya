import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const baseWidth = 375;
const baseHeight = 812;

// On web, the app renders inside a max-480px container styled like a phone.
// Use a fixed reference width (390px = modern iPhone) so UI elements stay
// properly proportioned regardless of actual browser window size.
const WEB_REFERENCE_WIDTH = 390;
const WEB_REFERENCE_HEIGHT = 844;

const currentWidth = isWeb ? WEB_REFERENCE_WIDTH : SCREEN_WIDTH;
const currentHeight = isWeb ? WEB_REFERENCE_HEIGHT : SCREEN_HEIGHT;

const scale = currentWidth / baseWidth;

export function normalize(size: number) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else if (Platform.OS === 'android') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    } else {
        // Web: clamp sizes to reasonable bounds for phone UI
        return Math.round(Math.min(newSize, size * 1.2));
    }
}

export function verticalScale(size: number) {
    const vScale = currentHeight / baseHeight;
    return Math.round(size * vScale);
}

// Utility: returns the actual display width of the web container (for layout use)
export function getContainerWidth(): number {
    if (isWeb) {
        return Math.min(SCREEN_WIDTH, 480);
    }
    return SCREEN_WIDTH;
}

