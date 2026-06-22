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
    Modal,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import constants from '../../../Utils/Helpers/constants';
import { useIsFocused } from '@react-navigation/native';
import { useTheme, useTranslation } from '../../../Themes/hooks';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;
type LoginErrors = {
    email?: string;
    password?: string;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const isFocused = useIsFocused();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberPassword, setRememberPassword] = useState(false);
    const [secureText, setSecureText] = useState(true);
    const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
        email: false,
        password: false,
    });
    
    // Focus states for futuristic UI feel
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const { colors, theme } = useTheme();
    const { t } = useTranslation();

    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dispatch = useDispatch();
    const { isLoading, loginResponse } = useSelector((state: RootState) => state.AuthReducer);

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
        if (loginResponse && (loginResponse.accessToken || loginResponse.token || loginResponse.success || loginResponse.message)) {
            const handleSuccess = async () => {
                try {
                    if (rememberPassword) {
                        await AsyncStorage.setMany({
                            [constants.REMEMBER_PASSWORD]: 'true',
                            [constants.SAVED_EMAIL]: email.trim(),
                            [constants.SAVED_PASSWORD]: password,
                        });
                    } else {
                        await AsyncStorage.removeMany([
                            constants.SAVED_EMAIL,
                            constants.SAVED_PASSWORD,
                        ]);
                        await AsyncStorage.setItem(constants.REMEMBER_PASSWORD, 'false');
                    }
                } catch (error) {
                    console.log('Error saving remembered login', error);
                }
            };
            handleSuccess();
        }
    }, [loginResponse, rememberPassword, email, password]);

    useEffect(() => {
        let isMounted = true;

        const loadRememberedLogin = async () => {
            try {
                const rememberValue = await AsyncStorage.getItem(constants.REMEMBER_PASSWORD);
                const savedEmail = await AsyncStorage.getItem(constants.SAVED_EMAIL);
                const savedPassword = await AsyncStorage.getItem(constants.SAVED_PASSWORD);

                if (!isMounted) {
                    return;
                }

                if (rememberValue === 'true' && savedEmail && savedPassword) {
                    setEmail(savedEmail);
                    setPassword(savedPassword);
                    setRememberPassword(true);
                } else {
                    setEmail('');
                    setPassword('');
                    setRememberPassword(false);
                }
            } catch (error) {
                if (isMounted) {
                    setEmail('');
                    setPassword('');
                    setRememberPassword(false);
                }
            }
        };

        loadRememberedLogin();

        return () => {
            isMounted = false;
        };
    }, [isFocused]);

    const getErrors = (): LoginErrors => {
        const errors: LoginErrors = {};

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(email.trim())) {
            errors.email = 'Enter valid email address';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 7) {
            errors.password = 'Password must be at least 7 characters';
        }

        return errors;
    };

    const errors = getErrors();

    const updateField = (field: 'email' | 'password', value: string) => {
        if (field === 'email') {
            setTouched((prev) => ({ ...prev, email: true }));
            setEmail(value);
            return;
        }
        setTouched((prev) => ({ ...prev, password: true }));
        setPassword(value);
    };

    const handleLogin = async () => {
        const nextErrors = getErrors();
        if (Object.keys(nextErrors).length > 0) {
            setTouched({ email: true, password: true });
            return;
        }

        const deviceName = Platform.OS === 'ios' ? 'iOS Device' : 'Android Device';
        const deviceId = Platform.OS === 'ios' ? 'ios-device' : 'android-device';

        dispatch(loginRequest({ 
            email: email.trim(), 
            password, 
            rememberMe: rememberPassword,
            deviceId,
            deviceName,
            deviceType: 'mobile' 
        }));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Background} barStyle={statusBarStyle} />

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.headerContainer}>
                    <Text style={[styles.brandTitle, { color: colors.text }]}>{t('login.welcome')}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('login.subtitle')}</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.fieldWrapper}>
                        <View style={[
                            styles.inputContainer,
                            { 
                                backgroundColor: colors.cardBackground, 
                                borderColor: emailFocused ? colors.accent : (touched.email && errors.email ? '#EF4444' : colors.border),
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
                                placeholder={t('login.email')}
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={(value) => updateField('email', value)}
                                onFocus={() => {
                                    setEmailFocused(true);
                                    setTouched((prev) => ({ ...prev, email: true }));
                                }}
                                onBlur={() => {
                                    setEmailFocused(false);
                                    setTouched((prev) => ({ ...prev, email: true }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                        {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                        <View style={[
                            styles.inputContainer,
                            { 
                                backgroundColor: colors.cardBackground, 
                                borderColor: passwordFocused ? colors.accent : (touched.password && errors.password ? '#EF4444' : colors.border),
                                shadowColor: colors.accent,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: passwordFocused && isDarkTheme ? 0.35 : 0,
                                shadowRadius: 8,
                                elevation: passwordFocused ? 2 : 0,
                            }
                        ]}>
                            <Icon name="lock" size={normalize(18)} color={passwordFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder={t('login.password')}
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry={secureText}
                                value={password}
                                onChangeText={(value) => updateField('password', value)}
                                onFocus={() => {
                                    setPasswordFocused(true);
                                    setTouched((prev) => ({ ...prev, password: true }));
                                }}
                                onBlur={() => {
                                    setPasswordFocused(false);
                                    setTouched((prev) => ({ ...prev, password: true }));
                                }}
                                editable={!isLoading}
                            />
                            <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon} disabled={isLoading}>
                                <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    <View style={styles.helperRow}>
                        <Pressable style={styles.rememberRow} onPress={() => setRememberPassword((prev) => !prev)} disabled={isLoading}>
                            <Icon
                                name={rememberPassword ? 'check-square' : 'square'}
                                size={normalize(18)}
                                color={rememberPassword ? colors.accent : colors.textSecondary}
                            />
                            <Text style={[styles.rememberText, { color: colors.text }]}>{t('login.remember')}</Text>
                        </Pressable>

                        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer} disabled={isLoading}>
                            <Text style={[styles.forgotPasswordText, { color: colors.Secondary }]}>{t('login.forgot')}</Text>
                        </Pressable>
                    </View>

                    <AnimatedPressable 
                        style={[
                            styles.loginButton, 
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
                        onPress={handleLogin} 
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>{t('login.signin')}</Text>
                    </AnimatedPressable>
                </View>

                <Pressable onPress={() => navigation.navigate('Register')} style={styles.footerLink} disabled={isLoading}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        {t('login.no_account')}{' '}
                        <Text style={[styles.footerTextBold, { color: colors.Secondary }]}>{t('login.register')}</Text>
                    </Text>
                </Pressable>
            </KeyboardAvoidingView>

            <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
                <View style={[styles.loadingOverlay, { backgroundColor: isDarkTheme ? 'rgba(5, 5, 8, 0.85)' : 'rgba(250, 251, 255, 0.82)' }]}>
                    <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>{t('login.signing_in')}</Text>
                    </View>
                </View>
            </Modal>
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
        paddingTop: verticalScale(80),
        paddingBottom: verticalScale(20),
    },
    headerContainer: {
        marginBottom: verticalScale(30),
    },
    brandTitle: {
        fontSize: normalize(28),
        fontWeight: '800',
        lineHeight: normalize(36),
        marginBottom: verticalScale(10),
    },
    subtitle: {
        fontSize: normalize(14),
    },
    formContainer: {
    },
    fieldWrapper: {
        marginBottom: verticalScale(16),
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
    eyeIcon: {
        padding: normalize(8),
    },
    errorText: {
        color: '#EF4444',
        fontSize: normalize(12),
        marginTop: verticalScale(6),
        marginLeft: normalize(4),
    },
    helperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    rememberText: {
        fontSize: normalize(13),
        fontWeight: '500',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: normalize(13),
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '700',
    },
    footerLink: {
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    footerText: {
        fontSize: normalize(14),
    },
    footerTextBold: {
        fontWeight: '700',
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingCard: {
        minWidth: normalize(180),
        borderRadius: normalize(16),
        paddingHorizontal: normalize(24),
        paddingVertical: verticalScale(22),
        alignItems: 'center',
        borderWidth: 1,
    },
    loadingText: {
        marginTop: verticalScale(12),
        fontSize: normalize(14),
        fontWeight: '600',
    },
});

export default LoginScreen;
