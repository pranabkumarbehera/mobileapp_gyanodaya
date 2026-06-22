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
    ScrollView,
    ActivityIndicator,
    Modal,
    Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signupRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { useTheme } from '../../../Themes/hooks';

type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;
type RegisterErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    gender?: string;
    acceptedTerms?: string;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const { colors, theme } = useTheme();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    // Focus states for dynamic borders
    const [firstNameFocused, setFirstNameFocused] = useState(false);
    const [lastNameFocused, setLastNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

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
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [gender, setGender] = useState<'Female' | 'Male' | null>('Female');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        password: false,
        gender: false,
        acceptedTerms: false,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dispatch = useDispatch();
    const { isLoading, signupResponse } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (
            signupResponse?.data?.id ||
            signupResponse?.data?._id ||
            signupResponse?.success === true ||
            signupResponse?.message
        ) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [signupResponse, navigation]);

    const getErrors = (): RegisterErrors => {
        const errors: RegisterErrors = {};

        if (!firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(email.trim())) {
            errors.email = 'Enter valid email address';
        }

        if (!phone) {
            errors.phone = 'Phone number is required';
        } else if (phone.length !== 10) {
            errors.phone = 'Phone number must be 10 digits';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 7) {
            errors.password = 'Password must be at least 7 characters';
        }

        if (!gender) {
            errors.gender = 'Gender is required';
        }

        if (!acceptedTerms) {
            errors.acceptedTerms = 'Please accept Terms & Condition and Privacy & Policy';
        }

        return errors;
    };

    const errors = getErrors();

    const updateTouched = (field: keyof typeof touched) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleRegister = () => {
        const nextErrors = getErrors();
        if (Object.keys(nextErrors).length > 0) {
            setTouched({
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                password: true,
                gender: true,
                acceptedTerms: true,
            });
            return;
        }
        dispatch(signupRequest({
            email: email.trim(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender,
            phone,
        }));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Background} barStyle={statusBarStyle} />

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={normalize(24)} color={colors.text} />
                    </Pressable>

                    <View style={styles.headerContainer}>
                        <Text style={[styles.brandTitle, { color: colors.Primary }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your success is our motivation.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        
                        <View style={styles.row}>
                            <View style={[styles.fieldWrapper, styles.halfInput]}>
                                <View style={[
                                    styles.inputContainer, 
                                    { 
                                        backgroundColor: colors.cardBackground, 
                                        borderColor: firstNameFocused ? colors.accent : (touched.firstName && errors.firstName ? '#EF4444' : colors.border),
                                        shadowColor: colors.accent,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: firstNameFocused && isDarkTheme ? 0.35 : 0,
                                        shadowRadius: 8,
                                        elevation: firstNameFocused ? 2 : 0,
                                    }
                                ]}>
                                    <Icon name="user" size={normalize(18)} color={firstNameFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="First name"
                                        placeholderTextColor={colors.textSecondary}
                                        value={firstName}
                                        onChangeText={(value) => {
                                            updateTouched('firstName');
                                            setFirstName(value);
                                        }}
                                        onFocus={() => {
                                            updateTouched('firstName');
                                            setFirstNameFocused(true);
                                        }}
                                        onBlur={() => {
                                            updateTouched('firstName');
                                            setFirstNameFocused(false);
                                        }}
                                        editable={!isLoading}
                                    />
                                </View>
                                {touched.firstName && errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                            </View>
                            <View style={[styles.fieldWrapper, styles.halfInput]}>
                                <View style={[
                                    styles.inputContainer, 
                                    { 
                                        backgroundColor: colors.cardBackground, 
                                        borderColor: lastNameFocused ? colors.accent : (touched.lastName && errors.lastName ? '#EF4444' : colors.border),
                                        shadowColor: colors.accent,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: lastNameFocused && isDarkTheme ? 0.35 : 0,
                                        shadowRadius: 8,
                                        elevation: lastNameFocused ? 2 : 0,
                                    }
                                ]}>
                                    <Icon name="user" size={normalize(18)} color={lastNameFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Last name"
                                        placeholderTextColor={colors.textSecondary}
                                        value={lastName}
                                        onChangeText={(value) => {
                                            updateTouched('lastName');
                                            setLastName(value);
                                        }}
                                        onFocus={() => {
                                            updateTouched('lastName');
                                            setLastNameFocused(true);
                                        }}
                                        onBlur={() => {
                                            updateTouched('lastName');
                                            setLastNameFocused(false);
                                        }}
                                        editable={!isLoading}
                                    />
                                </View>
                                {touched.lastName && errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                            </View>
                        </View>

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
                                    placeholder="Email address"
                                    placeholderTextColor={colors.textSecondary}
                                    value={email}
                                    onChangeText={(value) => {
                                        updateTouched('email');
                                        setEmail(value);
                                    }}
                                    onFocus={() => {
                                        updateTouched('email');
                                        setEmailFocused(true);
                                    }}
                                    onBlur={() => {
                                        updateTouched('email');
                                        setEmailFocused(false);
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
                                    borderColor: phoneFocused ? colors.accent : (touched.phone && errors.phone ? '#EF4444' : colors.border),
                                    shadowColor: colors.accent,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: phoneFocused && isDarkTheme ? 0.35 : 0,
                                    shadowRadius: 8,
                                    elevation: phoneFocused ? 2 : 0,
                                }
                            ]}>
                                <Icon name="phone" size={normalize(18)} color={phoneFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Phone number"
                                    placeholderTextColor={colors.textSecondary}
                                    value={phone}
                                    onChangeText={(text) => {
                                        updateTouched('phone');
                                        setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
                                    }}
                                    onFocus={() => {
                                        updateTouched('phone');
                                        setPhoneFocused(true);
                                    }}
                                    onBlur={() => {
                                        updateTouched('phone');
                                        setPhoneFocused(false);
                                    }}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    editable={!isLoading}
                                />
                            </View>
                            {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
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
                                    placeholder="Create password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={secureText}
                                    value={password}
                                    onChangeText={(value) => {
                                        updateTouched('password');
                                        setPassword(value);
                                    }}
                                    onFocus={() => {
                                        updateTouched('password');
                                        setPasswordFocused(true);
                                    }}
                                    onBlur={() => {
                                        updateTouched('password');
                                        setPasswordFocused(false);
                                    }}
                                    editable={!isLoading}
                                />
                                <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon} disabled={isLoading}>
                                    <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color={colors.textSecondary} />
                                </Pressable>
                            </View>
                            {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                        </View>

                        <Text style={[styles.genderLabel, { color: colors.text }]}>Gender</Text>
                        <View style={[styles.genderContainer, touched.gender && errors.gender ? styles.genderContainerError : null]}>
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => {
                                    setGender('Female');
                                    updateTouched('gender');
                                }}
                                disabled={isLoading}
                            >
                                <View style={[styles.radioCircle, { borderColor: colors.Primary }]}>
                                    {gender === 'Female' && <View style={[styles.radioInnerCircle, { backgroundColor: colors.Primary }]} />}
                                </View>
                                <Text style={[styles.radioText, { color: colors.text }]}>Female</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => {
                                    setGender('Male');
                                    updateTouched('gender');
                                }}
                                disabled={isLoading}
                            >
                                <View style={[styles.radioCircle, { borderColor: colors.Primary }]}>
                                    {gender === 'Male' && <View style={[styles.radioInnerCircle, { backgroundColor: colors.Primary }]} />}
                                </View>
                                <Text style={[styles.radioText, { color: colors.text }]}>Male</Text>
                            </Pressable>
                        </View>
                        {touched.gender && errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

                        <Pressable
                            style={styles.checkboxRow}
                            onPress={() => {
                                setAcceptedTerms((prev) => !prev);
                                updateTouched('acceptedTerms');
                            }}
                            disabled={isLoading}
                        >
                            <Icon
                                name={acceptedTerms ? 'check-square' : 'square'}
                                size={normalize(20)}
                                color={acceptedTerms ? colors.Primary : colors.textSecondary}
                                style={styles.checkboxIcon}
                            />
                            <Text style={[styles.checkboxText, { color: colors.text }]}>
                                I agree with GYANODAYA{' '}
                                <Text style={styles.termsLinkText} onPress={!isLoading ? () => navigation.navigate('TermsConditions') : undefined}>
                                    Terms & Condition
                                </Text>
                                {' '}and{' '}
                                <Text style={styles.privacyLinkText} onPress={!isLoading ? () => navigation.navigate('PrivacyPolicy') : undefined}>
                                    Privacy & Policy
                                </Text>
                            </Text>
                        </Pressable>
                        {touched.acceptedTerms && errors.acceptedTerms ? <Text style={styles.errorText}>{errors.acceptedTerms}</Text> : null}

                        <AnimatedPressable 
                            style={[
                                styles.createButton, 
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
                            onPress={handleRegister} 
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isLoading}
                        >
                            <Text style={styles.createButtonText}>Create Account</Text>
                        </AnimatedPressable>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
                <View style={[styles.loadingOverlay, { backgroundColor: isDarkTheme ? 'rgba(5, 5, 8, 0.85)' : 'rgba(250, 251, 255, 0.82)' }]} pointerEvents="auto">
                    <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <ActivityIndicator size="large" color={colors.Primary} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Creating your account...</Text>
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
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(20),
    },
    backButton: {
        marginBottom: verticalScale(20),
        alignSelf: 'flex-start',
    },
    headerContainer: {
        marginBottom: verticalScale(30),
    },
    brandTitle: {
        fontSize: normalize(28),
        fontWeight: '800',
        lineHeight: normalize(36),
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: normalize(14),
    },
    formContainer: {
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: normalize(12),
    },
    halfInput: {
        flex: 1,
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
    genderLabel: {
        fontSize: normalize(14),
        color: '#374151',
        fontWeight: '600',
        marginBottom: verticalScale(12),
        marginTop: verticalScale(8),
    },
    genderContainer: {
        flexDirection: 'row',
        gap: normalize(30),
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: 'transparent',
        paddingVertical: verticalScale(4),
    },
    genderContainerError: {
        borderColor: '#EF4444',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        height: normalize(20),
        width: normalize(20),
        borderRadius: normalize(10),
        borderWidth: 2,
        borderColor: '#092948',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(10),
    },
    radioInnerCircle: {
        height: normalize(10),
        width: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#092948',
    },
    radioText: {
        fontSize: normalize(15),
        color: '#374151',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(18),
    },
    checkboxIcon: {
        marginRight: normalize(12),
    },
    checkboxText: {
        flex: 1,
        fontSize: normalize(13),
        color: '#4B5563',
        lineHeight: normalize(20),
    },
    termsLinkText: {
        color: '#F59E0B',
        fontWeight: '700',
    },
    privacyLinkText: {
        color: '#F59E0B',
        fontWeight: '700',
    },
    errorText: {
        color: '#EF4444',
        fontSize: normalize(12),
        marginTop: verticalScale(6),
        marginLeft: normalize(4),
    },
    createButton: {
        backgroundColor: '#092948',
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
        marginBottom: verticalScale(30),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    createButtonText: {
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
        color: '#092948',
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
        minWidth: normalize(210),
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

export default RegisterScreen;
