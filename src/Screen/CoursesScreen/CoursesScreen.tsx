import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { useDispatch, useSelector } from 'react-redux';
import { bundleIDRequest, getBundleListRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';

type CoursesScreenProps = {
    navigation: any;
};

const DEFAULT_EXAM_META = {
    icon: 'book-open',
    iconType: 'Feather',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
    pattern: {
        questions: '-',
        marks: '-',
        marksPerQuestion: '-',
        negativeMarking: '-',
        duration: '-',
        note: '-'
    },
    subjects: []
};

const EXAM_ICON_THEMES = [
    { bgColor: '#EEF2FF', iconColor: '#4F46E5' },
    { bgColor: '#E0F2FE', iconColor: '#0284C7' },
    { bgColor: '#FEF3C7', iconColor: '#D97706' },
    { bgColor: '#D1FAE5', iconColor: '#059669' },
    { bgColor: '#F3E8FF', iconColor: '#7C3AED' },
    { bgColor: '#FEE2E2', iconColor: '#DC2626' },
    { bgColor: '#FFEDD5', iconColor: '#EA580C' }
];

const SUBJECT_COLOR_THEMES = [
    { bgColor: '#EEF2FF', textColor: '#4F46E5' },
    { bgColor: '#FEF3C7', textColor: '#D97706' },
    { bgColor: '#ECFDF5', textColor: '#059669' },
    { bgColor: '#FDF2F8', textColor: '#DB2777' },
    { bgColor: '#F5F3FF', textColor: '#7C3AED' },
    { bgColor: '#FFF7ED', textColor: '#EA580C' }
];

const normalizeTitle = (value: string = '') =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const getBundleItems = (bundleList: any) =>
    Array.isArray(bundleList)
        ? bundleList
        : bundleList?.data || bundleList?.bundles || bundleList?.quizzes || bundleList?.items || [];

const getThemeByIndex = (index: number, themes: any[]) =>
    themes[index % themes.length];

const getThemeIndexFromText = (value: string = '') =>
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getExamMetaByTitle = (title: string = '') => {
    const normalizedBundleTitle = normalizeTitle(title);
    const theme = getThemeByIndex(getThemeIndexFromText(normalizedBundleTitle), EXAM_ICON_THEMES);

    if (normalizedBundleTitle.includes('pgt') || normalizedBundleTitle.includes('graduate')) {
        return { ...DEFAULT_EXAM_META, icon: 'graduation-cap', iconType: 'FontAwesome5', ...theme };
    }
    if (normalizedBundleTitle.includes('teacher') || normalizedBundleTitle.includes('tgt') || normalizedBundleTitle.includes('school')) {
        return { ...DEFAULT_EXAM_META, icon: 'book', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('net') || normalizedBundleTitle.includes('jrf') || normalizedBundleTitle.includes('award')) {
        return { ...DEFAULT_EXAM_META, icon: 'award', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('science') || normalizedBundleTitle.includes('pcm') || normalizedBundleTitle.includes('cbz')) {
        return { ...DEFAULT_EXAM_META, icon: 'activity', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('bed') || normalizedBundleTitle.includes('education')) {
        return { ...DEFAULT_EXAM_META, icon: 'bar-chart-2', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('test') || normalizedBundleTitle.includes('mock')) {
        return { ...DEFAULT_EXAM_META, icon: 'clipboard', iconType: 'Feather', ...theme };
    }

    return { ...DEFAULT_EXAM_META, ...theme };
};

const buildSubjectsFromBundle = (bundle: any) => {
    const tests = Array.isArray(bundle?.quizIds) ? bundle.quizIds : [];

    return tests
        .map((test: any, index: number) => {
            if (!test || typeof test !== 'object') {
                return null;
            }

            const name = test?.title || test?.name || test?.subject || test?.quizTitle;
            if (!name) {
                return null;
            }

            return {
                id: test?.id || test?._id || test?.testId || `${index}`,
                name,
                testData: test,
                ...getThemeByIndex(index, SUBJECT_COLOR_THEMES)
            };
        })
        .filter(Boolean);
};

const parseBundleDescription = (description: string = '') => {
    const getValue = (key: string) => {
        const match = description.match(new RegExp(`${key}\\s*:\\s*['"]?([^,\\n'"]+)['"]?`, 'i'));
        return match?.[1]?.trim() || DEFAULT_EXAM_META.pattern[key as keyof typeof DEFAULT_EXAM_META.pattern];
    };

    return {
        questions: getValue('questions'),
        marks: getValue('marks'),
        marksPerQuestion: getValue('marksPerQuestion'),
        negativeMarking: getValue('negativeMarking'),
        duration: getValue('duration'),
        note: getValue('note')
    };
};

const buildSelectedExam = (bundle: any) => {
    const examMeta = getExamMetaByTitle(bundle?.title || bundle?.name || '');
    const subjects = buildSubjectsFromBundle(bundle);
    return {
        ...examMeta,
        id: bundle?.id || bundle?._id || bundle?.testId,
        name: bundle?.title || bundle?.name || '',
        description: bundle?.description || '',
        quizIds: Array.isArray(bundle?.quizIds) ? bundle?.quizIds : [],
        pattern: {
            ...examMeta.pattern,
            ...parseBundleDescription(bundle?.description || '')
        },
        subjects,
        rawBundle: bundle
    };
};

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const dispatch = useDispatch();
    const { bundleList, bundleDetails } = useSelector((state: RootState) => state.MockTestReducer);

    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getBundleListRequest({ limit: 10, page: 1 }));
    }, [dispatch]);

    useEffect(() => {
        if (bundleDetails) {
            setSelectedExam(buildSelectedExam(bundleDetails));
        }
    }, [bundleDetails]);

    const handleSelectSubject = (subject: any) => {
        setSelectedSubjectName(subject.name);

        // Match against bundle detail quizIds so the selected quiz _id reaches the existing start test flow.
        const tests = Array.isArray(selectedExam?.quizIds) ? selectedExam.quizIds : [];

        let matchedTest = subject?.testData && Number(subject?.testData?.price ?? 0) <= 0
            ? subject.testData
            : null;

        // 1st: find a test matching the subject that has price zero
        if (!matchedTest) {
            matchedTest = tests.find((test: any) => {
                if (!test || typeof test !== 'object') {
                    return false;
                }
                const testTitle = (test.title || test.name || '').toLowerCase();
                const subjectName = subject.name.toLowerCase();
                const testPrice = Number(test?.price ?? 0);
                return (testTitle.includes(subjectName) || subjectName.includes(testTitle)) && testPrice <= 0;
            });
        }

        // 2nd: if no exact match, just get the first free test
        if (!matchedTest) {
            matchedTest = tests.find((test: any) => test && typeof test === 'object' && Number(test?.price ?? 0) <= 0);
        }

        // 3rd: if quizIds only has raw ids, just use the first one
        if (!matchedTest && tests.length > 0) {
            matchedTest = tests[0];
        }

        if (matchedTest) {
            const targetTestId =
                typeof matchedTest === 'object'
                    ? matchedTest.id || matchedTest._id || matchedTest.testId
                    : matchedTest;
            setTimeout(() => {
                navigation.navigate('MockTestRules', { testId: targetTestId });
                // Reset selection after navigating to ensure clean state if user returns
                setSelectedSubjectName(null);
            }, 200);
        } else {
            setSelectedSubjectName(null);
        }
    };

    const handleBundlePress = (bundle: any) => {
        const bundleId = bundle?.id || bundle?._id || bundle?.testId;
        if (!bundleId) {
            return;
        }
        dispatch(bundleIDRequest({ id: bundleId }));
    };

    const renderIcon = (name: string, type: string, size: number, color: string) => {
        if (type === 'FontAwesome5') {
            return <FontAwesome5 name={name} size={size} color={color} />;
        }
        return <Feather name={name} size={size} color={color} />;
    };

    const bundleItems = getBundleItems(bundleList);
    const filteredExams = bundleItems.filter((bundle: any) =>
        (bundle?.title || bundle?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedExam) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

                <View style={styles.detailHeader}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.detailHeaderContent}>
                            <Pressable onPress={() => setSelectedExam(null)} style={styles.backBtn}>
                                <Feather name="arrow-left" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                            <View style={styles.headerTextColumn}>
                                <Text style={styles.headerTagline}>EXAM CATEGORY</Text>
                                <Text style={styles.headerMainTitle}>{selectedExam.name}</Text>
                            </View>
                            <View style={styles.headerRightIcon}>
                                {renderIcon(selectedExam.icon, selectedExam.iconType, normalize(20), selectedExam.iconColor)}
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
                    <Text style={styles.sectionTitle}>Exam Pattern</Text>

                    <View style={styles.patternCard}>
                        <View style={styles.patternGrid}>
                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#EFF6FF' }]}>
                                    <Feather name="help-circle" size={normalize(18)} color="#1D4ED8" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Total Questions</Text>
                                    <Text style={styles.patternValue}>{selectedExam.pattern.questions}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FEF3C7' }]}>
                                    <Feather name="star" size={normalize(16)} color="#D97706" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Total Marks</Text>
                                    <Text style={styles.patternValue}>{selectedExam.pattern.marks}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#ECFDF5' }]}>
                                    <Feather name="check-circle" size={normalize(16)} color="#059669" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Marks / Question</Text>
                                    <Text style={styles.patternValue}>{selectedExam.pattern.marksPerQuestion}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FEE2E2' }]}>
                                    <Feather name="minus-circle" size={normalize(16)} color="#DC2626" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Negative Marking</Text>
                                    <Text style={styles.patternValue}>{selectedExam.pattern.negativeMarking}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#F5F3FF' }]}>
                                    <Feather name="clock" size={normalize(16)} color="#7C3AED" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Duration</Text>
                                    <Text style={styles.patternValue}>{selectedExam.pattern.duration}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FFF7ED' }]}>
                                    <Feather name="book-open" size={normalize(16)} color="#EA580C" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.patternLabel}>Note</Text>
                                    <Text style={styles.patternValue} numberOfLines={2}>{selectedExam.pattern.note}</Text>
                                </View>
                            </View>
                        </View>
                    </View>



                    <Text style={styles.sectionTitle}>Available Subjects</Text>
                    <Text style={styles.subjectSubtitle}>
                        {selectedExam.subjects.length > 0 ? 'Tap a subject to start practice' : 'No subject list returned from the bundle API'}
                    </Text>

                    <View style={styles.subjectList}>
                        {selectedExam.subjects.map((subject: any, idx: number) => {
                            const isSelected = selectedSubjectName === subject.name;
                            return (
                                <Pressable
                                    key={idx}
                                    style={[
                                        styles.subjectCard,
                                        isSelected && styles.subjectCardSelected,
                                        !isSelected && { backgroundColor: subject.bgColor + '25' } // subtle opacity
                                    ]}
                                    onPress={() => handleSelectSubject(subject)}
                                >
                                    <View style={[styles.subjectIconWrap, { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : subject.bgColor }]}>
                                        <Feather name="book-open" size={normalize(18)} color={isSelected ? '#FFFFFF' : subject.textColor} />
                                    </View>
                                    <Text style={[styles.subjectTitle, isSelected && styles.subjectTitleSelected]}>
                                        {subject.name}
                                    </Text>
                                    {isSelected ? (
                                        <View style={styles.subjectRightSelected}>
                                            <Text style={styles.selectedLabel}>SELECTED</Text>
                                            <Feather name="chevron-right" size={normalize(16)} color="#F0A335" />
                                        </View>
                                    ) : (
                                        <Feather name="chevron-right" size={normalize(16)} color="#9CA3AF" />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>

                    <View style={{ height: verticalScale(50) }} />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        {/* <Text style={styles.brandText}>GYANODAYA</Text> */}
                        <Text style={styles.titleText}>Exam Categories</Text>
                        <Text style={styles.subtitleText}>Select an exam to view details & start practice</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={normalize(18)} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exam category..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#092948' }]}>{bundleItems.length}</Text>
                        <Text style={styles.statLabel}>Exams</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>30+</Text>
                        <Text style={styles.statLabel}>Subjects</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#F0A335' }]}>500+</Text>
                        <Text style={styles.statLabel}>Mock Tests</Text>
                    </View>
                </View>

                <Text style={styles.allExamsTitle}>All Exams</Text>

                <View style={styles.gridContainer}>
                    {filteredExams.map((bundle: any, index: number) => {
                        const exam = getExamMetaByTitle(bundle?.title || bundle?.name || '');
                        return (
                        <Pressable
                            key={bundle?.id || bundle?._id || bundle?.testId || index}
                            style={styles.gridItem}
                            onPress={() => handleBundlePress(bundle)}
                        >
                            <View style={[styles.circleContainer, { backgroundColor: exam.bgColor }]}>
                                {renderIcon(exam.icon, exam.iconType, normalize(26), exam.iconColor)}
                            </View>
                            <Text style={styles.examLabel}>{bundle?.title || bundle?.name}</Text>
                        </Pressable>
                        );
                    })}
                </View>

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF'
    },
    headerBackground: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(24),
        borderBottomRightRadius: normalize(24),
        paddingBottom: verticalScale(12)
    },
    topBar: {
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(12)
    },
    brandText: {
        fontSize: normalize(11),
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1.5,
        marginBottom: verticalScale(4)
    },
    titleText: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: verticalScale(6)
    },
    subtitleText: {
        fontSize: normalize(13),
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: normalize(18)
    },
    scrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20)
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.04,
        // shadowRadius: 6,
        // elevation: 2,
        marginBottom: verticalScale(20)
    },
    searchIcon: {
        marginRight: normalize(8)
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        height: '100%',
        paddingVertical: 0
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24)
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        marginHorizontal: normalize(4),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.02,
        // shadowRadius: 2,
        // elevation: 1
    },
    statValue: {
        fontSize: normalize(16),
        fontWeight: '800'
    },
    statLabel: {
        fontSize: normalize(11),
        color: '#6B7280',
        fontWeight: '600',
        marginTop: verticalScale(2)
    },
    allExamsTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: verticalScale(16)
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -normalize(8)
    },
    gridItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        paddingHorizontal: normalize(8)
    },
    circleContainer: {
        width: normalize(72),
        height: normalize(72),
        borderRadius: normalize(36),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFFFFF'
    },
    examLabel: {
        fontSize: normalize(11),
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: normalize(15)
    },

    // Detail Screen styles
    detailHeader: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20)
    },
    detailHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(20)
    },
    backBtn: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16)
    },
    headerTextColumn: {
        flex: 1
    },
    headerTagline: {
        fontSize: normalize(10),
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1
    },
    headerMainTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: verticalScale(2)
    },
    headerRightIcon: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20)
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: verticalScale(12)
    },
    patternCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        marginBottom: verticalScale(20),
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.02,
        // shadowRadius: 4,
        // elevation: 2
    },
    patternGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -normalize(6)
    },
    patternItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(6),
        marginBottom: verticalScale(12)
    },
    patternIconWrap: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(8)
    },
    patternLabel: {
        fontSize: normalize(9),
        color: '#9CA3AF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    patternValue: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#1F2937',
        marginTop: verticalScale(1)
    },
    subjectSubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: -verticalScale(8),
        marginBottom: verticalScale(12)
    },
    subjectList: {
        marginBottom: verticalScale(20)
    },
    subjectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.01,
        // shadowRadius: 1,
        // elevation: 1
    },
    subjectCardSelected: {
        backgroundColor: '#092948',
        borderColor: '#092948'
    },
    subjectIconWrap: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12)
    },
    subjectTitle: {
        flex: 1,
        fontSize: normalize(13),
        fontWeight: 'bold',
        color: '#374151'
    },
    subjectTitleSelected: {
        color: '#FFFFFF'
    },
    subjectRightSelected: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    selectedLabel: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: '#F0A335',
        marginRight: normalize(4),
        letterSpacing: 0.5
    },
    descriptionText: {
        fontSize: normalize(13),
        color: '#374151',
        lineHeight: normalize(20)
    }
});

export default CoursesScreen;
