import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const INTRO_DURATION_MS = 8000;

export default function SplashIntro({ onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const pulseScale = useRef(new Animated.Value(0.8)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const introAnimation = Animated.parallel([
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 6,
            tension: 70,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1.55,
              duration: 1300,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.45,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1.95,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(pulseScale, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    introAnimation.start();

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start(() => {
        introAnimation.stop();
        onFinish?.();
      });
    }, INTRO_DURATION_MS);

    return () => {
      clearTimeout(timer);
      introAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      pointerEvents="auto"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        opacity: screenOpacity,
      }}
    >
      <LinearGradient
        colors={["#061018", "#102A2E", "#0EA5A3", "#FF3D81"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: "#B7F34B",
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />

        <View
          style={{
            position: "absolute",
            top: -110,
            right: -90,
            width: 230,
            height: 230,
            borderRadius: 120,
            backgroundColor: "rgba(255,255,255,0.10)",
          }}
        />

        <View
          style={{
            position: "absolute",
            bottom: -120,
            left: -95,
            width: 260,
            height: 260,
            borderRadius: 140,
            backgroundColor: "rgba(183,243,75,0.12)",
          }}
        />

        <Animated.View
          style={{
            alignItems: "center",
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
        >
          <View
            style={{
              width: 190,
              height: 190,
              borderRadius: 44,
              backgroundColor: "rgba(255,255,255,0.14)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.24)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 18 },
              elevation: 10,
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../assets/images/logo_white.jpeg")}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.14)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.24)",
            }}
          >
            <Ionicons name="leaf" size={16} color="#B7F34B" />
            <Text style={{ color: "#fff", fontWeight: "950" }}>
              Fresh juices delivered fast
            </Text>
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "900",
              marginTop: 16,
              opacity: 0.86,
              textAlign: "center",
            }}
          >
            TundaDrop is loading your fresh experience...
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}