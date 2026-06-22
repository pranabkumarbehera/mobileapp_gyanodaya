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
import { useTheme, useTranslation } from '../../Themes/hooks';
import { changeTheme, changeLanguage } from '../../Redux/Reducers/UiPreferenceReducer';

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

    const { colors, theme } = useTheme();
    const { t, language } = useTranslation();

    const isDarkTheme = theme === 'neon' || theme === 'sunset';
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

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
                // Fallback
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

    const themeOptions = [
        { name: 'classic', label: t('profile.classic_theme'), mainColor: '#092948', accentColor: '#f0a335' },
        { name: 'neon', label: t('profile.neon_theme'), mainColor: '#0A0A10', accentColor: '#00F2FE' },
        { name: 'aurora', label: t('profile.aurora_theme'), mainColor: '#4F46E5', accentColor: '#EC4899' },
        { name: 'sunset', label: t('profile.sunset_theme'), mainColor: '#1E0D06', accentColor: '#F97316' }
    ];

    const langOptions = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'or', name: 'ଓଡ଼ିଆ' }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.headerBackground, { backgroundColor: colors.Primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
                            <View style={styles.headerRightSpacer} />
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.profileCardWrapper}>
                    <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDarkTheme ? 1 : 0 }]}>
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
                        <Text style={[styles.userName, { color: colors.text }]}>{profileName}</Text>
                        <Text style={[styles.userMeta, { color: colors.textSecondary }]}>
                            {formatPhoneForDisplay(mappedProfile.phone) || '--'}
                        </Text>
                        {!!mappedProfile.bio && (
                            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{mappedProfile.bio}</Text>
                        )}

                        <View style={styles.badgeContainer}>
                            <Icon name="award" size={normalize(14)} color="#D97706" />
                            <Text style={styles.badgeText}>{t('profile.active')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Preferences UI Section */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.preferences')}</Text>
                    <View style={[styles.settingsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDarkTheme ? 1 : 0 }]}>
                        <View style={styles.preferenceRowItem}>
                            <Text style={[styles.preferenceLabel, { color: colors.text }]}>{t('profile.select_theme')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themesWrapper}>
                                {themeOptions.map((opt) => {
                                    const isActive = theme === opt.name;
                                    return (
                                        <Pressable
                                            key={opt.name}
                                            onPress={() => dispatch(changeTheme(opt.name as any) as any)}
                                            style={[
                                                styles.themeCardBtn,
                                                {
                                                    borderColor: isActive ? colors.accent : colors.border,
                                                    backgroundColor: colors.Background
                                                }
                                            ]}
                                        >
                                            <View style={styles.themePreviewBubbles}>
                                                <View style={[styles.colorBubble, { backgroundColor: opt.mainColor }]} />
                                                <View style={[styles.colorBubble, { backgroundColor: opt.accentColor, marginLeft: -normalize(6) }]} />
                                            </View>
                                            <Text style={[styles.themeCardText, { color: colors.text, fontWeight: isActive ? '700' : '500' }]}>
                                                {opt.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={styles.preferenceDivider} />

                        <View style={styles.preferenceRowItem}>
                            <Text style={[styles.preferenceLabel, { color: colors.text }]}>{t('profile.select_lang')}</Text>
                            <View style={styles.languagesWrapper}>
                                {langOptions.map((opt) => {
                                    const isActive = language === opt.code;
                                    return (
                                        <Pressable
                                            key={opt.code}
                                            onPress={() => dispatch(changeLanguage(opt.code as any) as any)}
                                            style={[
                                                styles.langPillBtn,
                                                {
                                                    borderColor: isActive ? colors.accent : colors.border,
                                                    backgroundColor: isActive ? colors.tagCyan : colors.Background
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.langPillText, { color: isActive ? colors.tagCyanText : colors.text }]}>
                                                {opt.name}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.details')}</Text>
                    <View style={[styles.performanceCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDarkTheme ? 1 : 0 }]}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('profile.phone')}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{formatPhoneForDisplay(mappedProfile.phone) || '--'}</Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('profile.bio')}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{mappedProfile.bio || '--'}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.settings')}</Text>
                    <View style={[styles.settingsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDarkTheme ? 1 : 0 }]}>
                        <Pressable style={styles.settingItem} onPress={openEditModal}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="edit-3" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.edit')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="lock" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.change_pwd')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('CoursesPaymentHistory')}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="credit-card" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.history')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('AboutUs')}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="info" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.about')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleShareApp}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="share-2" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.refer')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={handleSupportPress}>
                            <View style={[styles.settingIconBg, { backgroundColor: colors.tagCyan }]}>
                                <Icon name="mail" size={normalize(18)} color={colors.tagCyanText} />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.support')}</Text>
                                <Text style={[styles.settingSubText, { color: colors.textSecondary }]}>gyanodaya43@gmail.com</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                        <Pressable style={styles.settingItem} onPress={openDeleteModal}>
                            <View style={[styles.settingIconBg, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="trash-2" size={normalize(18)} color="#EF4444" />
                            </View>
                            <View style={styles.settingCopy}>
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>{t('profile.delete_acc')}</Text>
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
                                <Text style={[styles.settingText, { color: '#EF4444' }]}>{t('profile.logout')}</Text>
                            </View>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <View style={{ height: verticalScale(100) }} />
                </View>
            </ScrollView>

            {/* EDIT PROFILE MODAL */}
            <Modal
                visible={isEditVisible}
                animationType="slide"
                transparent
                onRequestClose={closeEditModal}>
                <View style={[styles.modalBackdrop, { backgroundColor: isDarkTheme ? 'rgba(5, 5, 8, 0.75)' : 'rgba(9, 41, 72, 0.35)' }]}>
                    <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.edit')}</Text>
                            <Pressable onPress={closeEditModal} style={[styles.closeButton, { backgroundColor: colors.Background }]}>
                                <Icon name="x" size={normalize(20)} color={colors.text} />
                            </Pressable>
                        </View>

                        <Pressable onPress={handlePickImage} style={[styles.imagePickerButton, { backgroundColor: colors.Background, borderColor: colors.border }]}>
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
                                <Text style={[styles.imagePickerTitle, { color: colors.text }]}>Profile photo</Text>
                                <Text style={[styles.imagePickerSubtitle, { color: colors.textSecondary }]}>Tap to choose image</Text>
                            </View>
                            <Icon name="camera" size={normalize(18)} color={colors.accent} />
                        </Pressable>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.first_name')}</Text>
                            <TextInput
                                value={form.firstName}
                                onChangeText={(value) => updateField('firstName', value)}
                                style={[styles.input, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                placeholder="Enter first name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.last_name')}</Text>
                            <TextInput
                                value={form.lastName}
                                onChangeText={(value) => updateField('lastName', value)}
                                style={[styles.input, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                placeholder="Enter last name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.phone')}</Text>
                            <View style={styles.phoneInputRow}>
                                <View style={[styles.phonePrefixBox, { backgroundColor: colors.Background, borderColor: colors.border }]}>
                                    <Text style={[styles.phonePrefixText, { color: colors.text }]}>+91</Text>
                                </View>
                                <TextInput
                                    value={form.phone}
                                    onChangeText={(value) => updateField('phone', value.replace(/^\+91\s*/, ''))}
                                    style={[styles.input, styles.phoneInput, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.bio')}</Text>
                            <TextInput
                                value={form.bio}
                                onChangeText={(value) => updateField('bio', value)}
                                style={[styles.input, styles.bioInput, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                placeholder={t('profile.bio_placeholder')}
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <Pressable
                            onPress={handleSaveProfile}
                            style={[styles.saveButton, { backgroundColor: colors.Primary, borderColor: colors.border, borderWidth: isDarkTheme ? 1 : 0 }, profileState.isLoading ? styles.saveButtonDisabled : null]}
                            disabled={profileState.isLoading}>
                            {profileState.isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* DELETE ACCOUNT MODAL */}
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
                <View style={[styles.modalBackdrop, { backgroundColor: isDarkTheme ? 'rgba(5, 5, 8, 0.75)' : 'rgba(9, 41, 72, 0.35)' }]}>
                    <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
                        {deleteAccountStep !== 'success' && (
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('deleteAccount.confirm_title')}</Text>
                                <Pressable
                                    disabled={sendOtpLoading || verifyOtpLoading || deleteAccountLoading}
                                    onPress={() => setIsDeleteVisible(false)}
                                    style={[styles.closeButton, { backgroundColor: colors.Background }]}
                                >
                                    <Icon name="x" size={normalize(20)} color={colors.text} />
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'email' && (
                            <View style={{ width: '100%' }}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('deleteAccount.enter_email')}</Text>
                                <TextInput
                                    value={deleteEmail}
                                    onChangeText={setDeleteEmail}
                                    style={[styles.input, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    onPress={handleSendOtp}
                                    style={[styles.saveButton, { backgroundColor: colors.Primary }, sendOtpLoading ? styles.saveButtonDisabled : null]}
                                    disabled={sendOtpLoading}
                                >
                                    {sendOtpLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>{t('deleteAccount.send_otp')}</Text>
                                    )}
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'otp' && (
                            <View style={{ width: '100%' }}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>
                                    {t('deleteAccount.enter_otp', { email: deleteEmail })}
                                </Text>
                                <TextInput
                                    value={deleteOtp}
                                    onChangeText={setDeleteOtp}
                                    style={[styles.input, { backgroundColor: colors.Background, borderColor: colors.border, color: colors.text }]}
                                    placeholder="Enter OTP"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                />
                                <Pressable
                                    onPress={handleVerifyOtp}
                                    style={[styles.saveButton, { backgroundColor: colors.Primary }, verifyOtpLoading ? styles.saveButtonDisabled : null]}
                                    disabled={verifyOtpLoading}
                                >
                                    {verifyOtpLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>{t('deleteAccount.verify_otp')}</Text>
                                    )}
                                </Pressable>
                                <Pressable
                                    style={{ marginTop: verticalScale(14), alignItems: 'center' }}
                                    onPress={() => dispatch(setDeleteAccountStep('email'))}
                                >
                                    <Text style={{ color: colors.Secondary, fontWeight: 'bold' }}>{t('deleteAccount.change_email')}</Text>
                                </Pressable>
                            </View>
                        )}

                        {deleteAccountStep === 'confirm' && (
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <View style={styles.warningIconContainer}>
                                    <Icon name="alert-triangle" size={normalize(28)} color="#EF4444" />
                                </View>
                                <Text style={[styles.modalTitle, { color: '#EF4444', textAlign: 'center', marginBottom: verticalScale(12) }]}>
                                    {t('deleteAccount.confirm_title')}
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: colors.textSecondary, textAlign: 'center', marginBottom: verticalScale(16) }}>
                                    {t('deleteAccount.verified')}
                                </Text>
                                <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: colors.text, alignSelf: 'flex-start', marginBottom: verticalScale(8) }}>
                                    {t('deleteAccount.warning')}
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: colors.textSecondary, alignSelf: 'flex-start', marginBottom: verticalScale(12) }}>
                                    {t('deleteAccount.once_deleted')}
                                </Text>
                                <ScrollView style={{ maxHeight: verticalScale(180), width: '100%', marginBottom: verticalScale(20) }} showsVerticalScrollIndicator={true}>
                                    {t('deleteAccount.bullets').split('|').map((item, idx) => {
                                        // Wait, t('deleteAccount.bullets') returns array if parsed, or we define custom helper or let bullets be string joined by '|'
                                        // But in translations.ts we made deleteAccount.bullets an array! So let's handle both.
                                        const displayList = Array.isArray(t('deleteAccount.bullets')) 
                                            ? (t('deleteAccount.bullets') as any) 
                                            : [
                                                'Your profile will be permanently removed.',
                                                'Your enrolled courses will be deleted.',
                                                'Course progress will be deleted.',
                                                'Quiz history will be deleted.',
                                                'Certificates will be deleted.',
                                                'Saved preferences will be deleted.',
                                                'You will immediately lose access to your account.'
                                              ];
                                        return displayList.map((bulletItem: string, idx2: number) => (
                                            <View key={idx2} style={{ flexDirection: 'row', marginBottom: verticalScale(6), paddingRight: normalize(10) }}>
                                                <Text style={{ fontSize: normalize(14), color: colors.textSecondary, marginRight: normalize(6) }}>•</Text>
                                                <Text style={{ fontSize: normalize(13), color: colors.textSecondary, flex: 1, lineHeight: normalize(18) }}>{bulletItem}</Text>
                                            </View>
                                        ));
                                    })}
                                </ScrollView>
                                <View style={{ flexDirection: 'row', width: '100%', gap: normalize(12), borderTopWidth: 1, borderTopColor: colors.border, paddingTop: verticalScale(16) }}>
                                    <Pressable
                                        onPress={() => setIsDeleteVisible(false)}
                                        style={{ flex: 1, paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: normalize(15), fontWeight: 'bold', color: colors.text }}>{t('common.cancel')}</Text>
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
                                                {t('deleteAccount.confirm_btn')}
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
                                    {t('deleteAccount.success_title')}
                                </Text>
                                <Text style={{ fontSize: normalize(13), color: colors.textSecondary, marginBottom: verticalScale(24) }}>
                                    {t('deleteAccount.success_subtitle')}
                                </Text>
                                <View style={{ width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) }}>
                                    <Icon name="check" size={normalize(32)} color="#10B981" />
                                </View>
                                <Text style={{ fontSize: normalize(20), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(8) }}>
                                    Account Deleted Successfully
                                </Text>
                                <Text style={{ fontSize: normalize(14), color: colors.textSecondary, textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(28) }}>
                                    {t('deleteAccount.success_msg')}
                                </Text>
                                <Pressable
                                    onPress={handleReturnToHome}
                                    style={{ width: '100%', backgroundColor: colors.Primary, borderRadius: normalize(12), paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Text style={{ color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' }}>
                                        {t('deleteAccount.return_home')}
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
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    headerBackground: { height: verticalScale(180), borderBottomLeftRadius: normalize(30), borderBottomRightRadius: normalize(30) },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), marginHorizontal: -normalize(8) },
    headerTitle: { flex: 1, fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    headerRightSpacer: { width: normalize(40), height: normalize(40) },
    profileCardWrapper: { paddingHorizontal: normalize(24), marginTop: -verticalScale(80) },
    profileCard: { borderRadius: normalize(20), padding: normalize(24), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
    avatarContainer: { width: normalize(80), height: normalize(80), borderRadius: normalize(40), backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), borderWidth: 4, borderColor: '#FFFFFF', marginTop: -normalize(40), overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarFallbackText: { fontSize: normalize(24), fontWeight: '700', color: '#FFFFFF' },
    userName: { fontSize: normalize(20), fontWeight: 'bold', marginBottom: verticalScale(4) },
    userMeta: { fontSize: normalize(13), marginBottom: verticalScale(8) },
    bioText: { fontSize: normalize(13), lineHeight: normalize(18), textAlign: 'center', marginBottom: verticalScale(16) },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(16), gap: normalize(6) },
    badgeText: { color: '#D97706', fontSize: normalize(12), fontWeight: 'bold' },
    mainContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(24) },
    sectionTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: verticalScale(16), marginTop: verticalScale(8) },
    performanceCard: { borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(24), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    detailRow: { gap: verticalScale(6) },
    detailDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: verticalScale(16) },
    detailLabel: { fontSize: normalize(12), fontWeight: '600' },
    detailValue: { fontSize: normalize(14), lineHeight: normalize(20) },
    settingsContainer: { borderRadius: normalize(16), paddingHorizontal: normalize(16), marginBottom: verticalScale(24), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    settingItemLast: { borderBottomWidth: 0 },
    settingIconBg: { width: normalize(36), height: normalize(36), borderRadius: normalize(10), justifyContent: 'center', alignItems: 'center', marginRight: normalize(12) },
    settingCopy: { flex: 1 },
    settingText: { fontSize: normalize(15), fontWeight: '600' },
    settingSubText: { fontSize: normalize(12), marginTop: verticalScale(2) },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: normalize(28), borderTopRightRadius: normalize(28), paddingHorizontal: normalize(24), paddingTop: normalize(20), paddingBottom: normalize(32) },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: verticalScale(20) },
    modalTitle: { fontSize: normalize(20), fontWeight: '700' },
    closeButton: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), alignItems: 'center', justifyContent: 'center' },
    imagePickerButton: { flexDirection: 'row', alignItems: 'center', borderRadius: normalize(18), padding: normalize(14), marginBottom: verticalScale(18), borderWidth: 1 },
    editAvatarPreview: { width: normalize(58), height: normalize(58), borderRadius: normalize(29), overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: normalize(12) },
    imagePickerCopy: { flex: 1 },
    imagePickerTitle: { fontSize: normalize(14), fontWeight: '700', marginBottom: verticalScale(2) },
    imagePickerSubtitle: { fontSize: normalize(12) },
    inputGroup: { marginBottom: verticalScale(14) },
    inputLabel: { fontSize: normalize(13), fontWeight: '600', marginBottom: verticalScale(8) },
    input: { borderRadius: normalize(14), borderWidth: 1, paddingHorizontal: normalize(14), paddingVertical: verticalScale(12), fontSize: normalize(14) },
    phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
    phonePrefixBox: { borderRadius: normalize(14), borderWidth: 1, paddingHorizontal: normalize(14), paddingVertical: verticalScale(12) },
    phonePrefixText: { fontSize: normalize(14), fontWeight: '600' },
    phoneInput: { flex: 1 },
    bioInput: { minHeight: verticalScale(96) },
    saveButton: { borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(14), marginTop: verticalScale(10) },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: '700' },
    
    // Preferences styling
    preferenceRowItem: {
        paddingVertical: verticalScale(16),
    },
    preferenceLabel: {
        fontSize: normalize(14),
        fontWeight: '700',
        marginBottom: verticalScale(12),
    },
    themesWrapper: {
        flexDirection: 'row',
        gap: normalize(10),
    },
    themeCardBtn: {
        padding: normalize(10),
        borderRadius: normalize(12),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: normalize(100),
    },
    themePreviewBubbles: {
        flexDirection: 'row',
        marginBottom: verticalScale(6),
    },
    colorBubble: {
        width: normalize(16),
        height: normalize(16),
        borderRadius: normalize(8),
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    themeCardText: {
        fontSize: normalize(12),
    },
    preferenceDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    languagesWrapper: {
        flexDirection: 'row',
        gap: normalize(10),
    },
    langPillBtn: {
        flex: 1,
        paddingVertical: verticalScale(10),
        borderRadius: normalize(12),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    langPillText: {
        fontSize: normalize(14),
        fontWeight: '700',
    },
});

export default ProfileScreen;
