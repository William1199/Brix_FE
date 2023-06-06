import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

const ActionsDialog = ({ visible = true, onClose = () => {}, children }) => {
  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 1,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 200,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 0,
        tension: 100,
        friction: 30,
        delay: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.27)",
        zIndex: 10,
        opacity: opacity,
      }}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}></Pressable>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          marginHorizontal: 14,
          paddingBottom: 14,
          transform: [{ translateY: translateY }],
        }}
      >
        <View
          style={{
            borderRadius: 10,
            backgroundColor: "white",
          }}
        >
          {children}
        </View>
        <View
          style={{ backgroundColor: "white", marginTop: 8, borderRadius: 10 }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                padding: 14,
              },
              pressed && {
                backgroundColor: "rgba(22,24,35,0.12)",
              },
            ]}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                color: "blue",
                fontWeight: "500",
              }}
            >
              Hủy
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ActionsDialog;
