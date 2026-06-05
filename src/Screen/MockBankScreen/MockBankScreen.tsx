import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useDispatch, useSelector } from 'react-redux';
import { getMockTestListRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';

type MockBankScreenProps = StackScreenProps<RootStackParamList, 'MockBank'>;

const MockBankScreen = ({ navigation }: MockBankScreenProps) => {
    const dispatch = useDispatch();
    const { mockTestList, isLoading } = useSelector((state: RootState) => state.MockTestReducer);

    const [activeTab, setActiveTab] = useState('Mock Bank');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMock, setSelectedMock] = useState<any>(null);

    useEffect(() => {
        dispatch(getMockTestListRequest({}));
    }, [dispatch]);

    const fallbackData = [
        { id: 1, title: 'JEE Full Mock 1', subjects: 'Physics, Chemistry, Maths', questions: 90, duration: 180, marking: '+4/-1', type: 'free' },
        { id: 2, title: 'NEET Biology 4', subjects: 'Biology, Zoology', questions: 90, duration: 45, marking: '+4/-1', type: 'free' },
        { id: 3, title: 'Advanced Physics Pro', subjects: 'Physics', questions: 50, duration: 60, marking: '+4/-1', type: 'premium', price: 100 },
        { id: 4, title: 'Chemistry Elite Mock', subjects: 'Chemistry', questions: 50, duration: 60, marking: '+4/-1', type: 'premium', price: 100 },
    ];

    const rawData = Array.isArray(mockTestList)
        ? mockTestList
        : mockTestList?.data || mockTestList?.quizzes || mockTestList?.items || fallbackData;

    const displayData = rawData.map((mock: any) => {
        const correctMarks = mock?.positiveMarks ?? mock?.correctMarks ?? mock?.defaultMarks ?? mock?.marksPerQuestion ?? mock?.quiz?.positiveMarks ?? mock?.quiz?.defaultMarks ?? mock?.quiz?.marksPerQuestion ?? 1;
        const rawNeg = mock?.negativeMarks ?? mock?.negativeMarking ?? mock?.penalty ?? mock?.quiz?.negativeMarks ?? mock?.quiz?.negativeMarking ?? 0;
        const negVal = typeof rawNeg === 'object' && rawNeg !== null ? rawNeg.value : rawNeg;
        
        let markingStr = `+${correctMarks}`;
        if (Number(negVal) > 0) {
            markingStr += `/-${Number(negVal)}`;
        } else if (Number(negVal) < 0) {
            markingStr += `/${Number(negVal)}`;
        } else {
            markingStr += `/0`;
        }

        const price = Number(mock?.price || 0);

        return {
            id: mock.id || mock._id || mock.testId,
            title: mock.title || mock?.quiz?.title || 'Untitled Test',
            subjects: mock.subjects || mock.description || mock?.quiz?.description || 'General Syllabus',
            questions: mock.questionsCount || mock.questions?.length || mock?.quiz?.questionsCount || mock?.quiz?.questions?.length || 50,
            duration: mock.durationMinutes || mock.duration || mock?.quiz?.durationMinutes || mock?.quiz?.duration || 60,
            marking: markingStr,
            type: price > 0 ? 'premium' : 'free',
            price: price,
            originalData: mock
        };
    }).filter((mock: any) => activeTab === 'Mock Bank');

    const handleStartTest = (mock: any) => {
        if (mock.type === 'premium') {
            setSelectedMock(mock);
            setShowPaymentModal(true);
        } else {
            navigation.navigate('MockTestRules', { testId: mock.id });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={normalize(24)} color="#111827" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Test Series</Text>
                <Text style={styles.sectionSubtitle}>Practice with real exam scenarios.</Text>

                <View style={styles.tabsContainer}>
                    <Pressable
                        style={[styles.tab, activeTab === 'Mock Bank' && styles.activeTab]}
                        onPress={() => setActiveTab('Mock Bank')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Mock Bank' && styles.activeTabText]}>Mock Bank</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'Notes Bank' && styles.activeTab]}
                        onPress={() => setActiveTab('Notes Bank')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Notes Bank' && styles.activeTabText]}>Notes Bank</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'Question Bank' && styles.activeTab]}
                        onPress={() => setActiveTab('Question Bank')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Question Bank' && styles.activeTabText]}>Question Bank</Text>
                    </Pressable>
                </View>

                {isLoading ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <Text style={{ color: '#6B7280' }}>Loading tests...</Text>
                    </View>
                ) : displayData.length === 0 ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <Text style={{ color: '#6B7280' }}>No tests available right now.</Text>
                    </View>
                ) : displayData.map((mock: any, i: number) => (
                    <View key={i} style={styles.testCard}>
                        <View style={styles.cardTopRow}>
                            <Text style={styles.testTitle}>{mock.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
                                {mock.price > 0 ? (
                                    <View style={[styles.markingBadge, { backgroundColor: '#DCFCE7' }]}>
                                        <Text style={[styles.markingText, { color: '#16A34A' }]}>₹{mock.price}</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.markingBadge, { backgroundColor: '#FEF3C7' }]}>
                                        <Text style={[styles.markingText, { color: '#D97706' }]}>Free</Text>
                                    </View>
                                )}
                                <View style={[styles.markingBadge, { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={[styles.markingText, { color: '#4B5563' }]}>{mock.marking}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.subjectsText}>{mock.subjects}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Icon name="clock" size={normalize(14)} color="#6B7280" />
                                <Text style={styles.metaText}>{mock.duration} Mins</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Icon name="file-text" size={normalize(14)} color="#6B7280" />
                                <Text style={styles.metaText}>{mock.questions} Qs</Text>
                            </View>
                        </View>

                        <Pressable
                            style={[styles.startButton, mock.type === 'premium' && { backgroundColor: '#F59E0B' }]}
                            onPress={() => handleStartTest(mock)}
                        >
                            <Text style={styles.startButtonText}>{mock.type === 'premium' ? 'Unlock Test' : 'Start Test'}</Text>
                        </Pressable>
                    </View>
                ))}

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>

            <Modal visible={showPaymentModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBg} onPress={() => setShowPaymentModal(false)} />
                    <View style={styles.bottomSheetContent}>
                        <View style={styles.modalIconContainer}>
                            <FontAwesome5 name="crown" size={normalize(28)} color="#F59E0B" />
                        </View>
                        <Text style={styles.modalTitle}>Unlock Premium Test</Text>
                        <Text style={styles.modalSubtitle}>Get access to high-quality {selectedMock?.subjects} questions carefully curated by top educators.</Text>

                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Total Price</Text>
                            <Text style={styles.priceValue}>${selectedMock?.price}</Text>
                        </View>

                        <Pressable style={styles.payButton} onPress={() => {
                            setShowPaymentModal(false);
                            navigation.navigate('MockTestRules', { testId: selectedMock?.id });
                        }}>
                            <Text style={styles.payButtonText}>Pay ${selectedMock?.price} & Start</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    backButton: { padding: normalize(8), marginLeft: -normalize(8) },
    scrollContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    headerTitle: { fontSize: normalize(28), fontWeight: '800', color: Colorpath.Primary, marginBottom: verticalScale(8) },
    sectionSubtitle: { fontSize: normalize(14), color: '#6B7280', marginBottom: verticalScale(24) },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: normalize(12), padding: normalize(4), marginBottom: verticalScale(24) },
    tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: normalize(10) },
    activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: normalize(14), fontWeight: '600', color: '#6B7280' },
    activeTabText: { color: Colorpath.Primary },
    testCard: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(16), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(6) },
    testTitle: { fontSize: normalize(16), fontWeight: 'bold', color: Colorpath.Primary, flex: 1 },
    markingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: normalize(8), paddingVertical: verticalScale(4), borderRadius: normalize(8) },
    markingText: { color: '#D97706', fontSize: normalize(11), fontWeight: 'bold' },
    subjectsText: { fontSize: normalize(13), color: '#6B7280', marginBottom: verticalScale(16) },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(20), gap: normalize(20) },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
    metaText: { fontSize: normalize(13), color: '#4B5563', fontWeight: '500' },
    startButton: { backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    startButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
    premiumBadge: { backgroundColor: '#FEF3C7', padding: normalize(4), borderRadius: normalize(8), borderWidth: 1, borderColor: '#FDE68A' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomSheetContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), paddingBottom: verticalScale(40), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalIconContainer: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    modalTitle: { fontSize: normalize(20), fontWeight: 'bold', color: '#111827', marginBottom: verticalScale(8) },
    modalSubtitle: { fontSize: normalize(13), color: '#6B7280', textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(20) },
    priceContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#F3F4F6' },
    priceLabel: { fontSize: normalize(14), color: '#4B5563', fontWeight: '600' },
    priceValue: { fontSize: normalize(20), color: '#111827', fontWeight: 'bold' },
    payButton: { width: '100%', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    payButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
});

export default MockBankScreen;
