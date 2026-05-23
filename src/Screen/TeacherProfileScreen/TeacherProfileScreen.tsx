import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type TeacherProfileProps = StackScreenProps<RootStackParamList, 'TeacherProfile'>;

const TeacherProfileScreen = ({ route, navigation }: TeacherProfileProps) => {
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
                            <Text style={styles.avatarText}>VK</Text>
                        </View>
                        <Text style={styles.teacherName}>Prof. V. Kumar</Text>
                        <Text style={styles.designation}>Senior Mathematics Faculty</Text>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>4.9</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="star" size={normalize(12)} color="#FACC15" />
                                    <Text style={styles.statLabel}>Rating</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>15k+</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="users" size={normalize(12)} color={Colorpath.Primary} />
                                    <Text style={styles.statLabel}>Students</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>24</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="play-circle" size={normalize(12)} color={Colorpath.Primary} />
                                    <Text style={styles.statLabel}>Courses</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            <Pressable style={styles.followButton}>
                                <Icon name="user-plus" size={normalize(16)} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.followButtonText}>Follow</Text>
                            </Pressable>
                            <Pressable style={styles.messageButton}>
                                <Icon name="message-square" size={normalize(16)} color={Colorpath.Primary} style={styles.btnIcon} />
                                <Text style={styles.messageButtonText}>Message</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>
                        Former HOD at top coaching institutes. Over 15 years of experience in training students for JEE Advanced with a track record of producing top 100 ranks.
                    </Text>

                    <Text style={styles.sectionTitle}>Subject Performance</Text>
                    <View style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                            <Text style={styles.subjectName}>Physics</Text>
                            <Text style={styles.subjectScore}>85%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '85%', backgroundColor: '#FACC15' }]} />
                        </View>
                    </View>
                    <View style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                            <Text style={styles.subjectName}>Chemistry</Text>
                            <Text style={styles.subjectScore}>92%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '92%', backgroundColor: '#10B981' }]} />
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

                    <Text style={styles.sectionTitle}>Popular Courses</Text>
                    {[
                        { title: 'Calculus Mastery', stats: '45 hrs • 110 lessons' },
                        { title: 'Algebra Crash Course', stats: '32 hrs • 80 lessons' }
                    ].map((course, i) => (
                        <View key={i} style={styles.courseCard}>
                            <View style={styles.courseIconContainer}>
                                <Icon name="play-circle" size={normalize(24)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseTitle}>{course.title}</Text>
                                <Text style={styles.courseSubtitle}>{course.stats}</Text>
                            </View>
                        </View>
                    ))}
                    
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
    avatarContainer: { width: normalize(70), height: normalize(70), borderRadius: normalize(35), backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), borderWidth: 4, borderColor: '#FFFFFF', marginTop: -normalize(40) },
    avatarText: { fontSize: normalize(24), fontWeight: 'bold', color: Colorpath.Primary },
    teacherName: { fontSize: normalize(20), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(4) },
    designation: { fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(20) },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: verticalScale(24) },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: '#E5E7EB', height: '80%', alignSelf: 'center' },
    statValue: { fontSize: normalize(18), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(4) },
    statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(4) },
    statLabel: { fontSize: normalize(12), color: '#6B7280' },
    actionButtonsRow: { flexDirection: 'row', gap: normalize(12), width: '100%' },
    followButton: { flex: 1, flexDirection: 'row', backgroundColor: Colorpath.Secondary, paddingVertical: verticalScale(12), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center' },
    followButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: 'bold' },
    messageButton: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: verticalScale(12), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colorpath.Primary },
    messageButtonText: { color: Colorpath.Primary, fontSize: normalize(14), fontWeight: 'bold' },
    btnIcon: { marginRight: normalize(6) },
    mainContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(24) },
    sectionTitle: { fontSize: normalize(18), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(16), marginTop: verticalScale(8) },
    aboutText: { fontSize: normalize(14), color: '#4B5563', lineHeight: normalize(22), marginBottom: verticalScale(16) },
    performanceItem: { marginBottom: verticalScale(16) },
    performanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    subjectName: { fontSize: normalize(14), color: '#374151', fontWeight: '500' },
    subjectScore: { fontSize: normalize(14), color: '#374151', fontWeight: 'bold' },
    progressBarBg: { width: '100%', height: verticalScale(6), backgroundColor: '#E5E7EB', borderRadius: normalize(3), overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: normalize(3) },
    courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: normalize(16), padding: normalize(16), marginBottom: verticalScale(12), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    courseIconContainer: { width: normalize(48), height: normalize(48), borderRadius: normalize(12), backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: normalize(16) },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: normalize(15), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(4) },
    courseSubtitle: { fontSize: normalize(12), color: '#6B7280' },
});

export default TeacherProfileScreen;
