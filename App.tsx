import 'react-native-gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

import store from './src/Redux/Store';
import StackNav from './src/Navigator/StackNav';

function App() {
  return (
    <>
      <SafeAreaProvider>
        <StackNav />
      </SafeAreaProvider>
      <Toast />
    </>
  );
}

export default App;
