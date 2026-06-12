import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { useDispatch, useSelector } from 'react-redux';
import {
    bundleIDRequest,
    clearBundleFlowState,
    enrollBundleFailure,
    enrollBundleRequest,
    enrollBundleSuccess,
    getBundleListRequest,
    getStudentModulesRequest,
    getSubBundleDetailsRequest,
    getSubBundleListRequest,
} from '../../Redux/Reducers/MockTestReducer';
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
        note: '-',
    },
};

const EXAM_ICON_THEMES = [
    { bgColor: '#EEF2FF', iconColor: '#4F46E5' },
    { bgColor: '#E0F2FE', iconColor: '#0284C7' },
    { bgColor: '#FEF3C7', iconColor: '#D97706' },
    { bgColor: '#D1FAE5', iconColor: '#059669' },
    { bgColor: '#F3E8FF', iconColor: '#7C3AED' },
    { bgColor: '#FEE2E2', iconColor: '#DC2626' },
    { bgColor: '#FFEDD5', iconColor: '#EA580C' },
];

const normalizeTitle = (value: string = '') =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const ensureArray = (value: any) => (Array.isArray(value) ? value : []);

const getBundlePayload = (bundle: any) =>
    bundle?.bundle ||
    bundle?.data?.bundle ||
    bundle?.data ||
    bundle?.details ||
    bundle?.item ||
    bundle?.result ||
    bundle;

const getThemeByIndex = (index: number, themes: any[]) =>
    themes[index % themes.length];

const getThemeIndexFromText = (value: string = '') =>
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getBundleId = (bundle: any) =>
    bundle?.id ||
    bundle?._id ||
    bundle?.testId ||
    bundle?.bundleId ||
    null;

const getQuizId = (quiz: any) => quiz?.id || quiz?._id || quiz?.testId || quiz?.quizId;

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

const getSubBundleItems = (subBundleList: any) =>
    ensureArray(
        Array.isArray(subBundleList)
            ? subBundleList
            : (
                subBundleList?.data?.subBundles ||
                subBundleList?.data?.items ||
                subBundleList?.subBundles ||
                subBundleList?.items ||
                subBundleList?.data ||
                []
            )
    ).map(getBundlePayload);

const parseMaybeJson = (value: any) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue || (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('['))) {
        return value;
    }

    try {
        return JSON.parse(trimmedValue);
    } catch {
        return value;
    }
};

const getBundleQuizzes = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const parsedPayloadData = parseMaybeJson(payload?.data);
    const parsedBundleItems = parseMaybeJson(payload?.bundleItems);
    const parsedExamData = parseMaybeJson(payload?.examData);
    const quizCollections = [
        payload?.mockTests,
        payload?.quizzes,
        payload?.quizIds,
        payload?.tests,
        parsedBundleItems,
        payload?.items,
        parsedPayloadData?.quizzes,
        parsedPayloadData?.mockTests,
        parsedPayloadData?.quizIds,
        parsedPayloadData?.tests,
        parsedPayloadData?.bundleItems,
        parsedPayloadData?.items,
        parsedExamData?.quizzes,
        parsedExamData?.mockTests,
        parsedExamData?.tests,
    ];

    for (const collection of quizCollections) {
        if (Array.isArray(collection) && collection.length > 0) {
            return collection;
        }
    }

    return [];
};

const getBundleMockCount = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const quizzes = getBundleQuizzes(payload);

    if (quizzes.length > 0) {
        return quizzes.length;
    }

    const parsedPattern = parseMaybeJson(payload?.examPattern);
    const parsedData = parseMaybeJson(payload?.data);

    const directCount = firstDisplayValue(
        payload?.mockTestCount,
        payload?.mockTestsCount,
        payload?.quizCount,
        payload?.quizzesCount,
        payload?.testCount,
        payload?.testsCount,
        payload?.totalMocks,
        payload?.totalMockTests,
        payload?.totalQuizzes,
        parsedData?.mockTestCount,
        parsedData?.mockTestsCount,
        parsedData?.quizCount,
        parsedData?.quizzesCount,
        parsedData?.testCount,
        parsedData?.testsCount,
        parsedData?.totalMocks,
        parsedData?.totalMockTests,
        parsedData?.totalQuizzes,
        parsedPattern?.mockTestCount,
        parsedPattern?.quizCount,
        parsedPattern?.testCount,
    );

    return Number(directCount || 0);
};

const getQuizTopicName = (quiz: any) =>
    quiz?.masterTopicId?.name ||
    quiz?.masterTopic?.name ||
    quiz?.topic?.name ||
    quiz?.topicName ||
    quiz?.category ||
    'Miscellaneous';

const getQuizQuestionCount = (quiz: any) =>
    Number(quiz?.questionCount || quiz?.questionsCount || quiz?.totalQuestions || quiz?.questions?.length || 0);

const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || quiz?.timeLimit || 0);

const getQuizPrice = (quiz: any) =>
    Number(quiz?.price || 0);

const getQuizTotalMarks = (quiz: any) =>
    Number(
        quiz?.totalMarks ||
        quiz?.maxMarks ||
        quiz?.fullMarks ||
        quiz?.marks ||
        0
    );

const getQuizMarksPerQuestion = (quiz: any) => {
    const directValue =
        quiz?.marksPerQuestion ??
        quiz?.defaultMarks ??
        quiz?.positiveMarks ??
        quiz?.correctMarks;

    if (directValue !== undefined && directValue !== null && `${directValue}` !== '') {
        return Number(directValue);
    }

    const questionCount = getQuizQuestionCount(quiz);
    const totalMarks = getQuizTotalMarks(quiz);

    if (questionCount > 0 && totalMarks > 0) {
        return totalMarks / questionCount;
    }

    return 0;
};

const getQuizNegativeMarking = (quiz: any) => {
    const negativeMarking = quiz?.negativeMarking ?? quiz?.negativeMarks ?? quiz?.penalty;

    if (typeof negativeMarking === 'object' && negativeMarking !== null) {
        return negativeMarking?.value ?? '-';
    }

    return negativeMarking ?? '-';
};

const hasDisplayValue = (value: any) =>
    value !== undefined &&
    value !== null &&
    (!(typeof value === 'string') || value.trim() !== '');

const firstDisplayValue = (...values: any[]) =>
    values.find(value => hasDisplayValue(value));

const getPatternValue = (sources: any[], keys: string[]) => {
    for (const source of sources) {
        const parsedSource = parseMaybeJson(source);

        if (!parsedSource || typeof parsedSource !== 'object') {
            continue;
        }

        for (const key of keys) {
            const value = parsedSource?.[key];
            if (hasDisplayValue(value)) {
                return value;
            }
        }
    }

    return null;
};

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

const parseBundleDescription = (description: string = '') => {
    const safeDescription = typeof description === 'string' ? description.trim() : '';
    let descriptionObject: any = null;

    if (safeDescription.startsWith('{') || safeDescription.startsWith('[')) {
        try {
            descriptionObject = JSON.parse(safeDescription);
        } catch {
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
        note: getValue('note'),
    };
};

const buildPatternFromBundle = (bundle: any, examPattern: any) => {
    const quizzes = getBundleQuizzes(bundle);
    const bundlePattern =
        parseMaybeJson(bundle?.examPattern) ||
        parseMaybeJson(bundle?.pattern) ||
        parseMaybeJson(bundle?.exam_pattern) ||
        parseMaybeJson(bundle?.details?.examPattern) ||
        parseMaybeJson(bundle?.details?.pattern) ||
        parseMaybeJson(bundle?.data?.examPattern) ||
        parseMaybeJson(bundle?.data?.pattern) ||
        {};
    const parsedPattern = parseBundleDescription(bundle?.description || '');
    const patternSources = [
        bundlePattern,
        parseMaybeJson(bundle?.examPatternJson),
        parseMaybeJson(bundle?.meta),
        parseMaybeJson(bundle?.details?.meta),
        parseMaybeJson(bundle?.data),
    ];
    const totalQuestions = quizzes.reduce((sum: number, quiz: any) => sum + getQuizQuestionCount(quiz), 0);
    const totalMarks = quizzes.reduce((sum: number, quiz: any) => sum + getQuizTotalMarks(quiz), 0);
    const durationMinutes = quizzes.reduce((max: number, quiz: any) => Math.max(max, getQuizDuration(quiz)), 0);
    const firstQuiz = quizzes.find((quiz: any) => quiz && typeof quiz === 'object');
    const bundleQuestions = firstDisplayValue(
        bundle?.questionCount,
        bundle?.questionsCount,
        bundle?.totalQuestions,
        bundle?.noOfQuestions,
        getPatternValue(patternSources, ['questions', 'questionCount', 'questionsCount', 'totalQuestions', 'noOfQuestions']),
        parsedPattern.questions !== '-' ? parsedPattern.questions : null,
        totalQuestions || null,
    );
    const bundleMarks = firstDisplayValue(
        bundle?.totalMarks,
        bundle?.maxMarks,
        bundle?.fullMarks,
        bundle?.marks,
        getPatternValue(patternSources, ['marks', 'totalMarks', 'maxMarks', 'fullMarks']),
        parsedPattern.marks !== '-' ? parsedPattern.marks : null,
        totalMarks || null,
    );
    const resolvedMarksPerQuestion = firstDisplayValue(
        bundle?.marksPerQuestion,
        bundle?.defaultMarks,
        bundle?.positiveMarks,
        bundle?.correctMarks,
        getPatternValue(patternSources, ['marksPerQuestion', 'defaultMarks', 'positiveMarks', 'correctMarks']),
        parsedPattern.marksPerQuestion !== '-' ? parsedPattern.marksPerQuestion : null,
        firstQuiz ? getQuizMarksPerQuestion(firstQuiz) || null : null,
        hasDisplayValue(bundleQuestions) && hasDisplayValue(bundleMarks) && Number(bundleQuestions) > 0
            ? (Number(bundleMarks) / Number(bundleQuestions)).toFixed(2)
            : null,
    );
    const resolvedNegativeMarking = firstDisplayValue(
        bundle?.negativeMarking?.value,
        bundle?.negativeMarking,
        bundle?.negativeMarks,
        bundle?.penalty,
        getPatternValue(patternSources, ['negativeMarking', 'negativeMarks', 'penalty']),
        parsedPattern.negativeMarking !== '-' ? parsedPattern.negativeMarking : null,
        firstQuiz ? getQuizNegativeMarking(firstQuiz) : null,
    );
    const resolvedDuration = firstDisplayValue(
        bundle?.durationMinutes,
        bundle?.duration,
        bundle?.timeLimit,
        getPatternValue(patternSources, ['duration', 'durationMinutes', 'timeLimit']),
        parsedPattern.duration !== '-' ? parsedPattern.duration : null,
        durationMinutes ? `${durationMinutes} min` : null,
    );
    const resolvedNote = firstDisplayValue(
        getPatternValue(patternSources, ['note', 'description', 'instruction']),
        parsedPattern.note !== '-' ? parsedPattern.note : null,
        bundle?.description?.trim(),
        'Tap a mock to continue.',
    );

    return {
        questions: hasDisplayValue(bundleQuestions) ? `${bundleQuestions}` : examPattern.questions,
        marks: hasDisplayValue(bundleMarks) ? `${bundleMarks}` : examPattern.marks,
        marksPerQuestion: hasDisplayValue(resolvedMarksPerQuestion) ? `${resolvedMarksPerQuestion}` : examPattern.marksPerQuestion,
        negativeMarking: hasDisplayValue(resolvedNegativeMarking) ? `${resolvedNegativeMarking}` : examPattern.negativeMarking,
        duration: hasDisplayValue(resolvedDuration) ? `${resolvedDuration}` : examPattern.duration,
        note: hasDisplayValue(resolvedNote) ? `${resolvedNote}` : examPattern.note,
    };
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
                totalMarks: getQuizTotalMarks(quiz),
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

const buildSelectedExam = (bundle: any, forceEnrolled = false) => {
    const normalizedBundle = getBundlePayload(bundle);
    const examMeta = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');

    return {
        ...examMeta,
        id: getBundleId(normalizedBundle),
        name: normalizedBundle?.title || normalizedBundle?.name || '',
        description: normalizedBundle?.description || '',
        quizIds: getBundleQuizzes(normalizedBundle),
        pattern: {
            ...examMeta.pattern,
            ...buildPatternFromBundle(normalizedBundle, examMeta.pattern),
        },
        quizGroups: buildQuizGroups(normalizedBundle),
        isEnrolled: Boolean(normalizedBundle?.isEnrolled) || forceEnrolled,
        rawBundle: normalizedBundle,
    };
};

const collectEnrolledBundleIds = (studentModules: any) => {
    let allCandidates: any[] = [];
    if (studentModules?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.bundles)];
    if (studentModules?.data?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.bundles)];
    if (studentModules?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.modules)];
    if (studentModules?.data?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.modules)];
    if (studentModules?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.items)];
    if (studentModules?.data?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.items)];
    if (studentModules?.data && Array.isArray(studentModules.data)) allCandidates = [...allCandidates, ...studentModules.data];
    if (Array.isArray(studentModules)) allCandidates = [...allCandidates, ...studentModules];

    return allCandidates.reduce((acc: string[], item: any) => {
        if (typeof item !== 'object' || item === null) return acc;

        const bundleId =
            item?.bundleId ||
            item?.bundle?.id ||
            item?.bundle?._id ||
            item?.id ||
            item?._id;
        const isEnrolled = item?.isEnrolled !== undefined ? Boolean(item?.isEnrolled) : true;

        if (bundleId && isEnrolled) {
            acc.push(String(bundleId));
        }

        return acc;
    }, []);
};

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const dispatch = useDispatch();
    const {
        bundleList,
        studentModules,
        bundleDetails,
        subBundleList,
        subBundleDetails,
        isLoading,
        status,
    } = useSelector((state: RootState) => state.MockTestReducer);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [selectedSubBundleExam, setSelectedSubBundleExam] = useState<any>(null);
    const [selectedBundle, setSelectedBundle] = useState<any>(null);
    const [showBundleActionModal, setShowBundleActionModal] = useState(false);
    const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
    const [_activeSubBundleId, setActiveSubBundleId] = useState<string | null>(null);
    const [pendingEnrollmentId, setPendingEnrollmentId] = useState<string | null>(null);

    const bundleItems = useMemo(() => getBundleItems(bundleList), [bundleList]);
    const subBundleItems = useMemo(() => getSubBundleItems(subBundleList), [subBundleList]);
    const enrolledBundleIds = useMemo(
        () => Array.from(new Set(collectEnrolledBundleIds(studentModules))),
        [studentModules],
    );
    useEffect(() => {
        dispatch(getBundleListRequest({ limit: 50, page: 1, ...(selectedModule ? { module: selectedModule } : {}) }));
    }, [dispatch, selectedModule]);

    useEffect(() => {
        dispatch(getStudentModulesRequest({}));

        return () => {
            dispatch(clearBundleFlowState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (!bundleDetails) {
            return;
        }

        const resolvedBundleId = String(getBundleId(bundleDetails) || activeBundleId || '');
        const isEnrolled = Boolean(bundleDetails?.isEnrolled) || (resolvedBundleId ? enrolledBundleIds.includes(resolvedBundleId) : false) || Boolean(selectedBundle?.isEnrolled);

        setSelectedExam(buildSelectedExam(bundleDetails, isEnrolled));
        if (resolvedBundleId) {
            setActiveBundleId(resolvedBundleId);
            dispatch(getSubBundleListRequest({ bundleId: resolvedBundleId }));
        }
    }, [activeBundleId, bundleDetails, dispatch, enrolledBundleIds, selectedBundle]);

    useEffect(() => {
        if (!subBundleDetails) {
            return;
        }

        const isEnrolled = Boolean(subBundleDetails?.isEnrolled) || Boolean(selectedExam?.isEnrolled) || (activeBundleId ? enrolledBundleIds.includes(activeBundleId) : false);
        setSelectedSubBundleExam(buildSelectedExam(subBundleDetails, isEnrolled));
    }, [activeBundleId, enrolledBundleIds, subBundleDetails, selectedExam]);

    useEffect(() => {
        if (status === enrollBundleSuccess.type || status === enrollBundleFailure.type) {
            setPendingEnrollmentId(null);
            
            if (status === enrollBundleSuccess.type && activeBundleId) {
                if (selectedBundle && String(getBundleId(selectedBundle)) === String(activeBundleId)) {
                    setSelectedBundle({ ...selectedBundle, isEnrolled: true });
                }
            }
        }
    }, [status, activeBundleId, selectedBundle]);

    const filteredExams = bundleItems.filter((bundle: any) => {
        const matchesSearch = (bundle?.title || bundle?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule = selectedModule ? ((bundle?.module && bundle.module === selectedModule) || (bundle?.title || bundle?.name || '').toLowerCase().includes(selectedModule.toLowerCase())) : true;
        return matchesSearch && matchesModule;
    });
    const isEnrollingBundle = isLoading && status === enrollBundleRequest.type;
    const detailScreen = selectedSubBundleExam || selectedExam;
    const showingSubBundle = Boolean(selectedSubBundleExam);
    const canAttemptMocks = Boolean(detailScreen?.isEnrolled);
    const showSubBundleList = Boolean(selectedExam) && !showingSubBundle && subBundleItems.length > 0;

    const renderIcon = (name: string, type: string, size: number, color: string) => {
        if (type === 'FontAwesome5') {
            return <FontAwesome5 name={name} size={size} color={color} />;
        }
        return <Feather name={name} size={size} color={color} />;
    };

    const handleQuizAction = (quiz: any) => {
        if (!detailScreen?.isEnrolled) {
            return;
        }

        const quizId = quiz?.id || getQuizId(quiz?.rawQuiz);
        if (!quizId) {
            return;
        }

        navigation.navigate('MockTestRules', {
            testId: quizId,
            testData: quiz?.rawQuiz || quiz,
        });
    };

    const openBundleDetails = (bundle: any, mode: 'view' | 'enroll') => {
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId = getBundleId(normalizedBundle);
        const resolvedBundleId = bundleId ? String(bundleId) : null;

        if (!resolvedBundleId) {
            return;
        }

        const alreadyEnrolled =
            Boolean(normalizedBundle?.isEnrolled) ||
            enrolledBundleIds.includes(resolvedBundleId);

        setShowBundleActionModal(false);
        setSelectedSubBundleExam(null);
        setActiveSubBundleId(null);
        setActiveBundleId(resolvedBundleId);

        if (alreadyEnrolled) {
            dispatch(bundleIDRequest({ id: resolvedBundleId }));
            return;
        }

        if (mode === 'enroll') {
            if (pendingEnrollmentId === resolvedBundleId) {
                return;
            }
            setPendingEnrollmentId(resolvedBundleId);
            dispatch(enrollBundleRequest({ id: resolvedBundleId }));
            return;
        }

        dispatch(bundleIDRequest({ id: resolvedBundleId }));
    };

    const handleBundlePress = (bundle: any) => {
        const normalizedBundle = getBundlePayload(bundle);
        const bundleId = getBundleId(normalizedBundle);
        const hasEnrolledAccess =
            Boolean(normalizedBundle?.isEnrolled) ||
            (bundleId ? enrolledBundleIds.includes(String(bundleId)) : false);

        setSelectedBundle({
            ...normalizedBundle,
            isEnrolled: hasEnrolledAccess,
        });
        setShowBundleActionModal(true);
    };

    const handleSubBundlePress = (subBundle: any) => {
        const normalizedSubBundle = getBundlePayload(subBundle);
        const subBundleId = getBundleId(normalizedSubBundle);

        if (!activeBundleId || !subBundleId) {
            return;
        }

        const resolvedSubBundleId = String(subBundleId);
        setActiveSubBundleId(resolvedSubBundleId);
        dispatch(getSubBundleDetailsRequest({
            bundleId: activeBundleId,
            subBundleId: resolvedSubBundleId,
        }));
    };

    const handleBackPress = () => {
        if (selectedSubBundleExam) {
            setSelectedSubBundleExam(null);
            setActiveSubBundleId(null);
            return;
        }

        if (selectedExam) {
            setSelectedExam(null);
            setActiveBundleId(null);
            setActiveSubBundleId(null);
            dispatch(clearBundleFlowState());
            return;
        }

        if (selectedModule) {
            setSelectedModule(null);
            return;
        }
    };

    if (detailScreen) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

                <View style={styles.detailHeader}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.detailHeaderContent}>
                            <Pressable onPress={handleBackPress} style={styles.backBtn}>
                                <Feather name="arrow-left" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                            <View style={styles.headerTextColumn}>
                                <Text style={styles.headerTagline}>{showingSubBundle ? 'SUB-BUNDLE' : 'EXAM CATEGORY'}</Text>
                                <Text style={styles.headerMainTitle}>{detailScreen.name}</Text>
                                <Text style={styles.detailSubtitle}>
                                    {showingSubBundle
                                        ? (detailScreen.isEnrolled ? 'You are enrolled. Start any mock below.' : 'Enroll in the parent bundle to unlock attempts.')
                                        : (detailScreen.isEnrolled ? 'Open any curriculum item below.' : 'Enroll once to unlock every mock in this course.')}
                                </Text>
                            </View>
                            <View style={styles.headerRightIcon}>
                                {renderIcon(detailScreen.icon, detailScreen.iconType, normalize(20), detailScreen.iconColor)}
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
                                    <Text style={styles.patternValue}>{detailScreen.pattern.questions}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FEF3C7' }]}>
                                    <Feather name="star" size={normalize(16)} color="#D97706" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Total Marks</Text>
                                    <Text style={styles.patternValue}>{detailScreen.pattern.marks}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#ECFDF5' }]}>
                                    <Feather name="check-circle" size={normalize(16)} color="#059669" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Marks / Question</Text>
                                    <Text style={styles.patternValue}>{detailScreen.pattern.marksPerQuestion}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FEE2E2' }]}>
                                    <Feather name="minus-circle" size={normalize(16)} color="#DC2626" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Negative Marking</Text>
                                    <Text style={styles.patternValue}>{detailScreen.pattern.negativeMarking}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#F5F3FF' }]}>
                                    <Feather name="clock" size={normalize(16)} color="#7C3AED" />
                                </View>
                                <View>
                                    <Text style={styles.patternLabel}>Duration</Text>
                                    <Text style={styles.patternValue}>{detailScreen.pattern.duration}</Text>
                                </View>
                            </View>

                            <View style={styles.patternItem}>
                                <View style={[styles.patternIconWrap, { backgroundColor: '#FFF7ED' }]}>
                                    <Feather name="book-open" size={normalize(16)} color="#EA580C" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.patternLabel}>Note</Text>
                                    <Text style={styles.patternValue} numberOfLines={2}>{detailScreen.pattern.note}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {showSubBundleList ? (
                        <>
                            <Text style={styles.sectionTitle}>Course Curriculum</Text>
                            <Text style={styles.subjectSubtitle}>
                                {`${subBundleItems.length} sub-bundle${subBundleItems.length === 1 ? '' : 's'} available in this bundle`}
                            </Text>

                            <View style={styles.subjectList}>
                                <View style={styles.quizCardsWrap}>
                                    {subBundleItems.map((subBundle: any, index: number) => {
                                        const normalizedSubBundle = getBundlePayload(subBundle);
                                        const mockCount = getBundleMockCount(normalizedSubBundle);

                                        return (
                                            <Pressable
                                                key={normalizedSubBundle?.id || normalizedSubBundle?._id || normalizedSubBundle?.bundleId || index}
                                                style={styles.quizCard}
                                                onPress={() => handleSubBundlePress(normalizedSubBundle)}
                                            >
                                                <View style={styles.quizBadge}>
                                                    <Text style={styles.quizBadgeText}>SUB-BUNDLE</Text>
                                                </View>

                                                <Text style={styles.quizCardTitle}>{normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}</Text>

                                                <View style={styles.quizMetaRow}>
                                                    <View style={styles.quizMetaItem}>
                                                        <Feather name="layers" size={normalize(14)} color="#667085" />
                                                        <Text style={styles.quizMetaText}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.quizActionButton}>
                                                    <Text style={styles.quizActionText}>Explore Curriculum</Text>
                                                    <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>Mock Sets</Text>
                            <Text style={styles.subjectSubtitle}>
                                {detailScreen.quizGroups?.length > 0
                                    ? `${detailScreen.quizIds?.length || 0} quizzes in this ${showingSubBundle ? 'sub-bundle' : 'category'}`
                                    : 'No quizzes returned from the API'}
                            </Text>

                            <View style={styles.subjectList}>
                                {detailScreen.quizGroups?.map((group: any, groupIndex: number) => (
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
                                                        <Text style={styles.quizPriceText}>Rs. {quiz.price || 0}</Text>
                                                    </View>

                                                    {canAttemptMocks ? (
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
                        </>
                    )}

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
                        {selectedModule && (
                            <Pressable onPress={handleBackPress} style={{ padding: 8, marginLeft: -8, marginBottom: 8 }}>
                                <Feather name="arrow-left" size={24} color="#FFFFFF" />
                            </Pressable>
                        )}
                        <Text style={styles.titleText}>{selectedModule ? `${selectedModule} Bundles` : 'Courses'}</Text>
                        <Text style={styles.subtitleText}>
                            {selectedModule ? 'Select a bundle to view details & enroll' : 'Select a bundle to view details and enroll'}
                        </Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={normalize(18)} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
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

                <>
                    <Text style={styles.allExamsTitle}>All Bundles</Text>

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
                </>

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
                            {selectedBundle?.isEnrolled
                                ? 'This bundle is already enrolled. Open the bundle to continue with its sub-bundles and mocks.'
                                : 'Choose `View` to open the bundle details, or `Enroll Now` to unlock attempts.'}
                        </Text>

                        {selectedBundle?.isEnrolled ? (
                            <Pressable
                                style={styles.modalPrimaryButton}
                                onPress={() => openBundleDetails(selectedBundle, 'view')}
                            >
                                <Feather name="layers" size={normalize(16)} color="#FFFFFF" />
                                <Text style={styles.modalPrimaryButtonText}>View Bundle</Text>
                            </Pressable>
                        ) : (
                            <>
                                <Pressable
                                    style={styles.modalSecondaryButton}
                                    onPress={() => openBundleDetails(selectedBundle, 'view')}
                                >
                                    <Feather name="eye" size={normalize(16)} color="#0F172A" />
                                    <Text style={styles.modalSecondaryButtonText}>View</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.modalPrimaryButton, pendingEnrollmentId ? styles.quizActionButtonDisabled : null]}
                                    disabled={Boolean(pendingEnrollmentId)}
                                    onPress={() => openBundleDetails(selectedBundle, 'enroll')}
                                >
                                    <Feather name="check-circle" size={normalize(16)} color="#FFFFFF" />
                                    <Text style={styles.modalPrimaryButtonText}>
                                        {pendingEnrollmentId === String(getBundleId(selectedBundle)) ? 'Enrolling...' : 'Enroll Now'}
                                    </Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    headerBackground: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(24),
        borderBottomRightRadius: normalize(24),
        paddingBottom: verticalScale(12),
    },
    topBar: {
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(12),
    },
    titleText: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: verticalScale(6),
    },
    subtitleText: {
        fontSize: normalize(13),
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: normalize(18),
    },
    scrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20),
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
        marginBottom: verticalScale(20),
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
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
    },
    statValue: {
        fontSize: normalize(16),
        fontWeight: '800',
    },
    statLabel: {
        fontSize: normalize(11),
        color: '#6B7280',
        fontWeight: '600',
        marginTop: verticalScale(2),
    },
    allExamsTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: verticalScale(16),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -normalize(8),
    },
    gridItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        paddingHorizontal: normalize(8),
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
        borderColor: '#FFFFFF',
    },
    examLabel: {
        fontSize: normalize(11),
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: normalize(15),
    },
    detailHeader: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20),
    },
    detailHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(20),
    },
    backBtn: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16),
    },
    headerTextColumn: {
        flex: 1,
    },
    headerTagline: {
        fontSize: normalize(10),
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1,
    },
    headerMainTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: verticalScale(2),
    },
    detailSubtitle: {
        fontSize: normalize(11),
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: verticalScale(4),
    },
    headerRightIcon: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: verticalScale(12),
    },
    patternCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        marginBottom: verticalScale(20),
    },
    patternGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -normalize(6),
    },
    patternItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(6),
        marginBottom: verticalScale(12),
    },
    patternIconWrap: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: normalize(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(8),
    },
    patternLabel: {
        fontSize: normalize(9),
        color: '#9CA3AF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    patternValue: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#1F2937',
        marginTop: verticalScale(1),
    },
    subjectSubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: -verticalScale(8),
        marginBottom: verticalScale(12),
    },
    subjectList: {
        marginBottom: verticalScale(20),
    },
    quizSection: {
        marginBottom: verticalScale(22),
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    topicDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#9AE6B4',
        marginRight: normalize(10),
    },
    topicTitle: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#475467',
    },
    quizCardsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: normalize(12),
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
        elevation: 4,
    },
    quizBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: verticalScale(12),
    },
    quizBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: '#667085',
    },
    quizCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1D2939',
        marginBottom: verticalScale(14),
    },
    quizMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: verticalScale(16),
    },
    quizMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    quizMetaText: {
        fontSize: normalize(12),
        color: '#667085',
        marginLeft: normalize(6),
        fontWeight: '600',
    },
    quizPriceText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#344054',
    },
    quizActionButton: {
        height: verticalScale(46),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    quizActionButtonDisabled: {
        opacity: 0.7,
    },
    quizActionText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
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
        gap: normalize(8),
    },
    quizViewOnlyText: {
        color: '#667085',
        fontSize: normalize(13),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(24),
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        padding: normalize(22),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: verticalScale(8),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(8),
    },
    modalDescription: {
        fontSize: normalize(13),
        color: '#475569',
        lineHeight: normalize(20),
        marginBottom: verticalScale(18),
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
        marginBottom: verticalScale(12),
    },
    modalSecondaryButtonText: {
        color: '#0F172A',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPrimaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
});

export default CoursesScreen;
