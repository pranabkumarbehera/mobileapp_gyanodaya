/**
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Store from './src/Redux/Store';
import { Provider as StoreProvider } from 'react-redux';

LogBox.ignoreAllLogs();

const GyanodayaApp = () => {
    return (
        <StoreProvider store={Store}>
            <App />
        </StoreProvider>
    );
};

AppRegistry.registerComponent(appName, () => GyanodayaApp);
