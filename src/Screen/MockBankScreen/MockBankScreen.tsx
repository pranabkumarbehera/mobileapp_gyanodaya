import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useDispatch, useSelector } from 'react-redux';
import { getMockTestListRequest, getStudentModulesRequest } from '../../Redux/Reducers/MockTestReducer';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';
import { useTheme, useTranslation } from '../../Themes/hooks';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

type MockBankScreenProps = {
    navigation: any;
};

const MockTestCard = ({ mock, handleStartTest, colors, isDarkTheme, styles }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
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
            <View style={[styles.testCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDarkTheme ? colors.accent : '#000000' }]}>
                <View style={styles.cardTopRow}>
                    <Text style={[styles.testTitle, { color: colors.text }]} numberOfLines={2}>{mock.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                        {mock.type === 'premium' ? (
                            <View style={[styles.markingBadge, { backgroundColor: colors.tagGreen, borderColor: colors.border }]}>
                                <Text style={[styles.markingText, { color: colors.tagGreenText }]}>Purchased</Text>
                            </View>
                        ) : (
                            <View style={[styles.markingBadge, { backgroundColor: colors.tagOrange, borderColor: colors.border }]}>
                                <Text style={[styles.markingText, { color: colors.tagOrangeText }]}>Free</Text>
                            </View>
                        )}
                        <View style={[styles.markingBadge, { backgroundColor: colors.tagCyan, borderColor: colors.border }]}>
                            <Text style={[styles.markingText, { color: colors.tagCyanText }]}>{mock.marking}</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.subjectsText, { color: colors.textSecondary }]}>{mock.subjects}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Icon name="clock" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{mock.duration} Mins</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="file-text" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{mock.questions} Qs</Text>
                    </View>
                </View>

                <Pressable
                    style={[styles.startButton, { backgroundColor: colors.Primary }]}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => handleStartTest(mock)}
                >
                    <Text style={styles.startButtonText}>Start Test</Text>
                </Pressable>
            </View>
        </Animated.View>
    );
};

const MockBankScreen = ({ navigation }: MockBankScreenProps) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { colors, tokens } = useTheme();
    const { t } = useTranslation();
    const isDarkTheme = tokens.isDark;
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const [searchFocused, setSearchFocused] = useState(false);
    const { mockTestList, studentModules, isLoading } = useSelector((state: RootState) => state.MockTestReducer);
    const { paymentHistoryData, paymentHistoryLoading } = useSelector((state: RootState) => state.ProfileReducer);

    const [activeTab, setActiveTab] = useState('Free Mock');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMock, setSelectedMock] = useState<any>(null);

    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedSubModuleId, setSelectedSubModuleId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (isFocused) {
            dispatch(getStudentModulesRequest({}));
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }
    }, [dispatch, isFocused]);

    useEffect(() => {
        dispatch(getMockTestListRequest({
            moduleId: selectedModuleId || '',
            subModuleId: selectedSubModuleId || '',
            search: debouncedSearch,
        }));
    }, [dispatch, selectedModuleId, selectedSubModuleId, debouncedSearch]);

    const { enrolledBundleIds, failedPendingBundleIds } = useMemo(() => {
        const collectedIds = studentModules?.data?.modules || studentModules?.modules || studentModules?.data || (Array.isArray(studentModules) ? studentModules : []);
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || [];
        const failedPending = new Set<string>();

        const collectedBundleIds = collectedIds.map((item: any) => {
            const bundleId = item?.bundleId || item?.bundle?.id || item?.bundle?._id || item?.id || item?._id;
            return String(bundleId || '');
        }).filter(Boolean);

        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
            const paymentStatusMap = new Map<string, boolean>();
            paymentsList.forEach((item: any) => {
                const bundleId = String(item?.resourceId || item?.course?._id || item?.course?.id || item?.course || '');
                if (bundleId) {
                    const status = String(item?.status || '').toLowerCase();
                    const isSuccess = status === 'captured' || status === 'success' || status === 'paid' || status === 'completed';
                    if (isSuccess || !paymentStatusMap.has(bundleId)) {
                        paymentStatusMap.set(bundleId, isSuccess);
                    }
                }
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (!isSuccess) {
                    failedPending.add(bundleId);
                }
            });

            const filteredIds = collectedBundleIds.filter((id: string) => {
                if (paymentStatusMap.has(id)) {
                    return paymentStatusMap.get(id);
                }
                return true;
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (isSuccess && !filteredIds.includes(bundleId)) {
                    filteredIds.push(bundleId);
                }
            });

            return {
                enrolledBundleIds: Array.from(new Set(filteredIds)),
                failedPendingBundleIds: failedPending,
            };
        }

        return {
            enrolledBundleIds: Array.from(new Set(collectedBundleIds)),
            failedPendingBundleIds: failedPending,
        };
    }, [studentModules, paymentHistoryData]);

    const rawModules = studentModules?.data?.modules || studentModules?.modules || studentModules?.data || (Array.isArray(studentModules) ? studentModules : []);
    const modules = rawModules.filter((m: any) => {
        const id = String(m?.id || m?._id || '');
        return enrolledBundleIds.includes(id);
    });

    const activeModuleObj = modules.find((m: any) => String(m?.id || m?._id) === String(selectedModuleId));
    const subModules = activeModuleObj?.subModules || activeModuleObj?.sub_modules || activeModuleObj?.submodules || activeModuleObj?.childModules || activeModuleObj?.children || [];

    const rawData: any[] = Array.isArray(mockTestList)
        ? mockTestList
        : mockTestList?.data || mockTestList?.quizzes || mockTestList?.items || [];

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

        const price = Number(mock?.price || mock?.quiz?.price || 0);

        // Find if this mock test belongs to any module that is enrolled
        const mockModuleId = String(mock?.moduleId || mock?.quiz?.moduleId || mock?.bundleId || mock?.quiz?.bundleId || mock?.module?._id || mock?.module?.id || selectedModuleId || '');
        const isUnlocked = mockModuleId ? enrolledBundleIds.includes(mockModuleId) : false;

        return {
            id: mock.id || mock._id || mock.testId,
            title: mock.title || mock?.quiz?.title || 'Untitled Test',
            subjects: mock.subjects || mock.description || mock?.quiz?.description || 'General Syllabus',
            questions: mock.questionsCount || mock.questions?.length || mock?.quiz?.questionsCount || mock?.quiz?.questions?.length || 50,
            duration: mock.durationMinutes || mock.duration || mock?.quiz?.durationMinutes || mock?.quiz?.duration || 60,
            marking: markingStr,
            type: price > 0 ? 'premium' : 'free',
            isUnlocked: isUnlocked,
            price: price,
            originalData: mock
        };
    }).filter((mock: any) => activeTab === 'Free Mock' ? mock.type === 'free' : true);

    const handleStartTest = (mock: any) => {
        navigation.navigate('MockTestRules', { testId: mock.id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={normalize(24)} color={colors.text} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Test Series</Text>
                <Text style={styles.sectionSubtitle}>Practice with real exam scenarios.</Text>

                {/* Search Bar */}
                <View style={[
                    styles.searchBarContainer,
                    {
                        borderColor: searchFocused ? colors.accent : colors.border,
                        shadowColor: colors.accent,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: searchFocused && isDarkTheme ? 0.3 : 0,
                        shadowRadius: 8,
                        elevation: searchFocused ? 2 : 0,
                    }
                ]}>
                    <Icon name="search" size={normalize(18)} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search tests..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {searchInput.length > 0 && (
                        <Pressable onPress={() => setSearchInput('')}>
                            <Icon name="x" size={normalize(18)} color={colors.textSecondary} />
                        </Pressable>
                    )}
                </View>

                {/* Modules Filter */}
                {modules.length > 0 && (
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Modules</Text>
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
                                    All Modules
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

                {/* Sub-Modules Filter */}
                {selectedModuleId !== null && subModules.length > 0 && (
                    <View style={[styles.filterSection, { marginTop: verticalScale(8) }]}>
                        <Text style={styles.filterLabel}>Sub Modules</Text>
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
                                    All Sub Modules
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

                <View style={styles.tabsContainer}>
                    <Pressable
                        style={[styles.tab, activeTab === 'Free Mock' && styles.activeTab]}
                        onPress={() => setActiveTab('Free Mock')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Free Mock' && styles.activeTabText]}>Free Mock</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'Purchased Mock' && styles.activeTab]}
                        onPress={() => setActiveTab('Purchased Mock')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Purchased Mock' && styles.activeTabText]}>Purchased Mock</Text>
                    </Pressable>
                </View>

                {isLoading ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary }}>Loading tests...</Text>
                    </View>
                ) : displayData.length === 0 ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center', paddingHorizontal: normalize(24) }}>
                        <Icon name="inbox" size={normalize(32)} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: verticalScale(12), fontSize: normalize(15), fontWeight: '600', textAlign: 'center' }}>
                            {rawData.length === 0
                                ? 'No tests fetched from server yet.'
                                : `No ${activeTab === 'Free Mock' ? 'free' : 'purchased'} tests in this category.`}
                        </Text>
                        {rawData.length > 0 && (
                            <Text style={{ color: colors.textSecondary, marginTop: verticalScale(6), fontSize: normalize(13), textAlign: 'center' }}>
                                {activeTab === 'Free Mock'
                                    ? `${rawData.length} test(s) found – check the "Purchased Mock" tab`
                                    : `${rawData.length} test(s) exist – try the "Free Mock" tab`}
                            </Text>
                        )}
                    </View>
                ) : displayData.map((mock: any, i: number) => (
                    <MockTestCard
                        key={i}
                        mock={mock}
                        handleStartTest={handleStartTest}
                        colors={colors}
                        isDarkTheme={isDarkTheme}
                        styles={styles}
                    />
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

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    backButton: { padding: normalize(8), marginLeft: -normalize(8) },
    scrollContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(10) },
    headerTitle: { fontSize: normalize(28), fontWeight: '800', color: colors.Primary, marginBottom: verticalScale(8) },
    sectionSubtitle: { fontSize: normalize(14), color: colors.textSecondary, marginBottom: verticalScale(24) },
    tabsContainer: { flexDirection: 'row', backgroundColor: colors.Background, borderRadius: normalize(12), padding: normalize(4), marginBottom: verticalScale(24) },
    tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: normalize(10) },
    activeTab: { backgroundColor: colors.cardBackground, shadowColor: isDarkTheme ? colors.accent : '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: normalize(14), fontWeight: '600', color: colors.textSecondary },
    activeTabText: { color: colors.accent },
    testCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(16), shadowColor: isDarkTheme ? colors.accent : '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDarkTheme ? 0.16 : 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: colors.border },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(6) },
    testTitle: { fontSize: normalize(16), fontWeight: 'bold', color: colors.text, flex: 1 },
    markingBadge: { paddingHorizontal: normalize(8), paddingVertical: verticalScale(4), borderRadius: normalize(8), borderWidth: 1 },
    markingText: { fontSize: normalize(11), fontWeight: 'bold' },
    subjectsText: { fontSize: normalize(13), color: colors.textSecondary, marginBottom: verticalScale(16) },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(20), gap: normalize(20) },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
    metaText: { fontSize: normalize(13), color: colors.textSecondary, fontWeight: '500' },
    startButton: { paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    startButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
    premiumBadge: { padding: normalize(4), borderRadius: normalize(8), borderWidth: 1 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomSheetContent: { backgroundColor: colors.cardBackground, borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), paddingBottom: verticalScale(40), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalIconContainer: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: colors.tagOrange, justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    modalTitle: { fontSize: normalize(20), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(8) },
    modalSubtitle: { fontSize: normalize(13), color: colors.textSecondary, textAlign: 'center', lineHeight: normalize(20), marginBottom: verticalScale(20) },
    priceContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.Background, padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(24), borderWidth: 1, borderColor: colors.border },
    priceLabel: { fontSize: normalize(14), color: colors.textSecondary, fontWeight: '600' },
    priceValue: { fontSize: normalize(20), color: colors.text, fontWeight: 'bold' },
    payButton: { width: '100%', backgroundColor: colors.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(12), alignItems: 'center' },
    payButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold' },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: verticalScale(16),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: colors.text,
        height: '100%',
        paddingVertical: 0,
    },
    filterSection: {
        marginBottom: verticalScale(12),
    },
    filterLabel: {
        fontSize: normalize(12),
        fontWeight: 'bold',
        color: colors.textSecondary,
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
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: normalize(8),
    },
    filterPillActive: {
        backgroundColor: colors.Primary,
        borderColor: colors.Primary,
    },
    filterPillText: {
        fontSize: normalize(13),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
});

export default MockBankScreen;
