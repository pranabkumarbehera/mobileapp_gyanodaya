import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useTheme } from '../../Themes/hooks';

type TeacherScreenProps = StackScreenProps<RootStackParamList, 'Teacher'>;

const BookButton = ({ onPress, styles, colors }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                style={styles.primaryButton}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Text style={styles.primaryButtonText}>Book Session</Text>
            </Pressable>
        </Animated.View>
    );
};

const TeacherScreen = ({ navigation }: TeacherScreenProps) => {
    const { colors, theme } = useTheme();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const teachersList = [
        { name: 'Sr. Pranab', subject: 'Mobile App Developer', rating: '5.0', experience: '5+ Years', designation: 'Mobile App Developer' },
        { name: 'Dr. Sharma', subject: 'Advanced Mock Strategy', rating: '4.9', experience: '8+ Years', designation: 'Senior Educator' },
        { name: 'Ms. Patel', subject: 'Doubt Clearing', rating: '4.8', experience: '5+ Years', designation: 'Subject Matter Expert' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />
            <View style={styles.blobTopRight} />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={18} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.headerTitle}>Teachers & Mentors</Text>
                <View style={{ width: normalize(36) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionSubtitle}>Find and book your next learning session.</Text>

                {teachersList.map((teacher, i) => (
                    <View key={i} style={styles.glassCard}>
                        <View style={styles.teacherInfoRow}>
                            <View style={styles.avatarGlass}>
                                <Icon name="chalkboard-teacher" size={normalize(26)} color={colors.accent} />
                            </View>
                            <View style={styles.teacherDetails}>
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                                <Text style={styles.teacherSubject}>{teacher.subject}</Text>
                                <View style={styles.ratingRow}>
                                    <Icon name="star" size={normalize(11)} color="#FFD700" solid />
                                    <Text style={styles.ratingText}> {teacher.rating} / 5.0</Text>
                                </View>
                            </View>
                        </View>
                        <BookButton
                            onPress={() => navigation.navigate('TeacherProfile', { teacher })}
                            styles={styles}
                            colors={colors}
                        />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    blobTopRight: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: colors.accent, opacity: 0.1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.statusBg },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    backButton: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
    scrollContent: { padding: normalize(20) },
    sectionSubtitle: { fontSize: normalize(14), color: colors.textSecondary, marginBottom: verticalScale(24) },
    glassCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(16), borderWidth: 1, borderColor: colors.border, padding: normalize(16), marginBottom: verticalScale(16), shadowColor: isDarkTheme ? colors.accent : '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkTheme ? 0.15 : 0.05, shadowRadius: 10, elevation: 3 },
    teacherInfoRow: { flexDirection: 'row', marginBottom: verticalScale(16) },
    avatarGlass: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center', marginRight: normalize(16), borderWidth: 1, borderColor: colors.border },
    teacherDetails: { flex: 1, justifyContent: 'center' },
    teacherName: { fontSize: normalize(16), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(4) },
    teacherSubject: { fontSize: normalize(14), color: colors.textSecondary, marginBottom: verticalScale(4) },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: normalize(12), color: '#FFD700', fontWeight: 'bold' },
    primaryButton: { backgroundColor: colors.Primary, borderRadius: normalize(8), paddingVertical: verticalScale(10), alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    primaryButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: 'bold' },
});

export default TeacherScreen;
