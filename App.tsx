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

function App() {
  useEffect(() => {
    void checkForAppUpdate();
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
