import React, { useEffect, useState } from 'react';
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
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigator/StackNav';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';
import { RootState } from '../../Redux/Store';

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

    // Handle pull-to-refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        fetchPayments(1);
    };

    // Load more entries
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
                bg: '#10B981',
                icon: 'check-circle',
                label: 'SUCCESS'
            };
        } else if (status === 'failed' || status === 'rejected') {
            return {
                bg: '#EF4444',
                icon: 'x-circle',
                label: 'FAILED'
            };
        } else {
            return {
                bg: '#F59E0B',
                icon: 'clock',
                label: 'PENDING'
            };
        }
    };

    const isInitialLoading = paymentHistoryLoading && page === 1 && !isRefreshing;
    const isLoadingMore = paymentHistoryLoading && page > 1;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            {/* Back Header */}
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

            {/* Main Content Scroll View */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[Colorpath.Primary]}
                        tintColor={Colorpath.Primary}
                    />
                }
            >
                <View style={styles.cardContainer}>
                    {/* Header Info Block */}
                    <View style={styles.titleBlock}>
                        <View style={styles.receiptIconBg}>
                            <FontAwesome5 name="file-invoice-dollar" size={normalize(22)} color="#1E293B" />
                        </View>
                        <View style={styles.titleInfo}>
                            <Text style={styles.myOrdersTitle}>My Orders</Text>
                            <Text style={styles.myOrdersSubtitle}>Records of your transaction logs</Text>
                        </View>
                    </View>

                    <View style={styles.cardHeaderDivider} />

                    {/* Content Logic */}
                    {isInitialLoading ? (
                        <View style={styles.centerLoader}>
                            <ActivityIndicator size="large" color={Colorpath.Primary} />
                            <Text style={styles.loadingText}>Fetching transaction logs...</Text>
                        </View>
                    ) : paymentHistoryError ? (
                        <View style={styles.centerLoader}>
                            <Icon name="alert-triangle" size={normalize(32)} color="#EF4444" style={{ marginBottom: verticalScale(12) }} />
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
                                {/* Header Row */}
                                <View style={styles.tableHeaderRow}>
                                    <Text style={[styles.tableHeaderCell, colOrderId]}>ORDER ID</Text>
                                    <Text style={[styles.tableHeaderCell, colDate]}>DATE</Text>
                                    <Text style={[styles.tableHeaderCell, colItemName]}>ITEM NAME</Text>
                                    <Text style={[styles.tableHeaderCell, colType]}>TYPE</Text>
                                    <Text style={[styles.tableHeaderCell, colPrice]}>PRICE</Text>
                                    <Text style={[styles.tableHeaderCell, colStatus]}>STATUS</Text>
                                </View>

                                {/* Data Rows */}
                                {payments.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <View style={styles.emptyIconBg}>
                                            <Icon name="credit-card" size={normalize(32)} color="#9CA3AF" />
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
                                                    {/* ORDER ID */}
                                                    <Text style={[styles.tableCellText, colOrderId, styles.orderIdText]} numberOfLines={1} ellipsizeMode="tail">
                                                        {transactionId}
                                                    </Text>

                                                    {/* DATE */}
                                                    <View style={[styles.tableCellContainer, colDate]}>
                                                        <Icon name="calendar" size={normalize(14)} color="#9CA3AF" style={{ marginRight: normalize(6) }} />
                                                        <Text style={styles.tableCellText}>{formattedDate}</Text>
                                                    </View>

                                                    {/* ITEM NAME */}
                                                    <Text style={[styles.tableCellTextBold, colItemName]} numberOfLines={1} ellipsizeMode="tail">
                                                        {courseTitle}
                                                    </Text>

                                                    {/* TYPE */}
                                                    <View style={[styles.tableCellContainer, colType]}>
                                                        <View style={styles.typeBadge}>
                                                            <Text style={styles.typeBadgeText} numberOfLines={1} ellipsizeMode="tail">
                                                                {itemType}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* PRICE */}
                                                    <Text style={[styles.tableCellTextBold, colPrice]}>
                                                        {formatAmount(item?.amount)}
                                                    </Text>

                                                    {/* STATUS */}
                                                    <View style={[styles.tableCellContainer, colStatus]}>
                                                        <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
                                                            <Icon name={statusDetails.icon} size={normalize(11)} color="#FFFFFF" style={{ marginRight: normalize(4) }} />
                                                            <Text style={styles.statusLabel}>{statusDetails.label}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}

                                        {/* Load More Button */}
                                        {hasMore && (
                                            <Pressable
                                                style={styles.loadMoreButton}
                                                onPress={handleLoadMore}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? (
                                                    <ActivityIndicator size="small" color={Colorpath.Primary} />
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    headerBackground: { backgroundColor: Colorpath.Primary, paddingBottom: verticalScale(16) },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: normalize(20), paddingTop: verticalScale(10) },
    iconButton: { padding: normalize(8), width: normalize(40) },
    headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: normalize(16), paddingVertical: verticalScale(16) },
    cardContainer: { backgroundColor: '#FFFFFF', borderRadius: normalize(16), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB', paddingBottom: verticalScale(10) },
    titleBlock: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(20), paddingVertical: verticalScale(16) },
    receiptIconBg: { width: normalize(44), height: normalize(44), borderRadius: normalize(10), backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: normalize(14) },
    titleInfo: { flex: 1 },
    myOrdersTitle: { fontSize: normalize(18), fontWeight: '800', color: '#0F172A' },
    myOrdersSubtitle: { fontSize: normalize(13), color: '#64748B', marginTop: verticalScale(2) },
    cardHeaderDivider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: verticalScale(8) },
    centerLoader: { paddingVertical: verticalScale(60), justifyContent: 'center', alignItems: 'center', paddingHorizontal: normalize(24) },
    loadingText: { marginTop: verticalScale(12), fontSize: normalize(14), color: '#64748B', fontWeight: '500' },
    errorTitle: { fontSize: normalize(16), fontWeight: '700', color: '#0F172A', marginBottom: verticalScale(4) },
    errorSubtitle: { fontSize: normalize(14), color: '#64748B', textAlign: 'center', marginBottom: verticalScale(16) },
    retryButton: { backgroundColor: Colorpath.Primary, paddingHorizontal: normalize(20), paddingVertical: verticalScale(10), borderRadius: normalize(10) },
    retryButtonText: { color: '#FFFFFF', fontSize: normalize(14), fontWeight: '600' },
    horizontalScrollContent: { paddingHorizontal: normalize(12) },
    tableContainer: { width: normalize(740), paddingBottom: verticalScale(16) },
    tableHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(14), borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FAFBFF' },
    tableHeaderCell: { fontSize: normalize(11), fontWeight: '700', color: '#64748B', paddingHorizontal: normalize(8) },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    tableCellText: { fontSize: normalize(13), color: '#4B5563', paddingHorizontal: normalize(8) },
    tableCellTextBold: { fontSize: normalize(13), fontWeight: '700', color: '#0F172A', paddingHorizontal: normalize(8) },
    orderIdText: { color: '#9CA3AF' },
    tableCellContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(8) },
    typeBadge: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: normalize(12), paddingHorizontal: normalize(10), paddingVertical: verticalScale(3), backgroundColor: '#F9FAFB' },
    typeBadgeText: { fontSize: normalize(10), fontWeight: '600', color: '#374151' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(10), paddingVertical: verticalScale(4), borderRadius: normalize(12), alignSelf: 'flex-start' },
    statusLabel: { fontSize: normalize(11), fontWeight: '700', color: '#FFFFFF' },
    loadMoreButton: { paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: verticalScale(8) },
    loadMoreButtonText: { fontSize: normalize(13), fontWeight: '600', color: Colorpath.Primary },
    emptyContainer: { paddingVertical: verticalScale(60), justifyContent: 'center', alignItems: 'center', paddingHorizontal: normalize(24) },
    emptyIconBg: { width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16) },
    emptyTitle: { fontSize: normalize(15), fontWeight: '700', color: '#374151', marginBottom: verticalScale(4) },
    emptySubtitle: { fontSize: normalize(13), color: '#6B7280', textAlign: 'center' }
});

export default CoursesPaymentHistoryScreen;
