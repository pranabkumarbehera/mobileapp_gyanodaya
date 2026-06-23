import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useTheme } from '../../Themes/hooks';

type AboutUsScreenProps = StackScreenProps<RootStackParamList, 'AboutUs'>;

const AboutUsScreen = ({ navigation }: AboutUsScreenProps) => {
    const { colors, tokens } = useTheme();
    const isDarkTheme = tokens.isDark;
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>About Us</Text>
                        <View style={styles.iconButton} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentCard}>
                    <Text style={styles.introText}>
                        <Text style={styles.highlightText}>Gyanodaya</Text> is a dedicated learning platform designed to help aspiring teachers and competitive exam candidates achieve success through quality education and expert guidance.
                    </Text>

                    <Text style={styles.sectionHeading}>The application provides comprehensive study materials, including:</Text>
                    <View style={styles.bulletList}>
                        {[
                            'Mock Tests & Practice Sets',
                            'Handwritten Notes and PDF Materials',
                            'Recorded Video Classes',
                            'Previous Year Questions',
                            'MCQ Test Series',
                            'Exam-Oriented Study Resources',
                            'Regular Updates and Guidance'
                        ].map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Icon name="check-circle" size={normalize(16)} color={colors.Primary} style={styles.bulletIcon} />
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.sectionHeading}>Our courses are specially designed for:</Text>
                    <View style={styles.tagsContainer}>
                        {[
                            'SSB TGT', 'SSB PGT', 'RHT', 'LTR', 'OTET', 'CTET', 'OSSTET', 'UGC NET/JRF', 'Shiksha Shastri', 'Other Teaching & Competitive Examinations'
                        ].map((item, index) => (
                            <View key={index} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.paragraphText}>
                        Under the expert guidance of <Text style={{ fontWeight: 'bold', color: colors.text }}>Janmejay Sir and Niyati Ma'am</Text> and other experts, Gyanodaya aims to provide simple, effective, and affordable learning solutions for every student.
                    </Text>

                    <View style={styles.missionVisionContainer}>
                        <View style={styles.missionCard}>
                            <View style={styles.missionHeader}>
                                <View style={styles.iconBg}>
                                    <Icon name="target" size={normalize(18)} color={colors.tagOrangeText} />
                                </View>
                                <Text style={styles.missionTitle}>Our Mission</Text>
                            </View>
                            <Text style={styles.missionText}>
                                To make quality education accessible to every aspirant and help them achieve their dream teaching career through systematic preparation and continuous support.
                            </Text>
                        </View>

                        <View style={styles.missionCard}>
                            <View style={styles.missionHeader}>
                                <View style={[styles.iconBg, { backgroundColor: colors.tagCyan }]}>
                                    <Icon name="eye" size={normalize(18)} color={colors.tagCyanText} />
                                </View>
                                <Text style={styles.missionTitle}>Our Vision</Text>
                            </View>
                            <Text style={styles.missionText}>
                                To become a trusted educational platform that empowers learners with knowledge, confidence, and success.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footerWrap}>
                        <Text style={styles.footerQuote}>"Your Success is Our Motivation"</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    headerBackground: { backgroundColor: colors.Primary, paddingBottom: verticalScale(16) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), width: normalize(40) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: normalize(20), paddingVertical: verticalScale(24), paddingBottom: verticalScale(40) },
    contentCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(16), padding: normalize(20),      borderWidth: 1, borderColor: colors.border },
    introText: { fontSize: normalize(14), color: colors.textSecondary, lineHeight: normalize(22), marginBottom: verticalScale(20) },
    highlightText: { fontWeight: 'bold', color: colors.Primary, fontSize: normalize(15) },
    sectionHeading: { fontSize: normalize(15), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(12), marginTop: verticalScale(8) },
    bulletList: { marginBottom: verticalScale(20) },
    bulletItem: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
    bulletIcon: { marginRight: normalize(10) },
    bulletText: { fontSize: normalize(13), color: colors.text, flex: 1 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(8), marginBottom: verticalScale(24) },
    tagBadge: { backgroundColor: colors.Background, paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(8), borderWidth: 1, borderColor: colors.border },
    tagText: { fontSize: normalize(12), color: colors.textSecondary, fontWeight: '600' },
    paragraphText: { fontSize: normalize(14), color: colors.textSecondary, lineHeight: normalize(22), marginBottom: verticalScale(24) },
    missionVisionContainer: { gap: verticalScale(16), marginBottom: verticalScale(24) },
    missionCard: { backgroundColor: colors.Background, borderRadius: normalize(12), padding: normalize(16), borderWidth: 1, borderColor: colors.border },
    missionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
    iconBg: { width: normalize(32), height: normalize(32), borderRadius: normalize(8), backgroundColor: colors.tagOrange, justifyContent: 'center', alignItems: 'center', marginRight: normalize(10) },
    missionTitle: { fontSize: normalize(15), fontWeight: 'bold', color: colors.text },
    missionText: { fontSize: normalize(13), color: colors.textSecondary, lineHeight: normalize(20) },
    footerWrap: { alignItems: 'center', marginTop: verticalScale(10), paddingVertical: verticalScale(16), borderTopWidth: 1, borderTopColor: colors.border },
    footerQuote: { fontSize: normalize(14), fontStyle: 'italic', fontWeight: 'bold', color: colors.Primary, textAlign: 'center' }
});

export default AboutUsScreen;
