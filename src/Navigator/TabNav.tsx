import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import Colorpath from '../Themes/Colorpath';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import MockBankScreen from '../Screen/MockBankScreen/MockBankScreen';
import CoursesScreen from '../Screen/CoursesScreen/CoursesScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import { Pressable } from 'react-native';
import Fonts from '../Themes/Fonts';
export type TabParamList = {
  Home: undefined;
  Test: undefined;
  Courses: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNav = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, verticalScale(8));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarButton: props => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent', borderless: false }}
            style={({ pressed }) => [
              props.style,
              {
                opacity: 1,
                backgroundColor: '#FFFFFF',
              },
            ]}
          />
        ),

        tabBarIcon: ({ color }) => {
          let iconName = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Test') iconName = 'file-text';
          else if (route.name === 'Courses') iconName = 'book-open';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={normalize(26)} color={color} />;
        },

        tabBarActiveTintColor: Colorpath.Primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarActiveBackgroundColor: '#FFFFFF',
        tabBarInactiveBackgroundColor: '#FFFFFF',

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#b3c7ef',
          height: verticalScale(64) + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: verticalScale(10),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: verticalScale(2),
          fontFamily: Fonts.InterBold,
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
