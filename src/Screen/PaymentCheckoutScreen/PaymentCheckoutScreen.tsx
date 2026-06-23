import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../../Navigator/StackNav';
import {
    paymentFailure,
    paymentSuccess,
} from '../../Redux/Reducers/MockTestReducer';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
import { useTheme } from '../../Themes/hooks';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

type Props = StackScreenProps<RootStackParamList, 'PaymentCheckout'>;

const SUCCESS_MARKERS = [
    'payment-success',
    'payment_success',
    'payments/success',
    'status=success',
    'status=paid',
    'status=captured',
    'razorpay_payment_id=',
];

const FAILURE_MARKERS = [
    'payment-failed',
    'payment_failure',
    'payments/failure',
    'status=failed',
    'status=cancelled',
    'status=canceled',
];

const includesMarker = (url: string, markers: string[]) => {
    const normalized = url.toLowerCase();
    return markers.some(marker => normalized.includes(marker));
};

const EmbeddedWebView: any = WebView;

const PaymentCheckoutScreen = ({ navigation, route }: Props) => {
    const dispatch = useDispatch();
    const { colors, tokens } = useTheme();
    const webViewRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canGoBack, setCanGoBack] = useState(false);
    const [isResolved, setIsResolved] = useState(false);
    const { url, bundleId, payment } = route.params;

    const completeCheckout = useCallback((successful: boolean) => {
        if (isResolved) {
            return;
        }

        setIsResolved(true);
        if (successful) {
            dispatch(paymentSuccess(payment || { bundleId }));
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
            Toast.show({ type: 'success', text1: 'Payment completed successfully' });
        } else {
            dispatch(paymentFailure(undefined));
            Toast.show({ type: 'error', text1: 'Payment was not completed' });
        }
        navigation.goBack();
    }, [bundleId, dispatch, isResolved, navigation, payment]);

    const handleNavigationChange = useCallback((state: WebViewNavigation) => {
        setCanGoBack(state.canGoBack);
        if (includesMarker(state.url, SUCCESS_MARKERS)) {
            completeCheckout(true);
        } else if (includesMarker(state.url, FAILURE_MARKERS)) {
            completeCheckout(false);
        }
    }, [completeCheckout]);

    const handleClose = () => {
        if (canGoBack) {
            webViewRef.current?.goBack();
            return;
        }
        completeCheckout(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />
            <SafeAreaView edges={['top']} style={{ backgroundColor: tokens.glassSurface }}>
                <View style={[styles.header, { borderBottomColor: tokens.glassBorder }]}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={canGoBack ? 'Go back' : 'Close payment'}
                        onPress={handleClose}
                        style={[styles.iconButton, { backgroundColor: tokens.surfaceMuted }]}
                    >
                        <Feather name={canGoBack ? 'arrow-left' : 'x'} size={normalize(20)} color={colors.text} />
                    </Pressable>
                    <View style={styles.headerCopy}>
                        <Text style={[styles.title, { color: colors.text }]}>Secure payment</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Protected by Razorpay</Text>
                    </View>
                    <View style={[styles.secureBadge, { backgroundColor: colors.tagGreen }]}>
                        <Feather name="lock" size={normalize(12)} color={colors.tagGreenText} />
                        <Text style={[styles.secureText, { color: colors.tagGreenText }]}>SECURE</Text>
                    </View>
                </View>
            </SafeAreaView>

            <EmbeddedWebView
                ref={webViewRef}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationChange}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    Toast.show({ type: 'error', text1: 'Unable to load payment checkout' });
                }}
                javaScriptEnabled
                domStorageEnabled
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                setSupportMultipleWindows={false}
                startInLoadingState={false}
                style={{ backgroundColor: colors.Background }}
            />

            {isLoading ? (
                <View style={[styles.loadingOverlay, { backgroundColor: tokens.overlay }]}>
                    <View style={[styles.loadingCard, {
                        backgroundColor: tokens.glassSurface,
                        borderColor: tokens.glassBorder,
                    }]}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Loading secure checkout…</Text>
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        minHeight: verticalScale(64),
        paddingHorizontal: normalize(16),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        gap: normalize(12),
    },
    iconButton: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCopy: {
        flex: 1,
    },
    title: {
        fontSize: normalize(16),
        fontWeight: '800',
    },
    subtitle: {
        marginTop: verticalScale(2),
        fontSize: normalize(11),
        fontWeight: '600',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(5),
        borderRadius: normalize(999),
        paddingHorizontal: normalize(9),
        paddingVertical: verticalScale(6),
    },
    secureText: {
        fontSize: normalize(9),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(30),
    },
    loadingCard: {
        minWidth: normalize(210),
        borderWidth: 1,
        borderRadius: normalize(20),
        paddingHorizontal: normalize(24),
        paddingVertical: verticalScale(22),
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(12),
        fontSize: normalize(13),
        fontWeight: '700',
    },
});

export default PaymentCheckoutScreen;
