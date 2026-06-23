import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, FlatList, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';
import { getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import { bootstrapHomeRequest } from '../../Redux/Reducers/HomeReducer';
import LinearGradient from 'react-native-linear-gradient';
import Imagepath from '../../Themes/Imagepath';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { useTheme } from '../../Themes/hooks';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

type MockResultScreenProps = StackScreenProps<RootStackParamList, 'MockResult'>;

const PAGE_SIZE = 5;

const getAttemptId = (data: any) =>
    data?.data?._id ||
    data?.data?.attemptId ||
    data?.attemptId ||
    data?.attempt?.id ||
    data?.attempt?._id ||
    data?.id ||
    data?._id ||
    null;

const normalizeOption = (option: any, index: number) => {
    if (typeof option === 'string') {
        return {
            key: `${index}-${option}`,
            text: option,
            value: option,
        };
    }

    return {
        key: option?._id || option?.id || option?.value || option?.text || `${index}`,
        text: option?.text || option?.value || option?.label || `Option ${index + 1}`,
        value: option?.value || option?.text || option?._id || option?.id || '',
        isCorrect: option?.isCorrect,
    };
};

const isOptionMatch = (option: any, target: any) => {
    if (target === undefined || target === null || target === '') {
        return false;
    }

    return [
        option?.key,
        option?.value,
        option?.text,
        option?.id,
        option?._id,
    ].some(value => value !== undefined && value !== null && String(value) === String(target));
};

const hasUserAnswered = (item: any) => {
    const rawAnswer =
        item?.userAnswer ??
        item?.selectedAnswer?.value ??
        item?.selectedAnswer?.text ??
        item?.selectedAnswer ??
        item?.studentAnswer ??
        item?.answer;

    if (Array.isArray(rawAnswer)) {
        return rawAnswer.length > 0;
    }

    if (typeof rawAnswer === 'string') {
        return rawAnswer.trim() !== '';
    }

    return rawAnswer !== undefined && rawAnswer !== null && rawAnswer !== '';
};

const getReviewItems = (resultData: any) => {
    const rawItems =
        resultData?.results ||
        resultData?.review ||
        resultData?.questions ||
        resultData?.attempt?.questions ||
        resultData?.answers ||
        resultData?.result ||
        [];

    if (!Array.isArray(rawItems)) {
        return [];
    }

    return rawItems.map((item: any, index: number) => {
        const question = item?.question || item?.questionId || item;
        const rawOptions = question?.options || question?.choices || item?.options || [];
        const options = Array.isArray(rawOptions)
            ? rawOptions.map((option: any, optionIndex: number) => normalizeOption(option, optionIndex))
            : [];

        const selectedRaw =
            item?.selectedAnswer?.value ??
            item?.selectedAnswer?.text ??
            item?.selectedAnswer ??
            item?.userAnswer ??
            item?.studentAnswer ??
            item?.answer ??
            null;

        const selectedIndex =
            item?.selectedAnswer?.index ??
            item?.selectedIndex ??
            item?.userAnswerIndex ??
            null;

        const correctRaw =
            item?.correctAnswer?.value ??
            item?.correctAnswer?.text ??
            item?.correctAnswer ??
            question?.correctAnswer?.value ??
            question?.correctAnswer?.text ??
            question?.correctAnswer ??
            null;

        const safeSelectedLabel = typeof selectedRaw === 'object' && selectedRaw !== null
            ? selectedRaw.value || selectedRaw.text || selectedRaw.label || JSON.stringify(selectedRaw)
            : selectedRaw;

        const safeCorrectLabel = typeof correctRaw === 'object' && correctRaw !== null
            ? correctRaw.value || correctRaw.text || correctRaw.label || JSON.stringify(correctRaw)
            : correctRaw;

        const resolvedCorrectIndex = options.findIndex(option =>
            option?.isCorrect === true || isOptionMatch(option, correctRaw),
        );

        const resolvedSelectedIndex = selectedIndex !== null && selectedIndex !== undefined
            ? Number(selectedIndex)
            : options.findIndex(option => isOptionMatch(option, selectedRaw));

        const isAnswered = hasUserAnswered(item);
        let status = 'skipped';
        if (isAnswered) {
            if (item?.isCorrect === true || (resolvedCorrectIndex >= 0 && resolvedSelectedIndex === resolvedCorrectIndex)) {
                status = 'correct';
            } else {
                status = 'incorrect';
            }
        } else {
            status = 'skipped';
        }

        return {
            id: item?._id || question?._id || question?.id || `${index}`,
            questionNumber: index + 1,
            questionText: question?.text || question?.question || question?.questionText || item?.questionText || 'Question',
            options,
            marksAwarded: item?.marksAwarded ?? 0,
            questionMarks: question?.marks ?? 0,
            correctAnswerLabel: safeCorrectLabel,
            userAnswerLabel: safeSelectedLabel,
            selectedIndex: resolvedSelectedIndex >= 0 ? resolvedSelectedIndex : null,
            correctIndex: resolvedCorrectIndex >= 0 ? resolvedCorrectIndex : null,
            status,
        };
    });
};

const getRawResultItems = (resultData: any) => {
    const rawItems =
        resultData?.results ||
        resultData?.review ||
        resultData?.questions ||
        resultData?.attempt?.questions ||
        resultData?.answers ||
        resultData?.result ||
        [];

    return Array.isArray(rawItems) ? rawItems : [];
};

const formatTimeSpent = (value: any) => {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return '0s';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0 && remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${remainingSeconds}s`;
};

const MockResultScreen = ({ navigation, route }: MockResultScreenProps) => {
    const dispatch = useDispatch();
    const { colors, tokens } = useTheme();
    const isDarkTheme = tokens.isDark;
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const { testResult, isLoading, submitTestResponse, startTestResponse, status } = useSelector((state: RootState) => state.MockTestReducer);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const routeResultData = route.params?.resultData;
    const [isTransitioning, setIsTransitioning] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const attemptId =
        route.params?.attemptId ||
        getAttemptId(submitTestResponse) ||
        getAttemptId(startTestResponse);

    const submitData = submitTestResponse?.data || submitTestResponse || {};
    const resultData = routeResultData || testResult?.data || testResult || {};
    const resultWhole = resultData || {};

    useEffect(() => {
        if (attemptId && !routeResultData) {
            dispatch(getTestResultRequest({ id: attemptId }));
        }
    }, [attemptId, dispatch, routeResultData]);

    const reviewItems = useMemo(() => getReviewItems(resultWhole), [resultWhole]);
    const visibleReviewItems = reviewItems.slice(0, visibleCount);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [attemptId]);

    const score = route.params?.score ?? resultData?.score ?? resultData?.finalScore ?? resultData?.obtainedMarks ?? submitData?.score ?? 0;
    const totalMarks = resultData?.maxScore ?? resultData?.maxMarks ?? resultData?.quiz?.totalMarks ?? submitData?.maxScore ?? 0;
    const rawResultItems = getRawResultItems(resultWhole);
    const totalQuestionsFromResults = rawResultItems.length || reviewItems.length;
    const attemptedFromUserAnswer = rawResultItems.filter(item => hasUserAnswered(item)).length;
    const correctFromUserAnswer = rawResultItems.filter(item => hasUserAnswered(item) && item?.isCorrect === true).length;
    const wrongFromUserAnswer = rawResultItems.filter(item => hasUserAnswered(item) && item?.isCorrect === false).length;
    const skippedFromUserAnswer = Math.max(totalQuestionsFromResults - attemptedFromUserAnswer, 0);

    const attempted = rawResultItems.length > 0
        ? attemptedFromUserAnswer
        : resultData?.questionCount ?? resultData?.attempted ?? resultData?.stats?.attempted ?? resultData?.results?.length ?? submitData?.answers?.length ?? reviewItems.filter(item => item.status !== 'skipped').length;
    const correct = rawResultItems.length > 0
        ? correctFromUserAnswer
        : resultData?.correctAnswers ?? resultData?.correct ?? resultData?.stats?.correct ?? reviewItems.filter(item => item.status === 'correct').length;
    const wrong = rawResultItems.length > 0
        ? wrongFromUserAnswer
        : resultData?.wrongAnswers ?? resultData?.wrong ?? resultData?.stats?.wrong ?? reviewItems.filter(item => item.status === 'incorrect').length;
    const skipped = rawResultItems.length > 0
        ? skippedFromUserAnswer
        : resultData?.skippedQuestions ?? resultData?.skipped ?? resultData?.stats?.skipped ?? reviewItems.filter(item => item.status === 'skipped').length;
    const rawNegativeMarkingText = reviewItems.some(item => Number(item.marksAwarded) < 0)
        ? `${Math.min(...reviewItems.map(item => Number(item.marksAwarded) || 0))}`
        : '0';
    const negativeMarkingValue = Math.abs(Number(rawNegativeMarkingText));
    const calculatedPenalty = Number(wrong) * negativeMarkingValue;
    const penalty = calculatedPenalty > 0 ? calculatedPenalty : (resultData?.negativeMarks ?? resultData?.penalty ?? resultData?.stats?.penalty ?? 0);

    const rawCorrectMarkingText = reviewItems.some(item => Number(item.questionMarks) > 0)
        ? `${Math.max(...reviewItems.map(item => Number(item.questionMarks) || 0))}`
        : '';
    const correctMarkingValue = Math.abs(Number(rawCorrectMarkingText));
    const calculatedEarned = Number(correct) * correctMarkingValue;
    const earned = calculatedEarned > 0 ? calculatedEarned : (resultData?.score ?? resultData?.marksEarned ?? resultData?.stats?.earned ?? submitData?.score ?? score);

    const attemptedQuestions = Number(attempted ?? 0);
    const correctAnswers = Number(correct ?? 0);
    const accuracy = attemptedQuestions > 0
        ? ((correctAnswers / attemptedQuestions) * 100).toFixed(0)
        : '0';
    const timeSpent = formatTimeSpent(
        resultData?.attempt?.timeSpentSeconds ??
        resultData?.time_spent_seconds ??
        resultData?.timeTakenSeconds ??
        resultData?.timeTaken ??
        resultData?.stats?.timeSpentSeconds ??
        0,
    );
    const title = route.params?.title || resultData?.title || resultData?.quiz?.title || startTestResponse?.title || startTestResponse?.quiz?.title || 'Mock Test';
    const negativeMarkingText = rawNegativeMarkingText;

    const loadMore = () => {
        if (visibleCount < reviewItems.length) {
            setVisibleCount(current => Math.min(current + PAGE_SIZE, reviewItems.length));
        }
    };

    const headerContent = (
        <>
            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Text style={styles.headerSubtitle}>{title}</Text>
                        <Text style={styles.headerTitle}>Your Result</Text>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentWrap}>
                <View style={styles.scoreCard}>
                    <View style={styles.scoreTopRow}>
                        <View>
                            <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
                            <View style={styles.scoreValueRow}>
                                <Text style={styles.scoreMain}>{score}</Text>
                                <Text style={styles.scoreTotal}> / {totalMarks}</Text>
                            </View>
                        </View>
                        <View style={styles.trophyIconBg}>
                            <Image source={Imagepath.Trophy} style={{ width: normalize(24), height: normalize(24) }} resizeMode="contain" />
                        </View>
                    </View>

                    <View style={styles.scorePillsRow}>
                        <View style={[styles.scorePill, { backgroundColor: colors.tagGreen, borderColor: colors.border }]}>
                            <Text style={[styles.pillValue, { color: colors.tagGreenText }]}>+{score}</Text>
                            <Text style={[styles.pillLabel, { color: colors.tagGreenText }]}>Total Score</Text>
                        </View>
                        <View style={[styles.scorePill, { backgroundColor: colors.tagOrange, borderColor: colors.border }]}>
                            <Text style={[styles.pillValue, { color: colors.tagOrangeText }]}>{accuracy}%</Text>
                            <Text style={[styles.pillLabel, { color: colors.tagOrangeText }]}>Accuracy</Text>
                        </View>
                        <View style={[styles.scorePill, { backgroundColor: colors.tagCyan, borderColor: colors.border }]}>
                            <Text style={[styles.pillValue, { color: colors.tagCyanText }]}>{timeSpent}</Text>
                            <Text style={[styles.pillLabel, { color: colors.tagCyanText }]}>Time Spent</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: colors.text }]}>{attempted}</Text>
                        <Text style={styles.statLabel}>Attempted</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{correct}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>{wrong}</Text>
                        <Text style={styles.statLabel}>Wrong</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: colors.accent }]}>{skipped}</Text>
                        <Text style={styles.statLabel}>Skipped</Text>
                    </View>
                </View>

                <View style={styles.penaltyCard}>
                    <View style={styles.penaltyHeader}>
                        <Icon name="bar-chart-2" size={normalize(16)} color={colors.text} />
                        <Text style={styles.penaltyTitle}>Negative Marking Breakdown</Text>
                    </View>

                    <View style={styles.penaltyRow}>
                        <View>
                            <Text style={styles.penaltyRowTitle}>Marks Earned</Text>
                            <Text style={styles.penaltyRowSub}>Based on correct answers</Text>
                        </View>
                        <Text style={[styles.penaltyRowValue, { color: '#10B981' }]}>+{earned}</Text>
                    </View>

                    <View style={[styles.penaltyRow, { backgroundColor: colors.tagOrange }]}>
                        <View>
                            <Text style={[styles.penaltyRowTitle, { color: colors.tagOrangeText }]}>Penalty Applied</Text>
                            <Text style={styles.penaltyRowSub}>Negative marking per wrong answer: {negativeMarkingText}</Text>
                        </View>
                        <Text style={[styles.penaltyRowValue, { color: colors.tagOrangeText }]}>-{penalty}</Text>
                    </View>

                    <View style={styles.penaltyTotalRow}>
                        <Text style={styles.penaltyTotalTitle}>Final Score</Text>
                        <Text style={styles.penaltyTotalValue}>{(Number(earned) - Number(penalty)).toFixed(2).replace(/\.00$/, '')}</Text>
                    </View>
                </View>

                {reviewItems.length > 0 ? (
                    <View style={styles.reviewHeader}>
                        <Text style={styles.reviewTitle}>Answer Review</Text>
                        <Text style={styles.reviewSubtitle}>Showing {visibleReviewItems.length} of {reviewItems.length}</Text>
                    </View>
                ) : (
                    <View style={styles.reviewHeader}>
                        <Text style={styles.reviewTitle}>Answer Review</Text>
                        <Text style={styles.reviewSubtitle}>Result details are loading or unavailable.</Text>
                    </View>
                )}
            </View>
        </>
    );

    const renderOption = (item: any, option: any, index: number) => {
        const isSelected = item.selectedIndex === index;
        const isCorrect = item.correctIndex === index;

        let optionStyle = styles.reviewOption;
        let textStyle = styles.reviewOptionText;

        if (isCorrect) {
            optionStyle = { ...styles.reviewOption, ...styles.correctOption };
            textStyle = { ...styles.reviewOptionText, ...styles.correctOptionText };
        } else if (isSelected && item.status === 'incorrect') {
            optionStyle = { ...styles.reviewOption, ...styles.incorrectOption };
            textStyle = { ...styles.reviewOptionText, ...styles.incorrectOptionText };
        }

        return (
            <View key={option.key} style={optionStyle}>
                <Text style={styles.reviewOptionLetter}>{['A', 'B', 'C', 'D', 'E', 'F'][index] || index + 1}.</Text>
                <Text style={textStyle}>{option.text}</Text>
                {isCorrect ? <Icon name="check-circle" size={normalize(16)} color="#16A34A" /> : null}
                {!isCorrect && isSelected && item.status === 'incorrect' ? <Icon name="x-circle" size={normalize(16)} color="#DC2626" /> : null}
            </View>
        );
    };

    const renderReviewCard = ({ item }: { item: any }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewCardTop}>
                <View>
                    <Text style={styles.reviewQNum}>Q {item.questionNumber}</Text>
                    <Text style={styles.reviewMeta}>
                        {item.status === 'correct' ? `+${item.questionMarks || 0} marks` : item.status === 'incorrect' ? `${item.marksAwarded} marks` : '0 marks'}
                    </Text>
                </View>
                <View style={[
                    styles.reviewBadge,
                    item.status === 'correct' && styles.correctBadge,
                    item.status === 'incorrect' && styles.incorrectBadge,
                    item.status === 'skipped' && styles.skippedBadge,
                ]}>
                    <Text style={[
                        styles.reviewBadgeText,
                        item.status === 'correct' && styles.correctBadgeText,
                        item.status === 'incorrect' && styles.incorrectBadgeText,
                        item.status === 'skipped' && styles.skippedBadgeText,
                    ]}>
                        {item.status === 'correct' ? 'Correct' : item.status === 'incorrect' ? 'Incorrect' : 'Not Answered'}
                    </Text>
                </View>
            </View>

            <Text style={styles.reviewQText}>{item.questionText}</Text>
            <View style={styles.reviewOptionsWrap}>
                {item.options.map((option: any, index: number) => renderOption(item, option, index))}
            </View>
            <View style={styles.answerMetaWrap}>
                <Text style={styles.answerMetaText}>Your Answer: {item.userAnswerLabel ?? 'Not Answered'}</Text>
                <Text style={styles.answerMetaText}>Correct Answer: {item.correctAnswerLabel ?? '-'}</Text>
                <Text style={[
                    styles.answerMetaText,
                    Number(item.marksAwarded) >= 0 ? styles.positiveMarksText : styles.negativeMarksText,
                ]}>
                    Score: {item.marksAwarded}
                </Text>
            </View>
        </View>
    );

    const renderShimmer = () => {
        const shimmerColors = isDarkTheme ? [colors.border, colors.Background, colors.border] : ['#E5E7EB', '#F3F4F6', '#E5E7EB'];
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />
                <View style={styles.headerBackground}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.topBar}>
                            <Text style={styles.loadingTitle}>Preparing Result</Text>
                            <Text style={styles.loadingSubtitle}>
                                Please wait while we calculate your latest test summary.
                            </Text>
                            <ShimmerPlaceholder style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 8, marginTop: verticalScale(16) }} shimmerColors={shimmerColors} />
                            <ShimmerPlaceholder style={{ width: 180, height: 28, borderRadius: 6 }} shimmerColors={shimmerColors} />
                        </View>
                    </SafeAreaView>
                </View>
                <View style={styles.contentWrap}>
                    <View style={styles.scoreCard}>
                        <View style={styles.scoreTopRow}>
                            <View>
                                <ShimmerPlaceholder style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 8 }} shimmerColors={shimmerColors} />
                                <ShimmerPlaceholder style={{ width: 120, height: 36, borderRadius: 8 }} shimmerColors={shimmerColors} />
                            </View>
                            <ShimmerPlaceholder style={{ width: 48, height: 48, borderRadius: 24 }} shimmerColors={shimmerColors} />
                        </View>
                        <View style={styles.scorePillsRow}>
                            <ShimmerPlaceholder style={{ flex: 1, height: 60, borderRadius: 10 }} shimmerColors={shimmerColors} />
                            <ShimmerPlaceholder style={{ flex: 1, height: 60, borderRadius: 10 }} shimmerColors={shimmerColors} />
                            <ShimmerPlaceholder style={{ flex: 1, height: 60, borderRadius: 10 }} shimmerColors={shimmerColors} />
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <ShimmerPlaceholder style={{ flex: 1, height: 40, borderRadius: 8, marginHorizontal: 4 }} shimmerColors={shimmerColors} />
                        <ShimmerPlaceholder style={{ flex: 1, height: 40, borderRadius: 8, marginHorizontal: 4 }} shimmerColors={shimmerColors} />
                        <ShimmerPlaceholder style={{ flex: 1, height: 40, borderRadius: 8, marginHorizontal: 4 }} shimmerColors={shimmerColors} />
                        <ShimmerPlaceholder style={{ flex: 1, height: 40, borderRadius: 8, marginHorizontal: 4 }} shimmerColors={shimmerColors} />
                    </View>
                    <ShimmerPlaceholder style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 16 }} shimmerColors={shimmerColors} />
                    <ShimmerPlaceholder style={{ width: '72%', height: 14, borderRadius: 6, marginBottom: 10 }} shimmerColors={shimmerColors} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 72, borderRadius: 12, marginBottom: 10 }} shimmerColors={shimmerColors} />
                    <ShimmerPlaceholder style={{ width: '100%', height: 72, borderRadius: 12 }} shimmerColors={shimmerColors} />
                </View>
            </View>
        );
    };

    const isTestResultLoading = !routeResultData && (isLoading || status === 'MockTest/getTestResultRequest');

    if (isTransitioning || (isTestResultLoading && (!testResult || Object.keys(resultData).length === 0))) {
        return renderShimmer();
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />

            <FlatList
                data={visibleReviewItems}
                keyExtractor={(item) => item.id}
                renderItem={renderReviewCard}
                ListHeaderComponent={headerContent}
                ListFooterComponent={
                    <View style={styles.footerSpace}>
                        {visibleCount < reviewItems.length ? (
                            <Pressable style={styles.loadMoreBtn} onPress={loadMore}>
                                <Text style={styles.loadMoreText}>Load More</Text>
                            </Pressable>
                        ) : null}
                    </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
            />

            <View style={styles.bottomBar}>
                <Pressable style={styles.retryBtn} onPress={() => navigation.goBack()}>
                    <Icon name="rotate-ccw" size={normalize(16)} color={colors.textSecondary} style={{ marginRight: normalize(6) }} />
                    <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
                <Pressable style={styles.homeBtn} onPress={() => {
                    dispatch(bootstrapHomeRequest({ refresh: true }));
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                    });
                }}>
                    <Icon name="home" size={normalize(16)} color="#FFFFFF" style={styles.homeBtnLeftIcon} />
                    <Text style={styles.homeBtnText}>Home</Text>
                    <Icon name="chevron-right" size={normalize(16)} color="#FFFFFF" style={styles.homeBtnRightIcon} />
                </Pressable>
            </View>
        </View>
    );
};

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    headerBackground: { backgroundColor: colors.Primary, paddingBottom: verticalScale(20) },
    topBar: { paddingHorizontal: normalize(24), paddingTop: verticalScale(16) },
    headerSubtitle: { fontSize: normalize(10), fontWeight: '600', color: '#9CA3AF', letterSpacing: 1, marginBottom: verticalScale(4) },
    headerTitle: { fontSize: normalize(22), fontWeight: 'bold', color: '#FFFFFF' },
    listContent: { paddingBottom: verticalScale(110) },
    contentWrap: { paddingHorizontal: normalize(20), paddingTop: verticalScale(20) },
    loadingText: { marginTop: verticalScale(12), color: colors.textSecondary },
    loadingTitle: { fontSize: normalize(24), fontWeight: '700', color: '#FFFFFF' },
    loadingSubtitle: { marginTop: verticalScale(6), fontSize: normalize(12), lineHeight: normalize(18), color: '#D1D5DB', maxWidth: '84%' },
    scoreCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(16), padding: normalize(20), marginBottom: verticalScale(16),      borderWidth: 1, borderColor: colors.border },
    scoreTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    finalScoreLabel: { fontSize: normalize(11), fontWeight: 'bold', color: colors.textSecondary, letterSpacing: 0.5, marginBottom: verticalScale(4) },
    scoreValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    scoreMain: { fontSize: normalize(32), fontWeight: 'bold', color: colors.text },
    scoreTotal: { fontSize: normalize(14), fontWeight: '600', color: colors.textSecondary, marginLeft: normalize(4) },
    trophyIconBg: { width: normalize(48), height: normalize(48), borderRadius: normalize(24), backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.accent },
    scorePillsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: normalize(10) },
    scorePill: { flex: 1, paddingVertical: verticalScale(10), paddingHorizontal: normalize(8), borderRadius: normalize(10), borderWidth: 1, alignItems: 'center' },
    pillValue: { fontSize: normalize(15), fontWeight: 'bold', marginBottom: verticalScale(2) },
    pillLabel: { fontSize: normalize(10), fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBackground, borderRadius: normalize(12), padding: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: colors.border },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: normalize(16), fontWeight: 'bold', marginBottom: verticalScale(4) },
    statLabel: { fontSize: normalize(11), color: colors.textSecondary, fontWeight: '500' },
    penaltyCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(12), padding: normalize(16), marginBottom: verticalScale(24), borderWidth: 1, borderColor: colors.border },
    penaltyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(16) },
    penaltyTitle: { fontSize: normalize(14), fontWeight: 'bold', color: colors.text, marginLeft: normalize(8) },
    penaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: normalize(12), borderRadius: normalize(8), marginBottom: verticalScale(8), backgroundColor: colors.Background, borderWidth: 1, borderColor: colors.border },
    penaltyRowTitle: { fontSize: normalize(13), fontWeight: '600', color: colors.text, marginBottom: verticalScale(2) },
    penaltyRowSub: { fontSize: normalize(11), color: colors.textSecondary },
    penaltyRowValue: { fontSize: normalize(14), fontWeight: 'bold' },
    penaltyTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: verticalScale(12), marginTop: verticalScale(4), borderTopWidth: 1, borderTopColor: colors.border },
    penaltyTotalTitle: { fontSize: normalize(14), fontWeight: 'bold', color: colors.text },
    penaltyTotalValue: { fontSize: normalize(16), fontWeight: 'bold', color: colors.text },
    reviewHeader: { marginBottom: verticalScale(14) },
    reviewTitle: { fontSize: normalize(18), fontWeight: 'bold', color: colors.text, marginBottom: verticalScale(4) },
    reviewSubtitle: { fontSize: normalize(12), color: colors.textSecondary },
    reviewCard: { backgroundColor: colors.cardBackground, borderRadius: normalize(14), padding: normalize(16), marginHorizontal: normalize(20), marginBottom: verticalScale(14), borderWidth: 1, borderColor: colors.border,     },
    reviewCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(10) },
    reviewQNum: { fontSize: normalize(13), fontWeight: '700', color: colors.Primary },
    reviewMeta: { fontSize: normalize(11), color: colors.textSecondary, marginTop: verticalScale(4) },
    reviewBadge: { paddingHorizontal: normalize(10), paddingVertical: verticalScale(5), borderRadius: normalize(999) },
    correctBadge: { backgroundColor: '#DCFCE7' },
    incorrectBadge: { backgroundColor: '#FEE2E2' },
    skippedBadge: { backgroundColor: '#FEF3C7' },
    reviewBadgeText: { fontSize: normalize(11), fontWeight: '700' },
    correctBadgeText: { color: '#15803D' },
    incorrectBadgeText: { color: '#B91C1C' },
    skippedBadgeText: { color: '#B45309' },
    reviewQText: { fontSize: normalize(15), color: colors.text, fontWeight: '600', lineHeight: normalize(22), marginBottom: verticalScale(14) },
    reviewOptionsWrap: { gap: verticalScale(10) },
    reviewOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: normalize(10), paddingHorizontal: normalize(12), paddingVertical: verticalScale(12), backgroundColor: colors.cardBackground },
    reviewOptionLetter: { fontSize: normalize(14), fontWeight: '700', color: colors.text, marginRight: normalize(10) },
    reviewOptionText: { flex: 1, fontSize: normalize(14), color: colors.text },
    correctOption: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
    incorrectOption: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
    correctOptionText: { color: '#166534' },
    incorrectOptionText: { color: '#991B1B' },
    answerMetaWrap: { marginTop: verticalScale(14), gap: verticalScale(4) },
    answerMetaText: { fontSize: normalize(12), color: colors.textSecondary, fontWeight: '600' },
    positiveMarksText: { color: '#15803D' },
    negativeMarksText: { color: '#B91C1C' },
    footerSpace: { paddingHorizontal: normalize(20), paddingBottom: verticalScale(16) },
    loadMoreBtn: { alignSelf: 'center', backgroundColor: colors.tagCyan, paddingHorizontal: normalize(18), paddingVertical: verticalScale(10), borderRadius: normalize(999), borderWidth: 1, borderColor: colors.border },
    loadMoreText: { color: colors.tagCyanText, fontSize: normalize(13), fontWeight: '700' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16), backgroundColor: colors.cardBackground, borderTopWidth: 1, borderTopColor: colors.border, gap: normalize(12),     },
    retryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(12), borderRadius: normalize(10), borderWidth: 1, borderColor: colors.border, backgroundColor: colors.Background },
    retryBtnText: { color: colors.text, fontSize: normalize(15), fontWeight: '600' },
    homeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.Primary, paddingVertical: verticalScale(12), paddingHorizontal: normalize(14), borderRadius: normalize(10) },
    homeBtnLeftIcon: { marginRight: normalize(8) },
    homeBtnText: { color: '#FFFFFF', fontSize: normalize(15), fontWeight: '600' },
    homeBtnRightIcon: { marginLeft: 'auto' },
});

export default MockResultScreen;
