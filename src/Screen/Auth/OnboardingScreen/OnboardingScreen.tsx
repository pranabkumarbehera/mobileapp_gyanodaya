import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ListRenderItem,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { normalize, verticalScale, getContainerWidth } from '../../../Utils/Helpers/normalize';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme, useTranslation } from '../../../Themes/hooks';
import Fonts from '../../../Themes/Fonts';

// On web the app renders inside a max-480px container, not the full window width.
// getContainerWidth() returns the correct slide width for horizontal pagination.
const slideWidth = getContainerWidth();

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

type Slide = {
    id: string;
    titleKey: string;
    descKey: string;
    icon: string;
};

const onboardingSlides: Slide[] = [
    {
        id: 's1',
        titleKey: 'onboarding.slide1_title',
        descKey: 'onboarding.slide1_desc',
        icon: 'book-open'
    },
    {
        id: 's2',
        titleKey: 'onboarding.slide2_title',
        descKey: 'onboarding.slide2_desc',
        icon: 'users'
    },
    {
        id: 's3',
        titleKey: 'onboarding.slide3_title',
        descKey: 'onboarding.slide3_desc',
        icon: 'award'
    },
    {
        id: 's4',
        titleKey: 'onboarding.slide4_title',
        descKey: 'onboarding.slide4_desc',
        icon: 'bar-chart-2'
    },
    {
        id: 's5',
        titleKey: 'onboarding.slide5_title',
        descKey: 'onboarding.slide5_desc',
        icon: 'message-circle'
    },
    {
        id: 's6',
        titleKey: 'onboarding.slide6_title',
        descKey: 'onboarding.slide6_desc',
        icon: 'shield'
    }
];

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
    const flatListRef = useRef<FlatList<Slide>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { colors, theme, tokens } = useTheme();
    const { t } = useTranslation();
    const isLastSlide = currentIndex === onboardingSlides.length - 1;

    const isDarkTheme = tokens.isDark;
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    const handleMomentumPress = () => {
        if (!isLastSlide) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            return;
        }
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleSkip = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
        setCurrentIndex(nextIndex);
    };

    const renderItem: ListRenderItem<Slide> = ({ item }) => (
        <View style={styles.slide}>
            <View style={[
                styles.iconCircle,
                { 
                    backgroundColor: theme === 'neon' ? 'rgba(0, 242, 254, 0.08)' : 
                                     theme === 'sunset' ? 'rgba(249, 115, 22, 0.08)' : 
                                     colors.tagCyan,
                    borderColor: colors.border,
                    borderWidth: isDarkTheme ? 1 : 0
                }
            ]}>
                <Icon name={item.icon} size={normalize(45)} color={colors.accent} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{t(item.titleKey)}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{t(item.descKey)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.Background }]}>
            <StatusBar backgroundColor={colors.Background} barStyle={statusBarStyle} />

            <View style={styles.header}>
                <Pressable onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>{t('common.skip')}</Text>
                </Pressable>
            </View>

            <View style={styles.listWrapper}>
                <FlatList
                    ref={flatListRef}
                    data={onboardingSlides}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMomentumEnd}
                    bounces={false}
                />
            </View>

            <View style={styles.bottomContent}>
                <View style={styles.pagination}>
                    {onboardingSlides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                { backgroundColor: colors.border },
                                index === currentIndex && [styles.paginationDotActive, { backgroundColor: colors.Secondary }]
                            ]}
                        />
                    ))}
                </View>

                <Pressable 
                    style={[
                        styles.primaryButton, 
                        { 
                            backgroundColor: colors.Primary,
                            borderColor: colors.border,
                            borderWidth: isDarkTheme ? 1 : 0
                        }
                    ]} 
                    onPress={handleMomentumPress}
                >
                    <Text style={styles.primaryButtonText}>{t('common.continue')}</Text>
                    <Icon name="chevron-right" size={normalize(18)} color="#FFFFFF" style={styles.buttonIcon} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: normalize(24),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(10),
    },
    skipText: {
        fontSize: normalize(14),
        fontWeight: '500',
        padding: normalize(8),
    },
    listWrapper: {
        flex: 1,
    },
    slide: {
        width: slideWidth,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(30),
    },
    iconCircle: {
        width: normalize(120),
        height: normalize(120),
        borderRadius: normalize(60),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(40),
        
        
        
        
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: normalize(20),
    },
    title: {
        fontSize: normalize(22),
        fontWeight: '800',
        marginBottom: verticalScale(12),
        textAlign: 'center',
        fontFamily: Fonts.InterBold,
    },
    description: {
        fontSize: normalize(14),
        textAlign: 'center',
        lineHeight: normalize(22),
    },
    bottomContent: {
        paddingHorizontal: normalize(24),
        paddingBottom: verticalScale(40),
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        gap: normalize(6),
        marginBottom: verticalScale(30),
    },
    paginationDot: {
        width: normalize(6),
        height: normalize(6),
        borderRadius: normalize(3),
    },
    paginationDotActive: {
        width: normalize(20),
    },
    primaryButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(16),
        paddingHorizontal: normalize(24),
        borderRadius: normalize(12),
        
        
        
        
        
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: 'bold',
        marginRight: normalize(8),
    },
    buttonIcon: {
        marginTop: verticalScale(2),
    }
});

export default OnboardingScreen;
