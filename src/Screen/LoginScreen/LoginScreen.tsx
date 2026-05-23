import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);

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
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={secureText}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                            <Icon name={secureText ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>

                    <Pressable style={styles.loginButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </Pressable>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Or continue with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <Pressable style={styles.socialButton}>
                            <FontAwesome5 name="google" size={normalize(18)} color="#EA4335" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </Pressable>
                        <Pressable style={styles.socialButton}>
                            <FontAwesome5 name="apple" size={normalize(20)} color="#000000" />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </Pressable>
                    </View>
                </View>

                <Pressable onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
                    <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerTextBold}>Register</Text></Text>
                </Pressable>
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
        justifyContent: 'space-between',
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(40),
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: verticalScale(24),
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        color: '#6B7280',
        paddingHorizontal: normalize(16),
        fontSize: normalize(13),
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: normalize(16),
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(50),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    socialButtonText: {
        color: '#374151',
        fontSize: normalize(14),
        fontWeight: '600',
        marginLeft: normalize(10),
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

export default LoginScreen;
