import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBackground}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <View style={styles.userInfoRow}>
                                <View style={styles.avatarContainer}>
                                    <Image 
                                        source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}} 
                                        style={styles.avatar} 
                                    />
                                </View>
                                <View>
                                    <Text style={styles.welcomeText}>Welcome back,</Text>
                                    <Text style={styles.userName}>Aarav</Text>
                                </View>
                            </View>
                            <View style={styles.coinBadge}>
                                <FontAwesome5 name="coins" size={normalize(12)} color="#FACC15" solid />
                                <Text style={styles.coinText}>12</Text>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Rank</Text>
                                <Text style={styles.statValue}>#42</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Focus</Text>
                                <Text style={styles.statValue}>2.4k</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Accuracy</Text>
                                <Text style={styles.statValue}>58%</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Courses</Text>
                        <Text style={styles.viewAllText}>View All</Text>
                    </View>

                    <View style={styles.courseCard}>
                        <View style={styles.courseIconContainer}>
                            <Icon name="book-open" size={normalize(24)} color={Colorpath.Primary} />
                        </View>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitle}>Advanced Physics</Text>
                            <Text style={styles.courseSubtitle}>112 lessons</Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>36%</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '36%' }]} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Teachers</Text>
                        <Text style={styles.viewAllText}>View All</Text>
                    </View>

                    <View style={styles.teachersContainer}>
                        {[1, 2].map((i) => (
                            <Pressable key={i} style={styles.teacherCard} onPress={() => navigation.navigate('TeacherProfile', { teacher: { name: 'Dr. Sharma', subject: 'Mathematics', rating: '4.8', experience: '10+', designation: 'Senior Faculty' }})}>
                                <Image 
                                    source={{uri: i === 1 ? 'https://randomuser.me/api/portraits/women/44.jpg' : 'https://randomuser.me/api/portraits/women/45.jpg'}} 
                                    style={styles.teacherAvatar} 
                                />
                                <Text style={styles.teacherName}>Dr. Sharma</Text>
                                <Text style={styles.teacherSubject}>Mathematics</Text>
                                <View style={styles.ratingBadge}>
                                    <Icon name="star" size={normalize(10)} color="#FACC15" />
                                    <Text style={styles.ratingText}>4.8</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    
                    <View style={{height: verticalScale(100)}} />
                </View>
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerBackground: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(30),
        borderBottomRightRadius: normalize(30),
        paddingBottom: verticalScale(30),
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(10),
        marginBottom: verticalScale(24),
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: normalize(44),
        height: normalize(44),
        borderRadius: normalize(22),
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        marginRight: normalize(12),
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: normalize(12),
    },
    userName: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: 'bold',
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(16),
        gap: normalize(6),
    },
    coinText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: normalize(14),
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(24),
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: normalize(16),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        marginHorizontal: normalize(6),
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: normalize(12),
        marginBottom: verticalScale(4),
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: 'bold',
    },
    mainContent: {
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        marginTop: verticalScale(8),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: Colorpath.Primary,
    },
    viewAllText: {
        fontSize: normalize(13),
        color: Colorpath.Secondary,
        fontWeight: '600',
    },
    courseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(16),
        padding: normalize(16),
        marginBottom: verticalScale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    courseIconContainer: {
        width: normalize(48),
        height: normalize(48),
        borderRadius: normalize(12),
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16),
    },
    courseInfo: {
        flex: 1,
    },
    courseTitle: {
        fontSize: normalize(15),
        fontWeight: 'bold',
        color: Colorpath.Primary,
        marginBottom: verticalScale(4),
    },
    courseSubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
    },
    progressContainer: {
        alignItems: 'flex-end',
        width: normalize(60),
    },
    progressText: {
        fontSize: normalize(12),
        fontWeight: 'bold',
        color: Colorpath.Primary,
        marginBottom: verticalScale(6),
    },
    progressBarBg: {
        width: '100%',
        height: verticalScale(6),
        backgroundColor: '#E5E7EB',
        borderRadius: normalize(3),
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colorpath.Secondary,
    },
    teachersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    teacherCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(16),
        padding: normalize(16),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    teacherAvatar: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(30),
        marginBottom: verticalScale(12),
    },
    teacherName: {
        fontSize: normalize(14),
        fontWeight: 'bold',
        color: Colorpath.Primary,
        marginBottom: verticalScale(4),
    },
    teacherSubject: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginBottom: verticalScale(10),
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(10),
        gap: normalize(4),
    },
    ratingText: {
        fontSize: normalize(12),
        fontWeight: 'bold',
        color: '#D97706',
    },
});

export default HomeScreen;
