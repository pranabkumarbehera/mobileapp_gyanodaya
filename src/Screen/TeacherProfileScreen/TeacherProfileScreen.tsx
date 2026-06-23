import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useTheme } from '../../Themes/hooks';

type TeacherProfileProps = StackScreenProps<RootStackParamList, 'TeacherProfile'>;

const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
};

const TeacherProfileScreen = ({ route, navigation }: TeacherProfileProps) => {
    const { teacher } = route.params || {};
    const { colors, tokens } = useTheme();
    const isDarkTheme = tokens.isDark;
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const name = teacher?.name || 'Prof. V. Kumar';
    const subject = teacher?.subject || 'Senior Faculty';
    const designation = teacher?.designation || 'Senior Faculty & Mentor';
    const rating = teacher?.rating || '4.9';
    const experience = teacher?.experience || '15+ Years';
    const initials = getInitials(name);

    const followScale = useRef(new Animated.Value(1)).current;
    const messageScale = useRef(new Animated.Value(1)).current;

    const animateButton = (scaleVal: Animated.Value, toVal: number) => {
        Animated.spring(scaleVal, {
            toValue: toVal,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBackground}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Profile</Text>
                            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Teacher')}>
                                <Icon name="users" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.profileCardWrapper}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.teacherName}>{name}</Text>
                        <Text style={styles.designation}>{designation}</Text>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{rating}</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="star" size={normalize(12)} color="#FACC15" />
                                    <Text style={styles.statLabel}>Rating</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{experience}</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="award" size={normalize(12)} color={colors.Primary} />
                                    <Text style={styles.statLabel}>Experience</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{subject.split(' ')[0]}</Text>
                                <View style={styles.statLabelRow}>
                                    <Icon name="book" size={normalize(12)} color={colors.Primary} />
                                    <Text style={styles.statLabel}>Subject</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            <Animated.View style={{ flex: 1, transform: [{ scale: followScale }] }}>
                                <Pressable
                                    style={styles.followButton}
                                    onPressIn={() => animateButton(followScale, 0.95)}
                                    onPressOut={() => animateButton(followScale, 1)}
                                >
                                    <Icon name="user-plus" size={normalize(16)} color="#FFFFFF" style={styles.btnIcon} />
                                    <Text style={styles.followButtonText}>Follow</Text>
                                </Pressable>
                            </Animated.View>
                            <Animated.View style={{ flex: 1, transform: [{ scale: messageScale }] }}>
                                <Pressable
                                    style={styles.messageButton}
                                    onPressIn={() => animateButton(messageScale, 0.95)}
                                    onPressOut={() => animateButton(messageScale, 1)}
                                >
                                    <Icon name="message-square" size={normalize(16)} color={colors.Primary} style={styles.btnIcon} />
                                    <Text style={styles.messageButtonText}>Message</Text>
                                </Pressable>
                            </Animated.View>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>
                        Over {experience} of dedicated teaching experience in training competitive and academic aspirants, helping countless students clarify concepts, master mock strategy, and achieve top placements in examinations.
                    </Text>

                    <Text style={styles.sectionTitle}>Subject Performance</Text>
                    <View style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                            <Text style={styles.subjectName}>Concept Clarity</Text>
                            <Text style={styles.subjectScore}>85%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '85%', backgroundColor: colors.accent }]} />
                        </View>
                    </View>
                    <View style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                            <Text style={styles.subjectName}>Doubt Clearing</Text>
                            <Text style={styles.subjectScore}>92%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '92%', backgroundColor: '#10B981' }]} />
                        </View>
                    </View>
                    <View style={styles.performanceItem}>
                        <View style={styles.performanceHeader}>
                            <Text style={styles.subjectName}>Student Satisfaction</Text>
                            <Text style={styles.subjectScore}>95%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '95%', backgroundColor: colors.Primary }]} />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Popular Courses & Materials</Text>
                    {[
                        { title: 'Advanced Exam Strategy Session', stats: '15 hrs • 30 topics' },
                        { title: 'Interactive Mock Questions Discussion', stats: '20 hrs • 45 topics' }
                    ].map((course, i) => (
                        <View key={i} style={styles.courseCard}>
                            <View style={styles.courseIconContainer}>
                                <Icon name="play-circle" size={normalize(24)} color={colors.Primary} />
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

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    scrollContent: { flexGrow: 1 },
    headerBackground: { backgroundColor: colors.Primary, height: verticalScale(180), borderBottomLeftRadius: normalize(30), borderBottomRightRadius: normalize(30) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), marginHorizontal: -normalize(8) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    profileCardWrapper: { paddingHorizontal: normalize(24), marginTop: -verticalScale(80) },
    profileCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(20), padding: normalize(24), alignItems: 'center',      borderWidth: 1, borderColor: colors.border },
    avatarContainer: { width: normalize(70), height: normalize(70), borderRadius: normalize(35), backgroundColor: colors.tagCyan, justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(12), borderWidth: 4, borderColor: colors.cardBackground, marginTop: -normalize(40) },
    avatarText: { fontSize: normalize(24), fontWeight: 'bold', color: colors.tagCyanText },
    teacherName: { fontSize: normalize(20), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(4) },
    designation: { fontSize: normalize(13), color: colors.textSecondary, marginBottom: verticalScale(20), textAlign: 'center' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: verticalScale(24) },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: colors.border, height: '80%', alignSelf: 'center' },
    statValue: { fontSize: normalize(16), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(4) },
    statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(4) },
    statLabel: { fontSize: normalize(12), color: colors.textSecondary },
    actionButtonsRow: { flexDirection: 'row', gap: normalize(12), width: '100%' },
    followButton: { flex: 1, flexDirection: 'row', backgroundColor: colors.accent, paddingVertical: verticalScale(12), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.accent },
    followButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: 'bold' },
    messageButton: { flex: 1, flexDirection: 'row', backgroundColor: colors.cardBackground, paddingVertical: verticalScale(12), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.Primary },
    messageButtonText: { color: colors.Primary, fontSize: normalize(14), fontWeight: 'bold' },
    btnIcon: { marginRight: normalize(6) },
    mainContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(24) },
    sectionTitle: { fontSize: normalize(18), fontWeight: 'bold', color: colors.Primary, marginBottom: verticalScale(16), marginTop: verticalScale(8) },
    aboutText: { fontSize: normalize(14), color: colors.textSecondary, lineHeight: normalize(22), marginBottom: verticalScale(16) },
    performanceItem: { marginBottom: verticalScale(16) },
    performanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    subjectName: { fontSize: normalize(14), color: colors.text, fontWeight: '500' },
    subjectScore: { fontSize: normalize(14), color: colors.text, fontWeight: 'bold' },
    progressBarBg: { width: '100%', height: verticalScale(6), backgroundColor: colors.border, borderRadius: normalize(3), overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: normalize(3) },
    courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, borderRadius: normalize(16), padding: normalize(16), marginBottom: verticalScale(12),      borderWidth: 1, borderColor: colors.border },
    courseIconContainer: { width: normalize(48), height: normalize(48), borderRadius: normalize(12), backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center', marginRight: normalize(16), borderWidth: 1, borderColor: colors.border },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: normalize(15), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(4) },
    courseSubtitle: { fontSize: normalize(12), color: colors.textSecondary },
});

export default TeacherProfileScreen;
