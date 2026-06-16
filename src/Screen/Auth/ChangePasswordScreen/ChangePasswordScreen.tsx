import React, { useEffect, useState } from 'react';
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
import { changePasswordRequest, changePasswordSuccess, resetPasswordRequest, resetPasswordSuccess } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';

type ChangePasswordScreenProps = StackScreenProps<RootStackParamList, 'ChangePassword'>;
type ChangePasswordErrors = {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/;

const ChangePasswordScreen = ({ route, navigation }: ChangePasswordScreenProps) => {
    const resetToken = route.params?.token;
    const isResetMode = !!resetToken;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureCurrent, setSecureCurrent] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);
    const [touched, setTouched] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const dispatch = useDispatch();
    const { isLoading, changePasswordResponse, resetPasswordResponse, token } = useSelector((state: RootState) => state.AuthReducer);

    // Reset Redux state on mount
    useEffect(() => {
        dispatch(changePasswordSuccess(null));
        dispatch(resetPasswordSuccess(null));
    }, [dispatch]);

    useEffect(() => {
        if (changePasswordResponse?.success || changePasswordResponse?.message) {
            if (token) {
                (navigation as any).navigate('Home', { screen: 'Profile' });
            } else {
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        }
    }, [changePasswordResponse, navigation, token]);

    useEffect(() => {
        if (resetPasswordResponse?.success || resetPasswordResponse?.message) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [resetPasswordResponse, navigation]);

    const getErrors = (): ChangePasswordErrors => {
        const errors: ChangePasswordErrors = {};

        if (!isResetMode) {
            if (!currentPassword) {
                errors.currentPassword = 'Current password is required';
            } else if (currentPassword.length < 7) {
                errors.currentPassword = 'Current password must be at least 7 characters';
            }
        }

        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (newPassword.length < 7) {
            errors.newPassword = 'New password must be at least 7 characters';
        } else if (!passwordRegex.test(newPassword)) {
            errors.newPassword = 'Password must include uppercase, lowercase, and number';
        } else if (!isResetMode && newPassword === currentPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Confirm password is required';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const errors = getErrors();

    const updateTouched = (field: keyof typeof touched) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleChangePassword = async () => {
        const nextErrors = getErrors();
        if (Object.keys(nextErrors).length > 0) {
            setTouched({
                currentPassword: true,
                newPassword: true,
                confirmPassword: true,
            });
            return;
        }

        if (isResetMode) {
            dispatch(resetPasswordRequest({
                token: resetToken,
                newPassword,
            }));
        } else {
            dispatch(changePasswordRequest({
                oldPassword: currentPassword,
                newPassword,
            }));
        }
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
                        <Text style={styles.brandTitle}>{isResetMode ? 'Reset Password' : 'Change Password'}</Text>
                        <Text style={styles.subtitle}>
                            {isResetMode
                                ? 'Create a secure new password for your account.'
                                : 'Create a new password that is secure and easy to remember.'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {!isResetMode && (
                            <View style={styles.fieldWrapper}>
                                <Text style={styles.inputLabel}>Current Password</Text>
                                <View style={[styles.inputContainer, touched.currentPassword && errors.currentPassword ? styles.inputContainerError : null]}>
                                    <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter current password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={secureCurrent}
                                        value={currentPassword}
                                        onChangeText={(value) => {
                                            updateTouched('currentPassword');
                                            setCurrentPassword(value);
                                        }}
                                        onFocus={() => updateTouched('currentPassword')}
                                        onBlur={() => updateTouched('currentPassword')}
                                    />
                                    <Pressable onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeIcon}>
                                        <Icon name={secureCurrent ? 'eye-off' : 'eye'} size={normalize(18)} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                                {touched.currentPassword && errors.currentPassword ? <Text style={styles.errorText}>{errors.currentPassword}</Text> : null}
                            </View>
                        )}

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={[styles.inputContainer, touched.newPassword && errors.newPassword ? styles.inputContainerError : null]}>
                                <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={secureNew}
                                    value={newPassword}
                                    onChangeText={(value) => {
                                        updateTouched('newPassword');
                                        setNewPassword(value);
                                    }}
                                    onFocus={() => updateTouched('newPassword')}
                                    onBlur={() => updateTouched('newPassword')}
                                />
                                <Pressable onPress={() => setSecureNew(!secureNew)} style={styles.eyeIcon}>
                                    <Icon name={secureNew ? 'eye-off' : 'eye'} size={normalize(18)} color="#9CA3AF" />
                                </Pressable>
                            </View>
                            {touched.newPassword && errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <View style={[styles.inputContainer, touched.confirmPassword && errors.confirmPassword ? styles.inputContainerError : null]}>
                                <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={secureConfirm}
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        updateTouched('confirmPassword');
                                        setConfirmPassword(value);
                                    }}
                                    onFocus={() => updateTouched('confirmPassword')}
                                    onBlur={() => updateTouched('confirmPassword')}
                                />
                                <Pressable onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                                    <Icon name={secureConfirm ? 'eye-off' : 'eye'} size={normalize(18)} color="#9CA3AF" />
                                </Pressable>
                            </View>
                            {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                        </View>

                        <Pressable
                            style={styles.submitButton}
                            onPress={handleChangePassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>{isResetMode ? 'Reset Password' : 'Update Password'}</Text>
                            )}
                        </Pressable>
                    </View>
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
        marginBottom: verticalScale(30),
        alignSelf: 'flex-start',
    },
    headerContainer: {
        marginBottom: verticalScale(40),
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
    fieldWrapper: {
        marginBottom: verticalScale(16),
    },
    inputLabel: {
        fontSize: normalize(14),
        color: '#374151',
        fontWeight: '600',
        marginBottom: verticalScale(8),
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
    submitButton: {
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
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
});

export default ChangePasswordScreen;
