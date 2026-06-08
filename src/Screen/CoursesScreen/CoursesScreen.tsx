import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { useDispatch, useSelector } from 'react-redux';
import { bundleIDRequest, enrollBundleRequest, getBundleListRequest } from '../../Redux/Reducers/MockTestReducer';
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

const getBundlePayload = (bundle: any) =>
    bundle?.bundle ||
    bundle?.data?.bundle ||
    bundle?.data ||
    bundle?.details ||
    bundle?.item ||
    bundle?.result ||
    bundle;

const ensureArray = (value: any) => (Array.isArray(value) ? value : []);

const getBundleItems = (bundleList: any) =>
    ensureArray(
        Array.isArray(bundleList)
            ? bundleList
            : (
            bundleList?.data?.bundles ||
            bundleList?.data?.items ||
            bundleList?.data?.quizzes ||
            bundleList?.bundles ||
            bundleList?.quizzes ||
            bundleList?.items ||
            bundleList?.data ||
            []
        )
    ).map(getBundlePayload);

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

const getBundleQuizzes = (bundle: any) => {
    const payload = getBundlePayload(bundle);

    if (Array.isArray(payload?.subBundles) && payload.subBundles.length > 0) {
        return payload.subBundles;
    }
    if (Array.isArray(payload?.quizIds)) {
        return payload.quizIds;
    }
    if (Array.isArray(payload?.quizzes)) {
        return payload.quizzes;
    }
    if (Array.isArray(payload?.bundleItems)) {
        return payload.bundleItems;
    }
    if (Array.isArray(payload?.tests)) {
        return payload.tests;
    }
    if (Array.isArray(payload?.data?.quizIds)) {
        return payload.data.quizIds;
    }

    return [];
};

const buildSubjectsFromBundle = (bundle: any) => {
    const tests = getBundleQuizzes(bundle);

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

const getQuizId = (quiz: any) => quiz?.id || quiz?._id || quiz?.testId || quiz?.quizId;

const getQuizTopicName = (quiz: any) =>
    quiz?.masterTopicId?.name ||
    quiz?.masterTopic?.name ||
    quiz?.topic?.name ||
    quiz?.topicName ||
    quiz?.category ||
    'Miscellaneous';

const getQuizQuestionCount = (quiz: any) =>
    Number(quiz?.questionCount || quiz?.questionsCount || quiz?.questions?.length || 0);

const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || 0);

const getQuizPrice = (quiz: any) =>
    Number(quiz?.price || 0);

const getQuizNegativeMarking = (quiz: any) => {
    const negativeMarking = quiz?.negativeMarking;

    if (typeof negativeMarking === 'object' && negativeMarking !== null) {
        return negativeMarking?.value ?? '-';
    }

    return negativeMarking ?? '-';
};

const buildQuizCards = (bundle: any) =>
    getBundleQuizzes(bundle)
        .map((quiz: any, index: number) => {
            if (!quiz || typeof quiz !== 'object') {
                return null;
            }

            return {
                id: getQuizId(quiz) || `${index}`,
                title: quiz?.title || quiz?.name || `Mock ${index + 1}`,
                topicName: getQuizTopicName(quiz),
                questionCount: getQuizQuestionCount(quiz),
                durationMinutes: getQuizDuration(quiz),
                price: getQuizPrice(quiz),
                totalMarks: Number(quiz?.totalMarks || quiz?.marks || 0),
                negativeMarking: getQuizNegativeMarking(quiz),
                rawQuiz: quiz,
            };
        })
        .filter(Boolean);

const buildQuizGroups = (bundle: any) => {
    const groups = buildQuizCards(bundle).reduce((acc: any, quiz: any) => {
        const key = quiz.topicName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(quiz);
        return acc;
    }, {});

    return Object.entries(groups).map(([title, quizzes]) => ({
        title,
        quizzes,
    }));
};

const parseBundleDescription = (description: string = '') => {
    const safeDescription = typeof description === 'string' ? description.trim() : '';
    let descriptionObject: any = null;

    if (safeDescription.startsWith('{') || safeDescription.startsWith('[')) {
        try {
            descriptionObject = JSON.parse(safeDescription);
        } catch (error) {
            descriptionObject = null;
        }
    }

    const getValue = (key: string) => {
        const jsonValue =
            descriptionObject?.[key] ??
            descriptionObject?.pattern?.[key] ??
            descriptionObject?.examPattern?.[key];

        if (jsonValue !== undefined && jsonValue !== null && `${jsonValue}`.trim()) {
            return `${jsonValue}`.trim();
        }

        const match = safeDescription.match(new RegExp(`${key}\\s*:\\s*['"]?([^,\\n'"]+)['"]?`, 'i'));
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

const buildPatternFromBundle = (bundle: any, examPattern: any) => {
    const quizzes = getBundleQuizzes(bundle);
    const parsedPattern = parseBundleDescription(bundle?.description || '');
    const totalQuestions = quizzes.reduce((sum: number, quiz: any) => sum + getQuizQuestionCount(quiz), 0);
    const totalMarks = quizzes.reduce((sum: number, quiz: any) => sum + Number(quiz?.totalMarks || quiz?.marks || 0), 0);
    const durationMinutes = quizzes.reduce((max: number, quiz: any) => Math.max(max, getQuizDuration(quiz)), 0);
    const firstQuiz = quizzes.find((quiz: any) => quiz && typeof quiz === 'object');
    const marksPerQuestion =
        firstQuiz?.questionCount && firstQuiz?.totalMarks
            ? (Number(firstQuiz.totalMarks) / Number(firstQuiz.questionCount)).toFixed(2)
            : examPattern.marksPerQuestion;

    return {
        questions: parsedPattern.questions !== '-' ? parsedPattern.questions : (totalQuestions ? `${totalQuestions}` : '-'),
        marks: parsedPattern.marks !== '-' ? parsedPattern.marks : (totalMarks ? `${totalMarks}` : '-'),
        marksPerQuestion: parsedPattern.marksPerQuestion !== '-' ? parsedPattern.marksPerQuestion : marksPerQuestion,
        negativeMarking: parsedPattern.negativeMarking !== '-' ? parsedPattern.negativeMarking : `${getQuizNegativeMarking(firstQuiz)}`,
        duration: parsedPattern.duration !== '-' ? parsedPattern.duration : (durationMinutes ? `${durationMinutes} min` : '-'),
        note: parsedPattern.note !== '-' ? parsedPattern.note : (bundle?.description?.trim() || 'Tap a mock to continue.'),
    };
};

const buildSelectedExam = (bundle: any) => {
    const normalizedBundle = getBundlePayload(bundle);
    const examMeta = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');
    const quizGroups = buildQuizGroups(normalizedBundle);
    return {
        ...examMeta,
        id: normalizedBundle?.id || normalizedBundle?._id || normalizedBundle?.testId || normalizedBundle?.bundleId,
        name: normalizedBundle?.title || normalizedBundle?.name || '',
        description: normalizedBundle?.description || '',
        quizIds: getBundleQuizzes(normalizedBundle),
        pattern: {
            ...examMeta.pattern,
            ...buildPatternFromBundle(normalizedBundle, examMeta.pattern)
        },
        subjects: buildSubjectsFromBundle(normalizedBundle),
        quizGroups,
        isEnrolled: Boolean(normalizedBundle?.isEnrolled),
        rawBundle: normalizedBundle
    };
};

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const dispatch = useDispatch();
    const { bundleList, bundleDetails, isLoading, status } = useSelector((state: RootState) => state.MockTestReducer);

    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBundle, setSelectedBundle] = useState<any>(null);
    const [showBundleActionModal, setShowBundleActionModal] = useState(false);
    const [bundleAccessMode, setBundleAccessMode] = useState<'view' | 'enroll'>('view');

    useEffect(() => {
        dispatch(getBundleListRequest({ limit: 10, page: 1 }));
    }, [dispatch]);

    useEffect(() => {
        if (bundleDetails) {
            const nextExam = buildSelectedExam(bundleDetails);
            setSelectedExam({
                ...nextExam,
                isEnrolled: bundleAccessMode === 'enroll',
            });
        }

    }, [bundleAccessMode, bundleDetails]);

    const handleQuizAction = (quiz: any) => {
        if (!selectedExam?.isEnrolled) {
            return;
        }

        if (!quiz?.id) {
            return;
        }

        navigation.navigate('MockTestRules', {
            testId: quiz.id,
        });
    };

    const openBundleDetails = (bundle: any, mode: 'view' | 'enroll') => {
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId =
            normalizedBundle?.id ||
            normalizedBundle?._id ||
            normalizedBundle?.testId ||
            normalizedBundle?.bundleId;

        if (!bundleId) {
            return;
        }

        setBundleAccessMode(mode);
        setShowBundleActionModal(false);

        if (mode === 'enroll') {
            dispatch(enrollBundleRequest({ id: bundleId }));
            return;
        }

        dispatch(bundleIDRequest({ id: bundleId }));
    };

    const handleBundlePress = (bundle: any) => {
        setSelectedBundle(getBundlePayload(bundle));
        setShowBundleActionModal(true);
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
    const isEnrollingBundle = isLoading && status === enrollBundleRequest.type;

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
                                <Text style={styles.detailSubtitle}>
                                    {selectedExam.isEnrolled ? 'You are enrolled. Start any mock below.' : 'Enroll once to unlock every mock in this course.'}
                                </Text>
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



                    <Text style={styles.sectionTitle}>Mock Sets</Text>
                    <Text style={styles.subjectSubtitle}>
                        {selectedExam.quizGroups?.length > 0
                            ? `${selectedExam.quizIds?.length || 0} quizzes in this category`
                            : 'No quizzes returned from the bundle API'}
                    </Text>

                    <View style={styles.subjectList}>
                        {selectedExam.quizGroups?.map((group: any, groupIndex: number) => (
                            <View key={`${group.title}-${groupIndex}`} style={styles.quizSection}>
                                <View style={styles.topicRow}>
                                    <View style={styles.topicDot} />
                                    <Text style={styles.topicTitle}>{String(group.title || 'Miscellaneous').toUpperCase()}</Text>
                                </View>

                                <View style={styles.quizCardsWrap}>
                                    {group.quizzes.map((quiz: any, quizIndex: number) => (
                                        <View key={quiz.id || quizIndex} style={styles.quizCard}>
                                            <View style={styles.quizBadge}>
                                                <Text style={styles.quizBadgeText}>MOCK</Text>
                                            </View>

                                            <Text style={styles.quizCardTitle}>{quiz.title}</Text>

                                            <View style={styles.quizMetaRow}>
                                                <View style={styles.quizMetaItem}>
                                                    <Feather name="book-open" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizMetaText}>{quiz.questionCount || 0} Qs</Text>
                                                </View>
                                                <View style={styles.quizMetaItem}>
                                                    <Feather name="clock" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizMetaText}>{quiz.durationMinutes || 0}m</Text>
                                                </View>
                                                <Text style={styles.quizPriceText}>₹{quiz.price || 0}</Text>
                                            </View>

                                            {selectedExam.isEnrolled ? (
                                                <Pressable
                                                    style={[styles.quizActionButton, isEnrollingBundle && styles.quizActionButtonDisabled]}
                                                    disabled={isEnrollingBundle}
                                                    onPress={() => handleQuizAction(quiz)}
                                                >
                                                    {isEnrollingBundle ? (
                                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                                    ) : (
                                                        <>
                                                            <Text style={styles.quizActionText}>Attempt</Text>
                                                            <Feather name="play" size={normalize(14)} color="#FFFFFF" />
                                                        </>
                                                    )}
                                                </Pressable>
                                            ) : (
                                                <View style={styles.quizViewOnlyTag}>
                                                    <Feather name="eye" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizViewOnlyText}>View only</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
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
                        const normalizedBundle = getBundlePayload(bundle);
                        const exam = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');
                        return (
                        <Pressable
                            key={normalizedBundle?.id || normalizedBundle?._id || normalizedBundle?.testId || normalizedBundle?.bundleId || index}
                            style={styles.gridItem}
                            onPress={() => handleBundlePress(bundle)}
                        >
                            <View style={[styles.circleContainer, { backgroundColor: exam.bgColor }]}>
                                {renderIcon(exam.icon, exam.iconType, normalize(26), exam.iconColor)}
                            </View>
                            <Text style={styles.examLabel}>{normalizedBundle?.title || normalizedBundle?.name}</Text>
                        </Pressable>
                        );
                    })}
                </View>

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>

            <Modal
                visible={showBundleActionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBundleActionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowBundleActionModal(false)} />
                    <View style={styles.modalCard}>
                        <Text style={styles.modalLabel}>BUNDLE</Text>
                        <Text style={styles.modalTitle}>{selectedBundle?.title || selectedBundle?.name || 'Course'}</Text>
                        <Text style={styles.modalDescription}>
                            Choose `View` to open the mock list without attempt buttons, or `Enroll` to unlock attempts.
                        </Text>

                        <Pressable
                            style={styles.modalSecondaryButton}
                            onPress={() => openBundleDetails(selectedBundle, 'view')}
                        >
                            <Feather name="eye" size={normalize(16)} color="#0F172A" />
                            <Text style={styles.modalSecondaryButtonText}>View</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalPrimaryButton}
                            onPress={() => openBundleDetails(selectedBundle, 'enroll')}
                        >
                            <Feather name="check-circle" size={normalize(16)} color="#FFFFFF" />
                            <Text style={styles.modalPrimaryButtonText}>Enroll</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    detailSubtitle: {
        fontSize: normalize(11),
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: verticalScale(4)
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
    quizSection: {
        marginBottom: verticalScale(22)
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(14)
    },
    topicDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#9AE6B4',
        marginRight: normalize(10)
    },
    topicTitle: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#475467'
    },
    quizCardsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: normalize(12)
    },
    quizCard: {
        width: '48%',
        minWidth: normalize(140),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        padding: normalize(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4
    },
    quizBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: verticalScale(12)
    },
    quizBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: '#667085'
    },
    quizCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1D2939',
        marginBottom: verticalScale(14)
    },
    quizMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: verticalScale(16)
    },
    quizMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: normalize(14)
    },
    quizMetaText: {
        fontSize: normalize(12),
        color: '#667085',
        marginLeft: normalize(6),
        fontWeight: '600'
    },
    quizPriceText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#344054'
    },
    quizActionButton: {
        height: verticalScale(46),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8)
    },
    quizActionButtonDisabled: {
        opacity: 0.7
    },
    quizActionText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800'
    },
    quizViewOnlyTag: {
        height: verticalScale(46),
        borderRadius: normalize(12),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8)
    },
    quizViewOnlyText: {
        color: '#667085',
        fontSize: normalize(13),
        fontWeight: '700'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(24)
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.45)'
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        padding: normalize(22),
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    modalLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: verticalScale(8)
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(8)
    },
    modalDescription: {
        fontSize: normalize(13),
        color: '#475569',
        lineHeight: normalize(20),
        marginBottom: verticalScale(18)
    },
    modalSecondaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(12)
    },
    modalSecondaryButtonText: {
        color: '#0F172A',
        fontSize: normalize(14),
        fontWeight: '800'
    },
    modalPrimaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8)
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800'
    },
    descriptionText: {
        fontSize: normalize(13),
        color: '#374151',
        lineHeight: normalize(20)
    }
});

export default CoursesScreen;
