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

// import store from './src/Redux/Store';
// import { setNetworkStatus } from './src/Redux/Reducers/AppReducer';
import StackNav from './src/Navigator/StackNav';

function App() {

  // useEffect(() => {
  //   // Setup NetInfo listener
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     store.dispatch(setNetworkStatus(state.isConnected));
  //     if (!state.isConnected) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'No Internet Connection',
  //         text2: 'Please check your network settings.',
  //         position: 'bottom',
  //       });
  //     }
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

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
