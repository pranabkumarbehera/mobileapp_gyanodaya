import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { StackScreenProps } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../../Navigator/StackNav';
import { RootState } from '../../Redux/Store';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

type MockTestRulesScreenProps = StackScreenProps<RootStackParamList, 'MockTestRules'>;

const BUTTON_COLOR = '#092948';

const MockTestRulesScreen = ({ navigation, route }: MockTestRulesScreenProps) => {
    const { testId } = route.params || {};
    const { mockTestList } = useSelector((state: RootState) => state.MockTestReducer);

    const resolvedTest = useMemo(() => {
        const rawData = Array.isArray(mockTestList)
            ? mockTestList
            : mockTestList?.data || mockTestList?.quizzes || mockTestList?.items || [];

        return rawData.find((mock: any) => String(mock?.id || mock?._id || mock?.testId) === String(testId)) || null;
    }, [mockTestList, testId]);

    const title = resolvedTest?.title || resolvedTest?.name || 'Mock Test';
    const price = Number(resolvedTest?.price || 0);
    const duration = resolvedTest?.durationMinutes || resolvedTest?.duration || 120;
    const fullMarks = resolvedTest?.totalMarks || resolvedTest?.maxMarks || resolvedTest?.fullMarks || resolvedTest?.marks || (resolvedTest?.questionsCount || resolvedTest?.questions?.length || 0) * (resolvedTest?.defaultMarks || 4);
    const negativeMarking = resolvedTest?.negativeMarking?.value || resolvedTest?.negativeMarking || resolvedTest?.negativeMarks || 1;

    const rules = [
        `The test will be auto-submitted when only 1 minute is left if you have not submitted manually.`,
        `Duration: ${duration} minutes | Full Marks: ${fullMarks || '--'} | Negative Marking: ${negativeMarking} per wrong answer.`,
        `Screenshots and screen recording/video capture are not allowed during the test.`,
        `Read each question carefully and review your answers before the final minute countdown.`,
    ];

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

                <Pressable
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('MockTestQuestion', { testId, duration })}
                >
                    <Text style={styles.primaryButtonText}>Start Test</Text>
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
        marginBottom: verticalScale(28),
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
    primaryButton: {
        backgroundColor: BUTTON_COLOR,
        borderRadius: normalize(12),
        height: verticalScale(55),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(18),
        fontWeight: '800',
    },
});

export default MockTestRulesScreen;
