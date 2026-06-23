import React, { memo, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    InteractionManager,
    Pressable,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../Components/Avatar';
import EmptyState from '../../Components/EmptyState';
import { RootStackParamList } from '../../Navigator/StackNav';
import { bootstrapHomeRequest } from '../../Redux/Reducers/HomeReducer';
import { clearTestResult, getTestResultRequest } from '../../Redux/Reducers/MockTestReducer';
import { getProfileRequest } from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';
import { useTheme, useTranslation, withAlpha } from '../../Themes/hooks';
import {
    formatDisplayDate,
    formatPercent,
    formatScore,
    formatTimeSpent,
    getDashboardHeadline,
    getProfileImageUri,
    getProfileName,
    normalizeDashboardStats,
    normalizeRecentItems,
} from '../../Utils/Helpers/home';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const ShimmerPlaceholder = createShimmerPlaceholder();

type StatCardProps = {
    label: string;
    value: string;
    icon: string;
    iconColor: string;
    iconBackground: string;
};

type RecentItemCardProps = {
    item: any;
    isLoading: boolean;
    onPress: (item: any) => void;
};

const StatCard = memo(({ label, value }: StatCardProps) => {
    const { colors, tokens } = useTheme();
    const { t } = useTranslation();

    let displayLabel = label;
    let cardBg = tokens.glassSurface;
    let labelColor = colors.textSecondary;
    let valueColor = colors.text;

    if (label === 'Purchased Exams') {
        displayLabel = t('home.purchased');
        cardBg = colors.tagOrange;
        labelColor = colors.tagOrangeText;
    } else if (label === 'Tests Completed') {
        displayLabel = t('home.completed');
        cardBg = colors.tagGreen;
        labelColor = colors.tagGreenText;
    } else if (label === 'Avg. Accuracy') {
        displayLabel = t('home.accuracy');
        cardBg = colors.tagCyan;
        labelColor = colors.tagCyanText;
    } else if (label === 'Day Streak') {
        displayLabel = t('home.streak');
        cardBg = colors.tagPurple;
        labelColor = colors.tagPurpleText;
    }

    const isFuturistic = tokens.isDark;

    if (isFuturistic) {
        labelColor = colors.textSecondary;
        valueColor = colors.accent;
    }

    return (
        <View
            style={[
                styles.statCard,
                isFuturistic ? {
                    backgroundColor: tokens.glassSurface,
                    borderColor: tokens.glassBorder,
                    borderWidth: 1.5,
                    shadowColor: tokens.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: tokens.shadowOpacity,
                    shadowRadius: 8,
                    elevation: 2,
                } : {
                    backgroundColor: cardBg,
                    borderColor: colors.border,
                    borderWidth: 1,
                },
            ]}
        >
            <Text style={[styles.statLabel, { color: labelColor }]}>{displayLabel}</Text>
            <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
        </View>
    );
});

const RecentItemCard = memo(({ item, isLoading, onPress }: RecentItemCardProps) => {
    const { colors, tokens } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={[
            styles.resultCard, 
            { 
                backgroundColor: tokens.glassSurface,
                borderColor: tokens.glassBorder,
                borderWidth: 1,
                shadowColor: tokens.shadow,
                shadowOpacity: tokens.shadowOpacity,
            },
            tokens.isDark && {
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 3,
            }
        ]}>
            <View style={styles.resultTopRow}>
                <View style={styles.resultMetaRow}>
                    <View style={[styles.resultTypeBadge, { backgroundColor: colors.tagCyan }]}>
                        <Text style={[styles.resultTypeText, { color: colors.tagCyanText }]}>{item.type}</Text>
                    </View>
                    <View style={[styles.resultPriceBadge, { backgroundColor: colors.tagGreen }]}>
                        <Text style={[styles.resultPriceText, { color: colors.tagGreenText }]}>{Number(item.price) > 0 ? `Rs. ${item.price}` : 'Free'}</Text>
                    </View>
                    <View style={[styles.resultStatusBadge, { backgroundColor: colors.tagOrange }]}>
                        <Text style={[styles.resultStatusText, { color: colors.tagOrangeText }]}>{item.status}</Text>
                    </View>
                </View>
                <Text style={[styles.resultDateText, { color: colors.textSecondary }]}>{formatDisplayDate(item.date)}</Text>
            </View>

            <Text style={[styles.resultTitle, { color: colors.text }]}>{item.title}</Text>

            <View style={styles.resultMetricsRow}>
                <View style={[styles.metricChip, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.glassBorder }]}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Score</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>{formatScore(item.score)}</Text>
                </View>
                <View style={[styles.metricChip, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.glassBorder }]}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Accuracy</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>{formatPercent(item.accuracy)}</Text>
                </View>
            </View>

            <Pressable
                style={[
                    styles.detailsButton,
                    { backgroundColor: colors.Primary, borderColor: tokens.glassBorder, borderWidth: 1 },
                    (isLoading || !item.attemptId) && styles.detailsButtonDisabled
                ]}
                onPress={() => onPress(item)}
                disabled={isLoading || !item.attemptId}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={tokens.onAccent} />
                ) : (
                    <>
                        <Text style={[styles.detailsButtonText, { color: tokens.onAccent }]}>{t('home.view_details')}</Text>
                        <Icon name="arrow-up-right" size={normalize(14)} color={tokens.onAccent} />
                    </>
                )}
            </Pressable>
        </View>
    );
});

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const dispatch = useDispatch();
    const authState = useSelector((state: RootState) => state.AuthReducer);
    const profileState = useSelector((state: RootState) => state.ProfileReducer);
    const homeState = useSelector((state: RootState) => state.HomeReducer);
    const mockTestState = useSelector((state: RootState) => state.MockTestReducer);
    const [pendingItem, setPendingItem] = useState<any>(null);
    const profileSource = profileState.profileData || homeState.dashboardData?.user || homeState.dashboardData?.student || homeState.dashboardData?.profile;
    const profileName = useMemo(() => getProfileName(profileSource), [profileSource]);
    const profileImage = useMemo(() => getProfileImageUri(profileSource), [profileSource]);
    const stats = useMemo(() => normalizeDashboardStats(homeState.dashboardData), [homeState.dashboardData]);
    const purchasedExams = homeState.dashboardData?.purchasedExams
        ?? homeState.dashboardData?.purchasedItems
        ?? homeState.dashboardData?.purchased_exams
        ?? homeState.dashboardData?.purchased_items
        ?? homeState.dashboardData?.stats?.purchasedExams
        ?? homeState.dashboardData?.summary?.purchasedExams
        ?? 0;
    const testsCompleted = homeState.dashboardData?.testsCompleted
        ?? homeState.dashboardData?.completedAttempts
        ?? homeState.dashboardData?.tests_completed
        ?? homeState.dashboardData?.completed_attempts
        ?? homeState.dashboardData?.stats?.testsCompleted
        ?? homeState.dashboardData?.summary?.testsCompleted
        ?? homeState.dashboardData?.completedTests
        ?? 0;
    const avgAccuracy = formatPercent(
        homeState.dashboardData?.avgAccuracy
        ?? homeState.dashboardData?.averageAccuracy
        ?? homeState.dashboardData?.average_accuracy
        ?? homeState.dashboardData?.stats?.avgAccuracy
        ?? homeState.dashboardData?.summary?.avgAccuracy
        ?? stats.accuracy,
    );
    const dayStreak = homeState.dashboardData?.dayStreak
        ?? homeState.dashboardData?.streak
        ?? homeState.dashboardData?.day_streak
        ?? homeState.dashboardData?.stats?.dayStreak
        ?? homeState.dashboardData?.summary?.dayStreak
        ?? 0;
    const recentItems = useMemo(() => normalizeRecentItems(homeState.dashboardData), [homeState.dashboardData]);
    const { colors, tokens } = useTheme();
    const { t } = useTranslation();

    const isDarkTheme = tokens.isDark;
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    const recentSectionTitle = useMemo(
        () => getDashboardHeadline(homeState.dashboardData, recentItems),
        [homeState.dashboardData, recentItems],
    );

    const translatedHeadline = recentSectionTitle === 'Recent Activity' ? t('home.recent_title') : recentSectionTitle;

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            if (!homeState.dashboardData && !homeState.isBootstrapping) {
                dispatch(bootstrapHomeRequest({}));
            }
        });
        return () => task.cancel();
    }, [dispatch, homeState.dashboardData, homeState.isBootstrapping]);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            if (authState.token && !profileState.profileData && !profileState.isLoading) {
                dispatch(getProfileRequest({}));
            }
        });
        return () => task.cancel();
    }, [authState.token, dispatch, profileState.isLoading, profileState.profileData]);

    useEffect(() => {
        if (
            pendingItem &&
            mockTestState.testResult &&
            mockTestState.status === 'MockTest/getTestResultSuccess'
        ) {
            navigation.navigate('MockResult', {
                attemptId: pendingItem.attemptId,
                title: pendingItem.title,
                score: pendingItem.score,
                accuracy: pendingItem.accuracy,
                resultData: mockTestState.testResult,
            });
            setPendingItem(null);
            dispatch(clearTestResult());
        }
    }, [dispatch, mockTestState.status, mockTestState.testResult, navigation, pendingItem]);

    useEffect(() => {
        if (pendingItem && mockTestState.status === 'MockTest/getTestResultFailure') {
            setPendingItem(null);
        }
    }, [mockTestState.status, pendingItem]);

    const onRefresh = () => {
        dispatch(bootstrapHomeRequest({ refresh: true }));
    };

    const handleViewDetails = (item: any) => {
        if (!item.attemptId) {
            return;
        }
        setPendingItem(item);
        dispatch(clearTestResult());
        dispatch(getTestResultRequest({ id: item.attemptId }));
    };

    const renderLoading = () => (
        <View style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Primary} barStyle={statusBarStyle} />
            <View style={[styles.headerBackground, { backgroundColor: colors.Primary }]}>
                <View pointerEvents="none" style={[styles.headerGlow, { backgroundColor: withAlpha(colors.accent, tokens.isGlass ? 0.22 : 0.1) }]} />
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <View style={styles.profileRow}>
                            <ShimmerPlaceholder style={styles.avatarShimmer} />
                            <View>
                                <ShimmerPlaceholder style={styles.smallLine} />
                                <ShimmerPlaceholder style={styles.nameLine} />
                            </View>
                        </View>
                        <ShimmerPlaceholder style={styles.badgeShimmer} />
                    </View>
                    <View style={styles.statsRow}>
                        {[1, 2, 3, 4].map(item => (
                            <ShimmerPlaceholder key={item} style={styles.statShimmer} />
                        ))}
                    </View>
                </SafeAreaView>
            </View>
            <View style={styles.loadingContent}>
                {[1, 2].map(item => (
                    <ShimmerPlaceholder key={item} style={styles.cardShimmer} />
                ))}
            </View>
        </View>
    );

    const header = (
        <>
            <View style={[styles.headerBackground, { backgroundColor: colors.Primary }]}>
                <View pointerEvents="none" style={[styles.headerGlow, { backgroundColor: withAlpha(colors.accent, tokens.isGlass ? 0.22 : 0.1) }]} />
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <View style={styles.profileRow}>
                            <Pressable onPress={() => navigation.navigate('Profile')} style={[styles.avatarFrame, { borderColor: tokens.glassBorder }]}>
                                <Avatar imageUri={profileImage} name={profileName} size={normalize(52)} />
                            </Pressable>
                            <View style={styles.profileCopy}>
                                <Text style={[styles.welcomeText, { color: tokens.isGlass ? colors.textSecondary : 'rgba(255,255,255,0.78)' }]}>{t('home.greetings')}</Text>
                                <Pressable onPress={() => navigation.navigate('Profile')}>
                                    <Text style={[styles.userName, { color: tokens.onAccent }]}>{profileName}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <StatCard
                            label="Purchased Exams"
                            value={String(purchasedExams)}
                            icon="award"
                            iconColor="#92400E"
                            iconBackground="#FEF3C7"
                        />
                        <StatCard
                            label="Tests Completed"
                            value={String(testsCompleted)}
                            icon="target"
                            iconColor="#0F766E"
                            iconBackground="#CCFBF1"
                        />
                        <StatCard
                            label="Avg. Accuracy"
                            value={avgAccuracy}
                            icon="clock"
                            iconColor="#1D4ED8"
                            iconBackground="#DBEAFE"
                        />
                        <StatCard
                            label="Day Streak"
                            value={String(dayStreak)}
                            icon="clock"
                            iconColor="#7C3AED"
                            iconBackground="#EDE9FE"
                        />
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.sectionHeader}>
                <View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{translatedHeadline}</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{t('home.recent_sub')}</Text>
                </View>
            </View>
        </>
    );

    if (homeState.isBootstrapping && !homeState.dashboardData) {
        return renderLoading();
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Primary} barStyle="light-content" />

            <FlatList
                data={recentItems}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <RecentItemCard
                        item={item}
                        onPress={handleViewDetails}
                        isLoading={
                            mockTestState.isLoading &&
                            !!pendingItem &&
                            String(pendingItem.attemptId) === String(item.attemptId)
                        }
                    />
                )}
                ListHeaderComponent={header}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <EmptyState
                            title={homeState.error ? t('common.error') : t('home.no_activity')}
                            message={
                                homeState.error
                                    ? "We couldn't fetch your latest dashboard data. Please try again."
                                    : t('home.no_activity_desc')
                            }
                            actionLabel={t('common.retry')}
                            onAction={onRefresh}
                            icon={homeState.error ? 'wifi-off' : 'bar-chart-2'}
                        />
                    </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={homeState.isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: verticalScale(34),
        flexGrow: 1,
    },
    headerBackground: {
        paddingBottom: verticalScale(28),
        borderBottomLeftRadius: normalize(28),
        borderBottomRightRadius: normalize(28),
        overflow: 'hidden',
    },
    headerGlow: {
        position: 'absolute',
        width: normalize(220),
        height: normalize(220),
        borderRadius: normalize(110),
        top: -normalize(130),
        right: -normalize(65),
    },
    topBar: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarFrame: {
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.35)',
        borderRadius: normalize(28),
        padding: normalize(2),
        marginRight: normalize(12),
    },
    profileCopy: {
        flexShrink: 1,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: normalize(12),
        marginBottom: verticalScale(2),
    },
    userName: {
        fontSize: normalize(20),
        fontWeight: '800',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: normalize(999),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
        marginLeft: normalize(12),
    },
    liveDot: {
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
        backgroundColor: '#22C55E',
        marginRight: normalize(8),
    },
    liveBadgeText: {
        fontSize: normalize(12),
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: normalize(16),
        gap: normalize(8),
        marginTop: verticalScale(22),
    },
    statCard: {
        flex: 1,
        borderRadius: normalize(16),
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(18),
        height: verticalScale(70),
        justifyContent: 'center',
        borderWidth: 1,
        // borderColor: '#E6EAF0',
        // shadowColor: '#0F172A',
        // shadowOffset: { width: 0, height: 8 },
        // shadowOpacity: 0.08,
        // shadowRadius: 14,
        // elevation: 4,
    },
    statLabel: {
        color: '#586375',
        fontSize: normalize(11),
        fontWeight: '500',
        marginBottom: verticalScale(10),
    },
    statValue: {
        color: '#111827',
        fontSize: normalize(20),
        fontWeight: '800',
    },
    sectionHeader: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(14),
    },
    sectionTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        marginBottom: verticalScale(4),
    },
    sectionSubtitle: {
        fontSize: normalize(13),
    },
    resultCard: {
        marginHorizontal: normalize(20),
        marginBottom: verticalScale(14),
        padding: normalize(18),
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        // shadowColor: '#0F172A',
        // shadowOffset: { width: 0, height: 10 },
        // shadowOpacity: 0.05,
        // shadowRadius: 18,
        // elevation: 4,
    },
    resultTopRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: verticalScale(10),
        marginBottom: verticalScale(14),
    },
    resultMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(8),
    },
    resultPriceBadge: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(999),
    },
    resultPriceText: {
        color: '#15803D',
        fontSize: normalize(11),
        fontWeight: '700',
    },
    resultStatusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(999),
    },
    resultStatusText: {
        color: '#B45309',
        fontSize: normalize(11),
        fontWeight: '700',
    },
    resultDateText: {
        fontSize: normalize(11),
        fontWeight: '600',
    },
    resultTypeBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(999),
    },
    resultTypeText: {
        fontSize: normalize(11),
        fontWeight: '700',
    },
    resultTitle: {
        fontSize: normalize(17),
        fontWeight: '800',
        lineHeight: normalize(24),
        marginBottom: verticalScale(16),
    },
    resultMetricsRow: {
        flexDirection: 'row',
        gap: normalize(10),
        marginBottom: verticalScale(16),
    },
    metricChip: {
        flex: 1,
        borderRadius: normalize(16),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(12),
    },
    metricLabel: {
        fontSize: normalize(11),
        fontWeight: '600',
        marginBottom: verticalScale(4),
    },
    metricValue: {
        fontSize: normalize(16),
        fontWeight: '800',
    },
    detailsButton: {
        borderRadius: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: normalize(8),
    },
    detailsButtonDisabled: {
        opacity: 0.85,
    },
    detailsButtonText: {
        fontSize: normalize(14),
        fontWeight: '700',
    },
    emptyWrap: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(8),
    },
    loadingContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(24),
    },
    avatarShimmer: {
        width: normalize(52),
        height: normalize(52),
        borderRadius: normalize(26),
        marginRight: normalize(12),
    },
    smallLine: {
        width: normalize(110),
        height: verticalScale(12),
        borderRadius: normalize(6),
        marginBottom: verticalScale(8),
    },
    nameLine: {
        width: normalize(150),
        height: verticalScale(18),
        borderRadius: normalize(8),
    },
    badgeShimmer: {
        width: normalize(90),
        height: verticalScale(34),
        borderRadius: normalize(18),
        marginLeft: normalize(12),
    },
    statShimmer: {
        flex: 1,
        height: verticalScale(96),
        borderRadius: normalize(16),
    },
    cardShimmer: {
        width: '100%',
        height: verticalScale(180),
        borderRadius: normalize(20),
        marginBottom: verticalScale(14),
    },
});

export default HomeScreen;
