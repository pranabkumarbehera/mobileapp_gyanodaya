import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type ProfileScreenProps = StackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const dispatch = useDispatch();
    const { logoutResponse, isLoading } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        if (logoutResponse === 'logout') {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    }, [logoutResponse]);

    const handleLogout = () => {
        dispatch(logoutRequest());
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
                            <Pressable style={styles.iconButton}>
                                <Icon name="settings" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.profileCardWrapper}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}} 
                                style={styles.avatarImage} 
                            />
                        </View>
                        <Text style={styles.userName}>Aarav Reddy</Text>
                        <Text style={styles.userMeta}>JEE Aspirant • 12th Grade</Text>
                        
                        <View style={styles.badgeContainer}>
                            <Icon name="award" size={normalize(14)} color="#D97706" />
                            <Text style={styles.badgeText}>Gold Tier Scholar</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="award" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>All India Rank</Text>
                                <Text style={styles.statBoxValue}>#4,205</Text>
                            </View>
                        </View>
                        <View style={styles.statBox}>
                            <View style={styles.statIconWrapper}>
                                <Icon name="trending-up" size={normalize(20)} color={Colorpath.Primary} />
                            </View>
                            <View>
                                <Text style={styles.statBoxLabel}>Avg Score</Text>
                                <Text style={styles.statBoxValue}>78%</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Subject Performance</Text>
                    <View style={styles.performanceCard}>
                        <View style={styles.performanceItem}>
                            <View style={styles.performanceHeader}>
                                <Text style={styles.subjectName}>Physics</Text>
                                <Text style={styles.subjectScore}>85%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '85%', backgroundColor: Colorpath.Primary }]} />
                            </View>
                        </View>
                        <View style={styles.performanceItem}>
                            <View style={styles.performanceHeader}>
                                <Text style={styles.subjectName}>Chemistry</Text>
                                <Text style={styles.subjectScore}>92%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '92%', backgroundColor: Colorpath.Secondary }]} />
                            </View>
                        </View>
                        <View style={styles.performanceItem}>
                            <View style={styles.performanceHeader}>
                                <Text style={styles.subjectName}>Mathematics</Text>
                                <Text style={styles.subjectScore}>65%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '65%', backgroundColor: '#EF4444' }]} />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <View style={styles.settingsContainer}>
                        <Pressable style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                            <View style={styles.settingIconBg}>
                                <Icon name="lock" size={normalize(18)} color={Colorpath.Primary} />
                            </View>
                            <Text style={styles.settingText}>Change Password</Text>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                        <Pressable 
                            style={[styles.settingItem, styles.settingItemLast]} 
                            onPress={handleLogout}
                            disabled={isLoading}
                        >
                            <View style={[styles.settingIconBg, { backgroundColor: '#FEE2E2' }]}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Icon name="log-out" size={normalize(18)} color="#EF4444" />
                                )}
                            </View>
                            <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
                            <Icon name="chevron-right" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    </View>
                    
                    <View style={{height: verticalScale(100)}} />
                </View>
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    scrollContent: { flexGrow: 1 },
    headerBackground: { backgroundColor: Colorpath.Primary, height: verticalScale(180), borderBottomLeftRadius: normalize(30), borderBottomRightRadius: normalize(30) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), marginHorizontal: -normalize(8) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    profileCardWrapper: { paddingHorizontal: normalize(24), marginTop: -verticalScale(80) },
    profileCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(20), padding: normalize(24), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
    avatarContainer: { width: normalize(80), height: normalize(80), borderRadius: normalize(40), backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), borderWidth: 4, borderColor: '#FFFFFF', marginTop: -normalize(40), overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    userName: { fontSize: normalize(20), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(4) },
    userMeta: { fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(16) },
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
    performanceItem: { marginBottom: verticalScale(16) },
    performanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    subjectName: { fontSize: normalize(14), color: '#374151', fontWeight: '500' },
    subjectScore: { fontSize: normalize(14), color: '#374151', fontWeight: 'bold' },
    progressBarBg: { width: '100%', height: verticalScale(6), backgroundColor: '#E5E7EB', borderRadius: normalize(3), overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: normalize(3) },
    settingsContainer: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), paddingHorizontal: normalize(16), marginBottom: verticalScale(24), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    settingItemLast: { borderBottomWidth: 0 },
    settingIconBg: { width: normalize(36), height: normalize(36), borderRadius: normalize(10), backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: normalize(12) },
    settingText: { flex: 1, fontSize: normalize(15), fontWeight: '600', color: '#374151' },
});

export default ProfileScreen;
