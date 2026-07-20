import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

type MockBankScreenProps = {
    navigation: any;
};

const parseApiItems = (response: any) => {
    const payload = response?.data?.data ?? response?.data ?? response;

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.modules)) {
        return payload.modules;
    }

    if (Array.isArray(payload?.subModules)) {
        return payload.subModules;
    }

    if (Array.isArray(payload?.sub_modules)) {
        return payload.sub_modules;
    }

    if (Array.isArray(payload?.quizzes)) {
        return payload.quizzes;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    return [];
};

const buildAuthHeader = (token: string | null) => ({
    Accept: 'application/json',
    contenttype: 'application/json',
    authorization: token,
});

const MockBankScreen = ({ navigation }: MockBankScreenProps) => {
    const isFocused = useIsFocused();
    const authToken = useSelector((state: RootState) => state.AuthReducer.token);
    const insets = useSafeAreaInsets();
    const [modules, setModules] = useState<any[]>([]);
    const [subModules, setSubModules] = useState<any[]>([]);
    const [mockTests, setMockTests] = useState<any[]>([]);
    const [isModulesLoading, setIsModulesLoading] = useState(false);
    const [isSubModulesLoading, setIsSubModulesLoading] = useState(false);
    const [isMockTestsLoading, setIsMockTestsLoading] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedSubModuleId, setSelectedSubModuleId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMock, setSelectedMock] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchModules = useCallback(async () => {
        if (!authToken) {
            setModules([]);
            return;
        }

        try {
            setIsModulesLoading(true);
            const response = await getApi('student/modules', buildAuthHeader(authToken));
            setModules(parseApiItems(response));
        } catch (error: any) {
            setModules([]);
            Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || 'Failed to fetch courses',
            });
        } finally {
            setIsModulesLoading(false);
        }
    }, [authToken]);

    const fetchSubModules = useCallback(async (moduleId: string | null) => {
        if (!authToken || !moduleId) {
            setSubModules([]);
            return;
        }

        try {
            setIsSubModulesLoading(true);
            const response = await getApi(`student/sub-modules?moduleId=${encodeURIComponent(moduleId)}`, buildAuthHeader(authToken));
            setSubModules(parseApiItems(response));
        } catch (error: any) {
            setSubModules([]);
            Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || 'Failed to fetch categories',
            });
        } finally {
            setIsSubModulesLoading(false);
        }
    }, [authToken]);

    const fetchMockTests = useCallback(async (moduleId: string | null, subModuleId: string | null, search: string) => {
        if (!authToken) {
            setMockTests([]);
            return;
        }

        try {
            setIsMockTestsLoading(true);
            const query = new URLSearchParams({
                moduleId: moduleId || '',
                subModuleId: subModuleId || '',
                search: search || '',
            }).toString();
            const response = await getApi(`quizzes?${query}`, buildAuthHeader(authToken));
            setMockTests(parseApiItems(response));
        } catch (error: any) {
            setMockTests([]);
            Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || 'Failed to fetch mock tests',
            });
        } finally {
            setIsMockTestsLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (isFocused) {
            void fetchModules();
        }
    }, [fetchModules, isFocused]);

    useEffect(() => {
        void fetchSubModules(selectedModuleId);
    }, [fetchSubModules, selectedModuleId]);

    useEffect(() => {
        void fetchMockTests(selectedModuleId, selectedSubModuleId, debouncedSearch);
    }, [debouncedSearch, fetchMockTests, selectedModuleId, selectedSubModuleId]);

    const displayData = useMemo(() => mockTests.map((mock: any) => {
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

        const price = Number(mock?.price || mock?.quiz?.price || 0);

        return {
            id: mock.id || mock._id || mock.testId || mock.quizId || mock?.quiz?.id || mock?.quiz?._id,
            title: mock.name || mock.title || mock?.quiz?.name || mock?.quiz?.title || 'Untitled Test',
            subjects: mock.description || mock.subjects || mock?.quiz?.description || 'General Syllabus',
            questions: mock.questionCount ?? mock.questionsCount ?? mock.questions?.length ?? mock?.quiz?.questionCount ?? mock?.quiz?.questionsCount ?? mock?.quiz?.questions?.length ?? null,
            duration: mock.durationMinutes ?? mock.duration ?? mock?.quiz?.durationMinutes ?? mock?.quiz?.duration ?? null,
            marking: markingStr,
            type: price > 0 ? 'premium' : 'free',
            price,
            originalData: mock,
        };
    }), [mockTests]);

    const handleStartTest = (mock: any) => {
        if (!mock?.id) {
            return;
        }

        navigation.navigate('MockTestRules', { testId: mock.id, testData: mock.originalData });
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

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Icon name="search" size={normalize(18)} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tests..."
                            placeholderTextColor="#9CA3AF"
                            value={searchInput || ''}
                            onChangeText={setSearchInput}
                        />
                    {(searchInput?.length || 0) > 0 && (
                        <Pressable onPress={() => setSearchInput('')}>
                            <Icon name="x" size={normalize(18)} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                {/* All Course Filter */}
                {modules.length > 0 && (
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>All Course</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScrollStyle}
                        >
                            <Pressable
                                style={[
                                    styles.filterPill,
                                    selectedModuleId === null && styles.filterPillActive,
                                ]}
                                onPress={() => {
                                    setSelectedModuleId(null);
                                    setSelectedSubModuleId(null);
                                }}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            selectedModuleId === null && styles.filterPillTextActive,
                                        ]}
                                    >
                                    All Course
                                </Text>
                            </Pressable>
                            {modules.map((m: any, idx: number) => {
                                const moduleId = m?.id || m?._id || String(idx);
                                const moduleName = m?.name || m?.title || `Module ${idx + 1}`;
                                const isSelected = String(selectedModuleId) === String(moduleId);
                                return (
                                    <Pressable
                                        key={moduleId}
                                        style={[
                                            styles.filterPill,
                                            isSelected && styles.filterPillActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedModuleId(String(moduleId));
                                            setSelectedSubModuleId(null);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.filterPillText,
                                                isSelected && styles.filterPillTextActive,
                                            ]}
                                        >
                                            {moduleName}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Category / Subcategory Filter */}
                {selectedModuleId !== null && subModules.length > 0 && (
                    <View style={[styles.filterSection, { marginTop: verticalScale(8) }]}>
                        <Text style={styles.filterLabel}>Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScrollStyle}
                        >
                            <Pressable
                                style={[
                                    styles.filterPill,
                                    selectedSubModuleId === null && styles.filterPillActive,
                                ]}
                                onPress={() => setSelectedSubModuleId(null)}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            selectedSubModuleId === null && styles.filterPillTextActive,
                                        ]}
                                    >
                                    Subcategory
                                </Text>
                            </Pressable>
                            {subModules.map((sm: any, idx: number) => {
                                const subModuleId = sm?.id || sm?._id || String(idx);
                                const subModuleName = sm?.name || sm?.title || `Sub Module ${idx + 1}`;
                                const isSelected = String(selectedSubModuleId) === String(subModuleId);
                                return (
                                    <Pressable
                                        key={subModuleId}
                                        style={[
                                            styles.filterPill,
                                            isSelected && styles.filterPillActive,
                                        ]}
                                        onPress={() => setSelectedSubModuleId(String(subModuleId))}
                                    >
                                        <Text
                                            style={[
                                                styles.filterPillText,
                                                isSelected && styles.filterPillTextActive,
                                            ]}
                                        >
                                            {subModuleName}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {(isModulesLoading || isSubModulesLoading || isMockTestsLoading) ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <Text style={{ color: '#6B7280' }}>Loading tests...</Text>
                    </View>
                ) : displayData.length === 0 ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <Text style={{ color: '#6B7280' }}>No tests available right now.</Text>
                    </View>
                ) : displayData.map((mock: any, i: number) => (
                    <View key={mock.id || i} style={styles.testCard}>
                        <View style={styles.cardTopRow}>
                            <Pressable onPress={() => handleStartTest(mock)} style={{ flex: 1, paddingRight: normalize(8) }}>
                                <Text style={styles.testTitle}>{mock.title}</Text>
                            </Pressable>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
                                {mock.type === 'premium' ? (
                                    <View style={[styles.markingBadge, { backgroundColor: '#DCFCE7' }]}>
                                        <Text style={[styles.markingText, { color: '#16A34A' }]}>Purchased</Text>
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
                                <Text style={styles.metaText}>
                                    {mock.duration !== null && mock.duration !== undefined ? `${mock.duration} Mins` : 'Duration unavailable'}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Icon name="file-text" size={normalize(14)} color="#6B7280" />
                                <Text style={styles.metaText}>
                                    {mock.questions !== null && mock.questions !== undefined ? `${mock.questions} Qs` : 'Questions unavailable'}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            style={[styles.startButton, mock.type === 'premium' && { backgroundColor: '#16A34A' }]}
                            onPress={() => handleStartTest(mock)}
                        >
                            <Text style={styles.startButtonText}>Start Test</Text>
                        </Pressable>
                    </View>
                ))}

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>

            <Modal visible={showPaymentModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBg} onPress={() => setShowPaymentModal(false)} />
                    <View style={[styles.bottomSheetContent, { paddingBottom: Math.max(insets.bottom, verticalScale(40)) }]}>
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
                            navigation.navigate('MockTestRules', { testId: selectedMock?.id, testData: selectedMock?.originalData });
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
    modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomSheetContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalIconContainer: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    modalTitle: { fontSize: normalize(20), fontWeight: 'bold', color: '#111827', marginBottom: verticalScale(8) },
    modalSubtitle: { fontSize: normalize(13), color: '#6B7280', textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(20) },
    priceContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#F3F4F6' },
    priceLabel: { fontSize: normalize(14), color: '#4B5563', fontWeight: '600' },
    priceValue: { fontSize: normalize(20), color: '#111827', fontWeight: 'bold' },
    payButton: { width: '100%', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    payButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: verticalScale(16),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        height: '100%',
        paddingVertical: 0,
    },
    filterSection: {
        marginBottom: verticalScale(12),
    },
    filterLabel: {
        fontSize: normalize(12),
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: verticalScale(6),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    horizontalScrollStyle: {
        paddingVertical: verticalScale(4),
        gap: normalize(8),
    },
    filterPill: {
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(8),
        borderRadius: normalize(20),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: normalize(8),
    },
    filterPillActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    filterPillText: {
        fontSize: normalize(13),
        fontWeight: '600',
        color: '#4B5563',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
});

export default MockBankScreen;
