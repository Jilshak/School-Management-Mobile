import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const TOAST_MARGIN = 16;
const TOAST_WIDTH = width - (TOAST_MARGIN * 2); 

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: TOAST_WIDTH, // Update to use TOAST_WIDTH instead of width
        duration: duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: -100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(onClose);
    });
  }, [opacity, translateY, progress, duration, onClose]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const color = getToastColor();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity, transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIconName()} size={24} color={color} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
      <Animated.View 
        style={[
          styles.progressBar, 
          { backgroundColor: color, width: progress }
        ]} 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    left: TOAST_MARGIN,
    right: TOAST_MARGIN,
    width: TOAST_WIDTH,
    backgroundColor: 'white',
    borderRadius: 8, // Added border radius for rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginLeft: 12,
  },
  progressBar: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export default Toast;
