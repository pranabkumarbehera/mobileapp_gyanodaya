import React, { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Dimensions,
    FlatList,
    ListRenderItem,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Colorpath from '../../../Themes/Colorpath';
import { RootStackParamList } from '../../../Navigator/StackNav';
import { normalize, verticalScale } from '../../../Utils/Helpers/normalize';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

type Slide = {
    id: string;
    title: string;
    description: string;
    icon: string;
};

const slides: Slide[] = [
    {
        id: 's1',
        title: 'Study Plans',
        description: 'Personalized plans tailored for your exams.',
        icon: 'book-open'
    },
    {
        id: 's2',
        title: 'Expert Teachers',
        description: 'Learn from the best educators in the country.',
        icon: 'users'
    },
    {
        id: 's3',
        title: 'Live Tests',
        description: 'Compete with peers in real-time mock tests.',
        icon: 'award'
    },
    {
        id: 's4',
        title: 'Analytics',
        description: 'Detailed insights to improve your performance.',
        icon: 'bar-chart-2'
    },
    {
        id: 's5',
        title: 'Community',
        description: 'Join a thriving community of serious learners.',
        icon: 'message-circle'
    },
    {
        id: 's6',
        title: 'Strictly Protected',
        description: 'Screenshot, screen record, and video recording are completely prohibited.',
        icon: 'shield' // or 'video-off'
    }
];

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
    const flatListRef = useRef<FlatList<Slide>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const isLastSlide = currentIndex === slides.length - 1;

    const primaryLabel = 'Continue';

    const handleMomentumPress = async () => {
        if (!isLastSlide) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            return;
        }
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(nextIndex);
    };

    const renderItem: ListRenderItem<Slide> = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.iconCircle}>
                <Icon name={item.icon} size={normalize(45)} color={Colorpath.Primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FAFBFF" barStyle="dark-content" />

            <View style={styles.header}>
                <Pressable onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </Pressable>
            </View>

            <View style={styles.listWrapper}>
                <FlatList
                    ref={flatListRef}
                    data={slides}
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
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentIndex && styles.paginationDotActive
                            ]}
                        />
                    ))}
                </View>

                <Pressable style={styles.primaryButton} onPress={handleMomentumPress}>
                    <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
                    <Icon name="chevron-right" size={normalize(18)} color="#FFFFFF" style={styles.buttonIcon} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
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
        color: '#6B7280',
        fontSize: normalize(14),
        fontWeight: '500',
        padding: normalize(8),
    },
    listWrapper: {
        flex: 1,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: normalize(30),
    },
    iconCircle: {
        width: normalize(120),
        height: normalize(120),
        borderRadius: normalize(60),
        backgroundColor: '#EEF2FF',
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
        color: Colorpath.Primary,
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    description: {
        fontSize: normalize(14),
        color: '#6B7280',
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
        backgroundColor: '#E5E7EB',
    },
    paginationDotActive: {
        width: normalize(20),
        backgroundColor: Colorpath.Secondary,
    },
    primaryButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colorpath.Primary,
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
