import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput, ActivityIndicator, Modal, Linking, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colorpath from '../../Themes/Colorpath';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import { getApi } from '../../Utils/Helpers/ApiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { useTheme, useTranslation } from '../../Themes/hooks';
import Toast from 'react-native-toast-message';
import CustomNoteRenderer from '../../Components/CustomNoteRenderer';
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
    const parsedPayloadData = parseMaybeJson(payload?.data);
    const parsedDataData = parseMaybeJson(parsedData?.data);
    const parsedContent = parseMaybeJson(payload?.content || bundle?.content);

    // Broaden sources to cover nested shapes: bundle, payload, data, data.data, content
    const sources = [
        bundle,
        payload,
        parsedData,
        parsedPayloadData,
        parsedDataData,
        parsedContent,
        payload?.rawBundle,
        bundle?.rawBundle,
    ].filter(Boolean);

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

    const quizzes = getCollection('quizzes', 'mockTests', 'tests', 'quiz_list', 'quizList');
    const noteBanks = getCollection(
        'note_banks', 'noteBanks', 'notes', 'noteBank', 'note_bank',
        'notebanks', 'NoteBank', 'NoteBanks', 'notebankItems',
    );
    const questionBanks = getCollection(
        'question_banks', 'questionBanks', 'questions', 'questionBank', 'question_bank',
        'questionbanks', 'QuestionBank', 'QuestionBanks', 'previousYearQuestions',
        'pyq', 'pyqs', 'prevYearQuestions',
    );
    const videoBanks = getCollection(
        'video_banks', 'videoBanks', 'videos', 'youtube_banks', 'youtubeBanks',
        'youtube', 'videoBank', 'video_bank', 'videoLinks', 'video_links',
    );
    const youtubeBanks = getCollection('youtube_banks', 'youtubeBanks', 'youtube', 'youtubeLinks');
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

const getPagePreviewText = (page: any) => {
    if (!page) return 'No content available.';
    if (page.htmlContent) {
        return htmlToPlainText(page.htmlContent);
    }
    if (page.content) {
        let parsed = page.content;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch {
                return parsed;
            }
        }
        const extractText = (node: any): string => {
            if (!node) return '';
            if (node.text) return node.text;
            if (node.type === 'math' || node.type === 'mathInline') {
                return node.attrs?.formula || node.attrs?.latex || '';
            }
            if (Array.isArray(node.content)) {
                return node.content.map(extractText).join(' ');
            }
            if (node.type === 'doc' && Array.isArray(node.content)) {
                return node.content.map(extractText).join(' ');
            }
            return '';
        };
        return extractText(parsed).trim();
    }
    return 'No content available.';
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

const renderIcon = (name: string, type: string, size: number, color: string) => {
    if (type === 'FontAwesome5') {
        return <FontAwesome5 name={name} size={size} color={color} />;
    }
    return <Feather name={name} size={size} color={color} />;
};

const ExamCard = ({ bundle, index, onPress, colors, isDarkTheme, styles }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const normalizedBundle = getBundlePayload(bundle);
    const exam = getExamMetaByTitle(normalizedBundle?.title || normalizedBundle?.name || '');

    return (
        <Animated.View style={{ width: '48%', margin: '1%', transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.gridItem,
                    {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        shadowColor: isDarkTheme ? colors.accent : '#000000',
                    }
                ]}
            >
                <View style={[styles.circleContainer, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : exam.bgColor }]}>
                    {renderIcon(exam.icon, exam.iconType, normalize(24), isDarkTheme ? colors.accent : exam.iconColor)}
                </View>
                <Text style={[styles.examLabel, { color: colors.text }]} numberOfLines={2}>
                    {normalizedBundle?.title || normalizedBundle?.name}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

const QuizCard = ({ quiz, index, isEnrollingBundle, handleQuizAction, canAttemptMocks, colors, isDarkTheme, styles }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ width: '48%', transform: [{ scale }] }}>
            <View style={[styles.quizCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDarkTheme ? colors.accent : '#000000' }]}>
                <View style={[styles.quizBadge, { backgroundColor: colors.tagCyan, borderColor: colors.border }]}>
                    <Text style={[styles.quizBadgeText, { color: colors.tagCyanText }]}>MOCK</Text>
                </View>

                <Text style={[styles.quizCardTitle, { color: colors.text }]} numberOfLines={2}>{quiz.title}</Text>
                
                <View style={styles.quizMetaRow}>
                    <View style={styles.quizMetaItem}>
                        <Feather name="book-open" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.quizMetaText, { color: colors.textSecondary }]}>{quiz.questionCount || 0} Qs</Text>
                    </View>
                    <View style={styles.quizMetaItem}>
                        <Feather name="clock" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.quizMetaText, { color: colors.textSecondary }]}>{quiz.durationMinutes || 0}m</Text>
                    </View>
                </View>
                <Text style={[styles.quizPriceText, { color: colors.text, marginBottom: verticalScale(12) }]}>Rs. {quiz.price || 0}</Text>

                {canAttemptMocks ? (
                    <Pressable
                        style={[styles.quizActionButton, { backgroundColor: colors.accent }, isEnrollingBundle && styles.quizActionButtonDisabled]}
                        disabled={isEnrollingBundle}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={() => handleQuizAction(quiz)}
                    >
                        {isEnrollingBundle ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.quizActionText}>Attempt</Text>
                                <Feather name="play" size={normalize(12)} color="#FFFFFF" />
                            </>
                        )}
                    </Pressable>
                ) : (
                    <View style={[styles.quizViewOnlyTag, { backgroundColor: colors.Background, borderColor: colors.border }]}>
                        <Feather name="eye" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.quizViewOnlyText, { color: colors.textSecondary }]}>View only</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const SubBundleCard = ({ subBundle, index, handleSubBundlePress, colors, isDarkTheme, styles }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const normalizedSubBundle = getBundlePayload(subBundle);
    const mockCount = getBundleMockCount(normalizedSubBundle);

    return (
        <Animated.View style={{ width: '48%', transform: [{ scale }] }}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => handleSubBundlePress(normalizedSubBundle)}
                style={[
                    styles.quizCard,
                    {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        shadowColor: isDarkTheme ? colors.accent : '#000000',
                    }
                ]}
            >
                <Text style={[styles.quizCardTitle, { color: colors.text }]} numberOfLines={2}>
                    {normalizedSubBundle?.title || normalizedSubBundle?.name || `Sub Bundle ${index + 1}`}
                </Text>

                <View style={styles.quizMetaRow}>
                    <View style={styles.quizMetaItem}>
                        <Feather name="layers" size={normalize(12)} color={colors.textSecondary} />
                        <Text style={[styles.quizMetaText, { color: colors.textSecondary }]}>{mockCount} Mock Test{mockCount === 1 ? '' : 's'}</Text>
                    </View>
                </View>

                <View style={[styles.quizActionButton, { backgroundColor: colors.accent }]}>
                    <Text style={styles.quizActionText}>Explore</Text>
                    <Feather name="chevron-right" size={normalize(12)} color="#FFFFFF" />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const CourseMaterialCard = ({ item, sectionKey, handleOpenCourseItem, colors, isDarkTheme, styles }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    if (sectionKey === 'note') {
        return (
            <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.courseCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDarkTheme ? colors.accent : '#000000' }]}
                    onPress={() => handleOpenCourseItem(sectionKey, item)}
                >
                    <View style={[styles.courseCardBadge, { backgroundColor: colors.tagGreen, borderColor: colors.border }]}>
                        <Text style={[styles.courseCardBadgeText, { color: colors.tagGreenText }]}>NOTES</Text>
                    </View>
                    <Text style={[styles.courseCardTitle, { color: colors.text }]}>{getItemTitle(item, 'Note Bank')}</Text>
                    {getItemDescription(item) ? <Text style={[styles.courseCardSubtitle, { color: colors.textSecondary }]}>{getItemDescription(item)}</Text> : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="book-open" size={normalize(14)} color={colors.accent} />
                        <Text style={[styles.courseCardFooterText, { color: colors.textSecondary, marginLeft: normalize(6) }]}>Open note pages</Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    if (sectionKey === 'question') {
        return (
            <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.courseCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDarkTheme ? colors.accent : '#000000' }]}
                    onPress={() => handleOpenCourseItem(sectionKey, item)}
                >
                    <View style={[styles.courseCardBadge, { backgroundColor: colors.tagPurple, borderColor: colors.border }]}>
                        <Text style={[styles.courseCardBadgeText, { color: colors.tagPurpleText }]}>QUESTION BANK</Text>
                    </View>
                    <Text style={[styles.courseCardTitle, { color: colors.text }]}>{getItemTitle(item, 'Question Bank')}</Text>
                    {getQuestionBankYear(item) ? <Text style={[styles.courseCardSubtitle, { color: colors.textSecondary }]}>Year: {getQuestionBankYear(item)}</Text> : null}
                    <View style={styles.courseCardFooter}>
                        <Feather name="help-circle" size={normalize(14)} color={colors.accent} />
                        <Text style={[styles.courseCardFooterText, { color: colors.textSecondary, marginLeft: normalize(6) }]}>View questions & answers</Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.courseCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDarkTheme ? colors.accent : '#000000' }]}
                onPress={() => handleOpenCourseItem(sectionKey, item)}
            >
                <View style={[styles.courseCardBadge, { backgroundColor: colors.tagOrange, borderColor: colors.border }]}>
                    <Text style={[styles.courseCardBadgeText, { color: colors.tagOrangeText }]}>VIDEOLINK BANK</Text>
                </View>
                <View style={styles.videoCardTitleRow}>
                    <Feather name="play-circle" size={normalize(16)} color={colors.accent} />
                    <Text style={[styles.courseCardTitle, { color: colors.text }]}>{getItemTitle(item, 'Video Bank')}</Text>
                </View>
                {getItemDescription(item) ? <Text style={[styles.courseCardSubtitle, { color: colors.textSecondary }]}>{getItemDescription(item)}</Text> : <Text style={[styles.courseCardSubtitle, { color: colors.textSecondary }]}>YouTube Video</Text>}
                <View style={styles.courseCardFooter}>
                    <Feather name="youtube" size={normalize(14)} color="#FF0000" />
                    <Text style={[styles.courseCardFooterText, { color: '#FF0000', marginLeft: normalize(6) }]}>Open in YouTube</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const CoursesScreen = ({ navigation }: CoursesScreenProps) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { colors, theme } = useTheme();
    const { t } = useTranslation();
    const isDarkTheme = theme === 'neon' || theme === 'sunset' || theme === 'midnight' || theme === 'emerald';
    const styles = useMemo(() => getStyles(colors, isDarkTheme), [colors, isDarkTheme]);
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

        // DEBUG: Log the raw bundle response so we can see what keys the backend returns
        const payload = getBundlePayload(bundleDetails);
        const topKeys = Object.keys(bundleDetails || {});
        const payloadKeys = Object.keys(payload || {});
        console.log('[BundleDetails] Top-level keys:', topKeys);
        console.log('[BundleDetails] Payload keys:', payloadKeys);
        console.log('[BundleDetails] note_banks:', payload?.note_banks, '| noteBanks:', payload?.noteBanks, '| notes:', payload?.notes);
        console.log('[BundleDetails] question_banks:', payload?.question_banks, '| questionBanks:', payload?.questionBanks);
        console.log('[BundleDetails] Full payload (truncated):', JSON.stringify(payload)?.slice(0, 500));

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
            Toast.show({ type: 'error', text1: 'Note bank ID not found' });
            return null;
        }

        setSelectedNoteBankTitle(getItemTitle(item, 'Note Bank'));
        setSelectedNotePages([]);
        setSelectedNotePageIndex(0);
        setShowNoteViewerModal(true);
        setIsLoadingNotePages(true);

        // Try multiple API endpoint patterns the backend might use
        const endpoints = [
            `student/note-banks/${noteId}/pages`,
            `note-banks/${noteId}/pages`,
            `student/note-banks/${noteId}`,
            `note-banks/${noteId}`,
        ];

        let found = false;
        for (const endpoint of endpoints) {
            try {
                const response = await getApi(endpoint);
                // Try multiple response shapes
                const raw = response?.data?.data ?? response?.data ?? [];
                const pages = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.pages)
                        ? raw.pages
                        : Array.isArray(raw?.items)
                            ? raw.items
                            : Array.isArray(raw?.content)
                                ? raw.content
                                : Array.isArray(raw?.notes)
                                    ? raw.notes
                                    : raw?.htmlContent
                                        ? [raw]  // single page response
                                        : [];
                if (pages.length > 0) {
                    setSelectedNotePages(pages);
                    found = true;
                    break;
                }
            } catch {
                // try next endpoint
            }
        }

        if (!found) {
            setSelectedNotePages([]);
        }
        setIsLoadingNotePages(false);
    }, []);

    const handleOpenQuestionBank = useCallback(async (item: any) => {
        const questionBankId = getItemId(item);

        if (!questionBankId) {
            Toast.show({ type: 'error', text1: 'Question bank ID not found' });
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

        // Try multiple API endpoint patterns
        const endpoints = [
            `student/question-banks/${questionBankId}/questions`,
            `question-banks/${questionBankId}/questions`,
            `student/question-banks/${questionBankId}`,
            `question-banks/${questionBankId}`,
        ];

        let found = false;
        for (const endpoint of endpoints) {
            try {
                const response = await getApi(endpoint);
                const questions = getQuestionBankQuestions(response);
                if (Array.isArray(questions) && questions.length > 0) {
                    setSelectedQuestionBankQuestions(questions);
                    found = true;
                    break;
                }
            } catch {
                // try next endpoint
            }
        }

        if (!found) {
            setSelectedQuestionBankQuestions([]);
        }
        setIsLoadingQuestionBank(false);
    }, []);

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
                        {subBundleItems.map((subBundle: any, index: number) => (
                            <SubBundleCard
                                key={String(getBundleId(getBundlePayload(subBundle)) || index)}
                                subBundle={subBundle}
                                index={index}
                                handleSubBundlePress={handleSubBundlePress}
                                colors={colors}
                                isDarkTheme={isDarkTheme}
                                styles={styles}
                            />
                        ))}
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
                                        <QuizCard
                                            key={String(quiz.id || quizIndex)}
                                            quiz={quiz}
                                            index={quizIndex}
                                            isEnrollingBundle={isEnrollingBundle}
                                            handleQuizAction={handleQuizAction}
                                            canAttemptMocks={canAttemptMocks}
                                            colors={colors}
                                            isDarkTheme={isDarkTheme}
                                            styles={styles}
                                        />
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

        return (
            <CourseMaterialCard
                item={item}
                sectionKey={section.key}
                handleOpenCourseItem={handleOpenCourseItem}
                colors={colors}
                isDarkTheme={isDarkTheme}
                styles={styles}
            />
        );
    }, [activeCourseSection, courseSections, handleOpenCourseItem, colors, isDarkTheme, styles]);

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
                <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />

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
                            <FlatList
                                data={selectedNotePages}
                                keyExtractor={(page: any, index: number) => `${page?._id || page?.id || index}`}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.noteListScrollContainer}
                                renderItem={({ item, index }) => {
                                    const pageTitle = toDisplayText(item?.title, `Page ${index + 1}`);
                                    const previewText = getPagePreviewText(item);
                                    const readingTime = Math.max(1, Math.round((item?.htmlContent?.length || item?.content?.length || 500) / 1000));

                                    return (
                                        <Pressable
                                            onPress={() => {
                                                setSelectedNotePageDetail(item);
                                                setShowNotePageModal(true);
                                            }}
                                            style={styles.premiumNoteCard}
                                        >
                                            <View style={styles.premiumNoteCardHeader}>
                                                <View style={styles.premiumNoteCardTagRow}>
                                                    <View style={[styles.premiumNoteCardBadge, { backgroundColor: colors.tagCyan }]}>
                                                        <Text style={[styles.premiumNoteCardBadgeText, { color: colors.tagCyanText }]}>
                                                            PAGE {String(index + 1).padStart(2, '0')}
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.premiumNoteCardBadge, { backgroundColor: colors.tagOrange }]}>
                                                        <Feather name="clock" size={normalize(10)} color={colors.tagOrangeText} style={{ marginRight: 3 }} />
                                                        <Text style={[styles.premiumNoteCardBadgeText, { color: colors.tagOrangeText }]}>
                                                            {readingTime} MIN READ
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Feather name="chevron-right" size={normalize(20)} color={colors.textSecondary} />
                                            </View>
                                            
                                            <Text style={[styles.premiumNoteCardTitle, { color: colors.text }]}>
                                                {pageTitle}
                                            </Text>
                                            
                                            <Text style={[styles.premiumNoteCardBody, { color: colors.textSecondary }]} numberOfLines={3}>
                                                {previewText}
                                            </Text>
                                            
                                            <View style={[styles.premiumNoteCardFooter, { borderTopColor: colors.border }]}>
                                                <Feather name="book-open" size={normalize(14)} color={colors.Primary} style={{ marginRight: 6 }} />
                                                <Text style={[styles.premiumNoteCardFooterText, { color: colors.Primary }]}>Read full note page</Text>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
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
                            <FlatList
                                data={selectedQuestionBankQuestions}
                                keyExtractor={(item: any, index: number) => `${item?._id || item?.id || index}`}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.questionListScrollContainer}
                                renderItem={({ item, index }) => {
                                    const prompt = toDisplayText(getQuestionPrompt(item), 'Question');
                                    const year = toDisplayText(getQuestionBankYear(selectedQuestionBankMeta || item), '');

                                    return (
                                        <Pressable
                                            onPress={() => {
                                                setSelectedQuestionIndex(index);
                                                setSelectedQuestionAnswerDetail({
                                                    questionNumber: index + 1,
                                                    title: prompt,
                                                    answer: toDisplayText(getQuestionAnswer(item), ''),
                                                    explanation: toDisplayText(getQuestionExplanation(item), ''),
                                                    htmlContent: item.htmlContent,
                                                    questionContent: item.content || item.questionContent || item.jsonContent || item.questionContentJson,
                                                    explanationJson: item.explanationJson || item.explanationContent || item.explanationContentJson,
                                                    options: getQuestionOptions(item),
                                                });
                                                setShowQuestionAnswerModal(true);
                                            }}
                                            style={styles.premiumQuestionCard}
                                        >
                                            <View style={styles.premiumNoteCardHeader}>
                                                <View style={styles.premiumNoteCardTagRow}>
                                                    <View style={[styles.premiumNoteCardBadge, { backgroundColor: colors.tagPurple }]}>
                                                        <Text style={[styles.premiumNoteCardBadgeText, { color: colors.tagPurpleText }]}>
                                                            QUESTION {String(index + 1).padStart(2, '0')}
                                                        </Text>
                                                    </View>
                                                    {year ? (
                                                        <View style={[styles.premiumNoteCardBadge, { backgroundColor: colors.tagGreen }]}>
                                                            <Text style={[styles.premiumNoteCardBadgeText, { color: colors.tagGreenText }]}>
                                                                YEAR: {year}
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                                <Feather name="chevron-right" size={normalize(20)} color={colors.textSecondary} />
                                            </View>
                                            
                                            <Text style={[styles.premiumQuestionCardTitle, { color: colors.text }]} numberOfLines={3}>
                                                {prompt}
                                            </Text>
                                            
                                            <View style={[styles.premiumNoteCardFooter, { borderTopColor: colors.border }]}>
                                                <Feather name="help-circle" size={normalize(14)} color={colors.Primary} style={{ marginRight: 6 }} />
                                                <Text style={[styles.premiumNoteCardFooterText, { color: colors.Primary }]}>View Question & Answer</Text>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
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
                                    <Text style={styles.questionAnswerLabel}>QUESTION DETAIL</Text>
                                    <Text style={styles.questionAnswerTitle}>
                                        Review Question
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
                            <View style={styles.qDetailBodyCard}>
                                <View style={styles.qDetailBadgeRow}>
                                    <View style={[styles.premiumNoteCardBadge, { backgroundColor: colors.tagPurple }]}>
                                        <Text style={[styles.premiumNoteCardBadgeText, { color: colors.tagPurpleText }]}>
                                            QUESTION {String(selectedQuestionAnswerDetail?.questionNumber || '').padStart(2, '0')}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={{ marginVertical: verticalScale(12) }}>
                                    <CustomNoteRenderer
                                        content={selectedQuestionAnswerDetail?.questionContent}
                                        htmlFallback={selectedQuestionAnswerDetail?.htmlContent || selectedQuestionAnswerDetail?.title || ''}
                                    />
                                </View>

                                {selectedQuestionAnswerDetail?.options && selectedQuestionAnswerDetail.options.length > 0 ? (
                                    <View style={styles.qDetailOptionsWrap}>
                                        {selectedQuestionAnswerDetail.options.map((option: any, optIdx: number) => {
                                            const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                                            return (
                                                <View key={optIdx} style={[styles.qDetailOptionRow, { borderColor: colors.border }]}>
                                                    <View style={[styles.qDetailOptionLetterBox, { backgroundColor: colors.tagCyan }]}>
                                                        <Text style={[styles.qDetailOptionLetter, { color: colors.tagCyanText }]}>
                                                            {optionLetter}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.qDetailOptionText, { color: colors.text }]}>
                                                        {toDisplayText(option, '')}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : null}

                                <View style={[styles.qDetailExplanationContainer, { borderColor: colors.border }]}>
                                    <View style={[styles.qDetailExplanationHeader, { backgroundColor: theme === 'classic' ? '#ECFDF5' : 'rgba(16, 185, 129, 0.08)', borderBottomColor: colors.border }]}>
                                        <Feather name="check-circle" size={normalize(18)} color="#10B981" />
                                        <Text style={[styles.qDetailExplanationTitle, { color: theme === 'classic' ? '#0F766E' : '#34D399' }]}>
                                            ANSWER & EXPLANATION
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.qDetailExplanationBody}>
                                        {selectedQuestionAnswerDetail?.answer ? (
                                            <View style={styles.qCorrectAnswerBox}>
                                                <Text style={[styles.qCorrectAnswerLabel, { color: colors.textSecondary }]}>CORRECT ANSWER</Text>
                                                <View style={[styles.qCorrectAnswerValueContainer, { backgroundColor: theme === 'classic' ? '#EFF6FF' : 'rgba(59, 130, 246, 0.08)' }]}>
                                                    <Text style={[styles.qCorrectAnswerValue, { color: colors.Primary }]}>
                                                        {selectedQuestionAnswerDetail.answer}
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : null}

                                        {selectedQuestionAnswerDetail?.explanation ? (
                                            <View style={styles.qExplanationBox}>
                                                <Text style={[styles.qExplanationLabel, { color: colors.textSecondary }]}>EXPLANATION</Text>
                                                <CustomNoteRenderer
                                                    content={selectedQuestionAnswerDetail?.explanationJson}
                                                    htmlFallback={selectedQuestionAnswerDetail.explanation}
                                                />
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
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
                                <CustomNoteRenderer
                                    content={selectedNotePageDetail?.content || selectedNotePageDetail?.contentJson}
                                    htmlFallback={selectedNotePageDetail?.htmlContent}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.statusBg} barStyle={colors.statusBar} />

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
                    <Feather name="search" size={normalize(18)} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: colors.Primary }]}>{bundleItems.length}</Text>
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
                        {filteredExams.map((bundle: any, index: number) => (
                            <ExamCard
                                key={String(getBundleId(getBundlePayload(bundle)) || index)}
                                bundle={bundle}
                                index={index}
                                onPress={() => handleBundlePress(bundle)}
                                colors={colors}
                                isDarkTheme={isDarkTheme}
                                styles={styles}
                                renderIcon={renderIcon}
                            />
                        ))}
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

const getStyles = (colors: any, isDarkTheme: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    headerBackground: {
        backgroundColor: colors.Primary,
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
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(12),
        paddingHorizontal: normalize(14),
        height: verticalScale(48),
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: verticalScale(20),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: colors.text,
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
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(12),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        marginHorizontal: normalize(4),
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: normalize(16),
        fontWeight: '800',
    },
    statLabel: {
        fontSize: normalize(11),
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: verticalScale(2),
    },
    allExamsTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: verticalScale(16),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: -normalize(8),
    },
    gridItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(8),
        paddingVertical: verticalScale(16),
        borderRadius: normalize(16),
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkTheme ? 0.16 : 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    circleContainer: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(30),
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
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: normalize(15),
    },
    detailHeader: {
        backgroundColor: colors.Primary,
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
        color: colors.text,
        marginBottom: verticalScale(12),
    },
    patternCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(16),
        marginBottom: verticalScale(20),
        shadowColor: isDarkTheme ? colors.accent : '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.05,
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
        color: colors.text,
        fontWeight: '800',
        lineHeight: normalize(16),
    },
    subjectSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        color: colors.textSecondary,
        letterSpacing: 0.2,
    },
    dynamicTabTextActive: {
        color: colors.accent,
    },
    dynamicTabIndicator: {
        height: verticalScale(4),
        borderRadius: normalize(999),
        backgroundColor: 'transparent',
        marginTop: verticalScale(8),
    },
    dynamicTabIndicatorActive: {
        backgroundColor: colors.accent,
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
        backgroundColor: colors.accent,
        marginRight: normalize(10),
    },
    topicTitle: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: colors.text,
    },
    quizCardsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: normalize(12),
    },
    quizCard: {
        width: '100%',
        minWidth: normalize(140),
        borderRadius: normalize(18),
        padding: normalize(14),
        borderWidth: 1,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.16 : 0.08,
        shadowRadius: 18,
        elevation: 4,
    },
    quizBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        borderWidth: 1,
        marginBottom: verticalScale(12),
    },
    quizBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
    },
    quizCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        marginBottom: verticalScale(14),
    },
    resourceCardSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        marginLeft: normalize(6),
        fontWeight: '600',
    },
    quizPriceText: {
        fontSize: normalize(12),
        fontWeight: '800',
    },
    quizActionButton: {
        height: verticalScale(46),
        borderRadius: normalize(12),
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
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
    },
    quizViewOnlyText: {
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
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(20),
        padding: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: colors.textSecondary,
        letterSpacing: 1,
        marginBottom: verticalScale(8),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(8),
    },
    noteViewerContainer: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    noteViewerSafeArea: {
        backgroundColor: colors.cardBackground,
    },
    noteViewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.cardBackground,
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
        borderColor: colors.border,
        backgroundColor: colors.tagCyan,
        color: colors.tagCyanText,
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
        color: colors.text,
        marginBottom: verticalScale(2),
    },
    noteViewerSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
    },
    noteViewerScrollContent: {
        paddingHorizontal: normalize(20),
        paddingTop: verticalScale(18),
    },
    noteViewerStateBox: {
        minHeight: verticalScale(220),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: normalize(16),
    },
    noteViewerStateText: {
        marginTop: verticalScale(12),
        fontSize: normalize(13),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    noteViewerLayout: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    noteViewerLeftPanel: {
        width: '35%',
        backgroundColor: colors.cardBackground,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        padding: normalize(18),
    },
    noteViewerRightPanel: {
        width: '65%',
        padding: normalize(18),
        backgroundColor: colors.Background,
    },
    noteViewerPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: colors.textSecondary,
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
        borderColor: colors.border,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    noteViewerListItemActive: {
        backgroundColor: colors.Primary,
        borderColor: colors.Primary,
    },
    noteViewerListIndex: {
        fontSize: normalize(14),
        fontWeight: '800',
        color: colors.textSecondary,
        width: normalize(22),
    },
    noteViewerListIndexActive: {
        color: '#FFFFFF',
    },
    noteViewerListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
    },
    noteViewerListTextActive: {
        color: '#FFFFFF',
    },
    noteViewerDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    noteViewerDetailCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        shadowColor: isDarkTheme ? colors.accent : '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
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
        backgroundColor: colors.tagCyan,
        color: colors.tagCyanText,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    noteViewerDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: colors.text,
    },
    noteViewerDetailBody: {
        fontSize: normalize(14),
        color: colors.text,
        lineHeight: normalize(22),
    },
    noteViewerDetailHint: {
        marginTop: verticalScale(12),
        fontSize: normalize(12),
        color: colors.textSecondary,
        fontWeight: '600',
    },
    noteViewerViewButton: {
        alignSelf: 'flex-start',
        marginTop: verticalScale(18),
        backgroundColor: colors.accent,
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
        backgroundColor: colors.Background,
    },
    notePageViewerSafeArea: {
        backgroundColor: colors.cardBackground,
    },
    notePageViewerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    notePageViewerHeaderText: {
        flex: 1,
    },
    notePageViewerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.tagCyan,
        color: colors.tagCyanText,
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
        color: colors.text,
    },
    notePageViewerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.border,
    },
    notePageViewerScrollContent: {
        padding: normalize(18),
    },
    notePageViewerCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        shadowColor: isDarkTheme ? colors.accent : '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    notePageViewerBody: {
        fontSize: normalize(14),
        color: colors.text,
        lineHeight: normalize(22),
    },
    notePageCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(16),
        marginBottom: verticalScale(14),
    },
    notePageTitle: {
        fontSize: normalize(17),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(10),
    },
    notePageBody: {
        fontSize: normalize(13),
        color: colors.text,
        lineHeight: normalize(20),
    },
    modalDescription: {
        fontSize: normalize(13),
        color: colors.textSecondary,
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
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(14),
    },
    courseRightPanel: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(14),
    },
    coursePanelLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: colors.textSecondary,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: verticalScale(12),
    },
    courseSectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(16),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.Background,
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        minHeight: verticalScale(58),
    },
    courseSectionItemActive: {
        backgroundColor: colors.Primary,
        borderColor: colors.Primary,
    },
    courseSectionText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
    },
    courseSectionTextActive: {
        color: '#FFFFFF',
    },
    courseCard: {
        width: '100%',
        minHeight: verticalScale(150),
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(16),
        shadowColor: isDarkTheme ? colors.accent : '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
        shadowRadius: 18,
        elevation: 3,
        justifyContent: 'space-between',
    },
    courseCardBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
        borderWidth: 1,
        marginBottom: verticalScale(10),
    },
    courseCardBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    courseCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(6),
    },
    courseCardSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        color: colors.textSecondary,
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
        borderColor: colors.border,
        backgroundColor: colors.Background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(16),
    },
    emptyStateText: {
        marginTop: verticalScale(10),
        fontSize: normalize(13),
        color: colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    questionBankContainer: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    questionBankSafeArea: {
        backgroundColor: colors.cardBackground,
    },
    questionBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        borderColor: colors.border,
        backgroundColor: colors.tagPurple,
        color: colors.tagPurpleText,
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
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    questionBankSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        color: colors.textSecondary,
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
        color: colors.textSecondary,
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
        backgroundColor: colors.cardBackground,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        padding: normalize(18),
    },
    questionBankRightPanel: {
        flex: 1,
        padding: normalize(18),
        backgroundColor: colors.Background,
    },
    questionBankPanelLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: colors.textSecondary,
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
        borderColor: colors.border,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: normalize(14),
        paddingVertical: verticalScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
    },
    questionBankListItemActive: {
        backgroundColor: colors.Primary,
        borderColor: colors.Primary,
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
        color: colors.textSecondary,
        width: normalize(22),
    },
    questionBankListIndexActive: {
        color: '#FFFFFF',
    },
    questionBankListText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
    },
    questionBankListTextActive: {
        color: '#FFFFFF',
    },
    questionBankDetailScroll: {
        paddingBottom: verticalScale(24),
    },
    questionBankDetailCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        shadowColor: isDarkTheme ? colors.accent : '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
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
        backgroundColor: colors.tagPurple,
        color: colors.tagPurpleText,
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    questionBankDetailTitle: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '800',
        color: colors.text,
    },
    questionBankYearText: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        backgroundColor: colors.accent,
        marginTop: verticalScale(5),
    },
    questionBankOptionText: {
        flex: 1,
        fontSize: normalize(14),
        color: colors.text,
        lineHeight: normalize(22),
    },
    questionBankToggleBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: normalize(16),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(18),
    },
    questionBankToggleText: {
        fontSize: normalize(13),
        fontWeight: '800',
        color: colors.accent,
    },
    questionBankAnswerCard: {
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.tagGreen,
        padding: normalize(18),
    },
    questionBankAnswerLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        color: colors.tagGreenText,
        letterSpacing: 1,
        marginBottom: verticalScale(12),
    },
    questionBankAnswerText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: colors.text,
        lineHeight: normalize(22),
        marginBottom: verticalScale(10),
    },
    questionBankExplanationText: {
        fontSize: normalize(14),
        color: colors.textSecondary,
        lineHeight: normalize(22),
    },
    questionAnswerContainer: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    questionAnswerSafeArea: {
        backgroundColor: colors.cardBackground,
    },
    questionAnswerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    questionAnswerHeaderText: {
        flex: 1,
    },
    questionAnswerLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.tagGreen,
        color: colors.tagGreenText,
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
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    questionAnswerSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionAnswerCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.border,
    },
    questionAnswerScrollContent: {
        padding: normalize(18),
    },
    questionAnswerCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        shadowColor: isDarkTheme ? colors.accent : '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    questionAnswerBody: {
        fontSize: normalize(14),
        color: colors.text,
        lineHeight: normalize(22),
        marginBottom: verticalScale(14),
    },
    questionAnswerExplanation: {
        fontSize: normalize(14),
        color: colors.textSecondary,
        lineHeight: normalize(22),
    },
    videoBankContainer: {
        flex: 1,
        backgroundColor: colors.Background,
    },
    videoBankSafeArea: {
        backgroundColor: colors.cardBackground,
    },
    videoBankHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: normalize(14),
    },
    videoBankHeaderText: {
        flex: 1,
    },
    videoBankLabel: {
        alignSelf: 'flex-start',
        borderRadius: normalize(999),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.tagOrange,
        color: colors.tagOrangeText,
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
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    videoBankSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    videoBankCloseBtn: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        backgroundColor: colors.border,
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
        color: colors.textSecondary,
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
        color: colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    videoBankListContent: {
        padding: normalize(18),
    },
    videoBankCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(16),
        shadowColor: isDarkTheme ? colors.accent : '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkTheme ? 0.12 : 0.06,
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
        backgroundColor: colors.tagOrange,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBankCardTextWrap: {
        flex: 1,
    },
    videoBankCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    videoBankCardSubtitle: {
        fontSize: normalize(12),
        color: colors.textSecondary,
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
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        marginBottom: verticalScale(12),
    },
    modalSecondaryButtonText: {
        color: colors.text,
        fontSize: normalize(14),
        fontWeight: '800',
    },
    modalPrimaryButton: {
        height: verticalScale(48),
        borderRadius: normalize(12),
        backgroundColor: colors.accent,
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
        backgroundColor: colors.border,
        paddingVertical: verticalScale(6),
        paddingHorizontal: normalize(12),
        borderRadius: normalize(8),
    },
    modalPriceText: {
        fontSize: normalize(14),
        color: colors.text,
        fontWeight: '600',
    },
    noteListScrollContainer: {
        padding: normalize(18),
        paddingBottom: verticalScale(32),
    },
    premiumNoteCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(18),
        marginBottom: verticalScale(14),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    premiumNoteCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    premiumNoteCardTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
    },
    premiumNoteCardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(10),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(999),
    },
    premiumNoteCardBadgeText: {
        fontSize: normalize(10),
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    premiumNoteCardTitle: {
        fontSize: normalize(16),
        fontWeight: '800',
        marginBottom: verticalScale(6),
    },
    premiumNoteCardBody: {
        fontSize: normalize(13),
        lineHeight: normalize(19),
        marginBottom: verticalScale(12),
    },
    premiumNoteCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: verticalScale(10),
        marginTop: verticalScale(4),
    },
    premiumNoteCardFooterText: {
        fontSize: normalize(12),
        fontWeight: '700',
    },
    questionListScrollContainer: {
        padding: normalize(18),
        paddingBottom: verticalScale(32),
    },
    premiumQuestionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(18),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(18),
        marginBottom: verticalScale(14),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    premiumQuestionCardTitle: {
        fontSize: normalize(15),
        fontWeight: '800',
        lineHeight: normalize(22),
        marginBottom: verticalScale(12),
    },
    qDetailBodyCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: normalize(22),
        borderWidth: 1,
        borderColor: colors.border,
        padding: normalize(20),
        marginBottom: verticalScale(20),
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    qDetailBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    qDetailOptionsWrap: {
        marginVertical: verticalScale(16),
        gap: verticalScale(10),
    },
    qDetailOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: normalize(12),
        borderWidth: 1,
        padding: normalize(12),
        gap: normalize(12),
    },
    qDetailOptionLetterBox: {
        width: normalize(28),
        height: normalize(28),
        borderRadius: normalize(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    qDetailOptionLetter: {
        fontSize: normalize(13),
        fontWeight: '800',
    },
    qDetailOptionText: {
        flex: 1,
        fontSize: normalize(14),
        fontWeight: '600',
        lineHeight: normalize(20),
    },
    qDetailExplanationContainer: {
        borderRadius: normalize(16),
        borderWidth: 1,
        overflow: 'hidden',
        marginTop: verticalScale(12),
    },
    qDetailExplanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(14),
        borderBottomWidth: 1,
        gap: normalize(8),
    },
    qDetailExplanationTitle: {
        fontSize: normalize(13),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    qDetailExplanationBody: {
        padding: normalize(16),
        gap: verticalScale(14),
    },
    qCorrectAnswerBox: {
        gap: verticalScale(6),
    },
    qCorrectAnswerLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    qCorrectAnswerValueContainer: {
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
        borderRadius: normalize(8),
        alignSelf: 'flex-start',
    },
    qCorrectAnswerValue: {
        fontSize: normalize(14),
        fontWeight: '800',
    },
    qExplanationBox: {
        gap: verticalScale(6),
    },
    qExplanationLabel: {
        fontSize: normalize(11),
        fontWeight: '800',
        letterSpacing: 0.8,
        marginBottom: verticalScale(4),
    },
});

export default CoursesScreen;
