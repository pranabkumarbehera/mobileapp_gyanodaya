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
    ScrollView,
    ActivityIndicator,
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

type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;
type RegisterErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    gender?: string;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [gender, setGender] = useState<'Female' | 'Male' | null>('Female');
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        password: false,
        gender: false,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dispatch = useDispatch();
    const { isLoading, token, signupResponse } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (token) {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            return;
        }

        if (signupResponse?.data?.id) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [token, signupResponse, navigation]);

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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={normalize(24)} color="#111827" />
                    </Pressable>

                    <View style={styles.headerContainer}>
                        <Text style={styles.brandTitle}>Create Account</Text>
                        <Text style={styles.subtitle}>Your success is our motivation.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        
                        <View style={styles.row}>
                            <View style={[styles.fieldWrapper, styles.halfInput]}>
                                <View style={[styles.inputContainer, touched.firstName && errors.firstName ? styles.inputContainerError : null]}>
                                    <Icon name="user" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="First name"
                                        placeholderTextColor="#9CA3AF"
                                        value={firstName}
                                        onChangeText={(value) => {
                                            updateTouched('firstName');
                                            setFirstName(value);
                                        }}
                                        onFocus={() => updateTouched('firstName')}
                                        onBlur={() => updateTouched('firstName')}
                                    />
                                </View>
                                {touched.firstName && errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                            </View>
                            <View style={[styles.fieldWrapper, styles.halfInput]}>
                                <View style={[styles.inputContainer, touched.lastName && errors.lastName ? styles.inputContainerError : null]}>
                                    <Icon name="user" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Last name"
                                        placeholderTextColor="#9CA3AF"
                                        value={lastName}
                                        onChangeText={(value) => {
                                            updateTouched('lastName');
                                            setLastName(value);
                                        }}
                                        onFocus={() => updateTouched('lastName')}
                                        onBlur={() => updateTouched('lastName')}
                                    />
                                </View>
                                {touched.lastName && errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <View style={[styles.inputContainer, touched.email && errors.email ? styles.inputContainerError : null]}>
                                <Icon name="mail" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(value) => {
                                        updateTouched('email');
                                        setEmail(value);
                                    }}
                                    onFocus={() => updateTouched('email')}
                                    onBlur={() => updateTouched('email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                        </View>

                        <View style={styles.fieldWrapper}>
                            <View style={[styles.inputContainer, touched.phone && errors.phone ? styles.inputContainerError : null]}>
                                <Icon name="phone" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone number"
                                    placeholderTextColor="#9CA3AF"
                                    value={phone}
                                    onChangeText={(text) => {
                                        updateTouched('phone');
                                        setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
                                    }}
                                    onFocus={() => updateTouched('phone')}
                                    onBlur={() => updateTouched('phone')}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                            {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                        </View>

                        <View style={styles.fieldWrapper}>
                            <View style={[styles.inputContainer, touched.password && errors.password ? styles.inputContainerError : null]}>
                                <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={secureText}
                                    value={password}
                                    onChangeText={(value) => {
                                        updateTouched('password');
                                        setPassword(value);
                                    }}
                                    onFocus={() => updateTouched('password')}
                                    onBlur={() => updateTouched('password')}
                                />
                                <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                                    <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                                </Pressable>
                            </View>
                            {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                        </View>

                        <Text style={styles.genderLabel}>Gender</Text>
                        <View style={[styles.genderContainer, touched.gender && errors.gender ? styles.genderContainerError : null]}>
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => {
                                    setGender('Female');
                                    updateTouched('gender');
                                }}
                            >
                                <View style={styles.radioCircle}>
                                    {gender === 'Female' && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.radioText}>Female</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => {
                                    setGender('Male');
                                    updateTouched('gender');
                                }}
                            >
                                <View style={styles.radioCircle}>
                                    {gender === 'Male' && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.radioText}>Male</Text>
                            </Pressable>
                        </View>
                        {touched.gender && errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

                        <Pressable style={styles.createButton} onPress={handleRegister} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.createButtonText}>Create Account</Text>
                            )}
                        </Pressable>

                    </View>

                    <Pressable onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
                        <Text style={styles.footerText}>Already have an account? <Text style={styles.footerTextBold}>Login</Text></Text>
                    </Pressable>
                    
                </ScrollView>
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
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(20),
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
        color: Colorpath.Primary,
        lineHeight: normalize(36),
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
    },
    formContainer: {
        flex: 1,
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
        borderColor: Colorpath.Primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(10),
    },
    radioInnerCircle: {
        height: normalize(10),
        width: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: Colorpath.Primary,
    },
    radioText: {
        fontSize: normalize(15),
        color: '#374151',
    },
    errorText: {
        color: '#EF4444',
        fontSize: normalize(12),
        marginTop: verticalScale(6),
        marginLeft: normalize(4),
    },
    createButton: {
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
        marginBottom: verticalScale(30),
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
        color: Colorpath.Primary,
        fontWeight: '700',
    },
});

export default RegisterScreen;
