import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';
import { useTheme } from '../../Themes/hooks';

type CoursesPaymentHistoryScreenProps = StackScreenProps<RootStackParamList, 'CoursesPaymentHistory'>;

interface PaymentItem {
    id: string;
    _id?: string;
    amount: number;
    status: string;
    createdAt: string;
    orderId?: string;
    paymentId?: string;
    course?: {
        id: string;
        title: string;
    };
    courseName?: string;
    description?: string;
    resourceId?: string;
    resourceTitle?: string;
    resourceType?: string;
}

const LIMIT = 10;

// Table column widths
const colOrderId = { width: normalize(120) };
const colDate = { width: normalize(115) };
const colItemName = { width: normalize(140) };
const colType = { width: normalize(165) };
const colPrice = { width: normalize(80) };
const colStatus = { width: normalize(115) };

const CoursesPaymentHistoryScreen = ({ navigation }: CoursesPaymentHistoryScreenProps) => {
    const dispatch = useDispatch();
    const { colors, tokens } = useTheme();
    const isDarkTheme = tokens.isDark;
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);

    const { paymentHistoryData, paymentHistoryLoading, paymentHistoryError } = useSelector(
        (state: RootState) => state.ProfileReducer
    );

    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPayments = (pageNum: number) => {
        dispatch(paymentHistoryRequest({ page: pageNum, limit: LIMIT }));
    };

    useEffect(() => {
        fetchPayments(1);
    }, []);

    useEffect(() => {
        if (paymentHistoryData) {
            const fetchedList: PaymentItem[] =
                Array.isArray(paymentHistoryData?.data?.items) ? paymentHistoryData.data.items :
                    Array.isArray(paymentHistoryData?.items) ? paymentHistoryData.items :
                        Array.isArray(paymentHistoryData?.data) ? paymentHistoryData.data :
                            Array.isArray(paymentHistoryData) ? paymentHistoryData : [];

            if (page === 1) {
                setPayments(fetchedList);
                setIsRefreshing(false);
            } else {
                setPayments(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = fetchedList.filter(p => p.id && !existingIds.has(p.id));
                    return [...prev, ...newItems];
                });
            }

            if (fetchedList.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        }
    }, [paymentHistoryData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        fetchPayments(1);
    };

    const handleLoadMore = () => {
        if (!paymentHistoryLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPayments(nextPage);
        }
    };

    const formatAmount = (amount?: number | string) => {
        if (amount === undefined || amount === null) return '₹0';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (num % 1 === 0) {
            return `₹${num}`;
        }
        return `₹${num.toFixed(2)}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '--';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '--';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        } catch {
            return '--';
        }
    };

    const getStatusDetails = (statusStr: string) => {
        const status = String(statusStr || 'failed').toLowerCase();
        if (status === 'captured' || status === 'success' || status === 'paid' || status === 'completed') {
            return {
                bg: colors.tagGreen,
                textColor: colors.tagGreenText,
                icon: 'check-circle',
                label: 'SUCCESS'
            };
        } else if (status === 'failed' || status === 'rejected') {
            return {
                bg: colors.tagOrange,
                textColor: colors.tagOrangeText,
                icon: 'x-circle',
                label: 'FAILED'
            };
        } else {
            return {
                bg: colors.tagCyan,
                textColor: colors.tagCyanText,
                icon: 'clock',
                label: 'PENDING'
            };
        }
    };

    const isInitialLoading = paymentHistoryLoading && page === 1 && !isRefreshing;
    const isLoadingMore = paymentHistoryLoading && page > 1;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Icon name="arrow-left" size={normalize(24)} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Course Payment History</Text>
                        <View style={styles.iconButton} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.Primary]}
                        tintColor={colors.Primary}
                    />
                }
            >
                <View style={styles.cardContainer}>
                    <View style={styles.titleBlock}>
                        <View style={styles.receiptIconBg}>
                            <FontAwesome5 name="file-invoice-dollar" size={normalize(22)} color={colors.text} />
                        </View>
                        <View style={styles.titleInfo}>
                            <Text style={styles.myOrdersTitle}>My Orders</Text>
                            <Text style={styles.myOrdersSubtitle}>Records of your transaction logs</Text>
                        </View>
                    </View>

                    <View style={styles.cardHeaderDivider} />

                    {isInitialLoading ? (
                        <View style={styles.centerLoader}>
                            <ActivityIndicator size="large" color={colors.Primary} />
                            <Text style={styles.loadingText}>Fetching transaction logs...</Text>
                        </View>
                    ) : paymentHistoryError ? (
                        <View style={styles.centerLoader}>
                            <Icon name="alert-triangle" size={normalize(32)} color={colors.tagOrangeText} style={{ marginBottom: verticalScale(12) }} />
                            <Text style={styles.errorTitle}>Failed to load payments</Text>
                            <Text style={styles.errorSubtitle}>
                                {paymentHistoryError?.response?.data?.message || paymentHistoryError?.message || 'Something went wrong'}
                            </Text>
                            <Pressable style={styles.retryButton} onPress={() => fetchPayments(1)}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} contentContainerStyle={styles.horizontalScrollContent}>
                            <View style={styles.tableContainer}>
                                <View style={styles.tableHeaderRow}>
                                    <Text style={[styles.tableHeaderCell, colOrderId]}>ORDER ID</Text>
                                    <Text style={[styles.tableHeaderCell, colDate]}>DATE</Text>
                                    <Text style={[styles.tableHeaderCell, colItemName]}>ITEM NAME</Text>
                                    <Text style={[styles.tableHeaderCell, colType]}>TYPE</Text>
                                    <Text style={[styles.tableHeaderCell, colPrice]}>PRICE</Text>
                                    <Text style={[styles.tableHeaderCell, colStatus]}>STATUS</Text>
                                </View>

                                {payments.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <View style={styles.emptyIconBg}>
                                            <Icon name="credit-card" size={normalize(32)} color={colors.textSecondary} />
                                        </View>
                                        <Text style={styles.emptyTitle}>No Payments Found</Text>
                                        <Text style={styles.emptySubtitle}>You haven't made any course purchases yet.</Text>
                                    </View>
                                ) : (
                                    <>
                                        {payments.map((item, index) => {
                                            const courseTitle = item?.resourceTitle || item?.course?.title || item?.courseName || item?.description || 'test payment';
                                            const statusDetails = getStatusDetails(item?.status);
                                            const formattedDate = formatDate(item?.createdAt);
                                            const transactionId = item?.orderId || item?.paymentId || item?._id || '--';

                                            let itemType = 'MOCK TEST BUNDLE';
                                            if (item?.resourceType === 'QUIZ_BUNDLE') {
                                                itemType = 'MOCK TEST BUNDLE';
                                            } else if (item?.resourceType) {
                                                itemType = item.resourceType.replace('_', ' ').toUpperCase();
                                            } else if (item?.course || item?.courseName) {
                                                itemType = 'COURSE BUNDLE';
                                            } else if (item?.description) {
                                                itemType = item.description.toUpperCase();
                                            }

                                            return (
                                                <View key={item?.id || index} style={styles.tableRow}>
                                                    <Text style={[styles.tableCellText, colOrderId, styles.orderIdText]} numberOfLines={1} ellipsizeMode="tail">
                                                        {transactionId}
                                                    </Text>

                                                    <View style={[styles.tableCellContainer, colDate]}>
                                                        <Icon name="calendar" size={normalize(14)} color={colors.textSecondary} style={{ marginRight: normalize(6) }} />
                                                        <Text style={styles.tableCellText}>{formattedDate}</Text>
                                                    </View>

                                                    <Text style={[styles.tableCellTextBold, colItemName]} numberOfLines={1} ellipsizeMode="tail">
                                                        {courseTitle}
                                                    </Text>

                                                    <View style={[styles.tableCellContainer, colType]}>
                                                        <View style={styles.typeBadge}>
                                                            <Text style={styles.typeBadgeText} numberOfLines={1} ellipsizeMode="tail">
                                                                {itemType}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <Text style={[styles.tableCellTextBold, colPrice]}>
                                                        {formatAmount(item?.amount)}
                                                    </Text>

                                                    <View style={[styles.tableCellContainer, colStatus]}>
                                                        <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg, borderColor: colors.border }]}>
                                                            <Icon name={statusDetails.icon} size={normalize(11)} color={statusDetails.textColor} style={{ marginRight: normalize(4) }} />
                                                            <Text style={[styles.statusLabel, { color: statusDetails.textColor }]}>{statusDetails.label}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}

                                        {hasMore && (
                                            <Pressable
                                                style={styles.loadMoreButton}
                                                onPress={handleLoadMore}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? (
                                                    <ActivityIndicator size="small" color={colors.Primary} />
                                                ) : (
                                                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                                                )}
                                            </Pressable>
                                        )}
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>
                <View style={{ height: verticalScale(40) }} />
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.Background },
    headerBackground: { backgroundColor: colors.statusBg, paddingBottom: verticalScale(16) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), width: normalize(40) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: normalize(16), paddingVertical: verticalScale(16) },
    cardContainer: { backgroundColor: colors.cardBackground, borderRadius: normalize(16), shadowColor: isDarkTheme ? colors.accent : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkTheme ? 0.16 : 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: colors.border, paddingBottom: verticalScale(10) },
    titleBlock: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16) },
    receiptIconBg: { width: normalize(44), height: normalize(44), borderRadius: normalize(10), backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center', marginRight: normalize(14), borderWidth: 1, borderColor: colors.border },
    titleInfo: { flex: 1 },
    myOrdersTitle: { fontSize: normalize(18), fontWeight: '800', color: colors.text },
    myOrdersSubtitle: { fontSize: normalize(13), color: colors.textSecondary, marginTop: verticalScale(2) },
    cardHeaderDivider: { height: 1, backgroundColor: colors.border, marginBottom: verticalScale(8) },
    centerLoader: { paddingVertical: verticalScale(60), justifyContent: 'center', alignItems: 'center', paddingHorizontal: normalize(24) },
    loadingText: { marginTop: verticalScale(12), fontSize: normalize(14), color: colors.textSecondary, fontWeight: '500' },
    errorTitle: { fontSize: normalize(16), fontWeight: '700', color: colors.text, marginBottom: verticalScale(4) },
    errorSubtitle: { fontSize: normalize(14), color: colors.textSecondary, textAlign: 'center', marginBottom: verticalScale(16) },
    retryButton: { backgroundColor: colors.Primary, paddingHorizontal: normalize(20), paddingVertical: verticalScale(10), borderRadius: normalize(10) },
    retryButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: '600' },
    horizontalScrollContent: { paddingHorizontal: normalize(12) },
    tableContainer: { width: normalize(740), paddingBottom: verticalScale(16) },
    tableHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(14), borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.Background },
    tableHeaderCell: { fontSize: normalize(11), fontWeight: '700', color: colors.textSecondary, paddingHorizontal: normalize(8) },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: colors.border },
    tableCellText: { fontSize: normalize(13), color: colors.text, paddingHorizontal: normalize(8) },
    tableCellTextBold: { fontSize: normalize(13), fontWeight: '700', color: colors.text, paddingHorizontal: normalize(8) },
    orderIdText: { color: colors.textSecondary },
    tableCellContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(8) },
    typeBadge: { borderWidth: 1, borderColor: colors.border, borderRadius: normalize(12), paddingHorizontal: normalize(10), paddingVertical: verticalScale(3), backgroundColor: colors.Background },
    typeBadgeText: { fontSize: normalize(10), fontWeight: '600', color: colors.textSecondary },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(10), paddingVertical: verticalScale(4), borderRadius: normalize(12), alignSelf: 'flex-start', borderWidth: 1 },
    statusLabel: { fontSize: normalize(11), fontWeight: '700' },
    loadMoreButton: { paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: verticalScale(8) },
    loadMoreButtonText: { fontSize: normalize(13), fontWeight: '600', color: colors.Primary },
    emptyContainer: { paddingVertical: verticalScale(60), justifyContent: 'center', alignItems: 'center', paddingHorizontal: normalize(24) },
    emptyIconBg: { width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16), borderWidth: 1, borderColor: colors.border },
    emptyTitle: { fontSize: normalize(15), fontWeight: '700', color: colors.text, marginBottom: verticalScale(4) },
    emptySubtitle: { fontSize: normalize(13), color: colors.textSecondary, textAlign: 'center' }
});

export default CoursesPaymentHistoryScreen;
