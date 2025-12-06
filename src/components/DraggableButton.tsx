// FILE: src/components/DraggableButton.tsx

import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationTypes';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const BUTTON_SIZE = 50;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DraggableButton: React.FC = () => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const navigation = useNavigation<NavigationProp>();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        
        const actualX = screenWidth - 20 - BUTTON_SIZE + currentX;
        const actualY = screenHeight - 50 - BUTTON_SIZE + currentY;
        
        // ✅ Kiểm tra click hay drag
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          navigation.navigate('CreateRecipe'); // ✅ Navigate khi click
          return;
        }
        
        // Dính vào cạnh trái hoặc phải
        const screenCenter = screenWidth / 2;
        let targetX;
        
        if (actualX < screenCenter) {
          targetX = -(screenWidth - 20 - BUTTON_SIZE);
        } else {
          targetX = 0;
        }
        
        let targetY = currentY;
        const minY = -(screenHeight - 50 - BUTTON_SIZE - 20);
        const maxY = 50 - 20;
        
        if (actualY < 20) {
          targetY = minY;
        } else if (actualY > screenHeight - BUTTON_SIZE - 20) {
          targetY = maxY;
        }
        
        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.touchArea}>
        <View style={styles.plusIconHorizontal} />
        <View style={styles.plusIconVertical} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    zIndex: 1000,
    
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#8BC34A',
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconHorizontal: {
    position: 'absolute',
    width: 22,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  plusIconVertical: {
    position: 'absolute',
    width: 3,
    height: 22,
    backgroundColor: 'white',
    borderRadius: 2,
  }
});

export default DraggableButton;