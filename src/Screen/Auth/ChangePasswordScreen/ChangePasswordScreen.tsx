import React, { useEffect, useState, useRef } from 'react';
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
    Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordRequest, changePasswordSuccess, resetPasswordRequest, resetPasswordSuccess } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { useTheme } from '../../../Themes/hooks';

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

    const { colors, theme } = useTheme();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

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

    // Focus states for fields
    const [currentFocused, setCurrentFocused] = useState(false);
    const [newFocused, setNewFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

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
                        <Text style={[styles.brandTitle, { color: colors.Primary }]}>{isResetMode ? 'Reset Password' : 'Change Password'}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {isResetMode
                                ? 'Create a secure new password for your account.'
                                : 'Create a new password that is secure and easy to remember.'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {!isResetMode && (
                            <View style={styles.fieldWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Current Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        borderColor: currentFocused ? colors.accent : (touched.currentPassword && errors.currentPassword ? '#EF4444' : colors.border),
                                        shadowColor: colors.accent,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: currentFocused && isDarkTheme ? 0.35 : 0,
                                        shadowRadius: 8,
                                        elevation: currentFocused ? 2 : 0,
                                    }
                                ]}>
                                    <Icon name="lock" size={normalize(18)} color={currentFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Enter current password"
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={secureCurrent}
                                        value={currentPassword}
                                        onChangeText={(value) => {
                                            updateTouched('currentPassword');
                                            setCurrentPassword(value);
                                        }}
                                        onFocus={() => {
                                            updateTouched('currentPassword');
                                            setCurrentFocused(true);
                                        }}
                                        onBlur={() => {
                                            updateTouched('currentPassword');
                                            setCurrentFocused(false);
                                        }}
                                    />
                                    <Pressable onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeIcon}>
                                        <Icon name={secureCurrent ? 'eye-off' : 'eye'} size={normalize(18)} color={colors.textSecondary} />
                                    </Pressable>
                                </View>
                                {touched.currentPassword && errors.currentPassword ? <Text style={styles.errorText}>{errors.currentPassword}</Text> : null}
                            </View>
                        )}

                        <View style={styles.fieldWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: newFocused ? colors.accent : (touched.newPassword && errors.newPassword ? '#EF4444' : colors.border),
                                    shadowColor: colors.accent,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: newFocused && isDarkTheme ? 0.35 : 0,
                                    shadowRadius: 8,
                                    elevation: newFocused ? 2 : 0,
                                }
                            ]}>
                                <Icon name="lock" size={normalize(18)} color={newFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={secureNew}
                                    value={newPassword}
                                    onChangeText={(value) => {
                                        updateTouched('newPassword');
                                        setNewPassword(value);
                                    }}
                                    onFocus={() => {
                                        updateTouched('newPassword');
                                        setNewFocused(true);
                                    }}
                                    onBlur={() => {
                                        updateTouched('newPassword');
                                        setNewFocused(false);
                                    }}
                                />
                                <Pressable onPress={() => setSecureNew(!secureNew)} style={styles.eyeIcon}>
                                    <Icon name={secureNew ? 'eye-off' : 'eye'} size={normalize(18)} color={colors.textSecondary} />
                                </Pressable>
                            </View>
                            {touched.newPassword && errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm New Password</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: confirmFocused ? colors.accent : (touched.confirmPassword && errors.confirmPassword ? '#EF4444' : colors.border),
                                    shadowColor: colors.accent,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: confirmFocused && isDarkTheme ? 0.35 : 0,
                                    shadowRadius: 8,
                                    elevation: confirmFocused ? 2 : 0,
                                }
                            ]}>
                                <Icon name="lock" size={normalize(18)} color={confirmFocused ? colors.accent : colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={secureConfirm}
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        updateTouched('confirmPassword');
                                        setConfirmPassword(value);
                                    }}
                                    onFocus={() => {
                                        updateTouched('confirmPassword');
                                        setConfirmFocused(true);
                                    }}
                                    onBlur={() => {
                                        updateTouched('confirmPassword');
                                        setConfirmFocused(false);
                                    }}
                                />
                                <Pressable onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                                    <Icon name={secureConfirm ? 'eye-off' : 'eye'} size={normalize(18)} color={colors.textSecondary} />
                                </Pressable>
                            </View>
                            {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
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
                            onPress={handleChangePassword}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>{isResetMode ? 'Reset Password' : 'Update Password'}</Text>
                            )}
                        </AnimatedPressable>
                    </View>
                </ScrollView>
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
        marginBottom: verticalScale(16),
    },
    inputLabel: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginBottom: verticalScale(8),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(12),
        borderWidth: 1,
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
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
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
});

export default ChangePasswordScreen;
