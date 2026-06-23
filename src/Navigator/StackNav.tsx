import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/Store';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import SplashScreen from '../Screen/SplashScreen/SplashScreen';
import OnboardingScreen from '../Screen/Auth/OnboardingScreen/OnboardingScreen';
import LoginScreen from '../Screen/Auth/LoginScreen/LoginScreen';
import RegisterScreen from '../Screen/Auth/RegisterScreen/RegisterScreen';
import ForgotPasswordScreen from '../Screen/Auth/ForgotPasswordScreen/ForgotPasswordScreen';
import OtpScreen from '../Screen/Auth/OtpScreen/OtpScreen';
import ChangePasswordScreen from '../Screen/Auth/ChangePasswordScreen/ChangePasswordScreen';
import PrivacyPolicyScreen from '../Screen/Auth/PrivacyPolicyScreen/PrivacyPolicyScreen';
import TermsConditionsScreen from '../Screen/Auth/TermsConditionsScreen/TermsConditionsScreen';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import TabNav from './TabNav';
import TeacherScreen from '../Screen/TeacherScreen/TeacherScreen';
import MockBankScreen from '../Screen/MockBankScreen/MockBankScreen';
import MockTestRulesScreen from '../Screen/MockTestRulesScreen/MockTestRulesScreen';
import MockTestQuestionScreen from '../Screen/MockTestQuestionScreen/MockTestQuestionScreen';
import TeacherProfileScreen from '../Screen/TeacherProfileScreen/TeacherProfileScreen';
import CoursesScreen from '../Screen/CoursesScreen/CoursesScreen';
import MockResultScreen from '../Screen/MockResultScreen/MockResultScreen';
import AboutUsScreen from '../Screen/AboutUsScreen/AboutUsScreen';
import CoursesPaymentHistoryScreen from '../Screen/CoursesPaymentHistoryScreen/CoursesPaymentHistoryScreen';
import PaymentCheckoutScreen from '../Screen/PaymentCheckoutScreen/PaymentCheckoutScreen';
import { bootstrapHomeRequest } from '../Redux/Reducers/HomeReducer';
import { useTheme, useTranslation } from '../Themes/hooks';

export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    PrivacyPolicy: undefined;
    TermsConditions: undefined;
    ForgotPassword: undefined;
    Otp: { email: string };
    ChangePassword: { token?: string } | undefined;
    Home: undefined; // We'll map Home to TabNav for drop-in replacement
    Teacher: undefined;
    MockTestRules: { testId?: string | number; testData?: any };
    MockTestQuestion: { testId?: string | number; duration?: string | number; acceptedTerms?: boolean };
    AboutUs: undefined;
    Profile: undefined;
    CoursesPaymentHistory: undefined;
    PaymentCheckout: {
        url: string;
        bundleId: string;
        amount?: number;
        payment?: any;
    };
    TeacherProfile: { teacher: { name: string, subject: string, rating: string, experience: string, designation: string } };
    MockResult: {
        attemptId?: string | number;
        title?: string;
        score?: string | number;
        accuracy?: string | number;
        resultData?: any;
    };
};

const Stack = createStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AuthStack = () => (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
);

const AppStack = () => (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Home" component={TabNav} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Teacher" component={TeacherScreen} />
        <Stack.Screen name="MockTestRules" component={MockTestRulesScreen} />
        <Stack.Screen name="MockTestQuestion" component={MockTestQuestionScreen} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
        <Stack.Screen name="MockResult" component={MockResultScreen} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} />
        <Stack.Screen name="CoursesPaymentHistory" component={CoursesPaymentHistoryScreen} />
        <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
    </Stack.Navigator>
);

const StackNav = () => {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.AuthReducer.token);
    const homeState = useSelector((state: RootState) => state.HomeReducer);
    const { colors, tokens } = useTheme();
    const { t } = useTranslation();

    const isDarkTheme = tokens.isDark;
    const statusBarStyle = isDarkTheme ? 'light-content' : 'dark-content';

    useEffect(() => {
        if (token && !homeState.dashboardData && !homeState.isBootstrapping) {
            dispatch(bootstrapHomeRequest({}));
        }
    }, [dispatch, homeState.dashboardData, homeState.isBootstrapping, token]);

    if (token && homeState.isBootstrapping && !homeState.dashboardData) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.Background, justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar backgroundColor={colors.Background} barStyle={statusBarStyle} />
                <View style={{ backgroundColor: tokens.glassSurface, borderColor: tokens.glassBorder, borderWidth: 1, paddingHorizontal: 28, paddingVertical: 24, borderRadius: tokens.radius.lg, alignItems: 'center', shadowColor: tokens.shadow, shadowOpacity: tokens.shadowOpacity, shadowRadius: 18 }}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={{ marginTop: 12, color: colors.text, fontSize: 14, fontWeight: '600' }}>{t('home.loading_dashboard')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer ref={navigationRef}>
                {token ? <AppStack /> : <AuthStack />}
            </NavigationContainer>
        </View>
    );
};

export default StackNav;
