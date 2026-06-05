import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Animated, Easing, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { tokenRequest } from '../../Redux/Reducers/AuthReducer';
import { RootState } from '../../Redux/Store';
import Imagepath from '../../Themes/Imagepath';
import { RootStackParamList } from '../../Navigator/StackNav';
import { normalize, verticalScale } from '../../Utils/Helpers/normalize';
import Fonts from '../../Themes/Fonts';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = StackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: SplashScreenProps) => {
    const dispatch = useDispatch();
    const { isLoading, token } = useSelector((state: RootState) => state.AuthReducer);

    useEffect(() => {
        dispatch(tokenRequest({}));
    }, []);
    // Animation Values
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoFade = useRef(new Animated.Value(0)).current;

    const ripple1Scale = useRef(new Animated.Value(0.2)).current;
    const ripple1Opacity = useRef(new Animated.Value(0.6)).current;
    const ripple2Scale = useRef(new Animated.Value(0.2)).current;
    const ripple2Opacity = useRef(new Animated.Value(0.6)).current;

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

        // 6. Navigate to Onboarding ONLY if we've checked the token and it's null
        // Since StackNav will automatically unmount Splash if token is found,
        // we just need to wait a few seconds and go to Onboarding.
        const timeoutId = setTimeout(() => {
            if (!isLoading && !token) {
                navigation.replace('Onboarding');
            }
        }, 3500);

        return () => clearTimeout(timeoutId);
    }, [navigation, isLoading, token]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

            {/* Glowing Ambient Center Light */}
            <View style={styles.ambientGlow} />

            {/* Two Large Merging Bubbles Background */}
            {/* <Animated.View style={[
                styles.largeMergeBubble,
                { transform: [{ translateX: mergeBubbleLeftX }], opacity: mergeBubbleOpacity }
            ]} />
            <Animated.View style={[
                styles.largeMergeBubble,
                { transform: [{ translateX: mergeBubbleRightX }], opacity: mergeBubbleOpacity, backgroundColor: '#f0a335' }
            ]} /> */}

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
                {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) }}>
                    <Text style={styles.brandText}>GYANODAYA</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.subText}>YOUR SUCCESS IS OUR MOTIVATION</Text>
                </View> */}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        backgroundColor: '#f0a335', // Bright yellow bubbles
        shadowColor: '#f0a335',
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
        width: normalize(200),
        height: normalize(200),
        borderRadius: normalize(100), // Perfect circle
        backgroundColor: 'rgba(29, 43, 107, 0.05)',
        borderWidth: 2,
        borderColor: 'rgba(240, 163, 53, 0.3)', // Yellow/Gold circular border
    },
    logo: {
        width: normalize(250),
        height: normalize(250), // Increased logo dimensions significantly
    },
    brandText: {
        fontSize: normalize(38), // Slightly larger font
        fontWeight: '900',
        fontFamily: Fonts.InterBold,
        color: '#1D2B6B', // Dark blue text
        letterSpacing: 2,
        marginBottom: verticalScale(8),
    },
    subText: {
        fontSize: normalize(13),
        color: '#f0a335', // Yellow tagline
        fontWeight: '700',
        fontFamily: Fonts.InterBold,
        letterSpacing: 1.5,
        // textDecorationLine: "underline"
    },
});

export default SplashScreen;