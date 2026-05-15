import React, { useRef, useEffect } from "react";
import { Animated, Image, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeTokens } from "../../theme/useTheme";

const BG_IMAGES = [
  "https://images.pexels.com/photos/4955257/pexels-photo-4955257.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5146439/pexels-photo-5146439.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/8215121/pexels-photo-8215121.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

export function ScreenShell({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}) {
  const t = useThemeTokens();
  const pulse = useRef(new Animated.Value(0)).current;

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.28],
  });

  const backgroundColors = isDarkMode
    ? ["#061018", "#0B1220", "#102A2E"]
    : ["#F8FAFC", "#EFF6FF", "#FDF2F8"];

  const overlayColors = isDarkMode
    ? ["rgba(6,16,24,0.30)", "rgba(6,16,24,0.76)"]
    : ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.74)"];

  const content = (
    <View
      style={[
        {
          flexGrow: 1,
          paddingBottom: 24,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={backgroundColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: BG_IMAGES[0] }}
          blurRadius={22}
          style={{
            position: "absolute",
            top: -90,
            right: -130,
            width: 280,
            height: 280,
            borderRadius: 140,
            opacity: isDarkMode ? 0.24 : 0.34,
          }}
        />

        <Image
          source={{ uri: BG_IMAGES[1] }}
          blurRadius={24}
          style={{
            position: "absolute",
            bottom: 160,
            left: -130,
            width: 300,
            height: 300,
            borderRadius: 150,
            opacity: isDarkMode ? 0.18 : 0.27,
          }}
        />

        <Image
          source={{ uri: BG_IMAGES[2] }}
          blurRadius={24}
          style={{
            position: "absolute",
            bottom: -110,
            right: -120,
            width: 300,
            height: 300,
            borderRadius: 150,
            opacity: isDarkMode ? 0.18 : 0.25,
          }}
        />

        <Animated.View
          style={{
            position: "absolute",
            right: -70,
            top: 220,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: "#B7F34B",
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />

        <LinearGradient
          colors={overlayColors}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </View>

      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
          }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </LinearGradient>
  );
}

export default ScreenShell;