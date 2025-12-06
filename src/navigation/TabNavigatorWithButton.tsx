// FILE: src/navigation/TabNavigatorWithButton.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TabNavigator from './TabNavigator';
import DraggableButton from '../components/DraggableButton';

const TabNavigatorWithButton: React.FC = () => {
    return (
        <View style={styles.container}>
            <TabNavigator />
            <DraggableButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default TabNavigatorWithButton;