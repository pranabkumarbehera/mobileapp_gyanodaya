import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type TeacherScreenProps = StackScreenProps<RootStackParamList, 'Teacher'>;

const TeacherScreen = ({ navigation }: TeacherScreenProps) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.blobTopRight} />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.headerTitle}>Teachers & Mentors</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionSubtitle}>Find and book your next learning session.</Text>

                {[
                    { name: 'Sr. Pranab', subject: 'Mobile App Developer', rating: '5.0', experience: '5+ Years', designation: 'Mobile App Developer' },
                    { name: 'Dr. Sharma', subject: 'Advanced Mock Strategy', rating: '4.9', experience: '8+ Years', designation: 'Senior Educator' },
                    { name: 'Ms. Patel', subject: 'Doubt Clearing', rating: '4.8', experience: '5+ Years', designation: 'Subject Matter Expert' },
                ].map((teacher, i) => (
                    <View key={i} style={styles.glassCard}>
                        <View style={styles.teacherInfoRow}>
                            <View style={styles.avatarGlass}>
                                <Icon name="chalkboard-teacher" size={30} color={Colorpath.Secondary} />
                            </View>
                            <View style={styles.teacherDetails}>
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                                <Text style={styles.teacherSubject}>{teacher.subject}</Text>
                                <View style={styles.ratingRow}>
                                    <Icon name="star" size={10} color="#FFD700" solid />
                                    <Text style={styles.ratingText}> {teacher.rating} / 5.0</Text>
                                </View>
                            </View>
                        </View>
                        <Pressable 
                            style={styles.primaryButton} 
                            onPress={() => navigation.navigate('TeacherProfile', { teacher })}
                        >
                            <Text style={styles.primaryButtonText}>Book Session</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colorpath.Primary },
    blobTopRight: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: Colorpath.Secondary, opacity: 0.15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: normalize(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: normalize(20), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { padding: normalize(20) },
    sectionSubtitle: { fontSize: normalize(14), color: 'rgba(255,255,255,0.7)', marginBottom: verticalScale(24) },
    glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: normalize(16), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', padding: normalize(16), marginBottom: verticalScale(16) },
    teacherInfoRow: { flexDirection: 'row', marginBottom: verticalScale(16) },
    avatarGlass: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: normalize(16) },
    teacherDetails: { flex: 1, justifyContent: 'center' },
    teacherName: { fontSize: normalize(16), fontWeight: 'bold', color: '#FFFFFF', marginBottom: verticalScale(4) },
    teacherSubject: { fontSize: normalize(14), color: 'rgba(255,255,255,0.7)', marginBottom: verticalScale(4) },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: normalize(12), color: '#FFD700', fontWeight: 'bold' },
    primaryButton: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: normalize(8), paddingVertical: verticalScale(10), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    primaryButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: 'bold' },
});

export default TeacherScreen;
