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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';

type ForgotPasswordScreenProps = StackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
    const [email, setEmail] = useState('');

    const dispatch = useDispatch();
    const { isLoading, forgotPasswordResponse } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (forgotPasswordResponse?.success || forgotPasswordResponse?.message) {
            navigation.navigate('ChangePassword');
        }
    }, [forgotPasswordResponse]);

    const handleSendOTP = () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Please enter your email' });
            return;
        }
        dispatch(forgotPasswordRequest({ email }));
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
                            <Icon name="key" size={normalize(28)} color={Colorpath.Primary} />
                        </View>
                        <Text style={styles.brandTitle}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry! It occurs. Please enter the email address linked with your account.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Icon name="mail" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <Pressable 
                            style={styles.submitButton} 
                            onPress={handleSendOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Send OTP</Text>
                            )}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.footerLink}>
                    <Text style={styles.footerText}>Remember Password? </Text>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.footerTextBold}>Login</Text>
                    </Pressable>
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
    formContainer: {
        marginBottom: verticalScale(30),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: verticalScale(55),
        marginBottom: verticalScale(30),
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
        color: '#6B7280',
        fontSize: normalize(14),
    },
    footerTextBold: {
        color: Colorpath.Primary,
        fontWeight: '700',
        fontSize: normalize(14),
    },
});

export default ForgotPasswordScreen;
