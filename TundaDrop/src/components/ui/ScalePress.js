import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";

export default function ScalePress({
  children,
  onPress,
  onLongPress,
  style,
  pressableStyle,
  disabled = false,
  scaleTo = 0.96,
  hitSlop = 8,
  accessibilityLabel,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
          opacity: disabled ? 0.62 : 1,
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onLongPress={onLongPress}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => {
          if (disabled) return;
          animateTo(scaleTo);
        }}
        onPressOut={() => {
          animateTo(1);
        }}
        style={pressableStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
