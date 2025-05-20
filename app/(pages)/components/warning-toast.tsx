import React, { useEffect, useState } from 'react';
import { Animated, Text } from 'react-native';
import styles from '../css/style';

interface WarningToastProps {
  message: string;
  visible: boolean;
}

const WarningToast: React.FC<WarningToastProps> = ({ message, visible }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 5000); // Toast muncul selama 5 detik

      return () => clearTimeout(timeout);
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.warningToastSection, { opacity: fadeAnim }]}>
      <Text style={styles.warningText}>⚠️ {message}</Text>
    </Animated.View>
  );
};

export default WarningToast;