import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import constants from '../../../Utils/Helpers/constants';
import { useIsFocused } from '@react-navigation/native';

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dispatch = useDispatch();
    const { isLoading, loginResponse } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (loginResponse && (loginResponse.accessToken || loginResponse.token || loginResponse.success || loginResponse.message)) {
            const handleSuccess = async () => {
                try {
                    if (rememberPassword) {
                        await AsyncStorage.multiSet([
                            [constants.REMEMBER_PASSWORD, 'true'],
                            [constants.SAVED_EMAIL, email.trim()],
                            [constants.SAVED_PASSWORD, password],
                        ]);
                    } else {
                        await AsyncStorage.multiRemove([
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

        dispatch(loginRequest({ email: email.trim(), password, deviceType: 'mobile' }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.brandTitle}>Welcome{'\n'}Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue your preparation.</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.fieldWrapper}>
                        <View style={[styles.inputContainer, touched.email && errors.email ? styles.inputContainerError : null]}>
                            <Icon name="mail" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={(value) => updateField('email', value)}
                                onFocus={() => setTouched((prev) => ({ ...prev, email: true }))}
                                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                        {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                        <View style={[styles.inputContainer, touched.password && errors.password ? styles.inputContainerError : null]}>
                            <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secureText}
                                value={password}
                                onChangeText={(value) => updateField('password', value)}
                                onFocus={() => setTouched((prev) => ({ ...prev, password: true }))}
                                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                                editable={!isLoading}
                            />
                            <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon} disabled={isLoading}>
                                <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                            </Pressable>
                        </View>
                        {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    <View style={styles.helperRow}>
                        <Pressable style={styles.rememberRow} onPress={() => setRememberPassword((prev) => !prev)} disabled={isLoading}>
                            <Icon
                                name={rememberPassword ? 'check-square' : 'square'}
                                size={normalize(18)}
                                color={rememberPassword ? Colorpath.Primary : '#9CA3AF'}
                            />
                            <Text style={styles.rememberText}>Remember the password</Text>
                        </Pressable>

                        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer} disabled={isLoading}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </Pressable>
                    </View>

                    <Pressable style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </Pressable>
                </View>

                <Pressable onPress={() => navigation.navigate('Register')} style={styles.footerLink} disabled={isLoading}>
                    <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerTextBold}>Register</Text></Text>
                </Pressable>
            </KeyboardAvoidingView>

            <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={Colorpath.Primary} />
                        <Text style={styles.loadingText}>Signing you in...</Text>
                    </View>
                </View>
            </Modal>
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
        paddingTop: verticalScale(80),
        paddingBottom: verticalScale(20),
    },
    headerContainer: {
        marginBottom: verticalScale(30),
    },
    brandTitle: {
        fontSize: normalize(28),
        fontWeight: '800',
        color: Colorpath.Primary,
        lineHeight: normalize(36),
        marginBottom: verticalScale(10),
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
    },
    formContainer: {
    },
    fieldWrapper: {
        marginBottom: verticalScale(16),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: verticalScale(55),
        paddingHorizontal: normalize(16),
    },
    inputContainerError: {
        borderColor: '#EF4444',
    },
    inputIcon: {
        marginRight: normalize(12),
    },
    input: {
        flex: 1,
        color: '#111827',
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
        color: '#374151',
        fontSize: normalize(13),
        fontWeight: '500',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        color: Colorpath.Secondary,
        fontSize: normalize(13),
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(30),
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
        color: '#6B7280',
        fontSize: normalize(14),
    },
    footerTextBold: {
        color: Colorpath.Primary,
        fontWeight: '700',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(250, 251, 255, 0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingCard: {
        minWidth: normalize(180),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(16),
        paddingHorizontal: normalize(24),
        paddingVertical: verticalScale(22),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loadingText: {
        marginTop: verticalScale(12),
        color: '#111827',
        fontSize: normalize(14),
        fontWeight: '600',
    },
});

export default LoginScreen;
