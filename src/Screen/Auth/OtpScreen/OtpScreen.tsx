import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { forgotPasswordRequest, verifyOtpRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { useTheme } from '../../../Themes/hooks';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';

type OtpScreenProps = StackScreenProps<RootStackParamList, 'Otp'>;

const OtpScreen = ({ route, navigation }: OtpScreenProps) => {
    const { email } = route.params || { email: '' };
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [touched, setTouched] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const { colors, tokens } = useTheme();
    const isDarkTheme = tokens.isDark;
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const dispatch = useDispatch();
    const { isLoading, verifyOtpResponse } = useSelector((state: RootState) => state.AuthReducer);

    // Spring button scale animation
    const buttonScale = useRef(new Animated.Value(1)).current;
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // Countdown timer for Resend OTP
    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Handle successful OTP verification
    useEffect(() => {
        if (verifyOtpResponse?.success || verifyOtpResponse?.message) {
            // Find token in standard places
            const token = verifyOtpResponse?.resetToken ||
                verifyOtpResponse?.data?.resetToken ||
                verifyOtpResponse?.token ||
                verifyOtpResponse?.data?.token ||
                verifyOtpResponse?.data?.data?.token ||
                (typeof verifyOtpResponse?.data === 'string' ? verifyOtpResponse?.data : undefined);

            if (token && typeof token === 'string') {
                // Navigate to Reset Password screen with the verification token
                navigation.navigate('ChangePassword', { token });
            } else {
                // Fallback if token structure is nested differently
                navigation.navigate('ChangePassword', { token: JSON.stringify(token || verifyOtpResponse) });
            }
        }
    }, [verifyOtpResponse, navigation]);

    const handleOtpChange = (value: string, index: number) => {
        const nextOtp = [...otp];

        // Take only the last character entered
        const char = value.substring(value.length - 1);
        nextOtp[index] = char;
        setOtp(nextOtp);
        setTouched(true);

        // Move focus to next input if filled
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace back-navigation
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            const nextOtp = [...otp];
            nextOtp[index - 1] = '';
            setOtp(nextOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const isOtpComplete = () => {
        return otp.every(val => val.trim() !== '');
    };

    const handleVerify = () => {
        setTouched(true);
        if (!isOtpComplete()) {
            return;
        }
        Keyboard.dismiss();
        dispatch(verifyOtpRequest({
            email: email.trim(),
            otp: otp.join(''),
        }));
    };

    const handleResendOTP = () => {
        if (resendTimer > 0) return;
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        dispatch(forgotPasswordRequest({ email: email.trim() }));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Background} barStyle={statusBarStyle} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={normalize(24)} color={colors.text} />
                </Pressable>

                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.tagPurple }]}>
                            <Icon name="shield" size={normalize(28)} color={colors.tagPurpleText} />
                        </View>
                        <Text style={[styles.brandTitle, { color: colors.text }]}>OTP Verification</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            We've sent a 6-digit verification code to your email address:
                        </Text>
                        <Text style={[styles.emailText, { color: colors.accent }]}>{email}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.otpInputWrapper}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text },
                                        touched && !digit ? styles.otpInputError : null,
                                        digit ? { borderColor: colors.accent, backgroundColor: colors.Background } : null,
                                        focusedIndex === index ? { borderColor: colors.accent, borderWidth: 2 } : null,
                                        focusedIndex === index && isDarkTheme ? {
                                            shadowColor: colors.accent,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.35,
                                            shadowRadius: 8,
                                            elevation: 2,
                                        } : null
                                    ]}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    textAlign="center"
                                />
                            ))}
                        </View>
                        {touched && !isOtpComplete() && (
                            <Text style={styles.errorText}>Please enter all 6 digits of the OTP</Text>
                        )}

                        <AnimatedPressable
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: colors.Primary,
                                    borderColor: colors.border,
                                    borderWidth: isDarkTheme ? 1 : 0,
                                    transform: [{ scale: buttonScale }],
                                    shadowColor: isDarkTheme ? colors.accent : '#000000',
                                    shadowOpacity: isDarkTheme ? 0.25 : 0.1,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                },
                                !isOtpComplete() && styles.submitButtonDisabled
                            ]}
                            onPress={handleVerify}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Verify OTP</Text>
                            )}
                        </AnimatedPressable>
                    </View>

                    <View style={styles.resendContainer}>
                        <Text style={[styles.resendText, { color: colors.textSecondary }]}>Didn't receive the code? </Text>
                        {resendTimer > 0 ? (
                            <Text style={[styles.timerText, { color: colors.textSecondary }]}>Resend in {resendTimer}s</Text>
                        ) : (
                            <Pressable onPress={handleResendOTP}>
                                <Text style={[styles.resendButtonText, { color: colors.Secondary }]}>Resend OTP</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(20),
    },
    backButton: {
        marginBottom: verticalScale(30),
        alignSelf: 'flex-start',
    },
    contentContainer: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: verticalScale(40),
    },
    iconContainer: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    brandTitle: {
        fontSize: normalize(28),
        fontWeight: '800',
        marginBottom: verticalScale(12),
    },
    subtitle: {
        fontSize: normalize(15),
        lineHeight: normalize(22),
    },
    emailText: {
        fontSize: normalize(16),
        fontWeight: '700',
        marginTop: verticalScale(6),
    },
    formContainer: {
        marginBottom: verticalScale(30),
    },
    otpInputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    otpInput: {
        width: normalize(45),
        height: verticalScale(55),
        borderRadius: normalize(12),
        borderWidth: 1,
        fontSize: normalize(20),
        fontWeight: '700',
    },
    otpInputFilled: {
        backgroundColor: '#F8FAFC',
    },
    otpInputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: normalize(12),
        marginBottom: verticalScale(20),
        alignSelf: 'center',
    },
    submitButton: {
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '700',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    resendText: {
        fontSize: normalize(14),
    },
    timerText: {
        fontWeight: '600',
        fontSize: normalize(14),
    },
    resendButtonText: {
        fontWeight: '700',
        fontSize: normalize(14),
    },
});

export default OtpScreen;
