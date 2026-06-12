import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    AppStateStatus,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Colorpath from '../../Themes/Colorpath';
import { RootStackParamList } from '../../Navigator/StackNav';
import { clearStartTestState, clearTestResult, getTestResultRequest, startTestRequest, submitTestRequest } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { height } = Dimensions.get('window');

type MockTestQuestionScreenProps = StackScreenProps<RootStackParamList, 'MockTestQuestion'>;

const PAGE_BUFFER_SECONDS = 15;
const FIVE_MIN_WARNING_SECONDS = 5 * 60;
const SESSION_PREFIX = 'MOCK_TEST_SESSION_';
const DEFAULT_DURATION_SECONDS = 3 * 60;

type SessionState = {
    testId?: string | number;
    attemptId?: string | number | null;
    title?: string;
    startTimestamp: number;
    endTimestamp: number;
    durationSeconds: number;
    rawQuestions: any[];
    currentQuestionIndex: number;
    answers: Record<number, number>;
    visited: number[];
    review: number[];
    autoSubmitTriggered?: boolean;
};

const getSessionKey = (testId?: string | number) => `${SESSION_PREFIX}${String(testId || 'default')}`;

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

const getAttemptId = (response: any) =>
    response?.data?._id ||
    response?.data?.attemptId ||
    response?.attemptId ||
    response?.attempt?.id ||
    response?.attempt?._id ||
    response?.attempt?.attemptId ||
    response?.id ||
    response?._id ||
    null;

const getQuestions = (response: any) => {
    const possibleQuestions =
        response?.questions ||
        response?.quiz?.questions ||
        response?.attempt?.questions ||
        response?.data?.questions ||
        response?.data?.quiz?.questions;

    return Array.isArray(possibleQuestions) ? possibleQuestions : null;
};

const hasResultPayload = (result: any) => {
    const payload = result?.data || result;

    return Boolean(
        payload &&
        (
            Array.isArray(payload?.results) ||
            Array.isArray(payload?.review) ||
            Array.isArray(payload?.questions) ||
            payload?.score !== undefined ||
            payload?.maxScore !== undefined
        )
    );
};

const getDurationSeconds = (response: any, routeDuration?: string | number) => {
    const secondsValue = Number(
        firstDefined(
            response?.durationSeconds,
            response?.durationInSeconds,
            response?.timeLimitSeconds,
            response?.quiz?.durationSeconds,
            response?.attempt?.durationSeconds,
            response?.data?.durationSeconds,
        ),
    );

    if (Number.isFinite(secondsValue) && secondsValue > 0) {
        return secondsValue;
    }

    const minutesValue = Number(
        firstDefined(
            response?.durationMinutes,
            response?.duration,
            response?.timeLimit,
            response?.quiz?.durationMinutes,
            response?.quiz?.duration,
            response?.attempt?.durationMinutes,
            response?.data?.durationMinutes,
            routeDuration,
        ),
    );

    if (Number.isFinite(minutesValue) && minutesValue > 0) {
        return minutesValue * 60;
    }

    return DEFAULT_DURATION_SECONDS;
};

const formatClock = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainingSeconds = safeSeconds % 60;

    return [hours, minutes, remainingSeconds].map(unit => String(unit).padStart(2, '0')).join(':');
};

const mapQuestions = (rawQuestions: any[]) =>
    rawQuestions.map((q: any, i: number) => ({
        id: q.id || q._id || i,
        passage: q.passage || q.instructions || 'Read the question carefully and choose the correct option.',
        question: q.text || q.question || q.questionText || 'No question text provided.',
        options: Array.isArray(q.options)
            ? q.options
            : Array.isArray(q.choices)
                ? q.choices
                : ['Option A', 'Option B', 'Option C', 'Option D'],
        originalData: q,
    }));

const MockTestQuestionScreen = ({ route, navigation }: MockTestQuestionScreenProps) => {
    const { testId, duration, acceptedTerms } = route.params || {};
    const dispatch = useDispatch();
    const { startTestResponse, submitTestResponse, testResult, isLoading, error, status } = useSelector((state: RootState) => state.MockTestReducer);

    const [rawQuestions, setRawQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showPalette, setShowPalette] = useState(false);
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const [reviewed, setReviewed] = useState<Set<number>>(new Set());
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATION_SECONDS);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [sessionMeta, setSessionMeta] = useState<Pick<SessionState, 'attemptId' | 'title' | 'startTimestamp' | 'endTimestamp' | 'durationSeconds'> | null>(null);
    const [syncStatus, setSyncStatus] = useState<'saving' | 'saved' | 'offline'>('saved');
    const [isOnline, setIsOnline] = useState(true);

    const answersRef = useRef<Record<number, number>>({});
    const visitedRef = useRef<Set<number>>(new Set([0]));
    const reviewedRef = useRef<Set<number>>(new Set());
    const currentIndexRef = useRef(0);
    const sessionMetaRef = useRef<typeof sessionMeta>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const autoSubmitTriggeredRef = useRef(false);
    const submittingRef = useRef(false);
    const fiveMinuteWarningShownRef = useRef(false);
    const jumpPulse = useRef(new Animated.Value(0)).current;

    const mappedQuestions = useMemo(() => mapQuestions(rawQuestions), [rawQuestions]);
    const currentQ = mappedQuestions[currentQuestionIndex];
    const selectedOption = answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : null;
    const submittedAttemptId = getAttemptId(submitTestResponse) || sessionMeta?.attemptId || getAttemptId(startTestResponse);
    const questions = useMemo(() => Array.from({ length: mappedQuestions.length }, (_, i) => i + 1), [mappedQuestions.length]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        visitedRef.current = visited;
    }, [visited]);

    useEffect(() => {
        reviewedRef.current = reviewed;
    }, [reviewed]);

    useEffect(() => {
        currentIndexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex]);

    useEffect(() => {
        sessionMetaRef.current = sessionMeta;
    }, [sessionMeta]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);
            setIsOnline(online);
            setSyncStatus(online ? 'saved' : 'offline');
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(jumpPulse, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(jumpPulse, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [jumpPulse]);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const cachedSession = await AsyncStorage.getItem(getSessionKey(testId));
                if (!isMounted) {
                    return;
                }

                if (cachedSession) {
                    const parsed: SessionState = JSON.parse(cachedSession);
                    if (String(parsed?.testId) === String(testId) && parsed?.endTimestamp) {
                        setRawQuestions(Array.isArray(parsed.rawQuestions) ? parsed.rawQuestions : []);
                        setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
                        setAnswers(parsed.answers || {});
                        setVisited(new Set(parsed.visited?.length ? parsed.visited : [0]));
                        setReviewed(new Set(parsed.review || []));
                        setSessionMeta({
                            attemptId: parsed.attemptId ?? null,
                            title: parsed.title || 'Mock Test',
                            startTimestamp: parsed.startTimestamp,
                            endTimestamp: parsed.endTimestamp,
                            durationSeconds: parsed.durationSeconds || DEFAULT_DURATION_SECONDS,
                        });
                        autoSubmitTriggeredRef.current = Boolean(parsed.autoSubmitTriggered);
                        fiveMinuteWarningShownRef.current = Math.max(0, Math.ceil((parsed.endTimestamp - Date.now()) / 1000)) <= FIVE_MIN_WARNING_SECONDS;
                        setRemainingSeconds(Math.max(0, Math.ceil((parsed.endTimestamp - Date.now()) / 1000)));
                        setSessionLoaded(true);
                        return;
                    }
                }
            } catch {
                // Ignore broken cache and start fresh.
            }

            if (testId && !startTestResponse) {
                dispatch(clearStartTestState());
                dispatch(startTestRequest({ id: testId, acceptedTerms: Boolean(acceptedTerms) }));
            }
            setSessionLoaded(true);
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, [dispatch, testId]);

    useEffect(() => {
        if (!sessionLoaded || sessionMetaRef.current) {
            return;
        }

        const initialAttemptId = getAttemptId(startTestResponse);
        if (!initialAttemptId && !getQuestions(startTestResponse)) {
            return;
        }

        const questionsFromResponse = getQuestions(startTestResponse) || [];
        const durationSeconds = getDurationSeconds(startTestResponse, duration);
        const now = Date.now();

        setRawQuestions(questionsFromResponse);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setVisited(new Set([0]));
        setReviewed(new Set());
        setSessionMeta({
            attemptId: initialAttemptId,
            title: startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test',
            startTimestamp: now,
            endTimestamp: now + durationSeconds * 1000,
            durationSeconds,
        });
        fiveMinuteWarningShownRef.current = false;
        setRemainingSeconds(durationSeconds);
    }, [sessionLoaded, startTestResponse]);

    useEffect(() => {
        if (!sessionLoaded || !sessionMeta) {
            return;
        }

        const payload: SessionState = {
            testId,
            attemptId: sessionMeta.attemptId,
            title: sessionMeta.title,
            startTimestamp: sessionMeta.startTimestamp,
            endTimestamp: sessionMeta.endTimestamp,
            durationSeconds: sessionMeta.durationSeconds,
            rawQuestions,
            currentQuestionIndex,
            answers,
            visited: Array.from(visited),
            review: Array.from(reviewed),
            autoSubmitTriggered: autoSubmitTriggeredRef.current,
        };

        let cancelled = false;

        const persistSession = async () => {
            setSyncStatus(isOnline ? 'saving' : 'offline');
            await AsyncStorage.setItem(getSessionKey(testId), JSON.stringify(payload));
            if (!cancelled) {
                setSyncStatus(isOnline ? 'saved' : 'offline');
            }
        };

        persistSession();

        return () => {
            cancelled = true;
        };
    }, [answers, currentQuestionIndex, isOnline, rawQuestions, reviewed, sessionLoaded, sessionMeta, testId, visited]);

    useEffect(() => {
        setVisited(prev => {
            const next = new Set(prev);
            next.add(currentQuestionIndex);
            return next;
        });
    }, [currentQuestionIndex]);

    const submitLatestAnswers = async (autoTriggered = false) => {
        if (submittingRef.current) {
            return;
        }

        const activeAttemptId = sessionMetaRef.current?.attemptId || getAttemptId(startTestResponse);
        if (!activeAttemptId) {
            Toast.show({ type: 'error', text1: 'Test session is not ready yet. Please try again.' });
            return;
        }

        const formattedAnswers = Object.keys(answersRef.current).map(index => {
            const questionIndex = Number(index);
            const question = mappedQuestions[questionIndex];
            const selectedIndex = answersRef.current[questionIndex];
            const optionData = question?.options?.[selectedIndex];

            let answerValue = ['A', 'B', 'C', 'D', 'E', 'F'][selectedIndex] || String(selectedIndex);
            if (typeof optionData === 'object' && optionData !== null) {
                answerValue = optionData.id || optionData._id || optionData.value || answerValue;
            }

            return {
                questionId: question?.id,
                selectedAnswer: answerValue,
                isMarkedForReview: reviewedRef.current.has(questionIndex),
            };
        });

        autoSubmitTriggeredRef.current = autoTriggered || autoSubmitTriggeredRef.current;
        submittingRef.current = true;
        setIsSubmittingExam(true);
        dispatch(submitTestRequest({ id: activeAttemptId, answers: formattedAnswers }));
    };

    useEffect(() => {
        if (!sessionMeta) {
            return;
        }

        const tick = () => {
            const secondsLeft = Math.max(0, Math.ceil((sessionMeta.endTimestamp - Date.now()) / 1000));
            setRemainingSeconds(secondsLeft);

            if (secondsLeft <= FIVE_MIN_WARNING_SECONDS && secondsLeft > PAGE_BUFFER_SECONDS && !fiveMinuteWarningShownRef.current) {
                fiveMinuteWarningShownRef.current = true;
                Toast.show({
                    type: 'error',
                    text1: '5 minutes left',
                    text2: 'Please submit before the timeline ends. Your test will auto-submit near timeout.',
                });
            }

            if (secondsLeft <= PAGE_BUFFER_SECONDS && !autoSubmitTriggeredRef.current) {
                submitLatestAnswers(true);
            }
        };

        tick();
        const timerId = setInterval(tick, 1000);

        return () => clearInterval(timerId);
    }, [sessionMeta]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            const previousState = appStateRef.current;
            appStateRef.current = nextState;

            if ((previousState === 'background' || previousState === 'inactive') && nextState === 'active' && sessionMetaRef.current) {
                const secondsLeft = Math.max(0, Math.ceil((sessionMetaRef.current.endTimestamp - Date.now()) / 1000));
                setRemainingSeconds(secondsLeft);
                if (secondsLeft <= PAGE_BUFFER_SECONDS && !autoSubmitTriggeredRef.current) {
                    submitLatestAnswers(true);
                }
            }
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && submittedAttemptId && hasResultPayload(testResult)) {
            const finishFlow = async () => {
                await AsyncStorage.removeItem(getSessionKey(testId));
                autoSubmitTriggeredRef.current = false;
                submittingRef.current = false;
                setIsSubmittingExam(false);
                navigation.replace('MockResult', { attemptId: submittedAttemptId });
            };

            finishFlow();
        }
    }, [isSubmittingExam, navigation, submittedAttemptId, submitTestResponse, testId, testResult]);

    useEffect(() => {
        if (!isSubmittingExam || !submitTestResponse || !submittedAttemptId) {
            return;
        }

        const fallbackId = setTimeout(async () => {
            await AsyncStorage.removeItem(getSessionKey(testId));
            autoSubmitTriggeredRef.current = false;
            submittingRef.current = false;
            setIsSubmittingExam(false);
            navigation.replace('MockResult', { attemptId: submittedAttemptId });
        }, 3000);

        return () => clearTimeout(fallbackId);
    }, [isSubmittingExam, navigation, submitTestResponse, submittedAttemptId, testId]);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && !hasResultPayload(testResult)) {
            const resultId = submitTestResponse?.data?._id || submitTestResponse?._id || submittedAttemptId;
            if (resultId && status !== 'MockTest/getTestResultRequest') {
                dispatch(getTestResultRequest({ id: resultId }));
            }
        }
    }, [dispatch, isSubmittingExam, status, submitTestResponse, submittedAttemptId, testResult]);

    useEffect(() => {
        if (!isSubmittingExam || !error) {
            return;
        }

        submittingRef.current = false;
        setIsSubmittingExam(false);

        if (autoSubmitTriggeredRef.current) {
            const retryId = setTimeout(() => {
                if (isOnline) {
                    submitLatestAnswers(true);
                }
            }, 3000);

            return () => clearTimeout(retryId);
        }
    }, [error, isOnline, isSubmittingExam]);

    const handleNext = () => {
        if (currentQuestionIndex < mappedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            submitLatestAnswers(false);
        }
    };

    const handlePrev = () => {
        if (isSubmittingExam) {
            return;
        }
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSelectOption = (index: number) => {
        if (isSubmittingExam) {
            return;
        }

        setAnswers(prev => {
            if (prev[currentQuestionIndex] === index) {
                const next = { ...prev };
                delete next[currentQuestionIndex];
                return next;
            }

            return { ...prev, [currentQuestionIndex]: index };
        });
        setVisited(prev => {
            const next = new Set(prev);
            next.add(currentQuestionIndex);
            return next;
        });
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowPalette(false);
    };

    const handleClearResponse = () => {
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentQuestionIndex];
            return next;
        });
    };

    const handleToggleReview = () => {
        setReviewed(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestionIndex)) {
                next.delete(currentQuestionIndex);
            } else {
                next.add(currentQuestionIndex);
            }
            return next;
        });
    };

    if (isSubmittingExam) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />
                <View style={styles.headerBackground}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <ShimmerPlaceholder style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 8 }} />
                            <ShimmerPlaceholder style={{ width: 180, height: 28, borderRadius: 6 }} />
                        </View>
                    </SafeAreaView>
                </View>
                <View style={{ padding: normalize(24), paddingTop: verticalScale(40) }}>
                    <ShimmerPlaceholder style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 24 }} />
                    <ShimmerPlaceholder style={{ width: 80, height: 20, borderRadius: 6, marginBottom: 16 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 24, borderRadius: 6, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '80%', height: 24, borderRadius: 6, marginBottom: 32 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 50, borderRadius: 8, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 50, borderRadius: 8, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 50, borderRadius: 8, marginBottom: 12 }} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 50, borderRadius: 8 }} />
                </View>

                {/* Modern Professional Loading UI Overlay */}
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={Colorpath.Primary} style={styles.loadingSpinner} />
                        <Text style={styles.loadingOverlayTitle}>Preparing Result...</Text>
                        <Text style={styles.loadingOverlaySubtitle}>Analyzing your performance</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>{sessionMeta?.title || startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test'}</Text>
                        <Pressable style={styles.jumpButton} onPress={() => setShowPalette(!showPalette)}>
                            <Animated.Text
                                style={[
                                    styles.jumpButtonText,
                                    {
                                        opacity: jumpPulse.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.7, 1],
                                        }),
                                        transform: [
                                            {
                                                scale: jumpPulse.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [1, 1.08],
                                                }),
                                            },
                                        ],
                                    },
                                ]}>
                                Jump
                            </Animated.Text>
                            <Icon name="grid" size={normalize(22)} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.subHeader}>
                <View style={styles.qCountBadge}>
                    <Text style={styles.qCountText}>Q {currentQuestionIndex + 1} / {mappedQuestions.length}</Text>
                </View>
                <View style={styles.subHeaderRight}>
                    <View style={[styles.syncBadge, !isOnline && styles.syncBadgeOffline]}>
                        <View style={[styles.syncDot, !isOnline && styles.syncDotOffline]} />
                        <Text style={[styles.syncText, !isOnline && styles.syncTextOffline]}>
                            {!isOnline ? 'Saved Offline' : syncStatus === 'saving' ? 'Saving...' : 'Saved'}
                        </Text>
                    </View>
                    <View style={styles.timerBadge}>
                        <Icon name="clock" size={normalize(14)} color="#FFFFFF" />
                        <Text style={styles.timerText}>{formatClock(remainingSeconds)}</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading && mappedQuestions.length === 0 ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colorpath.Primary} />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading questions...</Text>
                    </View>
                ) : mappedQuestions.length === 0 ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center', paddingHorizontal: normalize(24) }}>
                        <Text style={{ color: '#6B7280', textAlign: 'center' }}>No questions were returned for this test yet.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.passageContainer}>
                            <Text style={styles.passageLabel}>READ CAREFULLY</Text>
                            <Text style={styles.passageText}>{currentQ?.passage}</Text>
                        </View>

                        <View style={styles.questionSection}>
                            <View style={styles.qTag}>
                                <Text style={styles.qTagText}>Q {currentQuestionIndex + 1}</Text>
                            </View>
                            <Text style={styles.questionText}>{currentQ?.question}</Text>
                        </View>

                        <View style={styles.optionsContainer}>
                            {currentQ?.options?.map((option: any, index: number) => (
                                <Pressable
                                    key={index}
                                    style={[
                                        styles.optionContainer,
                                        selectedOption === index && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelectOption(index)}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        selectedOption === index && styles.radioCircleSelected,
                                    ]}>
                                        {selectedOption === index && <View style={styles.radioDot} />}
                                    </View>
                                    <Text style={styles.optionLetter}>{['(A)', '(B)', '(C)', '(D)', '(E)', '(F)'][index]}</Text>
                                    <Text style={styles.optionText}>{typeof option === 'string' ? option : option?.text || option?.value || 'Option'}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>
                <Pressable style={[styles.prevButton, isSubmittingExam && styles.disabledButton]} onPress={handlePrev} disabled={isSubmittingExam}>
                    <Icon name="chevron-left" size={normalize(18)} color="#4B5563" />
                    <Text style={styles.prevButtonText}>Prev</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.reviewButton,
                        reviewed.has(currentQuestionIndex) && styles.reviewButtonActive,
                        isSubmittingExam && styles.disabledButton,
                    ]}
                    onPress={handleToggleReview}
                    disabled={isSubmittingExam}
                >
                    <Icon name="bookmark" size={normalize(16)} color={reviewed.has(currentQuestionIndex) ? '#FFFFFF' : '#D97706'} style={styles.reviewIcon} />
                    <Text style={[styles.reviewButtonText, reviewed.has(currentQuestionIndex) && styles.reviewButtonTextActive]}>
                        {reviewed.has(currentQuestionIndex) ? 'Marked' : 'Review'}
                    </Text>
                </Pressable>

                <Pressable style={[styles.nextButton, isSubmittingExam && styles.submittingButton]} onPress={handleNext} disabled={isSubmittingExam}>
                    {isSubmittingExam ? (
                        <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.nextButtonText}>Preparing Result...</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.nextButtonText}>{currentQuestionIndex === mappedQuestions.length - 1 ? 'Submit Exam' : 'Next'}</Text>
                            <Icon name={currentQuestionIndex === mappedQuestions.length - 1 ? 'check' : 'chevron-right'} size={normalize(18)} color="#FFFFFF" />
                        </>
                    )}
                </Pressable>
            </View>

            {showPalette && (
                <View style={styles.paletteOverlay}>
                    <Pressable style={styles.paletteBg} onPress={() => setShowPalette(false)} />
                    <View style={styles.paletteContainer}>
                        <View style={styles.paletteHeader}>
                            <Text style={styles.paletteTitle}>Question Palette</Text>
                            <Pressable onPress={() => setShowPalette(false)}>
                                <Icon name="x" size={normalize(20)} color="#111827" />
                            </Pressable>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.gridContainer}>
                                {questions.map((questionNumber) => {
                                    const index = questionNumber - 1;
                                    const hasAnswer = answers[index] !== undefined;
                                    const isReview = reviewed.has(index);
                                    const isCurrent = index === currentQuestionIndex;
                                    const isVisited = visited.has(index);

                                    let boxStyle = styles.gridBox;
                                    let textStyle = styles.gridText;

                                    if (isCurrent) {
                                        boxStyle = { ...styles.gridBox, ...styles.gridCurrent };
                                        textStyle = { ...styles.gridText, ...styles.gridTextCurrent };
                                    } else if (hasAnswer && isReview) {
                                        boxStyle = { ...styles.gridBox, ...styles.gridAnsweredMarked };
                                        textStyle = { ...styles.gridText, ...styles.gridTextAnswered };
                                    } else if (isReview) {
                                        boxStyle = { ...styles.gridBox, ...styles.gridReview };
                                        textStyle = { ...styles.gridText, ...styles.gridTextReview };
                                    } else if (hasAnswer) {
                                        boxStyle = { ...styles.gridBox, ...styles.gridAnswered };
                                        textStyle = { ...styles.gridText, ...styles.gridTextAnswered };
                                    } else if (isVisited) {
                                        boxStyle = { ...styles.gridBox, ...styles.gridSkipped };
                                        textStyle = { ...styles.gridText, ...styles.gridTextSkipped };
                                    }

                                    return (
                                        <Pressable
                                            key={questionNumber}
                                            style={boxStyle}
                                            onPress={() => handleJumpToQuestion(index)}
                                        >
                                            <Text style={textStyle}>{questionNumber}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        <View style={styles.paletteLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridCurrent]} />
                                <Text style={styles.legendText}>Current</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridAnswered]} />
                                <Text style={styles.legendText}>Attempted</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridReview]} />
                                <Text style={styles.legendText}>Review</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.gridAnsweredMarked]} />
                                <Text style={styles.legendText}>Ans + Review</Text>
                            </View>
                        </View>
                        <View style={styles.paletteFooter}>
                            <Pressable style={[styles.footerBtnOutline, isSubmittingExam && styles.disabledButton]} disabled={isSubmittingExam} onPress={handleClearResponse}>
                                <Text style={styles.footerBtnText}>Clear Response</Text>
                            </Pressable>
                            <Pressable style={[styles.footerBtnSolid, isSubmittingExam && styles.submittingButton]} disabled={isSubmittingExam} onPress={() => {
                                setShowPalette(false);
                                handleNext();
                            }}>
                                {isSubmittingExam ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.footerBtnSolidText}>{currentQuestionIndex === mappedQuestions.length - 1 ? 'Submit Exam' : 'Save & Next'}</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    headerBackground: { backgroundColor: Colorpath.Primary },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingTop: verticalScale(10), paddingBottom: verticalScale(16) },
    iconButton: { padding: normalize(4) },
    jumpButton: { flexDirection: 'row', alignItems: 'center', padding: normalize(4) },
    jumpButtonText: { color: '#FF4D4F', fontSize: normalize(14), fontWeight: '800', marginRight: normalize(8) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingVertical: verticalScale(16), backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    qCountBadge: { paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), backgroundColor: '#F3F4F6', borderRadius: normalize(12) },
    qCountText: { fontSize: normalize(14), fontWeight: 'bold', color: Colorpath.Primary },
    subHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
    syncBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: normalize(10), paddingVertical: verticalScale(6), borderRadius: normalize(12) },
    syncBadgeOffline: { backgroundColor: '#FEF2F2' },
    syncDot: { width: normalize(7), height: normalize(7), borderRadius: normalize(4), backgroundColor: '#10B981', marginRight: normalize(6) },
    syncDotOffline: { backgroundColor: '#EF4444' },
    syncText: { color: '#047857', fontSize: normalize(11), fontWeight: '700' },
    syncTextOffline: { color: '#B91C1C' },
    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), borderRadius: normalize(12), gap: normalize(6) },
    timerText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: 'bold' },
    scrollContent: { paddingHorizontal: normalize(24), paddingTop: verticalScale(20), paddingBottom: verticalScale(100) },
    passageContainer: { backgroundColor: '#EEF2FF', padding: normalize(16), borderRadius: normalize(12), marginBottom: verticalScale(24), borderWidth: 1, borderColor: '#EEF2FF', borderLeftWidth: normalize(6), borderLeftColor: '#F59E0B' },
    passageLabel: { fontSize: normalize(11), fontWeight: 'bold', color: '#B45309', marginBottom: verticalScale(8), letterSpacing: 0.5 },
    passageText: { fontSize: normalize(14), color: '#92400E', lineHeight: normalize(22) },
    questionSection: { marginBottom: verticalScale(24) },
    qTag: { backgroundColor: '#EEF2FF', paddingHorizontal: normalize(10), paddingVertical: verticalScale(4), borderRadius: normalize(8), alignSelf: 'flex-start', marginBottom: verticalScale(12) },
    qTagText: { color: '#4F46E5', fontSize: normalize(12), fontWeight: 'bold' },
    questionText: { fontSize: normalize(16), color: '#111827', fontWeight: '600', lineHeight: normalize(24) },
    optionsContainer: { gap: verticalScale(12) },
    optionContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(16), paddingVertical: verticalScale(12), borderRadius: normalize(8), borderWidth: 1, borderColor: '#EEF2FF', borderLeftWidth: normalize(6), borderLeftColor: '#EEF2FF', backgroundColor: '#FFFFFF' },
    optionSelected: { borderColor: Colorpath.Primary, borderLeftColor: Colorpath.Primary, backgroundColor: '#FFFFFF' },
    radioCircle: { width: normalize(20), height: normalize(20), borderRadius: normalize(10), borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: normalize(12) },
    radioCircleSelected: { borderColor: '#D97706' },
    radioDot: { width: normalize(10), height: normalize(10), borderRadius: normalize(5), backgroundColor: Colorpath.Primary },
    optionLetter: { fontSize: normalize(15), color: '#374151', fontWeight: '600', marginRight: normalize(8) },
    optionText: { fontSize: normalize(15), color: '#374151', flex: 1 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
    prevButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10), paddingHorizontal: normalize(12) },
    prevButtonText: { color: '#4B5563', fontSize: normalize(15), fontWeight: '600', marginLeft: normalize(4) },
    reviewButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10), paddingHorizontal: normalize(20), borderRadius: normalize(10), borderWidth: 1, borderColor: '#F59E0B' },
    reviewButtonActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
    reviewIcon: { marginRight: normalize(6) },
    reviewButtonText: { color: '#D97706', fontSize: normalize(14), fontWeight: 'bold' },
    reviewButtonTextActive: { color: '#FFFFFF' },
    nextButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(10), paddingHorizontal: normalize(24), borderRadius: normalize(10), marginLeft: normalize(12) },
    nextButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold', marginRight: normalize(4) },
    disabledButton: { opacity: 0.6 },
    submittingButton: { minWidth: normalize(150), justifyContent: 'center' },
    paletteOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
    paletteBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    paletteContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.6, backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), paddingBottom: verticalScale(20) },
    paletteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    paletteTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#111827' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(10), justifyContent: 'flex-start' },
    gridBox: { width: normalize(40), height: normalize(40), borderRadius: normalize(8), backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    gridAnswered: { backgroundColor: '#10B981', borderWidth: 0 },
    gridAnsweredMarked: { backgroundColor: '#4F46E5', borderWidth: 0 },
    gridCurrent: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: Colorpath.Secondary },
    gridReview: { backgroundColor: '#FFF7ED', borderWidth: 2, borderColor: '#F59E0B' },
    gridSkipped: { backgroundColor: '#FEF3C7', borderWidth: 0 },
    gridText: { fontSize: normalize(14), color: '#4B5563', fontWeight: '600' },
    gridTextAnswered: { color: '#FFFFFF' },
    gridTextCurrent: { color: Colorpath.Secondary },
    gridTextReview: { color: '#D97706' },
    gridTextSkipped: { color: '#B45309' },
    paletteLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(12), marginTop: verticalScale(18) },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: normalize(14), height: normalize(14), borderRadius: normalize(4), marginRight: normalize(6) },
    legendText: { color: '#4B5563', fontSize: normalize(11), fontWeight: '600' },
    paletteFooter: { flexDirection: 'row', gap: normalize(12), marginTop: verticalScale(20) },
    footerBtnOutline: { flex: 1, paddingVertical: verticalScale(14), borderRadius: normalize(10), borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
    footerBtnText: { color: '#374151', fontSize: normalize(14), fontWeight: '600' },
    footerBtnSolid: { flex: 1, backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(10), alignItems: 'center' },
    footerBtnSolidText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: '600' },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(16),
        paddingHorizontal: normalize(32),
        paddingVertical: verticalScale(32),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        width: '80%',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    loadingSpinner: {
        marginBottom: verticalScale(20),
        transform: [{ scale: 1.2 }],
    },
    loadingOverlayTitle: {
        fontSize: normalize(18),
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    loadingOverlaySubtitle: {
        fontSize: normalize(13),
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default MockTestQuestionScreen;
