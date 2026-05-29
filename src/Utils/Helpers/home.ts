const AVATAR_COLORS = ['#2563EB', '#0F766E', '#9333EA', '#C2410C', '#BE185D', '#047857'];

const asNumber = (value: any) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

const toWords = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

export const getInitials = (name?: string | null) => {
    const source = (name || '').trim();
    if (!source) {
        return 'NA';
    }

    const words = toWords(source);
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
};

export const getAvatarBackgroundColor = (seed?: string | null) => {
    const value = seed || 'avatar';
    const hash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const formatPercent = (value: any) => {
    const num = asNumber(value);
    if (num === null) {
        return '--';
    }

    return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}%`;
};

export const formatScore = (value: any) => {
    const num = asNumber(value);
    return num === null ? '--' : `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}`;
};

export const formatDisplayDate = (value: any) => {
    if (!value) {
        return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const formatTimeSpent = (value: any) => {
    if (typeof value === 'string' && /[a-z]/i.test(value)) {
        return value;
    }

    const totalSeconds = asNumber(value);
    if (totalSeconds === null) {
        return '--';
    }

    const seconds = totalSeconds > 1000 ? Math.round(totalSeconds) : Math.round(totalSeconds * 60);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
};

export const getProfileImageUri = (profile: any) =>
    firstDefined(
        profile?.profileImage,
        profile?.profilePicture,
        profile?.avatar,
        profile?.image,
        profile?.photo,
        profile?.user?.profileImage,
        profile?.user?.avatar,
    ) || null;

export const getProfileName = (profile: any) =>
    firstDefined(
        profile?.name,
        profile?.fullName,
        profile?.userName,
        profile?.username,
        profile?.studentName,
        [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim(),
        profile?.user?.name,
    ) || 'Student';

export const normalizeDashboardStats = (dashboard: any) => {
    const summary = dashboard?.summary || dashboard?.stats || dashboard?.overview || dashboard?.dashboard || dashboard || {};
    const recentAttempts = Array.isArray(summary?.recentAttempts) ? summary.recentAttempts : [];
    const calculatedAverageAccuracy = recentAttempts.length > 0
        ? recentAttempts.reduce((total: number, item: any) => {
            const score = asNumber(item?.score) || 0;
            const maxScore = asNumber(item?.maxScore) || 0;
            const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
            return total + accuracy;
        }, 0) / recentAttempts.length
        : null;

    return {
        score: firstDefined(summary?.score, summary?.totalScore, summary?.avgScore, summary?.averageScore, summary?.points),
        accuracy: firstDefined(summary?.accuracy, summary?.accuracyPercentage, summary?.avgAccuracy, summary?.averageAccuracy, calculatedAverageAccuracy),
        timeSpent: firstDefined(summary?.timeSpent, summary?.timeSpend, summary?.timeTaken, summary?.studyTime, summary?.totalTimeSpent),
    };
};

const getRecentCollections = (dashboard: any) => {
    const candidates = [
        dashboard?.recentMocks,
        dashboard?.recentCourses,
        dashboard?.recentAttempts,
        dashboard?.recentTests,
        dashboard?.latestAttempts,
        dashboard?.items,
        dashboard?.data?.recentMocks,
        dashboard?.data?.recentCourses,
        dashboard?.data?.recentAttempts,
    ];

    return candidates.find(Array.isArray) || [];
};

export const normalizeRecentItem = (item: any, index: number) => {
    const score = firstDefined(item?.score, item?.obtainedMarks, item?.marks, item?.result?.score, 0);
    const maxScore = firstDefined(item?.maxScore, item?.totalMarks, item?.fullMarks, item?.result?.maxScore, 0);
    const calculatedAccuracy = Number(maxScore) > 0 ? ((Number(score) / Number(maxScore)) * 100).toFixed(0) : '0';

    return {
        id: firstDefined(item?._id, item?.id, item?.attemptId, item?.attempt?._id, item?.quizId, `recent-${index}`),
        attemptId: firstDefined(item?.attemptId, item?.attempt?._id, item?.attempt?.id, item?._id, item?.id),
        title: firstDefined(item?.title, item?.name, item?.quizTitle, item?.courseTitle, item?.mockTitle, item?.attempt?.title, item?.quiz?.title, `Mock #${index + 1}`),
        score,
        maxScore,
        accuracy: firstDefined(item?.accuracy, item?.accuracyPercentage, item?.result?.accuracy, calculatedAccuracy),
        date: firstDefined(item?.submittedAt, item?.date, item?.createdAt, item?.attemptedAt, item?.updatedAt, item?.completedAt),
        submittedAt: firstDefined(item?.submittedAt, item?.date, item?.createdAt, item?.attemptedAt, item?.updatedAt, item?.completedAt),
        type: firstDefined(item?.type, item?.contentType, item?.category, 'Mock Test'),
        price: firstDefined(item?.price, item?.amount, 0),
        status: firstDefined(item?.status, item?.attemptStatus, 'SUBMITTED'),
    };
};

export const normalizeRecentItems = (dashboard: any) => getRecentCollections(dashboard).map(normalizeRecentItem);

export const getDashboardHeadline = (dashboard: any, items: any[]) =>
    firstDefined(
        dashboard?.recentSectionTitle,
        dashboard?.recentTitle,
        dashboard?.sectionTitle,
        items.length > 0 ? 'Recent Performance' : null,
    ) || 'Recent Performance';
