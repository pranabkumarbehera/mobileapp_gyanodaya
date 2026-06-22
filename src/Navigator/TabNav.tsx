import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import Fonts from '../Themes/Fonts';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import MockBankScreen from '../Screen/MockBankScreen/MockBankScreen';
import CoursesScreen from '../Screen/CoursesScreen/CoursesScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import { useTheme, useTranslation } from '../Themes/hooks';

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
  
  const { colors, theme } = useTheme();
  const { t, language } = useTranslation();

  const getTabLabel = (routeName: string) => {
    if (routeName === 'Home') {
      return language === 'hi' ? 'मुख्य' : language === 'or' ? 'ମୁଖ୍ୟ' : 'Home';
    }
    if (routeName === 'Test') {
      return language === 'hi' ? 'मॉक टेस्ट' : language === 'or' ? 'ମକ୍ ଟେଷ୍ଟ୍' : 'Mock Tests';
    }
    if (routeName === 'Courses') {
      return language === 'hi' ? 'कोर्स' : language === 'or' ? 'କୋର୍ସ' : 'Courses';
    }
    if (routeName === 'Profile') {
      return t('profile.title');
    }
    return routeName;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarButton: (props: any) => {
          const { ref, ...rest } = props;
          return (
            <Pressable
              ref={ref}
              {...rest}
              android_ripple={{ color: 'transparent', borderless: false }}
              style={({ pressed }) => [
                rest.style,
                {
                  opacity: 1,
                  backgroundColor: colors.tabBg,
                },
              ]}
            />
          );
        },

        tabBarIcon: ({ color }) => {
          let iconName = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Test') iconName = 'file-text';
          else if (route.name === 'Courses') iconName = 'book-open';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={normalize(26)} color={color} />;
        },

        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarActiveBackgroundColor: colors.tabBg,
        tabBarInactiveBackgroundColor: colors.tabBg,

        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: verticalScale(64) + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: verticalScale(10),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme === 'classic' ? 0.05 : 0.25,
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: getTabLabel('Home') }}
      />
      <Tab.Screen 
        name="Test" 
        component={MockBankScreen} 
        options={{ tabBarLabel: getTabLabel('Test') }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen} 
        options={{ tabBarLabel: getTabLabel('Courses') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: getTabLabel('Profile') }}
      />
    </Tab.Navigator>
  );
};

export default TabNav;
