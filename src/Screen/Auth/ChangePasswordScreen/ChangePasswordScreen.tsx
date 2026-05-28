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
import { changePasswordRequest } from '../../../Redux/Reducers/AuthReducer';
import { RootState } from '../../../Redux/Store';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../../Themes/Colorpath';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';

type ChangePasswordScreenProps = StackScreenProps<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureCurrent, setSecureCurrent] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const dispatch = useDispatch();
    const { isLoading, changePasswordResponse } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (changePasswordResponse?.success || changePasswordResponse?.message) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [changePasswordResponse]);

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Please fill all required fields' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords do not match' });
            return;
        }
        dispatch(changePasswordRequest({ oldPassword: currentPassword, newPassword }));
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
                        <Text style={styles.brandTitle}>Change Password</Text>
                        <Text style={styles.subtitle}>
                            Create a new password that is secure and easy to remember.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secureCurrent}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <Pressable onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeIcon}>
                                <Icon name={secureCurrent ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secureNew}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <Pressable onPress={() => setSecureNew(!secureNew)} style={styles.eyeIcon}>
                                <Icon name={secureNew ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={normalize(18)} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secureConfirm}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <Pressable onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                                <Icon name={secureConfirm ? "eye-off" : "eye"} size={normalize(18)} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Pressable 
                            style={styles.submitButton} 
                            onPress={handleChangePassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Update Password</Text>
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
        marginBottom: verticalScale(20),
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
