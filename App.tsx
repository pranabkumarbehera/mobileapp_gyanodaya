import 'react-native-gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

import store from './src/Redux/Store';
import StackNav from './src/Navigator/StackNav';
import { checkForAppUpdate } from './src/Utils/checkForAppUpdate';

const UPDATE_CHECK_DELAY_MS = 2 * 60 * 1000;

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      void checkForAppUpdate();
    }, UPDATE_CHECK_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

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
