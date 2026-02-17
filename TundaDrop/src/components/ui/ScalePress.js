import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";

export default function ScalePress({
  children,
  onPress,
  style,
  disabled,
  scaleTo = 0.97,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (disabled) return;
          Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
