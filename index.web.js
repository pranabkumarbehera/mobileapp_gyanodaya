import 'regenerator-runtime/runtime';
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Store from './src/Redux/Store';
import { Provider as StoreProvider } from 'react-redux';

// Import font files
import iconFontFeather from 'react-native-vector-icons/Fonts/Feather.ttf';
import iconFontFA5Brands from 'react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf';
import iconFontFA5Regular from 'react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf';
import iconFontFA5Solid from 'react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf';

const iconFontStyles = `
@font-face {
  src: url(${iconFontFeather});
  font-family: 'Feather';
}
@font-face {
  src: url(${iconFontFA5Brands});
  font-family: 'FontAwesome5_Brands';
}
@font-face {
  src: url(${iconFontFA5Regular});
  font-family: 'FontAwesome5_Regular';
}
@font-face {
  src: url(${iconFontFA5Solid});
  font-family: 'FontAwesome5_Solid';
}
`;

// Inject font face styling into document head
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(iconFontStyles));
document.head.appendChild(style);

const GyanodayaApp = () => {
    return (
        <StoreProvider store={Store}>
            <App />
        </StoreProvider>
    );
};

// Register the app
AppRegistry.registerComponent(appName, () => GyanodayaApp);

// Mount the app into the html root div
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
