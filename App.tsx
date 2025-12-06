// FILE: App.tsx

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Import RootNavigator - đảm bảo path đúng
import RootNavigator from './src/navigation/RootNavigator';

const App: React.FC = () => {
    return (
        <SafeAreaProvider>
            {/* StatusBar Configuration */}
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#ffffff"
                translucent={false}
            />
            
            {/* Root Navigation */}
            <RootNavigator />
        </SafeAreaProvider>
    );
};

export default App;