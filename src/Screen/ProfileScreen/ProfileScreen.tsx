import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    StatusBar,
    Image,
    ActivityIndicator,
    Modal,
    TextInput,
    Linking,
    Share,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest, logoutSuccess } from '../../Redux/Reducers/AuthReducer';
import {
    getProfileRequest,
    updateProfileRequest,
    sendDeleteAccountOtpRequest,
    verifyDeleteAccountOtpRequest,
    deleteAccountRequest,
    setDeleteAccountStep,
} from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import {
    getAvatarBackgroundColor,
    getInitials,
    getProfileImageUri,
    getProfileName,
    normalizeProfileData,
} from '../../Utils/Helpers/home';

type ProfileScreenProps = StackScreenProps<RootStackParamList, 'Profile'>;

type EditableProfile = {
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    avatarUrl: string;
};

const DEFAULT_FORM: EditableProfile = {
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
};

const formatPhoneForDisplay = (phone?: string | null) => {
    const value = (phone || '').trim();
    if (!value) {
        return '';
    }

    return value.startsWith('+91') ? value : `+91 ${value}`;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const dispatch = useDispatch();
    const { logoutResponse, isLoading: isAuthLoading } = useSelector((state: RootState) => state.AuthReducer);
    const profileState = useSelector((state: RootState) => state.ProfileReducer);
    const profileData = profileState.profileData;
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [form, setForm] = useState<EditableProfile>(DEFAULT_FORM);
    const [imageError, setImageError] = useState(false);
    const [editImageError, setEditImageError] = useState(false);

    // Account Deletion States
    const {
        deleteAccountStep,
        sendOtpLoading,
        verifyOtpLoading,
        deleteAccountLoading,
        deleteVerificationToken,
    } = useSelector((state: RootState) => state.ProfileReducer);

    const [isDeleteVisible, setIsDeleteVisible] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState('');
    const [deleteOtp, setDeleteOtp] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const openDeleteModal = () => {
        setDeleteEmail('');
        setDeleteOtp('');
        dispatch(setDeleteAccountStep('email'));
        setIsDeleteVisible(true);
    };

    const handleSendOtp = () => {
        const trimmedEmail = deleteEmail.trim();
        if (!trimmedEmail) {
            Toast.show({ type: 'error', text1: 'Email address is required' });
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            Toast.show({ type: 'error', text1: 'Please enter a valid email address' });
            return;
        }
        dispatch(sendDeleteAccountOtpRequest({ email: trimmedEmail }));
    };

    const handleVerifyOtp = () => {
        const trimmedOtp = deleteOtp.trim();
        if (!trimmedOtp) {
            Toast.show({ type: 'error', text1: 'OTP is required' });
            return;
        }
        dispatch(verifyDeleteAccountOtpRequest({ email: deleteEmail.trim(), otp: trimmedOtp }));
    };

    const handleConfirmDelete = () => {
        dispatch(deleteAccountRequest({ verificationToken: deleteVerificationToken }));
    };

    const handleReturnToHome = () => {
        setIsDeleteVisible(false);
        dispatch(logoutSuccess('logout'));
    };

    useEffect(() => {
        if (logoutResponse === 'logout') {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [logoutResponse, navigation]);

    useEffect(() => {
        if (!profileData && !profileState.isLoading) {
            dispatch(getProfileRequest({}));
        }
    }, [dispatch, profileData, profileState.isLoading]);

    const mappedProfile = useMemo<EditableProfile>(() => normalizeProfileData(profileData), [profileData]);

    useEffect(() => {
        if (!isEditVisible) {
            setForm(mappedProfile);
        }
    }, [isEditVisible, mappedProfile]);

    useEffect(() => {
        if (profileState.status === 'Profile/updateProfileSuccess' && isEditVisible) {
            setIsEditVisible(false);
        }
    }, [isEditVisible, profileState.status]);

    const profileName = useMemo(
        () => getProfileName({ ...profileData, ...mappedProfile }),
        [mappedProfile.firstName, mappedProfile.lastName, profileData],
    );
    const displayedAvatar = useMemo(
        () => form.avatarUrl || mappedProfile.avatarUrl || getProfileImageUri(profileData),
        [form.avatarUrl, mappedProfile.avatarUrl, profileData],
    );
    const initials = useMemo(() => getInitials(profileName), [profileName]);
    const avatarBackground = useMemo(() => getAvatarBackgroundColor(profileName), [profileName]);

    useEffect(() => {
        setImageError(false);
    }, [displayedAvatar]);

    useEffect(() => {
        setEditImageError(false);
    }, [form.avatarUrl]);

    const handleLogout = () => {
        dispatch(logoutRequest({}));
    };

    const handleSupportPress = async () => {
        const mailUrl = 'mailto:gyanodaya43@gmail.com';
        try {
            await Linking.openURL(mailUrl);
        } catch (error) {
            // Ignore if mail app is unavailable.
        }
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Prepare for your learning career with Gyanodaya! Download the app now: https://play.google.com/store/apps/details?id=com.gyanodaya.newapp',
            });
        } catch (error) {
            console.log('Error sharing app:', error);
        }
    };

    const updateField = (field: keyof EditableProfile, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const openEditModal = () => {
        setForm(mappedProfile);
        setIsEditVisible(true);
    };

    const closeEditModal = () => {
        setIsEditVisible(false);
    };

    const handlePickImage = async () => {
        try {
            let nextUri = '';

            try {
                const imagePicker = require('react-native-image-picker');
                if (imagePicker?.launchImageLibrary) {
                    const response = await imagePicker.launchImageLibrary({
                        mediaType: 'photo',
                        selectionLimit: 1,
                        quality: 0.8,
                    });
                    nextUri = response?.assets?.[0]?.uri || '';
                }
            } catch (error) {
                // Fallback for local environments where react-native-image-picker is not yet installed.
            }

            if (!nextUri) {
                const cropPicker = require('react-native-image-crop-picker');
                const response = await cropPicker.openPicker({
                    mediaType: 'photo',
                    cropping: true,
                    compressImageQuality: 0.8,
                });
                nextUri = response?.path || '';
            }

            if (nextUri) {
                updateField('avatarUrl', nextUri);
            }
        } catch (error: any) {
            if (error?.didCancel || error?.code === 'E_PICKER_CANCELLED') {
                return;
            }
        }
    };

    const handleSaveProfile = () => {
        dispatch(updateProfileRequest({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            bio: form.bio.trim(),
            avatarUrl: form.avatarUrl.trim(),
        }));
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBackground}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Profile</Text>
                            <View style={styles.headerRightSpacer} />
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.profileCardWrapper}>
                    <View style={styles.profileCard}>
                        <View style={[styles.avatarContainer, (!displayedAvatar || imageError) ? { backgroundColor: avatarBackground } : null]}>
                            {(displayedAvatar && !imageError) ? (
                                <Image
                                    source={{ uri: displayedAvatar }}
                                    style={styles.avatarImage}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <Text style={styles.avatarFallbackText}>{initials}</Text>
                            )}
                        </View>
                        <Text style={styles.userName}>{profileName}</Text>
                        <Text style={styles.userMeta}>{formatPhoneForDisplay(mappedProfile.phone) || 'Add phone number'}</Text>
                        {!!mappedProfile.bio && <Text style={styles.bioText}>{mappedProfile.bio}</Text>}

                        <View style={styles.badgeContainer}>
                            <Icon name="award" size={normalize(14)} color="#D97706" />
                            <Text style={styles.badgeText}>Profile Active</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="user" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>First Name</Text>
                                <Text style={styles.statBoxValue}>{mappedProfile.firstName || '--'}</Text>
                            </View>
                        </View>
                        <View style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="users" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>Last Name</Text>
                                <Text style={styles.statBoxValue}>{mappedProfile.lastName || '--'}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.performanceCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{formatPhoneForDisplay(mappedProfile.phone) || '--'}</Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bio</Text>
                            <Text style={styles.detailValue}>{mappedProfile.bio || '--'}</Text>
                        </View>
                    </View>



                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <View style={styles.settingsContainer}>
                        <Pressable style={styles.settingItem} onPress={openEditModal}>
                            <View style={styles.settingIconBg}>
                                <Icon name="edit-3" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Edit Profile</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                            <View style={styles.settingIconBg}>
                                <Icon name="lock" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Change Password</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('CoursesPaymentHistory')}>
                            <View style={styles.settingIconBg}>
                                <Icon name="credit-card" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Courses Payment History</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('AboutUs')}>
                            <View style={styles.settingIconBg}>
                                <Icon name="info" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>About Us</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleShareApp}>
                            <View style={styles.settingIconBg}>
                                <Icon name="share-2" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Refer Now</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleSupportPress}>
                            <View style={styles.settingIconBg}>
                                <Icon name="mail" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={styles.settingText}>Support</Text>
                                <Text style={styles.settingSubText}>gyanodaya43@gmail.com</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={openDeleteModal}>
                            <View style={[styles.settingIconBg, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="trash-2" size={normalize(18)} color="#EF4444" />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>Delete Account</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable
                            style={[styles.settingItem, styles.settingItemLast]}
                            onPress={handleLogout}
                            disabled={isAuthLoading}>
                            <View style={[styles.settingIconBg, { backgroundColor: '#FEE2E2' }]}>
                                {isAuthLoading ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Icon name="log-out" size={normalize(18)} color="#EF4444" />
                                )}
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <View style={{ height: verticalScale(100) }} />
                </View>
            </ScrollView>

            <Modal
                visible={isEditVisible}
                animationType="slide"
                transparent
                onRequestClose={closeEditModal}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <Pressable onPress={closeEditModal} style={styles.closeButton}>
                                <Icon name="x" size={normalize(20)} color="#6B7280" />
                            </Pressable>
                        </View>

                        <Pressable onPress={handlePickImage} style={styles.imagePickerButton}>
                            <View style={[styles.editAvatarPreview, (!form.avatarUrl || editImageError) ? { backgroundColor: avatarBackground } : null]}>
                                {(form.avatarUrl && !editImageError) ? (
                                    <Image
                                        source={{ uri: form.avatarUrl }}
                                        style={styles.avatarImage}
                                        onError={() => setEditImageError(true)}
                                    />
                                ) : (
                                    <Text style={styles.avatarFallbackText}>
                                        {getInitials(`${form.firstName} ${form.lastName}`.trim() || profileName)}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.imagePickerCopy}>
                                <Text style={styles.imagePickerTitle}>Profile photo</Text>
                                <Text style={styles.imagePickerSubtitle}>Tap to choose image</Text>
                            </View>
                            <Icon name="camera" size={normalize(18)} color={Colorpath.Primary} />
                        </Pressable>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>First name</Text>
                            <TextInput
                                value={form.firstName}
                                onChangeText={(value) => updateField('firstName', value)}
                                style={styles.input}
                                placeholder="Enter first name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Last name</Text>
                            <TextInput
                                value={form.lastName}
                                onChangeText={(value) => updateField('lastName', value)}
                                style={styles.input}
                                placeholder="Enter last name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone number</Text>
                            <View style={styles.phoneInputRow}>
                                <View style={styles.phonePrefixBox}>
                                    <Text style={styles.phonePrefixText}>+91</Text>
                                </View>
                                <TextInput
                                    value={form.phone}
                                    onChangeText={(value) => updateField('phone', value.replace(/^\+91\s*/, ''))}
                                    style={[styles.input, styles.phoneInput]}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                value={form.bio}
                                onChangeText={(value) => updateField('bio', value)}
                                style={[styles.input, styles.bioInput]}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <Pressable
                            onPress={handleSaveProfile}
                            style={[styles.saveButton, profileState.isLoading ? styles.saveButtonDisabled : null]}
                            disabled={profileState.isLoading}>
                            {profileState.isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isDeleteVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    if (deleteAccountStep !== 'success' && !deleteAccountLoading) {
                        setIsDeleteVisible(false);
                    }
                }}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        {deleteAccountStep !== 'success' && (
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Delete Account</Text>
                                <Pressable
                                    disabled={sendOtpLoading || verifyOtpLoading || deleteAccountLoading}
                                    onPress={() => setIsDeleteVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Icon name="x" size={normalize(20)} color="#6B7280" />
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'email' && (
                            <View style={{ width: '100%' }}>
                                <Text style={styles.inputLabel}>Enter email address associated with your account</Text>
                                <TextInput
                                    value={deleteEmail}
                                    onChangeText={setDeleteEmail}
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    onPress={handleSendOtp}
                                    style={[styles.saveButton, sendOtpLoading ? styles.saveButtonDisabled : null]}
                                    disabled={sendOtpLoading}
                                >
                                    {sendOtpLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Send OTP</Text>
                                    )}
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'otp' && (
                            <View style={{ width: '100%' }}>
                                <Text style={styles.inputLabel}>Enter the OTP sent to {deleteEmail}</Text>
                                <TextInput
                                    value={deleteOtp}
                                    onChangeText={setDeleteOtp}
                                    style={styles.input}
                                    placeholder="Enter OTP"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                />
                                <Pressable
                                    onPress={handleVerifyOtp}
                                    style={[styles.saveButton, verifyOtpLoading ? styles.saveButtonDisabled : null]}
                                    disabled={verifyOtpLoading}
                                >
                                    {verifyOtpLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Verify OTP</Text>
                                    )}
                                </Pressable>
                                <Pressable
                                    style={{ marginTop: verticalScale(14), alignItems: 'center' }}
                                    onPress={() => dispatch(setDeleteAccountStep('email'))}
                                >
                                    <Text style={{ color: Colorpath.Primary, fontWeight: 'bold' }}>Change Email</Text>
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'confirm' && (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <View style={styles.warningIconContainer}>
                                    <Icon name="alert-triangle" size={normalize(28)} color="#EF4444" />
                                </View>
                                <Text style={[styles.modalTitle, { color: '#EF4444', textAlign: 'center', marginBottom: verticalScale(12) }]}>
                                    Permanently Delete Account?
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: '#4B5563', textAlign: 'center', marginBottom: verticalScale(16) }}>
                                    You have successfully verified your identity.
                                </Text>
                                <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: '#111827', alignSelf: 'flex-start', marginBottom: verticalScale(8) }}>
                                    Deleting your GYANODAYA account is permanent.
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: '#6B7280', alignSelf: 'flex-start', marginBottom: verticalScale(12) }}>
                                    Once deleted:
                                </Text>
                                <ScrollView style={{ maxHeight: verticalScale(180), width: '100%', marginBottom: verticalScale(20) }} showsVerticalScrollIndicator={true}>
                                    {[
                                        'Your profile will be permanently removed.',
                                        'Your enrolled courses will be deleted.',
                                        'Course progress will be deleted.',
                                        'Quiz history will be deleted.',
                                        'Certificates will be deleted.',
                                        'Bookmarks will be deleted.',
                                        'Notifications will be deleted.',
                                        'Saved preferences will be deleted.',
                                        'Active sessions will be terminated.',
                                        'You will immediately lose access to your account.'
                                    ].map((item, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', marginBottom: verticalScale(6), paddingRight: normalize(10) }}>
                                            <Text style={{ fontSize: normalize(14), color: '#4B5563', marginRight: normalize(6) }}>•</Text>
                                            <Text style={{ fontSize: normalize(13), color: '#4B5563', flex: 1, lineHeight: normalize(18) }}>{item}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <View style={{ flexDirection: 'row', width: '100%', gap: normalize(12), borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: verticalScale(16) }}>
                                    <Pressable
                                        onPress={() => setIsDeleteVisible(false)}
                                        style={{ flex: 1, paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: '#374151' }}>Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleConfirmDelete}
                                        style={{ flex: 1, backgroundColor: '#EF4444', borderRadius: normalize(12), paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                        disabled={deleteAccountLoading}
                                    >
                                        {deleteAccountLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={{ color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' }}>
                                                Permanently Delete Account
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {deleteAccountStep === 'success' && (
                            <View style={{ width: '100%', alignItems: 'center', paddingVertical: verticalScale(20) }}>
                                <View style={{ width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) }}>
                                    <Icon name="trash" size={normalize(28)} color="#D97706" />
                                </View>
                                <Text style={{ fontSize: normalize(22), fontWeight: 'bold', color: '#EF4444', marginBottom: verticalScale(4) }}>
                                    Delete Your Account
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(24) }}>
                                    Your request was processed successfully.
                                </Text>
                                <View style={{ width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) }}>
                                    <Icon name="check" size={normalize(32)} color="#10B981" />
                                </View>
                                <Text style={{ fontSize: normalize(20), fontWeight: 'bold', color: '#111827', marginBottom: verticalScale(8) }}>
                                    Account Deleted Successfully
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: '#4B5563', textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(28) }}>
                                    your GYANODAYA account has been permanently deleted. We're sorry to see you go.
                                </Text>
                                <Pressable
                                    onPress={handleReturnToHome}
                                    style={{ width: '100%', backgroundColor: Colorpath.Primary, borderRadius: normalize(12), paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Text style={{ color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' }}>
                                        Return to Home
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    warningIconContainer: {
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    scrollContent: { flexGrow: 1 },
    headerBackground: { backgroundColor: Colorpath.Primary, height: verticalScale(180), borderBottomLeftRadius: normalize(30), borderBottomRightRadius: normalize(30) },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), marginHorizontal: -normalize(8) },
    headerTitle: { flex: 1, fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    headerRightSpacer: { width: normalize(40), height: normalize(40) },
    profileCardWrapper: { paddingHorizontal: normalize(24), marginTop: -verticalScale(80) },
    profileCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(20), padding: normalize(24), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
    avatarContainer: { width: normalize(80), height: normalize(80), borderRadius: normalize(40), backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), borderWidth: 4, borderColor: '#FFFFFF', marginTop: -normalize(40), overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarFallbackText: { fontSize: normalize(24), fontWeight: '700', color: '#FFFFFF' },
    userName: { fontSize: normalize(20), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(4) },
    userMeta: { fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(8) },
    bioText: { fontSize: normalize(13), color: '#4B5563', lineHeight: normalize(18), textAlign: 'center', marginBottom: verticalScale(16) },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(16), gap: normalize(6) },
    badgeText: { color: '#D97706', fontSize: normalize(12), fontWeight: 'bold' },
    mainContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(24) },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: normalize(12), marginBottom: verticalScale(24) },
    statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: normalize(16), borderRadius: normalize(16), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    statIconWrapper: { width: normalize(40), height: normalize(40), borderRadius: normalize(12), backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: normalize(12) },
    statBoxLabel: { fontSize: normalize(11), color: '#6B7280', marginBottom: verticalScale(2) },
    statBoxValue: { fontSize: normalize(16), fontWeight: 'bold', color: Colorpath.Primary },
    sectionTitle: { fontSize: normalize(18), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(16) },
    performanceCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(24), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    detailRow: { gap: verticalScale(6) },
    detailDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: verticalScale(16) },
    detailLabel: { fontSize: normalize(12), color: '#6B7280', fontWeight: '600' },
    detailValue: { fontSize: normalize(14), color: '#111827', lineHeight: normalize(20) },
    settingsContainer: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), paddingHorizontal: normalize(16), marginBottom: verticalScale(24), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    settingItemLast: { borderBottomWidth: 0 },
    settingIconBg: { width: normalize(36), height: normalize(36), borderRadius: normalize(10), backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: normalize(12) },
    settingCopy: { flex: 1 },
    settingText: { fontSize: normalize(15), fontWeight: '600', color: '#374151' },
    settingSubText: { fontSize: normalize(12), color: '#6B7280', marginTop: verticalScale(2) },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(9, 41, 72, 0.35)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(28), borderTopRightRadius: normalize(28), paddingHorizontal: normalize(24), paddingTop: normalize(20), paddingBottom: normalize(32) },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: verticalScale(20) },
    modalTitle: { fontSize: normalize(20), fontWeight: '700', color: Colorpath.Primary },
    closeButton: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    imagePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: normalize(18), padding: normalize(14), marginBottom: verticalScale(18), borderWidth: 1, borderColor: '#E5E7EB' },
    editAvatarPreview: { width: normalize(58), height: normalize(58), borderRadius: normalize(29), overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: normalize(12) },
    imagePickerCopy: { flex: 1 },
    imagePickerTitle: { fontSize: normalize(14), fontWeight: '700', color: '#111827', marginBottom: verticalScale(2) },
    imagePickerSubtitle: { fontSize: normalize(12), color: '#6B7280' },
    inputGroup: { marginBottom: verticalScale(14) },
    inputLabel: { fontSize: normalize(13), fontWeight: '600', color: '#374151', marginBottom: verticalScale(8) },
    input: { backgroundColor: '#F8FAFC', borderRadius: normalize(14), borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: normalize(14), paddingVertical: verticalScale(12), fontSize: normalize(14), color: '#111827' },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
    phonePrefixBox: { backgroundColor: '#F8FAFC', borderRadius: normalize(14), borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: normalize(14), paddingVertical: verticalScale(12) },
    phonePrefixText: { fontSize: normalize(14), fontWeight: '600', color: '#111827' },
    phoneInput: { flex: 1 },
    bioInput: { minHeight: verticalScale(96) },
    saveButton: { backgroundColor: Colorpath.Primary, borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(14), marginTop: verticalScale(10) },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: '700' },
});

export default ProfileScreen;
