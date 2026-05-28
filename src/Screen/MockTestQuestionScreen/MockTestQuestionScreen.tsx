import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { startTestRequest, submitTestRequest, getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import Toast from 'react-native-toast-message';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const ShimmerPlaceholder = createShimmerPlaceholder();

const { height } = Dimensions.get('window');

type MockTestQuestionScreenProps = StackScreenProps<RootStackParamList, 'MockTestQuestion'>;

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

const MockTestQuestionScreen = ({ route, navigation }: MockTestQuestionScreenProps) => {
    const { testId } = route.params || {};
    const dispatch = useDispatch();
    const { startTestResponse, submitTestResponse, testResult, isLoading, error, status } = useSelector((state: RootState) => state.MockTestReducer);
    const attemptId = getAttemptId(startTestResponse);
    const submittedAttemptId = getAttemptId(submitTestResponse) || attemptId;

    useEffect(() => {
        if (testId) {
            dispatch(startTestRequest({ id: testId }));
        }
    }, [testId, dispatch]);
    const testData = [
        {
            id: 1,
            passage: "In a frictionless physics laboratory setup, object A of mass 2kg moving at 10 m/s collides with object B of mass 3kg which is initially at rest. The collision is completely inelastic, and both objects stick together post-collision moving together along the same path.",
            question: "Which of the following statement about the hybridization of Carbon in ethyne (C2H2) is correct?",
            options: ['sp³ hybridized with bond angle 109.5°', 'sp² hybridized with bond angle 120°', 'sp hybridized with bond angle 180°', 'sp² hybridized with bond angle 109.5°'],
        },
        {
            id: 2,
            passage: "A light ray travels from air (n=1) into a glass block (n=1.5). The angle of incidence is 45 degrees.",
            question: "What is the approximate angle of refraction inside the glass?",
            options: ['28 degrees', '30 degrees', '35 degrees', '45 degrees'],
        },
        {
            id: 3,
            passage: "A block of mass 5kg is placed on a rough horizontal surface. The coefficient of static friction is 0.4.",
            question: "What is the minimum horizontal force required to just move the block? (Take g = 10 m/s²)",
            options: ['10 N', '15 N', '20 N', '25 N'],
        },
        {
            id: 4,
            passage: "A simple pendulum has a time period of 2 seconds on the surface of the Earth.",
            question: "What will be its time period if it is taken to a planet where acceleration due to gravity is 4 times that of Earth?",
            options: ['0.5 s', '1 s', '2 s', '4 s'],
        },
        {
            id: 5,
            passage: "An ideal gas undergoes an isothermal expansion at temperature T.",
            question: "Which of the following statements is true about the change in internal energy (ΔU) of the gas?",
            options: ['ΔU > 0', 'ΔU < 0', 'ΔU = 0', 'Depends on volume'],
        }
    ];

    const rawQuestions = getQuestions(startTestResponse) || testData;

    const mappedQuestions = rawQuestions.map((q: any, i: number) => ({
        id: q.id || q._id || i,
        passage: q.passage || q.instructions || "Read the question carefully and choose the correct option.",
        question: q.text || q.question || q.questionText || "No question text provided.",
        options: Array.isArray(q.options)
            ? q.options
            : Array.isArray(q.choices)
                ? q.choices
                : ['Option A', 'Option B', 'Option C', 'Option D'],
        originalData: q
    }));

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showPalette, setShowPalette] = useState(false);
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);

    useEffect(() => {
        setVisited(prev => new Set(prev).add(currentQuestionIndex));
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && submittedAttemptId && hasResultPayload(testResult)) {
            setIsSubmittingExam(false);
            navigation.replace('MockResult', { attemptId: submittedAttemptId });
        }
    }, [isSubmittingExam, submitTestResponse, testResult, submittedAttemptId, navigation]);

    useEffect(() => {
        if (!isSubmittingExam || !submitTestResponse || !submittedAttemptId) {
            return;
        }

        const fallbackId = setTimeout(() => {
            setIsSubmittingExam(false);
            navigation.replace('MockResult', { attemptId: submittedAttemptId });
        }, 3000); // Increased fallback time slightly to accommodate two API calls

        return () => clearTimeout(fallbackId);
    }, [isSubmittingExam, submitTestResponse, submittedAttemptId, navigation]);

    useEffect(() => {
        if (isSubmittingExam && submitTestResponse && !hasResultPayload(testResult)) {
            const resultId = submitTestResponse?.data?._id || submitTestResponse?._id || submittedAttemptId;
            if (resultId && status !== 'MockTest/getTestResultRequest') {
                dispatch(getTestResultRequest({ id: resultId }));
            }
        }
    }, [isSubmittingExam, submitTestResponse, testResult, status, submittedAttemptId, dispatch]);

    useEffect(() => {
        if (isSubmittingExam && error) {
            setIsSubmittingExam(false);
        }
    }, [isSubmittingExam, error]);

    const currentQ = mappedQuestions[currentQuestionIndex];
    const selectedOption = answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : null;

    const questions = Array.from({ length: mappedQuestions.length }, (_, i) => i + 1);

    const handleNext = () => {
        if (currentQuestionIndex < mappedQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (isSubmittingExam) {
            return;
        }

        if (!attemptId) {
            if (testId) {
                dispatch(startTestRequest({ id: testId }));
            }
            Toast.show({ type: 'error', text1: 'Test session is not ready yet. Please try again.' });
            return;
        }

        const formattedAnswers = Object.keys(answers).map(index => {
            const q = mappedQuestions[index as any];
            const selOption = answers[index as any];
            const optionData = q.options?.[selOption];
            
            let answerValue = ['A', 'B', 'C', 'D', 'E', 'F'][selOption] || String(selOption);
            
            if (typeof optionData === 'object' && optionData !== null) {
                answerValue = optionData.id || optionData._id || answerValue;
            }

            return {
                questionId: q.id,
                selectedAnswer: answerValue,
                isMarkedForReview: false
            };
        });

        setIsSubmittingExam(true);
        dispatch(submitTestRequest({ id: attemptId, answers: formattedAnswers }));
    };

    const handlePrev = () => {
        if (isSubmittingExam) {
            return;
        }
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSelectOption = (index: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }));
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
                        <Text style={styles.headerTitle}>{startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test'}</Text>
                        <Pressable style={styles.iconButton} onPress={() => setShowPalette(!showPalette)}>
                            <Icon name="grid" size={normalize(22)} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.subHeader}>
                <View style={styles.qCountBadge}>
                    <Text style={styles.qCountText}>Q {currentQuestionIndex + 1} / {mappedQuestions.length}</Text>
                </View>
                <View style={styles.timerBadge}>
                    <Icon name="clock" size={normalize(14)} color="#FFFFFF" />
                    <Text style={styles.timerText}>01:45:00</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading && mappedQuestions.length === testData.length ? (
                    <View style={{ marginTop: verticalScale(40), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colorpath.Primary} />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading questions...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.passageContainer}>
                            <Text style={styles.passageLabel}>READ CAREFULLY</Text>
                            <Text style={styles.passageText}>
                                {currentQ?.passage}
                            </Text>
                        </View>

                        <View style={styles.questionSection}>
                            <View style={styles.qTag}>
                                <Text style={styles.qTagText}>Q {currentQuestionIndex + 1}</Text>
                            </View>
                            <Text style={styles.questionText}>
                                {currentQ?.question}
                            </Text>
                        </View>

                        <View style={styles.optionsContainer}>
                            {currentQ?.options?.map((option: any, index: number) => (
                                <Pressable
                                    key={index}
                                    style={[
                                        styles.optionContainer,
                                        selectedOption === index && styles.optionSelected
                                    ]}
                                    onPress={() => handleSelectOption(index)}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        selectedOption === index && styles.radioCircleSelected
                                    ]}>
                                        {selectedOption === index && <View style={styles.radioDot} />}
                                    </View>
                                    <Text style={styles.optionLetter}>{['(A)', '(B)', '(C)', '(D)', '(E)', '(F)'][index]}</Text>
                                    <Text style={styles.optionText}>
                                        {typeof option === 'string' ? option : option?.text || option?.value || 'Option'}
                                    </Text>
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

                <Pressable style={[styles.reviewButton, isSubmittingExam && styles.disabledButton]} disabled={isSubmittingExam}>
                    <Icon name="bookmark" size={normalize(16)} color="#D97706" style={styles.reviewIcon} />
                    <Text style={styles.reviewButtonText}>Review</Text>
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
                            <Icon name={currentQuestionIndex === mappedQuestions.length - 1 ? "check" : "chevron-right"} size={normalize(18)} color="#FFFFFF" />
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
                                {questions.map((q) => {
                                    let type = 'unanswered';
                                    let displayText: string | number = q;

                                    if (answers[q - 1] !== undefined) {
                                        type = 'answered';
                                    } else if (visited.has(q - 1) && q - 1 !== currentQuestionIndex) {
                                        type = 'skipped';
                                        displayText = 'S';
                                    }

                                    if (q - 1 === currentQuestionIndex) {
                                        type = 'current';
                                    }

                                    return (
                                        <View key={q} style={[
                                            styles.gridBox,
                                            type === 'answered' && { backgroundColor: '#10B981', borderWidth: 0 },
                                            type === 'skipped' && { backgroundColor: '#FACC15', borderWidth: 0 },
                                            type === 'current' && styles.gridCurrent
                                        ]}>
                                            <Text style={[
                                                styles.gridText,
                                                type === 'answered' && { color: '#FFFFFF' },
                                                type === 'skipped' && { color: '#FFFFFF', fontWeight: 'bold' },
                                                type === 'current' && styles.gridTextCurrent
                                            ]}>{displayText}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        <View style={styles.paletteFooter}>
                            <Pressable style={[styles.footerBtnOutline, isSubmittingExam && styles.disabledButton]} disabled={isSubmittingExam} onPress={() => {
                                const newAnswers = { ...answers };
                                delete newAnswers[currentQuestionIndex];
                                setAnswers(newAnswers);
                            }}>
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
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(24), paddingVertical: verticalScale(16), backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    qCountBadge: { paddingHorizontal: normalize(12), paddingVertical: verticalScale(6), backgroundColor: '#F3F4F6', borderRadius: normalize(12) },
    qCountText: { fontSize: normalize(14), fontWeight: 'bold', color: Colorpath.Primary },
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
    radioCircleSelected: { borderColor: "#D97706" },
    radioDot: { width: normalize(10), height: normalize(10), borderRadius: normalize(5), backgroundColor: Colorpath.Primary },
    optionLetter: { fontSize: normalize(15), color: '#374151', fontWeight: '600', marginRight: normalize(8) },
    optionText: { fontSize: normalize(15), color: '#374151', flex: 1 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
    prevButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10), paddingHorizontal: normalize(12) },
    prevButtonText: { color: '#4B5563', fontSize: normalize(15), fontWeight: '600', marginLeft: normalize(4) },
    reviewButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10), paddingHorizontal: normalize(20), borderRadius: normalize(10), borderWidth: 1, borderColor: '#F59E0B' },
    reviewIcon: { marginRight: normalize(6) },
    reviewButtonText: { color: '#D97706', fontSize: normalize(14), fontWeight: 'bold' },
    nextButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(10), paddingHorizontal: normalize(24), borderRadius: normalize(10), marginLeft: normalize(12) },
    nextButtonText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: 'bold', marginRight: normalize(4) },
    disabledButton: { opacity: 0.6 },
    submittingButton: { minWidth: normalize(150), justifyContent: 'center' },
    paletteOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
    paletteBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    paletteContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.55, backgroundColor: '#FFFFFF', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), paddingBottom: verticalScale(20) },
    paletteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    paletteTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#111827' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(10), justifyContent: 'flex-start' },
    gridBox: { width: normalize(40), height: normalize(40), borderRadius: normalize(8), backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    gridAnswered: { backgroundColor: Colorpath.Primary },
    gridCurrent: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: Colorpath.Secondary },
    gridReview: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F59E0B' },
    gridText: { fontSize: normalize(14), color: '#4B5563', fontWeight: '600' },
    gridTextAnswered: { color: '#FFFFFF' },
    gridTextCurrent: { color: Colorpath.Secondary },
    gridTextReview: { color: '#D97706' },
    paletteFooter: { flexDirection: 'row', gap: normalize(12), marginTop: verticalScale(20) },
    footerBtnOutline: { flex: 1, paddingVertical: verticalScale(14), borderRadius: normalize(10), borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
    footerBtnText: { color: '#374151', fontSize: normalize(14), fontWeight: '600' },
    footerBtnSolid: { flex: 1, backgroundColor: Colorpath.Primary, paddingVertical: verticalScale(14), borderRadius: normalize(10), alignItems: 'center' },
    footerBtnSolidText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: '600' }
});

export default MockTestQuestionScreen;
