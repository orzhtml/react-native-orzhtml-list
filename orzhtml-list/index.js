import 'react-native-gesture-handler'
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'

import App from './App';
import { name as appName } from './app.json';

class OrzHtmlDemo extends Component {
    render() {
        return (
            <SafeAreaProvider>
                <App />
            </SafeAreaProvider>
        )
    }
}

AppRegistry.registerComponent(appName, () => OrzHtmlDemo);
