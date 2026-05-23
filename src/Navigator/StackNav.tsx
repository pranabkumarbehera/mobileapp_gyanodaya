import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../Screen/SplashScreen/SplashScreen';
import OnboardingScreen from '../Screen/OnboardingScreen/OnboardingScreen';
import LoginScreen from '../Screen/LoginScreen/LoginScreen';
import RegisterScreen from '../Screen/RegisterScreen/RegisterScreen';
import ForgotPasswordScreen from '../Screen/ForgotPasswordScreen/ForgotPasswordScreen';
import ChangePasswordScreen from '../Screen/ChangePasswordScreen/ChangePasswordScreen';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import TabNav from './TabNav';
import TeacherScreen from '../Screen/TeacherScreen/TeacherScreen';
import MockBankScreen from '../Screen/MockBankScreen/MockBankScreen';
import MockTestRulesScreen from '../Screen/MockTestRulesScreen/MockTestRulesScreen';
import MockTestQuestionScreen from '../Screen/MockTestQuestionScreen/MockTestQuestionScreen';
import TeacherProfileScreen from '../Screen/TeacherProfileScreen/TeacherProfileScreen';
import CoursesScreen from '../Screen/CoursesScreen/CoursesScreen';
import MockResultScreen from '../Screen/MockResultScreen/MockResultScreen';

export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ChangePassword: undefined;
    Home: undefined; // We'll map Home to TabNav for drop-in replacement
    Teacher: undefined;
    MockTestRules: undefined;
    MockTestQuestion: undefined;
    TeacherProfile: { teacher: { name: string, subject: string, rating: string, experience: string, designation: string } };
    MockResult: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const StackNav = () => {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false, gestureEnabled: false }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="Home" component={TabNav} />
                <Stack.Screen name="Teacher" component={TeacherScreen} />
                <Stack.Screen name="MockTestRules" component={MockTestRulesScreen} />
                <Stack.Screen name="MockTestQuestion" component={MockTestQuestionScreen} />
                <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
                <Stack.Screen name="MockResult" component={MockResultScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNav;
