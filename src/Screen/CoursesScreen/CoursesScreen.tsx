import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput, ActivityIndicator, Modal, Linking, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
    bundleIDRequest,
    clearBundleFlowState,
    enrollBundleFailure,
    enrollBundleRequest,
    enrollBundleSuccess,
    getBundleListRequest,
    getStudentModulesRequest,
    getSubBundleDetailsRequest,
    getSubBundleListRequest,
    paymentRequest,
    paymentSuccess,
    paymentFailure,
} from '../../Redux/Reducers/MockTestReducer';
import { RootState } from '../../Redux/Store';
import { paymentHistoryRequest } from '../../Redux/Reducers/ProfileReducer';

type CoursesScreenProps = {
    navigation: any;
};

const DEFAULT_EXAM_META = {
    icon: 'book-open',
    iconType: 'Feather',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
    pattern: {
        questions: '-',
        marks: '-',
        marksPerQuestion: '-',
        negativeMarking: '-',
        duration: '-',
        note: '-',
    },
};

const EXAM_ICON_THEMES = [
    { bgColor: '#EEF2FF', iconColor: '#4F46E5' },
    { bgColor: '#E0F2FE', iconColor: '#0284C7' },
    { bgColor: '#FEF3C7', iconColor: '#D97706' },
    { bgColor: '#D1FAE5', iconColor: '#059669' },
    { bgColor: '#F3E8FF', iconColor: '#7C3AED' },
    { bgColor: '#FEE2E2', iconColor: '#DC2626' },
    { bgColor: '#FFEDD5', iconColor: '#EA580C' },
];

const normalizeTitle = (value: string = '') =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const ensureArray = (value: any) => (Array.isArray(value) ? value : []);

const getBundlePayload = (bundle: any) =>
    bundle?.bundle ||
    bundle?.data?.bundle ||
    bundle?.data ||
    bundle?.details ||
    bundle?.item ||
    bundle?.result ||
    bundle;

const getThemeByIndex = (index: number, themes: any[]) =>
    themes[index % themes.length];

const getThemeIndexFromText = (value: string = '') =>
    value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getBundleId = (bundle: any) =>
    bundle?.id ||
    bundle?._id ||
    bundle?.testId ||
    bundle?.bundleId ||
    null;

const getQuizId = (quiz: any) => quiz?.id || quiz?._id || quiz?.testId || quiz?.quizId;

const getItemId = (item: any) =>
    item?.id ||
    item?._id ||
    item?.noteId ||
    item?.questionBankId ||
    item?.videoBankId ||
    item?.bankId ||
    null;

const getBundleItems = (bundleList: any) =>
    ensureArray(
        Array.isArray(bundleList)
            ? bundleList
            : (
                bundleList?.data?.bundles ||
                bundleList?.data?.items ||
                bundleList?.data?.quizzes ||
                bundleList?.bundles ||
                bundleList?.quizzes ||
                bundleList?.items ||
                bundleList?.data ||
                []
            )
    ).map(getBundlePayload);

const getSubBundleItems = (subBundleList: any) =>
    ensureArray(
        Array.isArray(subBundleList)
            ? subBundleList
            : (
                subBundleList?.data?.subBundles ||
                subBundleList?.data?.items ||
                subBundleList?.subBundles ||
                subBundleList?.items ||
                subBundleList?.data ||
                []
            )
    ).map(getBundlePayload);

const parseMaybeJson = (value: any) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue || (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('['))) {
        return value;
    }

    try {
        return JSON.parse(trimmedValue);
    } catch {
        return value;
    }
};

const getBundleQuizzes = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const parsedPayloadData = parseMaybeJson(payload?.data);
    const parsedBundleItems = parseMaybeJson(payload?.bundleItems);
    const parsedExamData = parseMaybeJson(payload?.examData);
    const quizCollections = [
        payload?.mockTests,
        payload?.quizzes,
        payload?.quizIds,
        payload?.tests,
        parsedBundleItems,
        payload?.items,
        parsedPayloadData?.quizzes,
        parsedPayloadData?.mockTests,
        parsedPayloadData?.quizIds,
        parsedPayloadData?.tests,
        parsedPayloadData?.bundleItems,
        parsedPayloadData?.items,
        parsedExamData?.quizzes,
        parsedExamData?.mockTests,
        parsedExamData?.tests,
    ];

    for (const collection of quizCollections) {
        if (Array.isArray(collection) && collection.length > 0) {
            return collection;
        }
    }

    return [];
};

const getDetailCollections = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const parsedData = parseMaybeJson(bundle?.data);
    const sources = [bundle, payload, parsedData];
    const getCollection = (...keys: string[]) => {
        for (const source of sources) {
            for (const key of keys) {
                const value = source?.[key];
                if (Array.isArray(value) && value.length > 0) {
                    return value;
                }
            }
        }

        return [];
    };

    const quizzes = getCollection('quizzes', 'mockTests', 'tests');
    const noteBanks = getCollection('note_banks', 'noteBanks', 'notes');
    const questionBanks = getCollection('question_banks', 'questionBanks', 'questions');
    const videoBanks = getCollection('video_banks', 'videoBanks', 'videos', 'youtube_banks', 'youtubeBanks', 'youtube');
    const youtubeBanks = getCollection('youtube_banks', 'youtubeBanks', 'youtube');
    const quizCount = Number(
        firstDisplayValue(
            payload?.quizCount,
            parsedData?.quizCount,
            quizzes.length,
        ) || 0,
    );

    return {
        quizzes,
        noteBanks,
        questionBanks,
        videoBanks,
        youtubeBanks,
        quizCount,
    };
};

const getItemTitle = (item: any, fallback: string) =>
    item?.title ||
    item?.name ||
    item?.label ||
    item?.heading ||
    item?.questionTitle ||
    item?.videoTitle ||
    item?.noteTitle ||
    fallback;

const getItemLink = (item: any) =>
    item?.url ||
    item?.link ||
    item?.fileUrl ||
    item?.documentUrl ||
    item?.videoUrl ||
    item?.youtubeUrl ||
    item?.youtubeLink ||
    item?.contentUrl ||
    item?.path ||
    null;

const getItemDescription = (item: any) =>
    item?.description ||
    item?.subtitle ||
    item?.summary ||
    item?.text ||
    item?.question ||
    item?.questionText ||
    '';

const toDisplayText = (value: any, fallback = ''): string => {
    if (typeof value === 'string') {
        return htmlToPlainText(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value
            .map(entry => toDisplayText(entry, ''))
            .filter(Boolean)
            .join(', ');
    }

    if (value && typeof value === 'object') {
        return toDisplayText(
            value?.htmlContent ||
            value?.label ||
            value?.title ||
            value?.text ||
            value?.name ||
            value?.value ||
            value?.question ||
            value?.answer ||
            value?.content ||
            fallback,
            fallback,
        );
    }

    return fallback;
};

const getQuestionBankYear = (item: any) =>
    item?.year ||
    item?.examYear ||
    item?.sessionYear ||
    item?.academicYear ||
    null;

const getQuestionBankQuestions = (response: any) => {
    const seen = new WeakSet<object>();
    const arrayKeys = [
        'questions',
        'items',
        'results',
        'rows',
        'docs',
        'records',
        'list',
        'question_list',
        'questionList',
        'data',
        'result',
        'payload',
        'questionBank',
        'question_bank',
        'bank',
    ];

    const walk = (value: any): any[] => {
        if (!value) {
            return [];
        }

        const parsedValue = parseMaybeJson(value);
        if (Array.isArray(parsedValue)) {
            return parsedValue;
        }

        if (!parsedValue || typeof parsedValue !== 'object') {
            return [];
        }

        const looksLikeQuestion =
            parsedValue?.question !== undefined ||
            parsedValue?.questionText !== undefined ||
            parsedValue?.text !== undefined ||
            parsedValue?.answer !== undefined ||
            parsedValue?.explanation !== undefined ||
            parsedValue?.options !== undefined ||
            parsedValue?.choices !== undefined;

        if (looksLikeQuestion) {
            return [parsedValue];
        }

        if (seen.has(parsedValue)) {
            return [];
        }
        seen.add(parsedValue);

        for (const key of arrayKeys) {
            const candidate = parsedValue?.[key];
            if (Array.isArray(candidate)) {
                return candidate;
            }

            const nested = walk(candidate);
            if (nested.length > 0) {
                return nested;
            }
        }

        for (const nestedValue of Object.values(parsedValue)) {
            const nested = walk(nestedValue);
            if (nested.length > 0) {
                return nested;
            }
        }

        return [];
    };

    const payloadCandidates = [
        response?.data?.data,
        response?.data,
        response,
    ];

    for (const candidate of payloadCandidates) {
        const questions = walk(candidate);
        if (questions.length > 0) {
            return questions;
        }
    }

    return [];
};

const getQuestionPrompt = (item: any) =>
    item?.question ||
    item?.questionText ||
    item?.text ||
    item?.title ||
    item?.prompt ||
    '';

const getQuestionAnswer = (item: any) =>
    item?.answer ||
    item?.correctAnswer ||
    item?.correct_answer ||
    item?.solution ||
    item?.response ||
    '';

const getQuestionExplanation = (item: any) =>
    item?.explanation ||
    item?.answerExplanation ||
    item?.answer_explanation ||
    item?.solutionExplanation ||
    item?.solution ||
    '';

const getQuestionOptions = (item: any) =>
    ensureArray(
        item?.options ||
        item?.choices ||
        item?.answers ||
        item?.variants ||
        item?.mcqOptions ||
        item?.optionList ||
        [],
    );

const getVideoBankUrl = (item: any) =>
    item?.videoUrl ||
    item?.youtubeUrl ||
    item?.url ||
    item?.link ||
    item?.contentUrl ||
    item?.path ||
    null;

const getYouTubeVideoId = (url: string) => {
    if (!url) {
        return '';
    }

    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]+)/i);
    return match?.[1] || '';
};

const getVideoBankItems = (response: any) => {
    const payloadCandidates = [
        response?.data?.data,
        response?.data,
        response,
    ];

    const arrayKeys = ['items', 'videos', 'results', 'data', 'list', 'records'];

    const seen = new WeakSet<object>();
    const walk = (value: any): any[] => {
        if (!value) {
            return [];
        }

        const parsedValue = parseMaybeJson(value);
        if (Array.isArray(parsedValue)) {
            return parsedValue;
        }

        if (!parsedValue || typeof parsedValue !== 'object') {
            return [];
        }

        if (seen.has(parsedValue)) {
            return [];
        }
        seen.add(parsedValue);

        if (parsedValue?.videoUrl || parsedValue?.youtubeUrl || parsedValue?.url || parsedValue?.link) {
            return [parsedValue];
        }

        for (const key of arrayKeys) {
            const candidate = parsedValue?.[key];
            if (Array.isArray(candidate)) {
                return candidate;
            }

            const nested = walk(candidate);
            if (nested.length > 0) {
                return nested;
            }
        }

        for (const nestedValue of Object.values(parsedValue)) {
            const nested = walk(nestedValue);
            if (nested.length > 0) {
                return nested;
            }
        }

        return [];
    };

    for (const candidate of payloadCandidates) {
        const items = walk(candidate);
        if (items.length > 0) {
            return items;
        }
    }

    return [];
};

const normalizeCourseSections = (bundle: any) => {
    const collections = getDetailCollections(bundle);
    return [
        {
            key: 'question',
            label: 'Question bank',
            badge: 'QUESTION BANK',
            items: collections.questionBanks,
            type: 'question' as const,
        },
        {
            key: 'note',
            label: 'Note bank',
            badge: 'NOTE BANK',
            items: collections.noteBanks,
            type: 'note' as const,
        },
        {
            key: 'video',
            label: 'VideoLink Bank',
            badge: 'VIDEO BANK',
            items: collections.videoBanks,
            type: 'video' as const,
        },
    ].filter(section => Array.isArray(section.items) && section.items.length > 0);
};

const getNoteBankId = (item: any) =>
    item?.noteId ||
    item?.note_id ||
    item?.note?.noteId ||
    item?.parentNoteId ||
    item?.id ||
    item?._id ||
    null;

const htmlToPlainText = (html: string = '') => {
    if (!html) {
        return '';
    }

    return html
        .replace(/<\s*\/\s*(p|div|h[1-6]|li|tr|table|tbody|thead|pre|blockquote|ul|ol)\s*>/gi, '\n')
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const getBundleMockCount = (bundle: any) => {
    const payload = getBundlePayload(bundle);
    const quizzes = getBundleQuizzes(payload);

    if (quizzes.length > 0) {
        return quizzes.length;
    }

    const parsedPattern = parseMaybeJson(payload?.examPattern);
    const parsedData = parseMaybeJson(payload?.data);

    const directCount = firstDisplayValue(
        payload?.mockTestCount,
        payload?.mockTestsCount,
        payload?.quizCount,
        payload?.quizzesCount,
        payload?.testCount,
        payload?.testsCount,
        payload?.totalMocks,
        payload?.totalMockTests,
        payload?.totalQuizzes,
        parsedData?.mockTestCount,
        parsedData?.mockTestsCount,
        parsedData?.quizCount,
        parsedData?.quizzesCount,
        parsedData?.testCount,
        parsedData?.testsCount,
        parsedData?.totalMocks,
        parsedData?.totalMockTests,
        parsedData?.totalQuizzes,
        parsedPattern?.mockTestCount,
        parsedPattern?.quizCount,
        parsedPattern?.testCount,
    );

    return Number(directCount || 0);
};

const buildDetailTabs = (bundle: any) => {
    const collections = getDetailCollections(bundle);
    const tabs = [
        {
            key: 'mock',
            label: `Mock Test (${collections.quizCount})`,
            items: collections.quizzes,
        },
        {
            key: 'note',
            label: `Note Bank (${collections.noteBanks.length})`,
            items: collections.noteBanks,
        },
        {
            key: 'question',
            label: `Question Bank (${collections.questionBanks.length})`,
            items: collections.questionBanks,
        },
        {
            key: 'youtube',
            label: `YouTube (${collections.youtubeBanks.length})`,
            items: collections.youtubeBanks,
        },
    ].filter(tab => Array.isArray(tab.items) && tab.items.length > 0);

    return tabs;
};

const getQuizTopicName = (quiz: any) =>
    quiz?.masterTopicId?.name ||
    quiz?.masterTopic?.name ||
    quiz?.topic?.name ||
    quiz?.topicName ||
    quiz?.category ||
    'General';

const getQuizQuestionCount = (quiz: any) =>
    Number(quiz?.questionCount || quiz?.questionsCount || quiz?.totalQuestions || quiz?.questions?.length || 0);

const getQuizDuration = (quiz: any) =>
    Number(quiz?.durationMinutes || quiz?.duration || quiz?.timeLimit || 0);

const getQuizPrice = (quiz: any) =>
    Number(quiz?.price || 0);

const getQuizTotalMarks = (quiz: any) =>
    Number(
        quiz?.totalMarks ||
        quiz?.maxMarks ||
        quiz?.fullMarks ||
        quiz?.marks ||
        0
    );

const getQuizMarksPerQuestion = (quiz: any) => {
    const directValue =
        quiz?.marksPerQuestion ??
        quiz?.defaultMarks ??
        quiz?.positiveMarks ??
        quiz?.correctMarks;

    if (directValue !== undefined && directValue !== null && `${directValue}` !== '') {
        return Number(directValue);
    }

    const questionCount = getQuizQuestionCount(quiz);
    const totalMarks = getQuizTotalMarks(quiz);

    if (questionCount > 0 && totalMarks > 0) {
        return totalMarks / questionCount;
    }

    return 0;
};

const getQuizNegativeMarking = (quiz: any) => {
    const negativeMarking = quiz?.negativeMarking ?? quiz?.negativeMarks ?? quiz?.penalty;

    if (typeof negativeMarking === 'object' && negativeMarking !== null) {
        return negativeMarking?.value ?? '-';
    }

    return negativeMarking ?? '-';
};

const hasDisplayValue = (value: any) =>
    value !== undefined &&
    value !== null &&
    (!(typeof value === 'string') || value.trim() !== '');

const firstDisplayValue = (...values: any[]) =>
    values.find(value => hasDisplayValue(value));

const getPatternValue = (sources: any[], keys: string[]) => {
    for (const source of sources) {
        const parsedSource = parseMaybeJson(source);

        if (!parsedSource || typeof parsedSource !== 'object') {
            continue;
        }

        for (const key of keys) {
            const value = parsedSource?.[key];
            if (hasDisplayValue(value)) {
                return value;
            }
        }
    }

    return null;
};

const getExamMetaByTitle = (title: string = '') => {
    const normalizedBundleTitle = normalizeTitle(title);
    const theme = getThemeByIndex(getThemeIndexFromText(normalizedBundleTitle), EXAM_ICON_THEMES);

    if (normalizedBundleTitle.includes('pgt') || normalizedBundleTitle.includes('graduate')) {
        return { ...DEFAULT_EXAM_META, icon: 'graduation-cap', iconType: 'FontAwesome5', ...theme };
    }
    if (normalizedBundleTitle.includes('teacher') || normalizedBundleTitle.includes('tgt') || normalizedBundleTitle.includes('school')) {
        return { ...DEFAULT_EXAM_META, icon: 'book', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('net') || normalizedBundleTitle.includes('jrf') || normalizedBundleTitle.includes('award')) {
        return { ...DEFAULT_EXAM_META, icon: 'award', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('science') || normalizedBundleTitle.includes('pcm') || normalizedBundleTitle.includes('cbz')) {
        return { ...DEFAULT_EXAM_META, icon: 'activity', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('bed') || normalizedBundleTitle.includes('education')) {
        return { ...DEFAULT_EXAM_META, icon: 'bar-chart-2', iconType: 'Feather', ...theme };
    }
    if (normalizedBundleTitle.includes('test') || normalizedBundleTitle.includes('mock')) {
        return { ...DEFAULT_EXAM_META, icon: 'clipboard', iconType: 'Feather', ...theme };
    }

    return { ...DEFAULT_EXAM_META, ...theme };
};

const parseBundleDescription = (description: string = '') => {
    const safeDescription = typeof description === 'string' ? description.trim() : '';
    let descriptionObject: any = null;

    if (safeDescription.startsWith('{') || safeDescription.startsWith('[')) {
        try {
            descriptionObject = JSON.parse(safeDescription);
        } catch {
            descriptionObject = null;
        }
    }

    const getValue = (key: string) => {
        const jsonValue =
            descriptionObject?.[key] ??
            descriptionObject?.pattern?.[key] ??
            descriptionObject?.examPattern?.[key];

        if (jsonValue !== undefined && jsonValue !== null && `${jsonValue}`.trim()) {
            return `${jsonValue}`.trim();
        }

        const match = safeDescription.match(new RegExp(`${key}\\s*:\\s*['"]?([^,\\n'"]+)['"]?`, 'i'));
        return match?.[1]?.trim() || DEFAULT_EXAM_META.pattern[key as keyof typeof DEFAULT_EXAM_META.pattern];
    };

    return {
        questions: getValue('questions'),
        marks: getValue('marks'),
        marksPerQuestion: getValue('marksPerQuestion'),
        negativeMarking: getValue('negativeMarking'),
        duration: getValue('duration'),
        note: getValue('note'),
    };
};

const buildPatternFromBundle = (bundle: any, examPattern: any) => {
    const quizzes = getBundleQuizzes(bundle);
    const bundlePattern =
        parseMaybeJson(bundle?.examPattern) ||
        parseMaybeJson(bundle?.pattern) ||
        parseMaybeJson(bundle?.exam_pattern) ||
        parseMaybeJson(bundle?.details?.examPattern) ||
        parseMaybeJson(bundle?.details?.pattern) ||
        parseMaybeJson(bundle?.data?.examPattern) ||
        parseMaybeJson(bundle?.data?.pattern) ||
        {};
    const parsedPattern = parseBundleDescription(bundle?.description || '');
    const patternSources = [
        bundlePattern,
        parseMaybeJson(bundle?.examPatternJson),
        parseMaybeJson(bundle?.meta),
        parseMaybeJson(bundle?.details?.meta),
        parseMaybeJson(bundle?.data),
    ];
    const totalQuestions = quizzes.reduce((sum: number, quiz: any) => sum + getQuizQuestionCount(quiz), 0);
    const totalMarks = quizzes.reduce((sum: number, quiz: any) => sum + getQuizTotalMarks(quiz), 0);
    const durationMinutes = quizzes.reduce((max: number, quiz: any) => Math.max(max, getQuizDuration(quiz)), 0);
    const firstQuiz = quizzes.find((quiz: any) => quiz && typeof quiz === 'object');
    const bundleQuestions = firstDisplayValue(
        bundle?.questionCount,
        bundle?.questionsCount,
        bundle?.totalQuestions,
        bundle?.noOfQuestions,
        getPatternValue(patternSources, ['questions', 'questionCount', 'questionsCount', 'totalQuestions', 'noOfQuestions']),
        parsedPattern.questions !== '-' ? parsedPattern.questions : null,
        totalQuestions || null,
    );
    const bundleMarks = firstDisplayValue(
        bundle?.totalMarks,
        bundle?.maxMarks,
        bundle?.fullMarks,
        bundle?.marks,
        getPatternValue(patternSources, ['marks', 'totalMarks', 'maxMarks', 'fullMarks']),
        parsedPattern.marks !== '-' ? parsedPattern.marks : null,
        totalMarks || null,
    );
    const resolvedMarksPerQuestion = firstDisplayValue(
        bundle?.marksPerQuestion,
        bundle?.defaultMarks,
        bundle?.positiveMarks,
        bundle?.correctMarks,
        getPatternValue(patternSources, ['marksPerQuestion', 'defaultMarks', 'positiveMarks', 'correctMarks']),
        parsedPattern.marksPerQuestion !== '-' ? parsedPattern.marksPerQuestion : null,
        firstQuiz ? getQuizMarksPerQuestion(firstQuiz) || null : null,
        hasDisplayValue(bundleQuestions) && hasDisplayValue(bundleMarks) && Number(bundleQuestions) > 0
            ? (Number(bundleMarks) / Number(bundleQuestions)).toFixed(2)
            : null,
    );
    const resolvedNegativeMarking = firstDisplayValue(
        bundle?.negativeMarking?.value,
        bundle?.negativeMarking,
        bundle?.negativeMarks,
        bundle?.penalty,
        getPatternValue(patternSources, ['negativeMarking', 'negativeMarks', 'penalty']),
        parsedPattern.negativeMarking !== '-' ? parsedPattern.negativeMarking : null,
        firstQuiz ? getQuizNegativeMarking(firstQuiz) : null,
    );
    const resolvedDuration = firstDisplayValue(
        bundle?.durationMinutes,
        bundle?.duration,
        bundle?.timeLimit,
        getPatternValue(patternSources, ['duration', 'durationMinutes', 'timeLimit']),
        parsedPattern.duration !== '-' ? parsedPattern.duration : null,
        durationMinutes ? `${durationMinutes} min` : null,
    );
    const resolvedNote = firstDisplayValue(
        getPatternValue(patternSources, ['note', 'description', 'instruction']),
        parsedPattern.note !== '-' ? parsedPattern.note : null,
        bundle?.description?.trim(),
        'Tap a mock to continue.',
    );

    return {
        questions: hasDisplayValue(bundleQuestions) ? `${bundleQuestions}` : examPattern.questions,
        marks: hasDisplayValue(bundleMarks) ? `${bundleMarks}` : examPattern.marks,
        marksPerQuestion: hasDisplayValue(resolvedMarksPerQuestion) ? `${resolvedMarksPerQuestion}` : examPattern.marksPerQuestion,
        negativeMarking: hasDisplayValue(resolvedNegativeMarking) ? `${resolvedNegativeMarking}` : examPattern.negativeMarking,
        duration: hasDisplayValue(resolvedDuration) ? `${resolvedDuration}` : examPattern.duration,
        note: hasDisplayValue(resolvedNote) ? `${resolvedNote}` : examPattern.note,
    };
};

const buildQuizCards = (bundle: any) =>
    getBundleQuizzes(bundle)
        .map((quiz: any, index: number) => {
            if (!quiz || typeof quiz !== 'object') {
                return null;
            }

            return {
                id: getQuizId(quiz) || `${index}`,
                title: quiz?.title || quiz?.name || `Mock ${index + 1}`,
                topicName: getQuizTopicName(quiz),
                questionCount: getQuizQuestionCount(quiz),
                durationMinutes: getQuizDuration(quiz),
                price: getQuizPrice(quiz),
                totalMarks: getQuizTotalMarks(quiz),
                negativeMarking: getQuizNegativeMarking(quiz),
                rawQuiz: quiz,
            };
        })
        .filter(Boolean);

const buildQuizGroups = (bundle: any) => {
    const groups = buildQuizCards(bundle).reduce((acc: any, quiz: any) => {
        const key = quiz.topicName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(quiz);
        return acc;
    }, {});

    return Object.entries(groups).map(([title, quizzes]) => ({
        title,
        quizzes,
    }));
};

const buildSelectedExam = (bundle: any, forceEnrolled = false) => {
    const normalizedBundle = getBundlePayload(bundle);
    const examMeta = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');

    return {
        ...examMeta,
        id: getBundleId(normalizedBundle),
        name: normalizedBundle?.title || normalizedBundle?.name || '',
        description: normalizedBundle?.description || '',
        quizIds: getBundleQuizzes(normalizedBundle),
        pattern: {
            ...examMeta.pattern,
            ...buildPatternFromBundle(normalizedBundle, examMeta.pattern),
        },
        quizGroups: buildQuizGroups(normalizedBundle),
        isEnrolled: forceEnrolled,
        rawBundle: normalizedBundle,
    };
};

const collectEnrolledBundleIds = (studentModules: any) => {
    let allCandidates: any[] = [];
    if (studentModules?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.bundles)];
    if (studentModules?.data?.bundles) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.bundles)];
    if (studentModules?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.modules)];
    if (studentModules?.data?.modules) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.modules)];
    if (studentModules?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.items)];
    if (studentModules?.data?.items) allCandidates = [...allCandidates, ...ensureArray(studentModules.data.items)];
    if (studentModules?.data && Array.isArray(studentModules.data)) allCandidates = [...allCandidates, ...studentModules.data];
    if (Array.isArray(studentModules)) allCandidates = [...allCandidates, ...studentModules];

    return allCandidates.reduce((acc: string[], item: any) => {
        if (typeof item !== 'object' || item === null) return acc;

        const bundleId =
            item?.bundleId ||
            item?.bundle?.id ||
            item?.bundle?._id ||
            item?.id ||
            item?._id;
        const isEnrolled = item?.isEnrolled !== undefined ? Boolean(item?.isEnrolled) : true;

        if (bundleId && isEnrolled) {
            acc.push(String(bundleId));
        }

        return acc;
    }, []);
};

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const {
        bundleList,
        studentModules,
        bundleDetails,
        subBundleList,
        subBundleDetails,
        isLoading,
        status,
    } = useSelector((state: RootState) => state.MockTestReducer);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [selectedSubBundleExam, setSelectedSubBundleExam] = useState<any>(null);
    const [selectedBundle, setSelectedBundle] = useState<any>(null);
    const [showBundleActionModal, setShowBundleActionModal] = useState(false);
    const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
    const [_activeSubBundleId, setActiveSubBundleId] = useState<string | null>(null);
    const [pendingEnrollmentId, setPendingEnrollmentId] = useState<string | null>(null);
    const [enrolledBundleOverrides, setEnrolledBundleOverrides] = useState<Set<string>>(new Set());
    const [activeDetailTab, setActiveDetailTab] = useState<'mock' | 'course'>('mock');
    const [activeCourseSection, setActiveCourseSection] = useState<string>('');
    const [showNoteViewerModal, setShowNoteViewerModal] = useState(false);
    const [isLoadingNotePages, setIsLoadingNotePages] = useState(false);
    const [selectedNoteBankTitle, setSelectedNoteBankTitle] = useState('');
    const [selectedNotePages, setSelectedNotePages] = useState<any[]>([]);
    const [selectedNotePageIndex, setSelectedNotePageIndex] = useState(0);
    const [showNotePageModal, setShowNotePageModal] = useState(false);
    const [selectedNotePageDetail, setSelectedNotePageDetail] = useState<any>(null);
    const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
    const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);
    const [selectedQuestionBankTitle, setSelectedQuestionBankTitle] = useState('');
    const [selectedQuestionBankQuestions, setSelectedQuestionBankQuestions] = useState<any[]>([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [selectedQuestionBankMeta, setSelectedQuestionBankMeta] = useState<any>(null);
    const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);
    const [showQuestionAnswerModal, setShowQuestionAnswerModal] = useState(false);
    const [selectedQuestionAnswerDetail, setSelectedQuestionAnswerDetail] = useState<any>(null);
    const [showVideoBankModal, setShowVideoBankModal] = useState(false);
    const [isLoadingVideoBank, setIsLoadingVideoBank] = useState(false);
    const [selectedVideoBankTitle, setSelectedVideoBankTitle] = useState('');
    const [selectedVideoBankItems, setSelectedVideoBankItems] = useState<any[]>([]);
    const authToken = useSelector((state: RootState) => state.AuthReducer.token);
    const { paymentHistoryData, paymentHistoryLoading } = useSelector((state: RootState) => state.ProfileReducer);

    const bundleItems = useMemo(() => getBundleItems(bundleList), [bundleList]);
    const subBundleItems = useMemo(() => getSubBundleItems(subBundleList), [subBundleList]);
    const { enrolledBundleIds, failedPendingBundleIds } = useMemo(() => {
        const collectedIds = collectEnrolledBundleIds(studentModules);
        const paymentsList = paymentHistoryData?.data?.items || paymentHistoryData?.items || [];
        const failedPending = new Set<string>();
        
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
            const paymentStatusMap = new Map<string, boolean>();
            paymentsList.forEach((item: any) => {
                const bundleId = String(item?.resourceId || item?.course?._id || item?.course?.id || item?.course || '');
                if (bundleId) {
                    const status = String(item?.status || '').toLowerCase();
                    const isSuccess = status === 'captured' || status === 'success' || status === 'paid' || status === 'completed';
                    if (isSuccess || !paymentStatusMap.has(bundleId)) {
                        paymentStatusMap.set(bundleId, isSuccess);
                    }
                }
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (!isSuccess) {
                    failedPending.add(bundleId);
                }
            });

            const filteredIds = collectedIds.filter((id: string) => {
                const strId = String(id);
                if (paymentStatusMap.has(strId)) {
                    return paymentStatusMap.get(strId);
                }
                return true;
            });

            paymentStatusMap.forEach((isSuccess, bundleId) => {
                if (isSuccess && !filteredIds.includes(bundleId)) {
                    filteredIds.push(bundleId);
                }
            });

            return {
                enrolledBundleIds: Array.from(new Set(filteredIds)),
                failedPendingBundleIds: failedPending,
            };
        }

        return {
            enrolledBundleIds: Array.from(new Set(collectedIds)),
            failedPendingBundleIds: failedPending,
        };
    }, [studentModules, paymentHistoryData]);
    useEffect(() => {
        dispatch(getBundleListRequest({ limit: 50, page: 1, ...(selectedModule ? { module: selectedModule } : {}) }));
    }, [dispatch, selectedModule]);

    useEffect(() => {
        if (isFocused) {
            dispatch(getStudentModulesRequest({}));
            dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
        }
    }, [dispatch, isFocused]);

    useEffect(() => {
        return () => {
            dispatch(clearBundleFlowState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedBundle) {
            const bundleId = getBundleId(selectedBundle);
            if (bundleId) {
                const strId = String(bundleId);
                const hasAccess =
                    !failedPendingBundleIds.has(strId) &&
                    (enrolledBundleIds.includes(strId) || enrolledBundleOverrides.has(strId));
                
                if (selectedBundle.isEnrolled !== hasAccess) {
                    setSelectedBundle((prev: any) => prev ? { ...prev, isEnrolled: hasAccess } : null);
                }
            }
        }
    }, [enrolledBundleIds, failedPendingBundleIds, enrolledBundleOverrides, selectedBundle]);

    useEffect(() => {
        if (!bundleDetails) {
            return;
        }

        const resolvedBundleId = String(getBundleId(bundleDetails) || activeBundleId || '');
        const isEnrolled =
            !failedPendingBundleIds.has(resolvedBundleId) &&
            (Boolean(bundleDetails?.isEnrolled) ||
            (resolvedBundleId ? enrolledBundleIds.includes(resolvedBundleId) : false) ||
            enrolledBundleOverrides.has(resolvedBundleId) ||
            Boolean(selectedBundle?.isEnrolled));

        setSelectedExam(buildSelectedExam(bundleDetails, isEnrolled));
        if (resolvedBundleId) {
            setActiveBundleId(resolvedBundleId);
            dispatch(getSubBundleListRequest({ bundleId: resolvedBundleId }));
        }
    }, [activeBundleId, bundleDetails, dispatch, enrolledBundleIds, enrolledBundleOverrides, selectedBundle, failedPendingBundleIds]);

    useEffect(() => {
        if (!subBundleDetails) {
            return;
        }

        const parentBundleId = activeBundleId ? String(activeBundleId) : '';
        const isEnrolled =
            !failedPendingBundleIds.has(parentBundleId) &&
            (Boolean(subBundleDetails?.isEnrolled) ||
            Boolean(selectedExam?.isEnrolled) ||
            (parentBundleId ? enrolledBundleIds.includes(parentBundleId) : false));
        setSelectedSubBundleExam(buildSelectedExam(subBundleDetails, isEnrolled));
    }, [activeBundleId, enrolledBundleIds, subBundleDetails, selectedExam, failedPendingBundleIds]);

    useEffect(() => {
        if (
            status === enrollBundleSuccess.type ||
            status === enrollBundleFailure.type ||
            status === paymentSuccess.type ||
            status === paymentFailure.type
        ) {
            setPendingEnrollmentId(null);
            
            if ((status === enrollBundleSuccess.type || status === paymentSuccess.type) && activeBundleId) {
                dispatch(paymentHistoryRequest({ page: 1, limit: 100 }));
                setEnrolledBundleOverrides(prev => {
                    const next = new Set(prev);
                    next.add(String(activeBundleId));
                    return next;
                });
                if (selectedBundle && String(getBundleId(selectedBundle)) === String(activeBundleId)) {
                    setSelectedBundle({ ...selectedBundle, isEnrolled: true });
                }
            }
        }
    }, [status, activeBundleId, selectedBundle, dispatch]);

    const openExternalVideoUrl = useCallback(async (rawUrl: string) => {
        if (!rawUrl) {
            return false;
        }

        const normalizedUrl = rawUrl.trim();
        const videoId = getYouTubeVideoId(normalizedUrl);
        const attempts = videoId
            ? [
                `youtube://watch?v=${videoId}`,
                `vnd.youtube://${videoId}`,
                `https://www.youtube.com/watch?v=${videoId}`,
            ]
            : [
                normalizedUrl,
                normalizedUrl.replace('youtu.be/', 'www.youtube.com/watch?v='),
            ];

        for (const candidate of attempts) {
            if (!candidate) {
                continue;
            }

            try {
                await Linking.openURL(candidate);
                return true;
            } catch {
                // keep trying
            }
        }

        return false;
    }, []);

    const filteredExams = bundleItems.filter((bundle: any) => {
        const matchesSearch = (bundle?.title || bundle?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule = selectedModule ? ((bundle?.module && bundle.module === selectedModule) || (bundle?.title || bundle?.name || '').toLowerCase().includes(selectedModule.toLowerCase())) : true;
        return matchesSearch && matchesModule;
    });
    const isEnrollingBundle = isLoading && (status === enrollBundleRequest.type || status === paymentRequest.type);
    const detailScreen = selectedSubBundleExam || selectedExam;
    const showingSubBundle = Boolean(selectedSubBundleExam);
    const canAttemptMocks = Boolean(detailScreen?.isEnrolled);
    const showSubBundleList = Boolean(selectedExam) && !showingSubBundle && subBundleItems.length > 0;
    const courseSections = useMemo(
        () => normalizeCourseSections(detailScreen?.rawBundle || detailScreen),
        [detailScreen],
    );
    const examPatternItems = useMemo(() => [
        { key: 'mock', label: 'Mock Bank', icon: 'layers', color: '#1D4ED8', bg: '#EFF6FF' },
        { key: 'crack', label: 'Crack', icon: 'zap', color: '#D97706', bg: '#FEF3C7' },
        { key: 'note', label: 'Note Bank Content', icon: 'book-open', color: '#059669', bg: '#ECFDF5' },
        { key: 'question', label: 'Question Bank', icon: 'help-circle', color: '#7C3AED', bg: '#F5F3FF' },
        { key: 'youtube', label: 'YouTube Video Bank URL', icon: 'youtube', color: '#FF0000', bg: '#FEF2F2' },
        { key: 'security', label: 'No Screen Record & Screenshot Denied', icon: 'shield', color: '#DC2626', bg: '#FEE2E2' },
    ], []);
    const mockContentAvailable = Boolean(
        detailScreen?.quizGroups?.length ||
        showSubBundleList ||
        getBundleQuizzes(detailScreen?.rawBundle || detailScreen).length,
    );
    const availableDetailTabs = useMemo(
        () => [
            mockContentAvailable ? { key: 'mock', label: 'Mock Bank' } : null,
            courseSections.length > 0 ? { key: 'course', label: 'Study Materials' } : null,
        ].filter(Boolean) as Array<{ key: 'mock' | 'course'; label: string }>,
        [courseSections.length, mockContentAvailable],
    );
    const detailTabs = availableDetailTabs;

    useEffect(() => {
        if (availableDetailTabs.length === 0) {
            setActiveDetailTab('mock');
            return;
        }

        if (!availableDetailTabs.find(tab => tab.key === activeDetailTab)) {
            setActiveDetailTab(availableDetailTabs[0].key);
        }
    }, [activeDetailTab, availableDetailTabs]);

    useEffect(() => {
        if (courseSections.length === 0) {
            setActiveCourseSection('');
            return;
        }

        if (!courseSections.find(section => section.key === activeCourseSection)) {
            setActiveCourseSection(courseSections[0].key);
        }
    }, [activeCourseSection, courseSections]);

    useEffect(() => {
        if (selectedQuestionBankQuestions.length === 0) {
            setSelectedQuestionIndex(0);
            return;
        }

        if (selectedQuestionIndex >= selectedQuestionBankQuestions.length) {
            setSelectedQuestionIndex(0);
        }
    }, [selectedQuestionBankQuestions.length, selectedQuestionIndex]);

    useEffect(() => {
        if (selectedNotePages.length === 0) {
            setSelectedNotePageIndex(0);
            return;
        }

        if (selectedNotePageIndex >= selectedNotePages.length) {
            setSelectedNotePageIndex(0);
        }
    }, [selectedNotePageIndex, selectedNotePages.length]);

    useEffect(() => {
        if (!showNotePageModal) {
            setSelectedNotePageDetail(null);
        }
    }, [showNotePageModal]);

    const renderIcon = (name: string, type: string, size: number, color: string) => {
        if (type === 'FontAwesome5') {
            return <FontAwesome5 name={name} size={size} color={color} />;
        }
        return <Feather name={name} size={size} color={color} />;
    };

    const handleQuizAction = (quiz: any) => {
        const quizId = getQuizId(quiz?.rawQuiz || quiz) || quiz?.id;
        if (!quizId) {
            return;
        }

        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        navigation.navigate('MockTestRules', {
            testId: quizId,
            testData: quiz?.rawQuiz || quiz,
        });
    };

    const handleOpenNoteBank = useCallback(async (item: any) => {
        const noteId = getNoteBankId(item);

        if (!noteId) {
            return null;
        }

        try {
            setIsLoadingNotePages(true);
            const response = await getApi(`student/note-banks/${noteId}/pages`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });

            const pages = response?.data?.data || response?.data || [];
            setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
            setSelectedNotePages(Array.isArray(pages) ? pages : []);
            setSelectedNotePageIndex(0);
            setShowNoteViewerModal(true);
        } catch {
            setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
            setSelectedNotePages([]);
            setSelectedNotePageIndex(0);
            setShowNoteViewerModal(true);
        } finally {
            setIsLoadingNotePages(false);
        }
    }, [authToken]);

    const handleOpenQuestionBank = useCallback(async (item: any) => {
        const questionBankId = getItemId(item);

        if (!questionBankId) {
            return;
        }

        setShowQuestionBankModal(true);
        setIsLoadingQuestionBank(true);
        setSelectedQuestionBankTitle(getItemTitle(item, 'Question Bank'));
        setSelectedQuestionBankMeta(item);
        setSelectedQuestionBankQuestions([]);
        setSelectedQuestionIndex(0);
        setShowQuestionAnswer(false);
        setShowQuestionAnswerModal(false);
        setSelectedQuestionAnswerDetail(null);

        try {
            const response = await getApi(`student/question-banks/${questionBankId}/questions`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });
            const questions = getQuestionBankQuestions(response);
            setSelectedQuestionBankQuestions(Array.isArray(questions) ? questions : []);
        } catch {
            setSelectedQuestionBankQuestions([]);
        } finally {
            setIsLoadingQuestionBank(false);
        }
    }, [authToken]);

    const handleOpenVideoBank = useCallback(async (item: any) => {
        const videoBankId = getItemId(item) || item?.videoBankId;
        const directVideoUrl = getVideoBankUrl(item);

        if (directVideoUrl) {
            await openExternalVideoUrl(directVideoUrl);
            return;
        }

        if (!videoBankId) {
            return;
        }

        try {
            setIsLoadingVideoBank(true);
            setSelectedVideoBankTitle(getItemTitle(item, 'Video Bank'));
            const response = await getApi(`student/video-banks/${videoBankId}/items`, {
                Accept: 'application/json',
                contenttype: 'application/json',
                authorization: authToken,
            });
            const items = getVideoBankItems(response);
            setSelectedVideoBankItems(items);

            if (items.length === 1) {
                const singleUrl = getVideoBankUrl(items[0]);
                if (singleUrl) {
                    await openExternalVideoUrl(singleUrl);
                    return;
                }
            }

            setShowVideoBankModal(true);
        } catch {
            setSelectedVideoBankItems([]);
            setShowVideoBankModal(false);
        } finally {
            setIsLoadingVideoBank(false);
        }
    }, [authToken, openExternalVideoUrl]);

    const handleOpenCourseItem = useCallback((sectionKey: string, item: any) => {
        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        if (!detailScreen?.isEnrolled) {
            Toast.show({ type: 'error', text1: 'Please enroll in this course to access study materials' });
            return;
        }

        if (sectionKey === 'note') {
            handleOpenNoteBank(item);
            return;
        }

        if (sectionKey === 'question') {
            handleOpenQuestionBank(item);
            return;
        }

        if (sectionKey === 'video') {
            handleOpenVideoBank(item);
        }
    }, [handleOpenNoteBank, handleOpenQuestionBank, handleOpenVideoBank, paymentHistoryLoading, detailScreen?.isEnrolled]);

    const renderMockSetCards = () => {
        if (!showingSubBundle && subBundleItems.length > 0) {
            return (
                <View style={styles.subjectList}>
                    <View style={styles.quizCardsWrap}>
                        {subBundleItems.map((subBundle: any, index: number) => {
                            const normalizedSubBundle = getBundlePayload(subBundle);
                            const mockCount = getBundleMockCount(normalizedSubBundle);

                            return (
                                <Pressable
                                    key={String(getBundleId(normalizedSubBundle) || index)}
                                    style={styles.quizCard}
                                    onPress={() => handleSubBundlePress(normalizedSubBundle)}
                                >
                                    {/* No SUB-BUNDLE badge displayed */}

                                    <Text style={styles.quizCardTitle}>{normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}</Text>

                                    <View style={styles.quizMetaRow}>
                                        <View style={styles.quizMetaItem}>
                                            <Feather name="layers" size={normalize(14)} color="#667085" />
                                            <Text style={styles.quizMetaText}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.quizActionButton}>
                                        <Text style={styles.quizActionText}>Explore Curriculum</Text>
                                        <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            );
        }

        if (detailScreen?.quizGroups?.length > 0) {
            return (
                <>
                    <Text style={styles.sectionTitle}>Mock Bank</Text>
                    <Text style={styles.subjectSubtitle}>
                        {detailScreen.quizGroups?.length > 0
                             ? `${detailScreen.quizIds?.length || 0} quizzes in this ${showingSubBundle ? 'course' : 'category'}`
                             : 'No quizzes returned from the API'}
                    </Text>

                    <View style={styles.subjectList}>
                        {detailScreen.quizGroups?.map((group: any, groupIndex: number) => (
                            <View key={`${group.title || 'group'}-${groupIndex}`} style={styles.quizSection}>
                                <View style={styles.topicRow}>
                                    <View style={styles.topicDot} />
                                    <Text style={styles.topicTitle}>{group.title}</Text>
                                </View>

                                <View style={styles.quizCardsWrap}>
                                    {group.quizzes.map((quiz: any, quizIndex: number) => (
                                        <View key={String(quiz.id || quizIndex)} style={styles.quizCard}>
                                            <View style={styles.quizBadge}>
                                                <Text style={styles.quizBadgeText}>MOCK</Text>
                                            </View>

                                            <Text style={styles.quizCardTitle}>{quiz.title}</Text>
                                            <View style={styles.quizMetaRow}>
                                                <View style={styles.quizMetaItem}>
                                                    <Feather name="clock" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizMetaText}>{quiz.durationMinutes || 0}m</Text>
                                                </View>
                                                <View style={styles.quizMetaItem}>
                                                    <Feather name="book-open" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizMetaText}>{quiz.questionCount || 0} Qs</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.quizPriceText}>Rs. {quiz.price || 0}</Text>

                                            {canAttemptMocks ? (
                                                <Pressable
                                                    style={[styles.quizActionButton, isEnrollingBundle && styles.quizActionButtonDisabled]}
                                                    disabled={isEnrollingBundle}
                                                    onPress={() => handleQuizAction(quiz)}
                                                >
                                                    {isEnrollingBundle ? (
                                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                                    ) : (
                                                        <>
                                                            <Text style={styles.quizActionText}>Attempt</Text>
                                                            <Feather name="play" size={normalize(14)} color="#FFFFFF" />
                                                        </>
                                                    )}
                                                </Pressable>
                                            ) : (
                                                <View style={styles.quizViewOnlyTag}>
                                                    <Feather name="eye" size={normalize(14)} color="#667085" />
                                                    <Text style={styles.quizViewOnlyText}>View only</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            );
        }

        return null;
    };

    const renderCourseSectionItem = useCallback(({ item }: { item: any }) => {
        if (!activeCourseSection) {
            return null;
        }

        const section = courseSections.find(current => current.key === activeCourseSection);
        if (!section) {
            return null;
        }

        if (section.key === 'note') {
            return (
                <Pressable style={styles.courseCard} onPress={() => handleOpenCourseItem(section.key, item)}>
                    <View style={styles.courseCardBadge}>
                        <Text style={styles.courseCardBadgeText}>NOTES</Text>
                    </View>
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Note Bank')}</Text>
                    {getItemDescription(item) ? <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text> : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="book-open" size={normalize(16)} color={Colorpath.Primary} />
                        <Text style={styles.courseCardFooterText}>Open note pages</Text>
                    </View>
                </Pressable>
            );
        }

        if (section.key === 'question') {
            return (
                <Pressable style={styles.courseCard} onPress={() => handleOpenCourseItem(section.key, item)}>
                    <View style={styles.courseCardBadge}>
                        <Text style={styles.courseCardBadgeText}>QUESTION BANK</Text>
                    </View>
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Question Bank')}</Text>
                    {getQuestionBankYear(item) ? <Text style={styles.courseCardSubtitle}>Year: {getQuestionBankYear(item)}</Text> : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="help-circle" size={normalize(16)} color={Colorpath.Primary} />
                        <Text style={styles.courseCardFooterText}>View questions & answers</Text>
                    </View>
                </Pressable>
            );
        }

        return (
            <Pressable style={styles.courseCard} onPress={() => handleOpenCourseItem(section.key, item)}>
                <View style={styles.courseCardBadge}>
                    <Text style={styles.courseCardBadgeText}>VIDEOLINK BANK</Text>
                </View>
                <View style={styles.videoCardTitleRow}>
                    <Feather name="play-circle" size={normalize(18)} color={Colorpath.Primary} />
                    <Text style={styles.courseCardTitle}>{getItemTitle(item, 'Video Bank')}</Text>
                </View>
                {getItemDescription(item) ? <Text style={styles.courseCardSubtitle}>{getItemDescription(item)}</Text> : <Text style={styles.courseCardSubtitle}>YouTube Video</Text>}
                <View style={styles.courseCardFooter}>
                    <Feather name="youtube" size={normalize(16)} color="#FF0000" />
                    <Text style={[styles.courseCardFooterText, { color: '#FF0000', marginLeft: normalize(4) }]}>Open in YouTube</Text>
                </View>
            </Pressable>
        );
    }, [activeCourseSection, courseSections, handleOpenCourseItem]);

    const renderCourseTabContent = () => {
        if (courseSections.length === 0) {
            return (
                <View style={styles.emptyStateBox}>
                    <Feather name="folder" size={normalize(24)} color="#94A3B8" />
                    <Text style={styles.emptyStateText}>No Data Available</Text>
                </View>
            );
        }

        const activeSection = courseSections.find(section => section.key === activeCourseSection) || courseSections[0];

        return (
            <View style={styles.courseLayout}>
                <View style={styles.courseLeftPanel}>
                    <Text style={styles.coursePanelLabel}>Sections</Text>
                    <FlatList
                        data={courseSections}
                        keyExtractor={(item) => item.key}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(10) }} />}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => setActiveCourseSection(item.key)}
                                style={[
                                    styles.courseSectionItem,
                                    activeSection?.key === item.key && styles.courseSectionItemActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.courseSectionText,
                                        activeSection?.key === item.key && styles.courseSectionTextActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>

                <View style={styles.courseRightPanel}>
                    <Text style={styles.coursePanelLabel}>{activeSection?.label}</Text>
                    <FlatList
                        data={activeSection?.items || []}
                        keyExtractor={(item: any, index: number) => String(getItemId(item) || index)}
                        renderItem={renderCourseSectionItem}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                        ListEmptyComponent={(
                            <View style={styles.emptyStateBox}>
                                <Feather name="inbox" size={normalize(24)} color="#94A3B8" />
                                <Text style={styles.emptyStateText}>No Data Available</Text>
                            </View>
                        )}
                        scrollEnabled={false}
                    />
                </View>
            </View>
        );
    };

    const renderDetailTabCards = () => (
        activeDetailTab === 'course' ? renderCourseTabContent() : renderMockSetCards()
    );

    const openBundleDetails = (bundle: any, mode: 'view' | 'enroll') => {
                                        const normalizedBundle = getBundlePayload(bundle);
                                        const bundleId = getBundleId(normalizedBundle);
                                        const resolvedBundleId = bundleId ? String(bundleId) : null;
                                
                                        if (!resolvedBundleId) {
                                            return;
                                        }
                                
                                        const alreadyEnrolled =
                                            !failedPendingBundleIds.has(resolvedBundleId) &&
                                            (Boolean(normalizedBundle?.isEnrolled) ||
                                            enrolledBundleIds.includes(resolvedBundleId) ||
                                            enrolledBundleOverrides.has(resolvedBundleId));
                                
                                        setShowBundleActionModal(false);
                                        setSelectedSubBundleExam(null);
                                        setActiveSubBundleId(null);
                                        setActiveBundleId(resolvedBundleId);
                                
                                        if (alreadyEnrolled) {
                                            dispatch(bundleIDRequest({ id: resolvedBundleId }));
                                            return;
                                        }
                                
                                        if (mode === 'enroll') {
                                            if (pendingEnrollmentId === resolvedBundleId) {
                                                return;
                                            }
                                            setPendingEnrollmentId(resolvedBundleId);
                                            const originalPrice = Number(normalizedBundle?.price || normalizedBundle?.amount || 0);
                                            const discountPrice = Number(normalizedBundle?.discountPrice || 0);
                                            const discountPercentage = Number(normalizedBundle?.discountPercentage || 0);
                                
                                            let finalPrice = originalPrice;
                                            if (discountPrice > 0) {
                                                finalPrice = discountPrice;
                                            } else if (discountPercentage > 0) {
                                                finalPrice = originalPrice - (originalPrice * discountPercentage) / 100;
                                            }
                                            finalPrice = Math.round(finalPrice);
                                
                                            if (finalPrice > 0) {
                                                dispatch(paymentRequest({ id: resolvedBundleId, price: finalPrice }));
                                            } else {
                                                dispatch(enrollBundleRequest({ id: resolvedBundleId }));
                                            }
                                            return;
                                        }
                                
                                        dispatch(bundleIDRequest({ id: resolvedBundleId }));
                                    };
                                
                                    const handleBundlePress = (bundle: any) => {
                                        const normalizedBundle = getBundlePayload(bundle);
                                        const bundleId = getBundleId(normalizedBundle);
                                        const hasEnrolledAccess =
                                            !failedPendingBundleIds.has(String(bundleId)) &&
                                            (Boolean(normalizedBundle?.isEnrolled) ||
                                            (bundleId ? enrolledBundleIds.includes(String(bundleId)) : false) ||
                                            (bundleId ? enrolledBundleOverrides.has(String(bundleId)) : false));
                                
                                        setSelectedBundle({
                                            ...normalizedBundle,
                                            isEnrolled: hasEnrolledAccess,
                                        });
                                        setShowBundleActionModal(true);
                                    };

    const handleSubBundlePress = (subBundle: any) => {
        const normalizedSubBundle = getBundlePayload(subBundle);
        const subBundleId = getBundleId(normalizedSubBundle);

        if (!activeBundleId || !subBundleId) {
            return;
        }

        if (paymentHistoryLoading) {
            Toast.show({ type: 'info', text1: 'Verifying payment status, please wait...' });
            return;
        }

        const resolvedSubBundleId = String(subBundleId);
        setActiveSubBundleId(resolvedSubBundleId);
        dispatch(getSubBundleDetailsRequest({
            bundleId: activeBundleId,
            subBundleId: resolvedSubBundleId,
        }));
    };

    const handleBackPress = () => {
        if (selectedSubBundleExam) {
            setSelectedSubBundleExam(null);
            setActiveSubBundleId(null);
            return;
        }

        if (selectedExam) {
            setSelectedExam(null);
            setActiveBundleId(null);
            setActiveSubBundleId(null);
            dispatch(clearBundleFlowState());
            return;
        }

        if (selectedModule) {
            setSelectedModule(null);
            return;
        }
    };

    if (detailScreen) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

                <View style={styles.detailHeader}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.detailHeaderContent}>
                            <Pressable onPress={handleBackPress} style={styles.backBtn}>
                                <Feather name="arrow-left" size={normalize(20)} color="#FFFFFF" />
                            </Pressable>
                            <View style={styles.headerTextColumn}>
                                <Text style={styles.headerTagline}>{showingSubBundle ? 'COURSE' : 'EXAM CATEGORY'}</Text>
                                <Text style={styles.headerMainTitle}>{detailScreen.name}</Text>
                                <Text style={styles.detailSubtitle}>
                                    {showingSubBundle
                                        ? (detailScreen.isEnrolled ? 'You are enrolled. Start any mock below.' : 'Enroll in the parent bundle to unlock attempts.')
                                        : (detailScreen.isEnrolled ? 'Open any curriculum item below.' : 'Enroll once to unlock every mock in this course.')}
                                </Text>
                            </View>
                            <View style={styles.headerRightIcon}>
                                {renderIcon(detailScreen.icon, detailScreen.iconType, normalize(20), detailScreen.iconColor)}
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
                    <Text style={styles.sectionTitle}>Exam Pattern</Text>

                    <View style={styles.patternCard}>
                        <View style={styles.patternGrid}>
                            {examPatternItems.map((item) => (
                                <View key={item.key} style={styles.patternItem}>
                                    <View style={[styles.patternIconWrap, { backgroundColor: item.bg }]}>
                                        <Feather name={item.icon as any} size={normalize(18)} color={item.color} />
                                    </View>
                                    <View style={styles.patternTextWrap}>
                                        <Text style={styles.patternLabel}>{item.label}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {detailTabs.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.dynamicTabsScrollContent}
                            >
                                {detailTabs.map((tab: any) => (
                                    <Pressable
                                        key={tab.key}
                                        onPress={() => setActiveDetailTab(tab.key)}
                                        style={styles.dynamicTabItem}
                                    >
                                        <Text style={[
                                            styles.dynamicTabText,
                                            activeDetailTab === tab.key && styles.dynamicTabTextActive,
                                        ]}>
                                            {tab.label}
                                        </Text>
                                        <View style={[
                                            styles.dynamicTabIndicator,
                                            activeDetailTab === tab.key && styles.dynamicTabIndicatorActive,
                                        ]} />
                                    </Pressable>
                                ))}
                            </ScrollView>

                            {renderDetailTabCards()}
                        </>
                    ) : showSubBundleList ? (
                        <>
                            <Text style={styles.sectionTitle}>Course Curriculum</Text>
                            <Text style={styles.subjectSubtitle}>
                                {`${subBundleItems.length} course${subBundleItems.length === 1 ? '' : 's'} available in this course`}
                            </Text>

                            <View style={styles.subjectList}>
                                <View style={styles.quizCardsWrap}>
                                    {subBundleItems.map((subBundle: any, index: number) => {
                                        const normalizedSubBundle = getBundlePayload(subBundle);
                                        const mockCount = getBundleMockCount(normalizedSubBundle);

                                        return (
                                            <Pressable
                                                key={String(getBundleId(normalizedSubBundle) || index)}
                                                style={styles.quizCard}
                                                onPress={() => handleSubBundlePress(normalizedSubBundle)}
                                            >
                                                {/* No SUB-BUNDLE badge displayed */}

                                                <Text style={styles.quizCardTitle}>{normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}</Text>

                                                <View style={styles.quizMetaRow}>
                                                    <View style={styles.quizMetaItem}>
                                                        <Feather name="layers" size={normalize(14)} color="#667085" />
                                                        <Text style={styles.quizMetaText}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.quizActionButton}>
                                                    <Text style={styles.quizActionText}>Explore Curriculum</Text>
                                                    <Feather name="chevron-right" size={normalize(14)} color="#FFFFFF" />
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>Mock Bank</Text>
                            <Text style={styles.subjectSubtitle}>
                                {detailScreen.quizGroups?.length > 0
                                    ? `${detailScreen.quizIds?.length || 0} quizzes in this ${showingSubBundle ? 'course' : 'category'}`
                                    : 'No quizzes returned from the API'}
                            </Text>

                            <View style={styles.subjectList}>
                                {detailScreen.quizGroups?.map((group: any, groupIndex: number) => (
                                    <View key={`${group.title || 'group'}-${groupIndex}`} style={styles.quizSection}>
                                        <View style={styles.topicRow}>
                                            <View style={styles.topicDot} />
                                            <Text style={styles.topicTitle}>{String(group.title || 'General').toUpperCase()}</Text>
                                        </View>

                                        <View style={styles.quizCardsWrap}>
                                            {group.quizzes.map((quiz: any, quizIndex: number) => (
                                                <View key={String(quiz.id || quizIndex)} style={styles.quizCard}>
                                                    <View style={styles.quizBadge}>
                                                        <Text style={styles.quizBadgeText}>MOCK</Text>
                                                    </View>

                                                    <Text style={styles.quizCardTitle}>{quiz.title}</Text>

                                                    <View style={styles.quizMetaRow}>
                                                        <View style={styles.quizMetaItem}>
                                                            <Feather name="book-open" size={normalize(14)} color="#667085" />
                                                            <Text style={styles.quizMetaText}>{quiz.questionCount || 0} Qs</Text>
                                                        </View>
                                                        <View style={styles.quizMetaItem}>
                                                            <Feather name="clock" size={normalize(14)} color="#667085" />
                                                            <Text style={styles.quizMetaText}>{quiz.durationMinutes || 0}m</Text>
                                                        </View>
                                                        <Text style={styles.quizPriceText}>Rs. {quiz.price || 0}</Text>
                                                    </View>

                                                    {canAttemptMocks ? (
                                                        <Pressable
                                                            style={[styles.quizActionButton, isEnrollingBundle && styles.quizActionButtonDisabled]}
                                                            disabled={isEnrollingBundle}
                                                            onPress={() => handleQuizAction(quiz)}
                                                        >
                                                            {isEnrollingBundle ? (
                                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                                            ) : (
                                                                <>
                                                                    <Text style={styles.quizActionText}>Attempt</Text>
                                                                    <Feather name="play" size={normalize(14)} color="#FFFFFF" />
                                                                </>
                                                            )}
                                                        </Pressable>
                                                    ) : (
                                                        <View style={styles.quizViewOnlyTag}>
                                                            <Feather name="eye" size={normalize(14)} color="#667085" />
                                                            <Text style={styles.quizViewOnlyText}>View only</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <View style={{ height: verticalScale(50) }} />
                </ScrollView>

                <Modal
                    visible={showNoteViewerModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowNoteViewerModal(false)}
                >
                    <View style={styles.noteViewerContainer}>
                        <SafeAreaView edges={['top']} style={styles.noteViewerSafeArea}>
                            <View style={styles.noteViewerHeader}>
                                <View style={styles.noteViewerHeaderText}>
                                    <Text style={styles.noteViewerLabel}>NOTE BANK</Text>
                                    <Text style={styles.noteViewerTitle}>{selectedNoteBankTitle || 'Note Bank'}</Text>
                                    <Text style={styles.noteViewerSubtitle}>READ AND LEARN WITH CURATED NOTES</Text>
                                </View>
                                <Pressable onPress={() => setShowNoteViewerModal(false)} style={styles.noteViewerCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingNotePages ? (
                            <View style={styles.noteViewerStateBox}>
                                <ActivityIndicator size="large" color={Colorpath.Primary} />
                                <Text style={styles.noteViewerStateText}>Loading pages...</Text>
                            </View>
                        ) : selectedNotePages.length === 0 ? (
                            <View style={styles.noteViewerStateBox}>
                                <Feather name="file-text" size={normalize(24)} color="#94A3B8" />
                                <Text style={styles.noteViewerStateText}>No note pages found.</Text>
                            </View>
                        ) : (
                            <View style={styles.noteViewerLayout}>
                                <View style={styles.noteViewerLeftPanel}>
                                    <Text style={styles.noteViewerPanelLabel}>PAGES</Text>
                                    <FlatList
                                        data={selectedNotePages}
                                        keyExtractor={(page: any, index: number) => `${page?._id || page?.id || index}`}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.noteViewerListContent}
                                        renderItem={({ item, index }) => {
                                            const pageTitle = toDisplayText(item?.title, `Page ${index + 1}`);

                                            return (
                                                <Pressable
                                                    onPress={() => setSelectedNotePageIndex(index)}
                                                    style={[
                                                        styles.noteViewerListItem,
                                                        selectedNotePageIndex === index && styles.noteViewerListItemActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.noteViewerListIndex,
                                                            selectedNotePageIndex === index && styles.noteViewerListIndexActive,
                                                        ]}
                                                    >
                                                        {index + 1}.
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.noteViewerListText,
                                                            selectedNotePageIndex === index && styles.noteViewerListTextActive,
                                                        ]}
                                                        numberOfLines={2}
                                                    >
                                                        {pageTitle}
                                                    </Text>
                                                </Pressable>
                                            );
                                        }}
                                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                    />
                                </View>

                                <View style={styles.noteViewerRightPanel}>
                                    {(() => {
                                        const currentPage = selectedNotePages[selectedNotePageIndex];

                                        if (!currentPage) {
                                            return (
                                                <View style={styles.noteViewerStateBox}>
                                                    <Feather name="file-text" size={normalize(24)} color="#94A3B8" />
                                                    <Text style={styles.noteViewerStateText}>No note pages found.</Text>
                                                </View>
                                            );
                                        }

                                        return (
                                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.noteViewerDetailScroll}>
                                                <View style={styles.noteViewerDetailCard}>
                                                    <View style={styles.noteViewerDetailTopRow}>
                                                        <Text style={styles.noteViewerDetailTag}>PAGE {selectedNotePageIndex + 1}</Text>
                                                        <Text style={styles.noteViewerDetailTitle}>{toDisplayText(currentPage?.title, `Page ${selectedNotePageIndex + 1}`)}</Text>
                                                    </View>
                                                    <Text style={styles.noteViewerDetailBody} numberOfLines={5} ellipsizeMode="tail">
                                                        {htmlToPlainText(currentPage?.htmlContent || '') || 'No content available.'}
                                                    </Text>
                                                    <Text style={styles.noteViewerDetailHint}>Tap View to read the full page.</Text>
                                                    <Pressable
                                                        style={styles.noteViewerViewButton}
                                                        onPress={() => {
                                                            setSelectedNotePageDetail(currentPage);
                                                            setShowNotePageModal(true);
                                                        }}
                                                    >
                                                        <Text style={styles.noteViewerViewButtonText}>View</Text>
                                                        <Feather name="chevron-right" size={normalize(16)} color="#FFFFFF" />
                                                    </Pressable>
                                                </View>
                                            </ScrollView>
                                        );
                                    })()}
                                </View>
                            </View>
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showQuestionBankModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowQuestionBankModal(false)}
                >
                    <View style={styles.questionBankContainer}>
                        <SafeAreaView edges={['top']} style={styles.questionBankSafeArea}>
                            <View style={styles.questionBankHeader}>
                                <View style={styles.questionBankHeaderText}>
                                    <Text style={styles.questionBankLabel}>QUESTION BANK</Text>
                                    <Text style={styles.questionBankTitle}>{selectedQuestionBankTitle || 'Previous Year Question'}</Text>
                                    <Text style={styles.questionBankSubtitle}>PRACTICE WITH CURATED QUESTIONS AND EXPLANATIONS</Text>
                                </View>
                                <Pressable onPress={() => setShowQuestionBankModal(false)} style={styles.questionBankCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingQuestionBank ? (
                            <View style={styles.questionBankLoadingState}>
                                <ActivityIndicator size="large" color={Colorpath.Primary} />
                                <Text style={styles.questionBankLoadingText}>Loading questions...</Text>
                            </View>
                        ) : selectedQuestionBankQuestions.length === 0 ? (
                            <View style={styles.questionBankEmptyState}>
                                <Feather name="inbox" size={normalize(26)} color="#94A3B8" />
                                <Text style={styles.questionBankEmptyText}>No Data Available</Text>
                            </View>
                        ) : (
                            <View style={styles.questionBankLayout}>
                                <View style={styles.questionBankLeftPanel}>
                                    <Text style={styles.questionBankPanelLabel}>QUESTIONS</Text>
                                    <FlatList
                                        data={selectedQuestionBankQuestions}
                                        keyExtractor={(item: any, index: number) => `${item?._id || item?.id || index}`}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.questionBankListContent}
                                        renderItem={({ item, index }) => {
                                            const itemTitle = toDisplayText(getQuestionPrompt(item), `Question ${index + 1}`);
                                            return (
                                                <Pressable
                                                    onPress={() => {
                                                        setSelectedQuestionIndex(index);
                                                    }}
                                                    style={[
                                                        styles.questionBankListItem,
                                                        selectedQuestionIndex === index && styles.questionBankListItemActive,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.questionBankListIndex,
                                                            selectedQuestionIndex === index && styles.questionBankListIndexActive,
                                                        ]}
                                                    >
                                                        {index + 1}.
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.questionBankListText,
                                                            selectedQuestionIndex === index && styles.questionBankListTextActive,
                                                        ]}
                                                        numberOfLines={2}
                                                    >
                                                        {itemTitle}
                                                    </Text>
                                                </Pressable>
                                            );
                                        }}
                                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                    />
                                </View>

                                <View style={styles.questionBankRightPanel}>
                                    {(() => {
                                        const currentQuestion = selectedQuestionBankQuestions[selectedQuestionIndex];

                                        if (!currentQuestion) {
                                            return (
                                                <View style={styles.questionBankEmptyState}>
                                                    <Feather name="file-text" size={normalize(26)} color="#94A3B8" />
                                                    <Text style={styles.questionBankEmptyText}>No Data Available</Text>
                                                </View>
                                            );
                                        }

                                        const options = getQuestionOptions(currentQuestion);
                                        const prompt = toDisplayText(getQuestionPrompt(currentQuestion), 'Question');
                                        const answer = toDisplayText(getQuestionAnswer(currentQuestion), '');
                                        const explanation = toDisplayText(getQuestionExplanation(currentQuestion), '');
                                        const year = toDisplayText(getQuestionBankYear(selectedQuestionBankMeta || currentQuestion), '');

                                        return (
                                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.questionBankDetailScroll}>
                                                <View style={styles.questionBankDetailCard}>
                                                    <View style={styles.questionBankDetailTopRow}>
                                                        <Text style={styles.questionBankDetailTag}>QUESTION {selectedQuestionIndex + 1}</Text>
                                                        <Text style={styles.questionBankDetailTitle}>{prompt}</Text>
                                                    </View>

                                                    {currentQuestion?.htmlContent ? (
                                                        <Text style={{ fontSize: normalize(15), color: '#334155', marginTop: verticalScale(10), marginBottom: verticalScale(16), lineHeight: normalize(22) }}>
                                                            {htmlToPlainText(currentQuestion.htmlContent)}
                                                        </Text>
                                                    ) : null}

                                                    {year ? <Text style={styles.questionBankYearText}>Year: {year}</Text> : null}

                                                    {options.length > 0 ? (
                                                        <View style={styles.questionBankOptionsWrap}>
                                                            {options.map((option: any, optionIndex: number) => {
                                                                const optionText = toDisplayText(
                                                                    option,
                                                                    `Option ${optionIndex + 1}`,
                                                                );

                                                                return (
                                                                    <View key={`${optionText}-${optionIndex}`} style={styles.questionBankOptionRow}>
                                                                        <View style={styles.questionBankOptionDot} />
                                                                        <Text style={styles.questionBankOptionText}>{optionText}</Text>
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>
                                                    ) : null}

                                                    {(answer || explanation) ? (
                                                        <Pressable
                                                            onPress={() => {
                                                                setSelectedQuestionAnswerDetail({
                                                                    questionNumber: selectedQuestionIndex + 1,
                                                                    title: prompt,
                                                                    answer,
                                                                    explanation,
                                                                });
                                                                setShowQuestionAnswerModal(true);
                                                            }}
                                                            style={styles.questionBankToggleBtn}
                                                        >
                                                            <Text style={styles.questionBankToggleText}>Show Answer</Text>
                                                            <Feather
                                                                name="chevron-right"
                                                                size={normalize(18)}
                                                                color={Colorpath.Primary}
                                                            />
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            </ScrollView>
                                        );
                                    })()}
                                </View>
                            </View>
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showQuestionAnswerModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowQuestionAnswerModal(false)}
                >
                    <View style={styles.questionAnswerContainer}>
                        <SafeAreaView edges={['top']} style={styles.questionAnswerSafeArea}>
                            <View style={styles.questionAnswerHeader}>
                                <View style={styles.questionAnswerHeaderText}>
                                    <Text style={styles.questionAnswerLabel}>ANSWER & EXPLANATION</Text>
                                    <Text style={styles.questionAnswerTitle}>
                                        {selectedQuestionAnswerDetail?.title || 'Question Answer'}
                                    </Text>
                                    <Text style={styles.questionAnswerSubtitle}>
                                        QUESTION {selectedQuestionAnswerDetail?.questionNumber || ''}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => setShowQuestionAnswerModal(false)}
                                    style={styles.questionAnswerCloseBtn}
                                >
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.questionAnswerScrollContent}>
                            <View style={styles.questionAnswerCard}>
                                {selectedQuestionAnswerDetail?.answer ? (
                                    <Text style={styles.questionAnswerBody}>{selectedQuestionAnswerDetail.answer}</Text>
                                ) : null}
                                {selectedQuestionAnswerDetail?.explanation ? (
                                    <Text style={styles.questionAnswerExplanation}>
                                        {selectedQuestionAnswerDetail.explanation}
                                    </Text>
                                ) : null}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={showVideoBankModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowVideoBankModal(false)}
                >
                    <View style={styles.videoBankContainer}>
                        <SafeAreaView edges={['top']} style={styles.videoBankSafeArea}>
                            <View style={styles.videoBankHeader}>
                                <View style={styles.videoBankHeaderText}>
                                    <Text style={styles.videoBankLabel}>VIDEO BANK</Text>
                                    <Text style={styles.videoBankTitle}>{selectedVideoBankTitle || 'Video Bank'}</Text>
                                    <Text style={styles.videoBankSubtitle}>Select a video to open in YouTube</Text>
                                </View>
                                <Pressable onPress={() => setShowVideoBankModal(false)} style={styles.videoBankCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        {isLoadingVideoBank ? (
                            <View style={styles.videoBankLoadingState}>
                                <ActivityIndicator size="large" color={Colorpath.Primary} />
                                <Text style={styles.videoBankLoadingText}>Loading videos...</Text>
                            </View>
                        ) : selectedVideoBankItems.length === 0 ? (
                            <View style={styles.videoBankEmptyState}>
                                <Feather name="youtube" size={normalize(28)} color="#94A3B8" />
                                <Text style={styles.videoBankEmptyText}>No Data Available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={selectedVideoBankItems}
                                keyExtractor={(videoItem: any, index: number) => `${videoItem?._id || videoItem?.id || index}`}
                                contentContainerStyle={styles.videoBankListContent}
                                ItemSeparatorComponent={() => <View style={{ height: verticalScale(12) }} />}
                                renderItem={({ item, index }) => {
                                    const title = toDisplayText(getItemTitle(item, `Video ${index + 1}`), `Video ${index + 1}`);
                                    const subtitle = toDisplayText(getItemDescription(item), 'YouTube Video') || 'YouTube Video';
                                    const videoUrl = getVideoBankUrl(item);

                                    return (
                                        <Pressable
                                            style={styles.videoBankCard}
                                            onPress={async () => {
                                                if (!videoUrl) {
                                                    return;
                                                }
                                                await openExternalVideoUrl(videoUrl);
                                            }}
                                        >
                                            <View style={styles.videoBankCardTopRow}>
                                                <View style={styles.videoBankPlayIconWrap}>
                                                    <Feather name="play-circle" size={normalize(18)} color="#FF0000" />
                                                </View>
                                                <View style={styles.videoBankCardTextWrap}>
                                                    <Text style={styles.videoBankCardTitle} numberOfLines={2}>{title}</Text>
                                                    <Text style={styles.videoBankCardSubtitle} numberOfLines={1}>{subtitle}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.videoBankCardFooter}>
                                                <Feather name="youtube" size={normalize(16)} color="#FF0000" />
                                                <Text style={styles.videoBankCardFooterText}>Open in YouTube</Text>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
                        )}
                    </View>
                </Modal>

                <Modal
                    visible={showNotePageModal}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setShowNotePageModal(false)}
                >
                    <View style={styles.notePageViewerContainer}>
                        <SafeAreaView edges={['top']} style={styles.notePageViewerSafeArea}>
                            <View style={styles.notePageViewerHeader}>
                                <View style={styles.notePageViewerHeaderText}>
                                    <Text style={styles.notePageViewerLabel}>NOTE PAGE</Text>
                                    <Text style={styles.notePageViewerTitle}>
                                        {toDisplayText(selectedNotePageDetail?.title, 'Note Page')}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setShowNotePageModal(false)} style={styles.notePageViewerCloseBtn}>
                                    <Feather name="x" size={normalize(22)} color="#0F172A" />
                                </Pressable>
                            </View>
                        </SafeAreaView>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notePageViewerScrollContent}>
                            <View style={styles.notePageViewerCard}>
                                <Text style={styles.notePageViewerBody}>
                                    {htmlToPlainText(selectedNotePageDetail?.htmlContent || '') || 'No content available.'}
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colorpath.Primary} barStyle="light-content" />

            <View style={styles.headerBackground}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topBar}>
                        {selectedModule && (
                            <Pressable onPress={handleBackPress} style={{ padding: 8, marginLeft: -8, marginBottom: 8 }}>
                                <Feather name="arrow-left" size={24} color="#FFFFFF" />
                            </Pressable>
                        )}
                        <Text style={styles.titleText}>{selectedModule ? `${selectedModule} Bundles` : 'Courses'}</Text>
                        <Text style={styles.subtitleText}>
                            {selectedModule ? 'Select a bundle to view details & enroll' : 'Select a bundle to view details and enroll'}
                        </Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={normalize(18)} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#092948' }]}>{bundleItems.length}</Text>
                        <Text style={styles.statLabel}>Exams</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>30+</Text>
                        <Text style={styles.statLabel}>Subjects</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#F0A335' }]}>500+</Text>
                        <Text style={styles.statLabel}>Mock Tests</Text>
                    </View>
                </View>

                <>
                    <Text style={styles.allExamsTitle}>All Courses</Text>

                    <View style={styles.gridContainer}>
                        {filteredExams.map((bundle: any, index: number) => {
                            const normalizedBundle = getBundlePayload(bundle);
                            const exam = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');
                            return (
                                <Pressable
                                    key={String(getBundleId(normalizedBundle) || index)}
                                    style={styles.gridItem}
                                    onPress={() => handleBundlePress(bundle)}
                                >
                                    <View style={[styles.circleContainer, { backgroundColor: exam.bgColor }]}>
                                        {renderIcon(exam.icon, exam.iconType, normalize(26), exam.iconColor)}
                                    </View>
                                    <Text style={styles.examLabel}>{normalizedBundle?.title || normalizedBundle?.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </>

                <View style={{ height: verticalScale(100) }} />
            </ScrollView>

            <Modal
                visible={showBundleActionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBundleActionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowBundleActionModal(false)} />
                    <View style={styles.modalCard}>
                        <Text style={styles.modalLabel}>COURSE</Text>
                        <Text style={styles.modalTitle}>{selectedBundle?.title || selectedBundle?.name || 'Course'}</Text>
                        <Text style={styles.modalDescription}>
                            {selectedBundle?.isEnrolled
                                ? 'This course is already enrolled. Open the course to continue with its study materials.'
                                : 'Choose `View` to open the course details, or `Enroll Now` to unlock attempts.'}
                        </Text>

                        {(() => {
                            const originalPrice = Number(selectedBundle?.price || 0);
                            const discountPrice = Number(selectedBundle?.discountPrice || 0);
                            const discountPercentage = Number(selectedBundle?.discountPercentage || 0);

                            let finalPrice = originalPrice;
                            if (discountPrice > 0) {
                                finalPrice = discountPrice;
                            } else if (discountPercentage > 0) {
                                finalPrice = originalPrice - (originalPrice * discountPercentage) / 100;
                            }
                            finalPrice = Math.round(finalPrice);

                            if (selectedBundle?.isEnrolled || originalPrice === 0) {
                                return null;
                            }

                            return (
                                <View style={styles.modalPriceRow}>
                                    <Text style={styles.modalPriceText}>
                                        Price: <Text style={{ textDecorationLine: 'line-through', color: '#9CA3AF' }}>₹{originalPrice}</Text>
                                        {discountPercentage > 0 ? ` | Discount: ${discountPercentage}%` : ''}
                                        {` | Final: `}
                                        <Text style={{ color: '#16A34A', fontWeight: 'bold' }}>₹{finalPrice}</Text>
                                    </Text>
                                </View>
                            );
                        })()}

                        {selectedBundle?.isEnrolled ? (
                            <Pressable
                                style={[styles.modalPrimaryButton, paymentHistoryLoading && styles.quizActionButtonDisabled]}
                                disabled={paymentHistoryLoading}
                                onPress={() => openBundleDetails(selectedBundle, 'view')}
                            >
                                {paymentHistoryLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Feather name="layers" size={normalize(16)} color="#FFFFFF" />
                                        <Text style={styles.modalPrimaryButtonText}>View Course</Text>
                                    </>
                                )}
                            </Pressable>
                        ) : (
                            <>
                                <Pressable
                                    style={styles.modalSecondaryButton}
                                    onPress={() => openBundleDetails(selectedBundle, 'view')}
                                >
                                    <Feather name="eye" size={normalize(16)} color="#0F172A" />
                                    <Text style={styles.modalSecondaryButtonText}>View</Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.modalPrimaryButton,
                                        (pendingEnrollmentId || paymentHistoryLoading) ? styles.quizActionButtonDisabled : null
                                    ]}
                                    disabled={Boolean(pendingEnrollmentId) || paymentHistoryLoading}
                                    onPress={() => openBundleDetails(selectedBundle, 'enroll')}
                                >
                                    {paymentHistoryLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Feather name="check-circle" size={normalize(16)} color="#FFFFFF" />
                                            <Text style={styles.modalPrimaryButtonText}>
                                                {(() => {
                                                    const originalPrice = Number(selectedBundle?.price || 0);
                                                    const discountPrice = Number(selectedBundle?.discountPrice || 0);
                                                    const discountPercentage = Number(selectedBundle?.discountPercentage || 0);

                                                    let finalPrice = originalPrice;
                                                    if (discountPrice > 0) {
                                                        finalPrice = discountPrice;
                                                    } else if (discountPercentage > 0) {
                                                        finalPrice = originalPrice - (originalPrice * discountPercentage) / 100;
                                                    }
                                                    finalPrice = Math.round(finalPrice);

                                                    return pendingEnrollmentId === String(getBundleId(selectedBundle)) 
                                                        ? (finalPrice > 0 ? 'Processing...' : 'Enrolling...') 
                                                        : (finalPrice > 0 ? `Buy & Enroll (₹${finalPrice})` : 'Enroll');
                                                })()}
                                            </Text>
                                        </>
                                    )}
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    headerBackground: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(24),
        borderBottomRightRadius: normalize(24),
        paddingBottom: verticalScale(12),
    },
    topBar: {
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(12),
    },
    titleText: {
        fontSize: normalize(24),
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: verticalScale(6),
    },
    subtitleText: {
        fontSize: normalize(13),
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: normalize(18),
    },
    scrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: verticalScale(20),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        height: '100%',
        paddingVertical: 0,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        marginHorizontal: normalize(4),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statValue: {
        fontSize: normalize(16),
        fontWeight: '800',
    },
    statLabel: {
        fontSize: normalize(11),
        color: '#6B7280',
        fontWeight: '600',
        marginTop: verticalScale(2),
    },
    allExamsTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: verticalScale(16),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -normalize(8),
    },
    gridItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        paddingHorizontal: normalize(8),
    },
    circleContainer: {
        width: normalize(72),
        height: normalize(72),
        borderRadius: normalize(36),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    examLabel: {
        fontSize: normalize(11),
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: normalize(15),
    },
    detailHeader: {
        backgroundColor: Colorpath.Primary,
        borderBottomLeftRadius: normalize(20),
        borderBottomRightRadius: normalize(20),
    },
    detailHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(20),
    },
    backBtn: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(16),
    },
    headerTextColumn: {
        flex: 1,
    },
    headerTagline: {
        fontSize: normalize(10),
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1,
    },
    headerMainTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: verticalScale(2),
    },
    detailSubtitle: {
        fontSize: normalize(11),
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: verticalScale(4),
    },
    headerRightIcon: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(20),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: verticalScale(12),
    },
    patternCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        marginBottom: verticalScale(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    patternGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -normalize(6),
    },
    patternItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(6),
        marginBottom: verticalScale(12),
    },
    patternIconWrap: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(10),
    },
    patternTextWrap: {
        flex: 1,
        minHeight: verticalScale(40),
        justifyContent: 'center',
    },
    patternLabel: {
        fontSize: normalize(11),
        color: '#111827',
        fontWeight: '800',
        lineHeight: normalize(16),
    },
    subjectSubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: -verticalScale(8),
        marginBottom: verticalScale(12),
    },
    dynamicTabsScrollContent: {
        paddingVertical: verticalScale(4),
        marginBottom: verticalScale(8),
    },
    dynamicTabItem: {
        marginRight: normalize(22),
        paddingBottom: verticalScale(8),
    },
    dynamicTabText: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 0.2,
    },
    dynamicTabTextActive: {
        color: Colorpath.Primary,
    },
    dynamicTabIndicator: {
        height: verticalScale(4),
        borderRadius: normalize(999),
        backgroundColor: 'transparent',
        marginTop: verticalScale(8),
    },
    dynamicTabIndicatorActive: {
        backgroundColor: '#F0A335',
    },
    subjectList: {
        marginBottom: verticalScale(20),
    },
    quizSection: {
        marginBottom: verticalScale(22),
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    topicDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#9AE6B4',
        marginRight: normalize(10),
    },
    topicTitle: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#475467',
    },
    quizCardsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: normalize(12),
    },
    quizCard: {
        width: '48%',
        minWidth: normalize(140),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        padding: normalize(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
    },
    quizBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: verticalScale(12),
    },
    quizBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: '#667085',
    },
    quizCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1D2939',
        marginBottom: verticalScale(14),
    },
    resourceCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
        marginBottom: verticalScale(14),
    },
    quizMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: verticalScale(16),
    },
    quizMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    quizMetaText: {
        fontSize: normalize(12),
        color: '#667085',
        marginLeft: normalize(6),
        fontWeight: '600',
    },
    quizPriceText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#344054',
    },
    quizActionButton: {
        height: verticalScale(46),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    quizActionButtonDisabled: {
        opacity: 0.7,
    },
    quizActionText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    quizViewOnlyTag: {
        height: verticalScale(46),
        borderRadius: normalize(12),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    quizViewOnlyText: {
        color: '#667085',
        fontSize: normalize(13),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(24),
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(20),
        padding: normalize(22),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: verticalScale(8),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(8),
    },
    noteViewerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    noteViewerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    noteViewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    noteViewerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteViewerHeaderText: {
        flex: 1,
    },
    noteViewerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    noteViewerTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(2),
    },
    noteViewerSubtitle: {
        fontSize: normalize(12),
        color: '#64748B',
    },
    noteViewerScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(18),
    },
    noteViewerStateBox: {
        minHeight: verticalScale(220),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: normalize(16),
    },
    noteViewerStateText: {
        marginTop: verticalScale(12),
        fontSize: normalize(13),
        color: '#64748B',
        textAlign: 'center',
    },
    noteViewerLayout: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    noteViewerLeftPanel: {
        width: '35%',
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        padding: normalize(18),
    },
    noteViewerRightPanel: {
        width: '65%',
        padding: normalize(18),
        backgroundColor: '#F8FAFC',
    },
    noteViewerPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 2,
        marginBottom: verticalScale(14),
    },
    noteViewerListContent: {
        paddingBottom: verticalScale(12),
    },
    noteViewerListItem: {
        minHeight: verticalScale(60),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    noteViewerListItemActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    noteViewerListIndex: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#98A2B3',
        width: normalize(22),
    },
    noteViewerListIndexActive: {
        color: '#FFFFFF',
    },
    noteViewerListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#344054',
    },
    noteViewerListTextActive: {
        color: '#FFFFFF',
    },
    noteViewerDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    noteViewerDetailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    noteViewerDetailTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(12),
        marginBottom: verticalScale(12),
    },
    noteViewerDetailTag: {
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    noteViewerDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#101828',
    },
    noteViewerDetailBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    noteViewerDetailHint: {
        marginTop: verticalScale(12),
        fontSize: normalize(12),
        color: '#64748B',
        fontWeight: '600',
    },
    noteViewerViewButton: {
        alignSelf: 'flex-start',
        marginTop: verticalScale(18),
        backgroundColor: Colorpath.Primary,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(16),
        height: verticalScale(44),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
    },
    noteViewerViewButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    notePageViewerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    notePageViewerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    notePageViewerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    notePageViewerHeaderText: {
        flex: 1,
    },
    notePageViewerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    notePageViewerTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#0F172A',
    },
    notePageViewerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    notePageViewerScrollContent: {
        padding: normalize(18),
    },
    notePageViewerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    notePageViewerBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    notePageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: normalize(16),
        marginBottom: verticalScale(14),
    },
    notePageTitle: {
        fontSize: normalize(17),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(10),
    },
    notePageBody: {
        fontSize: normalize(13),
        color: '#334155',
        lineHeight: normalize(20),
    },
    modalDescription: {
        fontSize: normalize(13),
        color: '#475569',
        lineHeight: normalize(20),
        marginBottom: verticalScale(18),
    },
    courseLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(16),
        marginTop: verticalScale(8),
    },
    courseLeftPanel: {
        width: '30%',
        minWidth: normalize(180),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(14),
    },
    courseRightPanel: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(14),
    },
    coursePanelLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: verticalScale(12),
    },
    courseSectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        minHeight: verticalScale(58),
    },
    courseSectionItemActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    courseSectionText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#344054',
    },
    courseSectionTextActive: {
        color: '#FFFFFF',
    },
    courseCard: {
        width: '100%',
        minHeight: verticalScale(150),
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 3,
        justifyContent: 'space-between',
    },
    courseCardBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        borderWidth: 1,
        borderColor: '#99F6E4',
        marginBottom: verticalScale(10),
    },
    courseCardBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 0.6,
    },
    courseCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(6),
    },
    courseCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
        marginBottom: verticalScale(12),
    },
    courseCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: normalize(10),
    },
    courseCardFooterText: {
        flex: 1,
        fontSize: normalize(12),
        fontWeight: '700',
        color: '#475467',
    },
    videoCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(10),
    },
    emptyStateBox: {
        minHeight: verticalScale(220),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(16),
    },
    emptyStateText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    questionBankContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    questionBankSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    questionBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: normalize(14),
    },
    questionBankCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionBankHeaderText: {
        flex: 1,
    },
    questionBankLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    questionBankTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    questionBankSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionBankLoadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(10),
    },
    questionBankLoadingText: {
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
    },
    questionBankEmptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(20),
    },
    questionBankEmptyText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    questionBankLayout: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    questionBankLeftPanel: {
        width: '30%',
        minWidth: normalize(180),
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        padding: normalize(18),
    },
    questionBankRightPanel: {
        flex: 1,
        padding: normalize(18),
        backgroundColor: '#F8FAFC',
    },
    questionBankPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#667085',
        letterSpacing: 2,
        marginBottom: verticalScale(14),
    },
    questionBankListContent: {
        paddingBottom: verticalScale(12),
    },
    questionBankListItem: {
        minHeight: verticalScale(60),
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    questionBankListItemActive: {
        backgroundColor: Colorpath.Primary,
        borderColor: Colorpath.Primary,
    },
    questionBankListItemInactive: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    questionBankListIndex: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: '#98A2B3',
        width: normalize(22),
    },
    questionBankListIndexActive: {
        color: '#FFFFFF',
    },
    questionBankListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#344054',
    },
    questionBankListTextActive: {
        color: '#FFFFFF',
    },
    questionBankDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    questionBankDetailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    questionBankDetailTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: normalize(12),
        marginBottom: verticalScale(12),
    },
    questionBankDetailTag: {
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        borderRadius: normalize(999),
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    questionBankDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#101828',
    },
    questionBankYearText: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        marginBottom: verticalScale(16),
    },
    questionBankOptionsWrap: {
        marginTop: verticalScale(6),
        marginBottom: verticalScale(18),
        gap: verticalScale(10),
    },
    questionBankOptionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(10),
    },
    questionBankOptionDot: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: Colorpath.Primary,
        marginTop: verticalScale(5),
    },
    questionBankOptionText: {
        flex: 1,
        fontSize: normalize(14),
        color: '#344054',
        lineHeight: normalize(22),
    },
    questionBankToggleBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(18),
    },
    questionBankToggleText: {
        fontSize: normalize(13),
        fontWeight: '800',
        color: Colorpath.Primary,
    },
    questionBankAnswerCard: {
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        padding: normalize(18),
    },
    questionBankAnswerLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: Colorpath.Primary,
        letterSpacing: 1,
        marginBottom: verticalScale(12),
    },
    questionBankAnswerText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: normalize(22),
        marginBottom: verticalScale(10),
    },
    questionBankExplanationText: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    questionAnswerContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    questionAnswerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    questionAnswerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    questionAnswerHeaderText: {
        flex: 1,
    },
    questionAnswerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
        color: Colorpath.Primary,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    questionAnswerTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: verticalScale(4),
    },
    questionAnswerSubtitle: {
        fontSize: normalize(12),
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionAnswerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    questionAnswerScrollContent: {
        padding: normalize(18),
    },
    questionAnswerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: '#D0D5DD',
        padding: normalize(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    questionAnswerBody: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
        marginBottom: verticalScale(14),
    },
    questionAnswerExplanation: {
        fontSize: normalize(14),
        color: '#334155',
        lineHeight: normalize(22),
    },
    videoBankContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    videoBankSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    videoBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: normalize(14),
    },
    videoBankHeaderText: {
        flex: 1,
    },
    videoBankLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(10),
    },
    videoBankTitle: {
        fontSize: normalize(22),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    videoBankSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    videoBankCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBankLoadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(10),
    },
    videoBankLoadingText: {
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
    },
    videoBankEmptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(20),
    },
    videoBankEmptyText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: '#667085',
        fontWeight: '600',
        textAlign: 'center',
    },
    videoBankListContent: {
        padding: normalize(18),
    },
    videoBankCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 3,
        minHeight: verticalScale(120),
        justifyContent: 'space-between',
    },
    videoBankCardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: normalize(12),
    },
    videoBankPlayIconWrap: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBankCardTextWrap: {
        flex: 1,
    },
    videoBankCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#101828',
        marginBottom: verticalScale(4),
    },
    videoBankCardSubtitle: {
        fontSize: normalize(12),
        color: '#667085',
        lineHeight: normalize(18),
    },
    videoBankCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginTop: verticalScale(12),
    },
    videoBankCardFooterText: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#FF0000',
    },
    modalSecondaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(12),
    },
    modalSecondaryButtonText: {
        color: '#0F172A',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPrimaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: '#0D9F6E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: verticalScale(10),
        backgroundColor: '#F1F5F9',
        paddingVertical: verticalScale(6),
        paddingHorizontal: normalize(12),
        borderRadius: normalize(8),
    },
    modalPriceText: {
        fontSize: normalize(14),
        color: '#4B5563',
        fontWeight: '600',
    },
});

export default CoursesScreen;
