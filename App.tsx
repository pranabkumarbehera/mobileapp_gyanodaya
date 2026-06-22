import 'react-native-gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import store from './src/Redux/Store';
import StackNav from './src/Navigator/StackNav';

function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuter}>
        <View style={styles.webContainer}>
          <SafeAreaProvider style={styles.provider}>
            <StackNav />
          </SafeAreaProvider>
          <Toast />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.nativeContainer}>
      <SafeAreaProvider style={styles.provider}>
        <StackNav />
      </SafeAreaProvider>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: Platform.select({
    web: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e8e8e8',
    } as any,
    default: { flex: 1 },
  }),
  webContainer: Platform.select({
    web: {
      flex: 1,
      width: '100%',
      maxWidth: 480,
      backgroundColor: '#FAFBFF',
      boxShadow: '0 0 60px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      position: 'relative',
    } as any,
    default: { flex: 1 },
  }),
  nativeContainer: {
    flex: 1,
  },
  provider: {
    flex: 1,
  }
});

export default App;
