import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, View } from 'react-native';
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
  
  const { colors, tokens } = useTheme();
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
                  backgroundColor: 'transparent',
                },
              ]}
            />
          );
        },

        tabBarIcon: ({ color, focused }) => {
          let iconName = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Test') iconName = 'file-text';
          else if (route.name === 'Courses') iconName = 'book-open';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%', width: normalize(50) }}>
              <Icon name={iconName} size={normalize(23)} color={color} />
              {focused && (
                <View 
                  style={{
                    position: 'absolute',
                    bottom: -verticalScale(6),
                    width: normalize(5),
                    height: normalize(5),
                    borderRadius: normalize(2.5),
                    backgroundColor: colors.tabActive,
                    shadowColor: colors.tabActive,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.8,
                    shadowRadius: 3,
                    elevation: 2,
                  }} 
                />
              )}
            </View>
          );
        },

        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',

        tabBarStyle: {
          position: 'absolute',
          bottom: verticalScale(12) + (bottomInset > 8 ? bottomInset - 8 : 0),
          left: normalize(16),
          right: normalize(16),
          backgroundColor: tokens.isGlass ? tokens.glassSurface : colors.tabBg,
          borderWidth: 1,
          borderColor: tokens.glassBorder,
          borderRadius: normalize(tokens.radius.xl),
          height: verticalScale(64),
          paddingBottom: verticalScale(8),
          paddingTop: verticalScale(8),
          shadowColor: tokens.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: tokens.shadowOpacity,
          shadowRadius: 16,
          elevation: 6,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: verticalScale(3),
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
