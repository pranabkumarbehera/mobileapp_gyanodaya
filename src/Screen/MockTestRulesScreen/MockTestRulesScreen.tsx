import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../Navigator/StackNav';
import { getMockTestDetailsRequest, startTestRequest, clearStartTestState } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { useTheme, useTranslation } from '../../Themes/hooks';

type MockTestRulesScreenProps = StackScreenProps<RootStackParamList, 'MockTestRules'>;

const getResolvedTestId = (value: any) =>
    value?.id || value?._id || value?.testId || value?.quizId || null;

const getQuizQuestionCount = (quiz: any) =>
    Number(quiz?.questionCount || quiz?.questionsCount || quiz?.totalQuestions || quiz?.questions?.length || 0);

const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || quiz?.timeLimit || 0);

const getQuizTotalMarks = (quiz: any) =>
    Number(
        quiz?.totalMarks ||
        quiz?.maxMarks ||
        quiz?.fullMarks ||
        quiz?.marks ||
        0
    );

const getQuizNegativeMarking = (quiz: any) => {
    const negativeMarking = quiz?.negativeMarking ?? quiz?.negativeMarks ?? quiz?.penalty;

    if (typeof negativeMarking === 'object' && negativeMarking !== null) {
        return negativeMarking?.value ?? '-';
    }

    return negativeMarking ?? '-';
};

const MockTestRulesScreen = ({ navigation, route }: MockTestRulesScreenProps) => {
    const { testId, testData } = route.params || {};
    const dispatch = useDispatch();
    const { colors, theme } = useTheme();
    const { t } = useTranslation();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const { mockTestDetails, isLoading, status, startTestResponse } = useSelector((state: RootState) => state.MockTestReducer);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const resolvedTest = useMemo(() => {
        const detailsId = getResolvedTestId(mockTestDetails);
        if (detailsId && String(detailsId) === String(testId)) {
            return mockTestDetails;
        }
        return testData || null;
    }, [mockTestDetails, testData, testId]);

    const title = resolvedTest?.title || resolvedTest?.name || 'Mock Test';
    const price = Number(resolvedTest?.price || 0);
    const duration = getQuizDuration(resolvedTest) || 120;
    const fullMarks = getQuizTotalMarks(resolvedTest) || (getQuizQuestionCount(resolvedTest) * 4) || '--';
    const negativeMarking = getQuizNegativeMarking(resolvedTest);

    useEffect(() => {
        dispatch(clearStartTestState());
        if (testId) {
            dispatch(getMockTestDetailsRequest({ id: testId }));
        }
    }, [dispatch, testId]);

    useEffect(() => {
        if (isStarting && startTestResponse && !isLoading) {
            setIsStarting(false);
            navigation.replace('MockTestQuestion', {
                testId,
                duration,
                acceptedTerms: true,
            });
        }
    }, [isStarting, startTestResponse, isLoading, navigation, testId, duration]);

    const rules = [
        'The test will be auto-submitted when only 1 minute is left if you have not submitted manually.',
        `Duration: ${duration} minutes | Full Marks: ${fullMarks || '--'} | Negative Marking: ${negativeMarking} per wrong answer.`,
        'Screenshots and screen recording/video capture are not allowed during the test.',
        'Read each question carefully and review your answers before the final minute countdown.',
    ];

    const handleContinue = () => {
        if (!termsAccepted) {
            Toast.show({
                type: 'error',
                text1: 'Please accept the terms & condition',
            });
            return;
        }

        setIsStarting(true);
        dispatch(startTestRequest({ id: testId, acceptedTerms: true }));
    };

    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={normalize(16)} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Mock Test Rules</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                    <View style={styles.titleRow}>
                        <Text style={styles.courseTitle}>{title}</Text>
                        <Text style={styles.priceText}>{price > 0 ? `Rs. ${price}` : 'Free'}</Text>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                            <Icon name="clock" size={normalize(12)} color={colors.Primary} />
                            <Text style={styles.metaChipText}>{duration} mins</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Icon name="star" size={normalize(12)} color={colors.Primary} />
                            <Text style={styles.metaChipText}>Full Marks {fullMarks || '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaChipWide}>
                            <Icon name="minus-circle" size={normalize(12)} color={colors.tagOrangeText} />
                            <Text style={styles.metaChipWideText}>Negative Marking {negativeMarking} / question</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.rulesCard}>
                    <Text style={styles.rulesTitle}>Rules</Text>
                    {rules.map((rule, index) => (
                        <View key={index} style={styles.ruleItem}>
                            <View style={styles.bulletWrap}>
                                <Text style={styles.bulletText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.ruleText}>{rule}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.rulesCard}>
                    <Text style={styles.rulesTitle}>Terms & Conditions</Text>
                    <Text style={styles.ruleText}>
                        By starting this mock test, you agree to follow the exam rules, avoid unfair practices, and allow the app to submit your attempt automatically when the timer ends.
                    </Text>

                    <Pressable style={styles.checkboxRow} onPress={() => setTermsAccepted(prev => !prev)}>
                        <View style={[
                            styles.checkbox,
                            termsAccepted && styles.checkboxChecked,
                            { borderColor: termsAccepted ? colors.Primary : colors.border }
                        ]}>
                            {termsAccepted ? <Icon name="check" size={normalize(10)} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>I accept the Terms & Conditions and want to continue.</Text>
                    </Pressable>

                    {!termsAccepted ? (
                        <Text style={styles.validationText}>Please accept the terms & condition</Text>
                    ) : null}
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: verticalScale(10) }}>
                    <Pressable
                        style={[styles.primaryButton, (isLoading && (status === getMockTestDetailsRequest.type || isStarting)) ? styles.primaryButtonDisabled : null]}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleContinue}
                        disabled={isLoading && (status === getMockTestDetailsRequest.type || isStarting)}
                    >
                        <Text style={styles.primaryButtonText}>{isStarting ? 'Starting...' : 'Start Test'}</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.cardBackground,
    },
    backButton: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.Background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: colors.text,
    },
    headerSpacer: {
        width: normalize(36),
    },
    scrollContent: {
        padding: normalize(20),
        flexGrow: 1,
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        marginBottom: verticalScale(18),
        shadowColor: isDarkTheme ? colors.accent : '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkTheme ? 0.15 : 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(16),
        gap: normalize(12),
    },
    courseTitle: {
        flex: 1,
        fontSize: normalize(18),
        fontWeight: '800',
        color: colors.text,
        lineHeight: normalize(24),
    },
    priceText: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: colors.accent,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(10),
        marginBottom: verticalScale(10),
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.Background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: normalize(999),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
    },
    metaChipText: {
        marginLeft: normalize(8),
        fontSize: normalize(12),
        fontWeight: '700',
        color: colors.text,
    },
    metaChipWide: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.tagOrange,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: normalize(999),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
    },
    metaChipWideText: {
        marginLeft: normalize(8),
        fontSize: normalize(12),
        fontWeight: '700',
        color: colors.tagOrangeText,
    },
    rulesCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        marginBottom: verticalScale(18),
        shadowColor: isDarkTheme ? colors.accent : '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkTheme ? 0.15 : 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rulesTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(16),
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(14),
    },
    bulletWrap: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: colors.tagCyan,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12),
        marginTop: verticalScale(1),
    },
    bulletText: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: colors.tagCyanText,
    },
    ruleText: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: normalize(14),
        lineHeight: verticalScale(22),
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: verticalScale(16),
    },
    checkbox: {
        width: normalize(22),
        height: normalize(22),
        borderRadius: normalize(6),
        borderWidth: 2,
        backgroundColor: colors.Background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12),
        marginTop: verticalScale(2),
    },
    checkboxChecked: {
        backgroundColor: colors.Primary,
    },
    checkboxText: {
        flex: 1,
        color: colors.text,
        fontSize: normalize(14),
        lineHeight: verticalScale(22),
        fontWeight: '600',
    },
    validationText: {
        color: colors.tagOrangeText,
        fontSize: normalize(12),
        fontWeight: '600',
        marginTop: verticalScale(12),
    },
    primaryButton: {
        backgroundColor: colors.Primary,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(18),
        fontWeight: '800',
    },
});

export default MockTestRulesScreen;
