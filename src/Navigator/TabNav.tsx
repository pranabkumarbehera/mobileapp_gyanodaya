import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../Themes/Colorpath';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';

import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import MockBankScreen from '../Screen/MockBankScreen/MockBankScreen';
import CoursesScreen from '../Screen/CoursesScreen/CoursesScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';

export type TabParamList = {
    Home: undefined;
    Test: undefined;
    Courses: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNav = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName = 'home';
                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Test') iconName = 'file-text';
                    else if (route.name === 'Courses') iconName = 'book-open';
                    else if (route.name === 'Profile') iconName = 'user';

                    return (
                        <Icon 
                            name={iconName} 
                            size={normalize(26)} // Large icon size as requested
                            color={color} 
                        />
                    );
                },
                tabBarActiveTintColor: Colorpath.Primary,
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: verticalScale(65),
                    paddingBottom: verticalScale(10),
                    paddingTop: verticalScale(10),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: normalize(11),
                    fontWeight: '600',
                    marginTop: verticalScale(2),
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Test" component={MockBankScreen} />
            <Tab.Screen name="Courses" component={CoursesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNav;
