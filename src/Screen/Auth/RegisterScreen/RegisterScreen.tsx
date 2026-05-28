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
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';

type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [gender, setGender] = useState<'Female' | 'Male' | null>('Female');

    const dispatch = useDispatch();
    const { isLoading, token } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (token) {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
    }, [token, navigation]);

    const handleRegister = () => {
        if (!firstName || !lastName || !email || !password) {
            Toast.show({ type: 'error', text1: 'Please fill all required fields' });
            return;
        }
        if (password.length < 8) {
            Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
            return;
        }
        dispatch(signupRequest({ firstName, lastName, email, password }));
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
                            <View style={[styles.inputContainer, styles.halfInput]}>
                                <Icon name="user" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="First name"
                                    placeholderTextColor="#9CA3AF"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfInput]}>
                                <Icon name="user" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last name"
                                    placeholderTextColor="#9CA3AF"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="mail" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secureText}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                                <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text style={styles.genderLabel}>Gender</Text>
                        <View style={styles.genderContainer}>
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => setGender('Female')}
                            >
                                <View style={styles.radioCircle}>
                                    {gender === 'Female' && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.radioText}>Female</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.radioOption} 
                                onPress={() => setGender('Male')}
                            >
                                <View style={styles.radioCircle}>
                                    {gender === 'Male' && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.radioText}>Male</Text>
                            </Pressable>
                        </View>

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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: verticalScale(55),
        marginBottom: verticalScale(16),
        paddingHorizontal: normalize(16),
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
        marginBottom: verticalScale(40),
        gap: normalize(30),
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
    createButton: {
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
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
