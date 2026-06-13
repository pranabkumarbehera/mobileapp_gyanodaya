import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Animated, Easing, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import Imagepath from '../../Themes/Imagepath';
import { RootStackParamList } from '../../Navigator/StackNav';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import Fonts from '../../Themes/Fonts';
import { tokenRequest, tokenFailure, tokenSuccess } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = StackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: SplashScreenProps) => {
    const dispatch = useDispatch();
    const { token, status } = useSelector((state: RootState) => state.AuthReducer);

    // Animation Values
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoFade = useRef(new Animated.Value(0)).current;

    const ripple1Scale = useRef(new Animated.Value(0.2)).current;
    const ripple1Opacity = useRef(new Animated.Value(0.6)).current;
    const ripple2Scale = useRef(new Animated.Value(0.2)).current;
    const ripple2Opacity = useRef(new Animated.Value(0.6)).current;

    const brandLettersFade = useRef([...Array(9)].map(() => new Animated.Value(0))).current;
    const brandLettersTranslate = useRef([...Array(9)].map(() => new Animated.Value(15))).current;
    const taglineFade = useRef(new Animated.Value(0)).current;
    const taglineTranslate = useRef(new Animated.Value(15)).current;

    // Merging Background Bubbles
    const mergeBubbleLeftX = useRef(new Animated.Value(-width * 0.8)).current;
    const mergeBubbleRightX = useRef(new Animated.Value(width * 0.8)).current;
    const mergeBubbleOpacity = useRef(new Animated.Value(0)).current;

    // Fast particles array (35 particles)
    const particles = useRef([...Array(35)].map(() => ({
        y: new Animated.Value(0),
        xOffset: new Animated.Value(0),
        opacity: new Animated.Value(0),
        left: Math.random() * width,
        size: Math.random() * 8 + 4, // Larger circular bubbles
        delay: Math.random() * 800,
        duration: Math.random() * 1000 + 1500, // Faster duration (speedily)
        drift: (Math.random() - 0.5) * 100 // Sway left/right
    }))).current;

    useEffect(() => {
        dispatch(tokenRequest({}));

        // 1. Logo fades in and scales up to a LARGE size
        Animated.parallel([
            Animated.timing(logoFade, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
                toValue: 1.2, // Increased scale for larger icon
                duration: 1200,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            })
        ]).start();

        // 2. Merging large background bubbles
        Animated.parallel([
            Animated.timing(mergeBubbleOpacity, {
                toValue: 0.15,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(mergeBubbleLeftX, {
                toValue: -width * 0.1, // Move towards center
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(mergeBubbleRightX, {
                toValue: width * 0.1, // Move towards center to merge
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start();

        // 3. Dual Ripples / Glow effect (Looping) behind the large logo
        const createRipple = (scaleAnim: Animated.Value, opacityAnim: Animated.Value, delay: number) => {
            setTimeout(() => {
                Animated.loop(
                    Animated.parallel([
                        Animated.timing(scaleAnim, {
                            toValue: 2.5,
                            duration: 2500,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.timing(opacityAnim, { toValue: 0.8, duration: 500, useNativeDriver: true }),
                            Animated.timing(opacityAnim, { toValue: 0, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true })
                        ])
                    ])
                ).start();
            }, delay);
        };

        createRipple(ripple1Scale, ripple1Opacity, 0);
        createRipple(ripple2Scale, ripple2Opacity, 1000);

        // 4. Brand Text Fade In (Letter by letter in slow motion)
        setTimeout(() => {
            const letterAnimations = brandLettersFade.map((fadeAnim, index) => {
                const translateAnim = brandLettersTranslate[index];
                return Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: 0,
                        duration: 800,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    })
                ]);
            });
            Animated.stagger(150, letterAnimations).start();
        }, 1200);

        // 5. Tagline Fade In
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(taglineFade, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslate, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start();
        }, 2800);

        // 6. Fast Background Yellow Bubbles
        particles.forEach(p => {
            setTimeout(() => {
                Animated.loop(
                    Animated.parallel([
                        Animated.timing(p.y, {
                            toValue: -height * 0.6,
                            duration: p.duration,
                            easing: Easing.linear,
                            useNativeDriver: true,
                        }),
                        Animated.timing(p.xOffset, {
                            toValue: p.drift,
                            duration: p.duration,
                            easing: Easing.inOut(Easing.sin),
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.timing(p.opacity, { toValue: 0.9, duration: p.duration * 0.3, useNativeDriver: true }),
                            Animated.timing(p.opacity, { toValue: 0, duration: p.duration * 0.7, useNativeDriver: true })
                        ])
                    ])
                ).start();
            }, p.delay);
        });
    }, [dispatch, logoFade, logoScale, mergeBubbleLeftX, mergeBubbleOpacity, mergeBubbleRightX, particles, ripple1Opacity, ripple1Scale, ripple2Opacity, ripple2Scale, taglineFade, taglineTranslate, brandLettersFade, brandLettersTranslate]);

    useEffect(() => {
        if (status === tokenSuccess.type && token) {
            return;
        }

        if (status === tokenFailure.type || (status === tokenSuccess.type && !token)) {
          setTimeout(() => {
            navigation.replace('Onboarding');
          }, 3500); // Delay navigation to allow splash animations to complete
        }
    }, [navigation, status, token]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1D2B6B" barStyle="light-content" />

            {/* Glowing Ambient Center Light */}
            <View style={styles.ambientGlow} />

            {/* Two Large Merging Bubbles Background */}
            <Animated.View style={[
                styles.largeMergeBubble,
                { transform: [{ translateX: mergeBubbleLeftX }], opacity: mergeBubbleOpacity }
            ]} />
            <Animated.View style={[
                styles.largeMergeBubble,
                { transform: [{ translateX: mergeBubbleRightX }], opacity: mergeBubbleOpacity, backgroundColor: '#3B82F6' }
            ]} />

            {/* Fast Yellow Circular Bubbles */}
            {particles.map((p, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bubble,
                        {
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            borderRadius: p.size / 2, // Perfect circle
                            opacity: p.opacity,
                            transform: [
                                { translateY: p.y },
                                { translateX: p.xOffset }
                            ]
                        }
                    ]}
                />
            ))}

            <View style={styles.content}>

                {/* Large Logo Section====== */}
                <View style={styles.logoWrapper}>
                    {/* Ripples */}
                    <Animated.View style={[
                        styles.ripple,
                        { transform: [{ scale: ripple1Scale }], opacity: ripple1Opacity }
                    ]} />
                    <Animated.View style={[
                        styles.ripple,
                        { transform: [{ scale: ripple2Scale }], opacity: ripple2Opacity }
                    ]} />

                    {/* Logo Image */}
                    <Image
                        source={Imagepath.Logo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Typography */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) }}>
                    {['G', 'Y', 'A', 'N', 'O', 'D', 'A', 'Y', 'A'].map((letter, index) => (
                        <Animated.Text
                            key={index}
                            style={[
                                styles.brandText,
                                {
                                    opacity: brandLettersFade[index],
                                    transform: [{ translateY: brandLettersTranslate[index] }],
                                    marginBottom: 0,
                                }
                            ]}
                        >
                            {letter}
                        </Animated.Text>
                    ))}
                </View>

                <Animated.View style={{ opacity: taglineFade, transform: [{ translateY: taglineTranslate }], alignItems: 'center' }}>
                    <Text style={styles.subText}>YOUR SUCCESS IS OUR MOTIVATION</Text>
                </Animated.View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D2B6B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ambientGlow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: height * 0.5 - width * 0.75,
        left: -width * 0.25,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 120,
        elevation: 20,
    },
    largeMergeBubble: {
        position: 'absolute',
        width: width,
        height: width,
        borderRadius: width / 2, // Perfect circle
        backgroundColor: '#FACC15',
        top: height * 0.3,
        left: 0,
    },
    bubble: {
        position: 'absolute',
        bottom: -30,
        backgroundColor: '#FACC15', // Bright yellow bubbles
        shadowColor: '#FACC15',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 8,
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        width: normalize(180),
        height: normalize(180),
    },
    ripple: {
        position: 'absolute',
        width: normalize(140),
        height: normalize(140),
        borderRadius: normalize(70), // Perfect circle
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(250, 204, 21, 0.5)', // Yellow/Gold circular border
    },
    logo: {
        width: normalize(250),
        height: normalize(230), // Increased logo dimensions significantly
    },
    brandText: {
        fontSize: normalize(36), // Slightly larger font
        fontWeight: '900',
        fontFamily: Fonts.InterBold,
        color: '#FFFFFF',
        letterSpacing: 2,
        marginBottom: verticalScale(8),
        textShadowColor: 'rgba(255,255,255,0.25)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
    },
    subText: {
        fontSize: normalize(12),
        color: '#FACC15', // Yellow tagline
        fontWeight: '700',
        fontFamily: Fonts.InterBold,
        letterSpacing: 1.5,
        // textDecorationLine: "underline"
    },
});

export default SplashScreen;
