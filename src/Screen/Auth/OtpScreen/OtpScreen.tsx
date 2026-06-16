import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtpRequest, forgotPasswordRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';

type OtpScreenProps = StackScreenProps<RootStackParamList, 'Otp'>;

const OtpScreen = ({ route, navigation }: OtpScreenProps) => {
    const { email } = route.params || { email: '' };
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [touched, setTouched] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const dispatch = useDispatch();
    const { isLoading, verifyOtpResponse } = useSelector((state: RootState) => state.AuthReducer);

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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={normalize(24)} color="#111827" />
                </Pressable>

                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <Icon name="shield" size={normalize(28)} color={Colorpath.Primary} />
                        </View>
                        <Text style={styles.brandTitle}>OTP Verification</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 6-digit verification code to your email address:
                        </Text>
                        <Text style={styles.emailText}>{email}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.otpInputWrapper}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput, 
                                        touched && !digit ? styles.otpInputError : null,
                                        digit ? styles.otpInputFilled : null
                                    ]}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
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

                        <Pressable 
                            style={[styles.submitButton, !isOtpComplete() && styles.submitButtonDisabled]} 
                            onPress={handleVerify}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Verify OTP</Text>
                            )}
                        </Pressable>
                    </View>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {resendTimer > 0 ? (
                            <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                        ) : (
                            <Pressable onPress={handleResendOTP}>
                                <Text style={styles.resendButtonText}>Resend OTP</Text>
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
        backgroundColor: '#FAFBFF',
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
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    brandTitle: {
        fontSize: normalize(28),
        fontWeight: '800',
        color: Colorpath.Primary,
        marginBottom: verticalScale(12),
    },
    subtitle: {
        fontSize: normalize(15),
        color: '#6B7280',
        lineHeight: normalize(22),
    },
    emailText: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: Colorpath.Primary,
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
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
    },
    otpInputFilled: {
        borderColor: Colorpath.Primary,
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
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colorpath.Primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        color: '#6B7280',
        fontSize: normalize(14),
    },
    timerText: {
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: normalize(14),
    },
    resendButtonText: {
        color: Colorpath.Primary,
        fontWeight: '700',
        fontSize: normalize(14),
    },
});

export default OtpScreen;
