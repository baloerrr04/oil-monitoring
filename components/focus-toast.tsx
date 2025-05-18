import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface FocusToastProps {
  value: number | string;
}

const FocusToast: React.FC<FocusToastProps> = ({ value }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup or fade out (optional)
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };
  }, [value]);

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>Data Value: {value}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#323232', // dark background
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // for android shadow
    maxWidth: 250,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FocusToast;
