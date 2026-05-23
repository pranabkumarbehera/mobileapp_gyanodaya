import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';

type MockResultScreenProps = StackScreenProps<RootStackParamList, 'MockResult'>;

const MockResultScreen = ({ navigation }: MockResultScreenProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Text style={styles.headerSubtitle}>PHYSICS — MOCK TEST 2</Text>
                        <Text style={styles.headerTitle}>Your Result</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.scoreCard}>
                    <View style={styles.scoreTopRow}>
                        <View>
                            <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
                            <View style={styles.scoreValueRow}>
                                <Text style={styles.scoreMain}>113.0</Text>
                                <Text style={styles.scoreTotal}> / 360</Text>
                            </View>
                        </View>
                        <View style={styles.trophyIconBg}>
                            <Icon name="award" size={normalize(24)} color="#D97706" />
                        </View>
                    </View>
                    
                    <View style={styles.scorePillsRow}>
                        <View style={[styles.scorePill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                            <Text style={[styles.pillValue, { color: '#059669' }]}>+152</Text>
                            <Text style={[styles.pillLabel, { color: '#059669' }]}>Marks Earned</Text>
                        </View>
                        <View style={[styles.scorePill, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                            <Text style={[styles.pillValue, { color: '#DC2626' }]}>-39.0</Text>
                            <Text style={[styles.pillLabel, { color: '#DC2626' }]}>Penalty</Text>
                        </View>
                        <View style={[styles.scorePill, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                            <Text style={[styles.pillValue, { color: '#4F46E5' }]}>#342</Text>
                            <Text style={[styles.pillLabel, { color: '#4F46E5' }]}>All India Rank</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#374151' }]}>62</Text>
                        <Text style={styles.statLabel}>Attempted</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>38</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>22</Text>
                        <Text style={styles.statLabel}>Wrong</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#F59E0B' }]}>28</Text>
                        <Text style={styles.statLabel}>Skipped</Text>
                    </View>
                </View>

                <View style={styles.penaltyCard}>
                    <View style={styles.penaltyHeader}>
                        <Icon name="bar-chart-2" size={normalize(16)} color="#4B5563" />
                        <Text style={styles.penaltyTitle}>Negative Marking Breakdown</Text>
                    </View>
                    
                    <View style={[styles.penaltyRow, { backgroundColor: '#FEF2F2' }]}>
                        <View>
                            <Text style={[styles.penaltyRowTitle, { color: '#DC2626' }]}>Wrong (-2.5 each)</Text>
                            <Text style={styles.penaltyRowSub}>14 questions</Text>
                        </View>
                        <Text style={[styles.penaltyRowValue, { color: '#DC2626' }]}>-35.0</Text>
                    </View>
                    
                    <View style={[styles.penaltyRow, { backgroundColor: '#FFFBEB' }]}>
                        <View>
                            <Text style={[styles.penaltyRowTitle, { color: '#D97706' }]}>Wrong (-0.5 each)</Text>
                            <Text style={styles.penaltyRowSub}>8 questions</Text>
                        </View>
                        <Text style={[styles.penaltyRowValue, { color: '#D97706' }]}>-4.0</Text>
                    </View>

                    <View style={styles.penaltyRow}>
                        <View>
                            <Text style={styles.penaltyRowTitle}>Skipped (0 penalty)</Text>
                            <Text style={styles.penaltyRowSub}>28 questions</Text>
                        </View>
                        <Text style={styles.penaltyRowValue}>0</Text>
                    </View>
                    
                    <View style={styles.penaltyTotalRow}>
                        <Text style={styles.penaltyTotalTitle}>Total Penalty</Text>
                        <Text style={styles.penaltyTotalValue}>-39.0</Text>
                    </View>
                </View>

                <View style={styles.reviewHeader}>
                    <Text style={styles.reviewTitle}>Answer Review</Text>
                    <Text style={styles.reviewSubtitle}>(sample)</Text>
                </View>

                {[
                    { q: 'Q.1', text: 'Velocity of object A after inelastic collision?', ans: '(C) 6 m/s', correct: true, score: '+4' },
                    { q: 'Q.2', text: 'Hybridisation of Carbon in ethyne (C₂H₂)?', ans: '(B) sp² — 120°', actual: '(C) sp — 180°', correct: false, score: '-2.5' },
                    { q: 'Q.3', text: 'Newton\'s second law relates force to?', ans: '(A) Acceleration', correct: true, score: '+4' },
                    { q: 'Q.4', text: 'SI unit of electric current?', ans: '(D) Ohm', actual: '(D) Ampere', correct: false, score: '-0.5' },
                    { q: 'Q.5', text: 'Which law states energy cannot be created or destroyed?', ans: '-', actual: '', correct: null, score: '0' }
                ].map((item, index) => (
                    <View key={index} style={[
                        styles.reviewCard,
                        item.correct === true && { borderColor: '#A7F3D0' },
                        item.correct === false && { borderColor: '#FECACA' },
                        item.correct === null && { borderColor: '#E5E7EB' }
                    ]}>
                        <View style={styles.reviewCardTop}>
                            <Text style={styles.reviewQNum}>{item.q}</Text>
                            <View style={styles.reviewStatusBadge}>
                                {item.correct === true && <><Icon name="check-circle" size={normalize(12)} color="#10B981" /><Text style={[styles.reviewStatusText, { color: '#10B981' }]}>Correct</Text></>}
                                {item.correct === false && <><Icon name="x-circle" size={normalize(12)} color="#EF4444" /><Text style={[styles.reviewStatusText, { color: '#EF4444' }]}>{item.score}</Text></>}
                                {item.correct === null && <><Icon name="minus-circle" size={normalize(12)} color="#9CA3AF" /><Text style={[styles.reviewStatusText, { color: '#9CA3AF' }]}>Skipped</Text></>}
                            </View>
                        </View>
                        <Text style={styles.reviewQText}>{item.text}</Text>
                        <View style={styles.reviewAnsRow}>
                            <Text style={styles.reviewAnsLabel}>Your ans:</Text>
                            <Text style={[styles.reviewAnsValue, item.correct === true && { color: '#111827' }, item.correct === false && { color: '#111827', textDecorationLine: 'line-through' }]}>{item.ans}</Text>
                            {item.actual ? (
                                <>
                                    <Text style={[styles.reviewAnsLabel, { marginLeft: normalize(12) }]}>Correct:</Text>
                                    <Text style={[styles.reviewAnsValue, { color: '#10B981' }]}>{item.actual}</Text>
                                </>
                            ) : null}
                            <View style={{ flex: 1 }} />
                            <Text style={[
                                styles.reviewScoreBox,
                                item.correct === true && { color: '#10B981' },
                                item.correct === false && { color: '#EF4444' },
                                item.correct === null && { color: '#4B5563' }
                            ]}>{item.score}</Text>
                        </View>
                    </View>
                ))}

            </ScrollView>

            <View style={styles.bottomBar}>
                <Pressable style={styles.retryBtn} onPress={() => navigation.goBack()}>
                    <Icon name="rotate-ccw" size={normalize(16)} color="#4B5563" style={{ marginRight: normalize(6) }} />
                    <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
                <Pressable style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
                    <Icon name="home" size={normalize(16)} color="#FFFFFF" style={{ marginRight: normalize(6) }} />
                    <Text style={styles.homeBtnText}>Home</Text>
                    <Icon name="chevron-right" size={normalize(16)} color="#FFFFFF" style={{ marginLeft: normalize(2) }} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    headerBackground: { backgroundColor: Colorpath.Primary, paddingBottom: verticalScale(20) },
    topBar: { paddingHorizontal: normalize(24), paddingTop: verticalScale(16) },
    headerSubtitle: { fontSize: normalize(10), fontWeight: '600', color: '#9CA3AF', letterSpacing: 1, marginBottom: verticalScale(4) },
    headerTitle: { fontSize: normalize(22), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: normalize(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(100) },
    scoreCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(16), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#F3F4F6' },
    scoreTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    finalScoreLabel: { fontSize: normalize(11), fontWeight: 'bold', color: '#6B7280', letterSpacing: 0.5, marginBottom: verticalScale(4) },
    scoreValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    scoreMain: { fontSize: normalize(32), fontWeight: 'bold', color: '#111827' },
    scoreTotal: { fontSize: normalize(14), fontWeight: '600', color: '#6B7280', marginLeft: normalize(4) },
    trophyIconBg: { width: normalize(48), height: normalize(48), borderRadius: normalize(24), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F59E0B' },
    scorePillsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: normalize(10) },
    scorePill: { flex: 1, paddingVertical: verticalScale(10), paddingHorizontal: normalize(8), borderRadius: normalize(10), borderWidth: 1, alignItems: 'center' },
    pillValue: { fontSize: normalize(15), fontWeight: 'bold', marginBottom: verticalScale(2) },
    pillLabel: { fontSize: normalize(10), fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: normalize(12), padding: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#F3F4F6' },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: normalize(16), fontWeight: 'bold', marginBottom: verticalScale(4) },
    statLabel: { fontSize: normalize(11), color: '#6B7280', fontWeight: '500' },
    penaltyCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(12), padding: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#F3F4F6' },
    penaltyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(16) },
    penaltyTitle: { fontSize: normalize(14), fontWeight: 'bold', color: '#374151', marginLeft: normalize(8) },
    penaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: normalize(12), borderRadius: normalize(8), marginBottom: verticalScale(8) },
    penaltyRowTitle: { fontSize: normalize(13), fontWeight: '600', color: '#4B5563', marginBottom: verticalScale(2) },
    penaltyRowSub: { fontSize: normalize(11), color: '#9CA3AF' },
    penaltyRowValue: { fontSize: normalize(14), fontWeight: 'bold', color: '#4B5563' },
    penaltyTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: verticalScale(12), marginTop: verticalScale(4), borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    penaltyTotalTitle: { fontSize: normalize(14), fontWeight: 'bold', color: '#111827' },
    penaltyTotalValue: { fontSize: normalize(16), fontWeight: 'bold', color: '#DC2626' },
    reviewHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: verticalScale(12) },
    reviewTitle: { fontSize: normalize(16), fontWeight: 'bold', color: '#111827' },
    reviewSubtitle: { fontSize: normalize(12), color: '#6B7280', marginLeft: normalize(6) },
    reviewCard: { backgroundColor: '#FFFFFF', padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(12), borderWidth: 1 },
    reviewCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(8) },
    reviewQNum: { fontSize: normalize(13), color: '#6B7280', fontWeight: '500' },
    reviewStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: normalize(4) },
    reviewStatusText: { fontSize: normalize(12), fontWeight: 'bold' },
    reviewQText: { fontSize: normalize(14), color: '#111827', fontWeight: '500', lineHeight: normalize(20), marginBottom: verticalScale(12) },
    reviewAnsRow: { flexDirection: 'row', alignItems: 'center' },
    reviewAnsLabel: { fontSize: normalize(11), color: '#6B7280', marginRight: normalize(4) },
    reviewAnsValue: { fontSize: normalize(12), fontWeight: '600' },
    reviewScoreBox: { fontSize: normalize(14), fontWeight: 'bold' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: normalize(12) },
    retryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(12), borderRadius: normalize(10), borderWidth: 1, borderColor: '#D1D5DB' },
    retryBtnText: { color: '#374151', fontSize: normalize(15), fontWeight: '600' },
    homeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(12), borderRadius: normalize(10) },
    homeBtnText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: '600' }
});

export default MockResultScreen;
