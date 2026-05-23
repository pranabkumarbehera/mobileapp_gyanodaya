import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type CoursesScreenProps = StackScreenProps<RootStackParamList, 'Courses'>;

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const [activeTab, setActiveTab] = useState('All');

    const courses = [
        { id: 1, title: 'Calculus Mastery', stats: '45 hrs • 110 lessons', progress: 36, status: 'Ongoing' },
        { id: 2, title: 'Algebra Crash Course', stats: '32 hrs • 80 lessons', progress: 100, status: 'Completed' },
        { id: 3, title: 'Advanced Physics', stats: '60 hrs • 120 lessons', progress: 12, status: 'Ongoing' },
        { id: 4, title: 'Organic Chemistry', stats: '40 hrs • 90 lessons', progress: 0, status: 'Not Started' },
    ];

    const filteredCourses = activeTab === 'All' 
        ? courses 
        : courses.filter(course => course.status === activeTab);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>My Courses</Text>
                        <Pressable style={styles.iconButton}>
                            <Icon name="search" size={normalize(20)} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.tabsContainer}>
                    {['All', 'Ongoing', 'Completed'].map((tab) => (
                        <Pressable 
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </Pressable>
                    ))}
                </View>

                {filteredCourses.map((course, i) => (
                    <View key={i} style={styles.courseCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.courseIconContainer}>
                                <Icon name="play-circle" size={normalize(24)} color={Colorpath.Primary} />
                            </View>
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseTitle}>{course.title}</Text>
                                <Text style={styles.courseSubtitle}>{course.stats}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.progressSection}>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressValue}>{course.progress}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${course.progress}%` }]} />
                            </View>
                        </View>
                        
                        <Pressable 
                            style={styles.actionButton}
                            onPress={() => {
                                if (course.progress === 100) {
                                    navigation.navigate('MockResult');
                                }
                            }}
                        >
                            <Text style={styles.actionButtonText}>
                                {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'View Result' : 'Continue Learning'}
                            </Text>
                        </Pressable>
                    </View>
                ))}
                
                <View style={{height: verticalScale(100)}} />
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    headerBackground: { backgroundColor: Colorpath.Primary },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10), paddingBottom: verticalScale(16) },
    iconButton: { padding: normalize(4) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(20) },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: normalize(12), padding: normalize(4), marginBottom: verticalScale(24) },
    tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: normalize(10) },
    activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: normalize(14), fontWeight: '600', color: '#6B7280' },
    activeTabText: { color: Colorpath.Primary },
    courseCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(16), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(20) },
    courseIconContainer: { width: normalize(52), height: normalize(52), borderRadius: normalize(14), backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: normalize(16) },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: normalize(16), fontWeight: 'bold', color: Colorpath.Primary, marginBottom: verticalScale(6) },
    courseSubtitle: { fontSize: normalize(13), color: '#6B7280' },
    progressSection: { marginBottom: verticalScale(20) },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    progressLabel: { fontSize: normalize(13), color: '#6B7280', fontWeight: '500' },
    progressValue: { fontSize: normalize(13), color: Colorpath.Primary, fontWeight: '700' },
    progressBarBg: { width: '100%', height: verticalScale(6), backgroundColor: '#E5E7EB', borderRadius: normalize(3), overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: Colorpath.Secondary, borderRadius: normalize(3) },
    actionButton: { width: '100%', backgroundColor: '#F8FAFC', paddingVertical: verticalScale(12), borderRadius: normalize(10), borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    actionButtonText: { color: Colorpath.Primary, fontSize: normalize(14), fontWeight: 'bold' },
});

export default CoursesScreen;
