import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../Navigator/StackNav';
import { getMockTestDetailsRequest, startTestRequest, clearStartTestState } from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

type MockTestRulesScreenProps = StackScreenProps<RootStackParamList, 'MockTestRules'>;

const BUTTON_COLOR = '#092948';

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
    const { mockTestDetails, isLoading, status, startTestResponse } = useSelector((state: RootState) => state.MockTestReducer);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={18} color={BUTTON_COLOR} />
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
                            <Icon name="clock" size={12} color={BUTTON_COLOR} />
                            <Text style={styles.metaChipText}>{duration} mins</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Icon name="star" size={12} color={BUTTON_COLOR} />
                            <Text style={styles.metaChipText}>Full Marks {fullMarks || '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaChipWide}>
                            <Icon name="minus-circle" size={12} color="#B91C1C" />
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
                        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                            {termsAccepted ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>I accept the Terms & Conditions and want to continue.</Text>
                    </Pressable>

                    {!termsAccepted ? (
                        <Text style={styles.validationText}>Please accept the terms & condition</Text>
                    ) : null}
                </View>

                <Pressable
                    style={[styles.primaryButton, (isLoading && (status === getMockTestDetailsRequest.type || isStarting)) ? styles.primaryButtonDisabled : null]}
                    onPress={handleContinue}
                    disabled={isLoading && (status === getMockTestDetailsRequest.type || isStarting)}
                >
                    <Text style={styles.primaryButtonText}>{isStarting ? 'Starting...' : 'Start Test'}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#111827',
    },
    headerSpacer: {
        width: normalize(36),
    },
    scrollContent: {
        padding: normalize(20),
        flexGrow: 1,
    },
    infoCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: normalize(20),
        marginBottom: verticalScale(18),
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
        color: '#111827',
        lineHeight: normalize(24),
    },
    priceText: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: BUTTON_COLOR,
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
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: normalize(999),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
    },
    metaChipText: {
        marginLeft: normalize(8),
        fontSize: normalize(12),
        fontWeight: '700',
        color: '#334155',
    },
    metaChipWide: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: normalize(999),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
    },
    metaChipWideText: {
        marginLeft: normalize(8),
        fontSize: normalize(12),
        fontWeight: '700',
        color: '#B91C1C',
    },
    rulesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(20),
        marginBottom: verticalScale(18),
    },
    rulesTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#111827',
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
        backgroundColor: '#E6EEF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12),
        marginTop: verticalScale(1),
    },
    bulletText: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: BUTTON_COLOR,
    },
    ruleText: {
        flex: 1,
        color: '#475569',
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
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12),
        marginTop: verticalScale(2),
    },
    checkboxChecked: {
        backgroundColor: BUTTON_COLOR,
        borderColor: BUTTON_COLOR,
    },
    checkboxText: {
        flex: 1,
        color: '#111827',
        fontSize: normalize(14),
        lineHeight: verticalScale(22),
        fontWeight: '600',
    },
    validationText: {
        color: '#B91C1C',
        fontSize: normalize(12),
        fontWeight: '600',
        marginTop: verticalScale(12),
    },
    primaryButton: {
        backgroundColor: BUTTON_COLOR,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
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
