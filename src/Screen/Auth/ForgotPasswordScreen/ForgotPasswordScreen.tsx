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
    Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordRequest, forgotPasswordSuccess } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { useTheme } from '../../../Themes/hooks';

type ForgotPasswordScreenProps = StackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    const { colors, theme } = useTheme();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dispatch = useDispatch();
    const { isLoading, forgotPasswordResponse } = useSelector((state: RootState) => state.AuthReducer);

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

    useEffect(() => {
        dispatch(forgotPasswordSuccess(null));
    }, [dispatch]);

    useEffect(() => {
        if (forgotPasswordResponse?.success || forgotPasswordResponse?.message) {
            navigation.navigate('Otp', { email: email.trim() });
        }
    }, [forgotPasswordResponse, navigation]);

    const getEmailError = () => {
        if (!email.trim()) return 'Email is required';
        if (!emailRegex.test(email.trim())) return 'Enter valid email address';
        return '';
    };

    const emailError = getEmailError();

    const handleSendOTP = () => {
        if (emailError) {
            setTouched(true);
            return;
        }
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
                        <View style={[styles.iconContainer, { backgroundColor: colors.tagCyan }]}>
                            <Icon name="key" size={normalize(28)} color={colors.tagCyanText} />
                        </View>
                        <Text style={[styles.brandTitle, { color: colors.text }]}>Forgot Password?</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Don't worry! It occurs. Please enter the email address linked with your account.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.fieldWrapper}>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: emailFocused ? colors.accent : (touched && emailError ? '#EF4444' : colors.border),
                                    shadowColor: colors.accent,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: emailFocused && isDarkTheme ? 0.35 : 0,
                                    shadowRadius: 8,
                                    elevation: emailFocused ? 2 : 0,
                                }
                            ]}>
                                <Icon name="mail" size={normalize(18)} color={emailFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    value={email}
                                    onChangeText={(value) => { setTouched(true); setEmail(value); }}
                                    onFocus={() => { setEmailFocused(true); setTouched(true); }}
                                    onBlur={() => { setEmailFocused(false); setTouched(true); }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {touched && emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        </View>

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
                                }
                            ]}
                            onPress={handleSendOTP}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Send OTP</Text>
                            )}
                        </AnimatedPressable>
                    </View>
                </View>

                <View style={styles.footerLink}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Remember Password? </Text>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.footerTextBold, { color: colors.Secondary }]}>Login</Text>
                    </Pressable>
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
    formContainer: {
        marginBottom: verticalScale(30),
    },
    fieldWrapper: {
        marginBottom: verticalScale(30),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(12),
        borderWidth: 1,
        height: verticalScale(55),
        paddingHorizontal: normalize(16),
    },
    inputIcon: {
        marginRight: normalize(12),
    },
    input: {
        flex: 1,
        fontSize: normalize(15),
    },
    errorText: {
        color: '#EF4444',
        fontSize: normalize(12),
        marginTop: verticalScale(6),
        marginLeft: normalize(4),
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
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '700',
    },
    footerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    footerText: {
        fontSize: normalize(14),
    },
    footerTextBold: {
        fontWeight: '700',
        fontSize: normalize(14),
    },
});

export default ForgotPasswordScreen;
