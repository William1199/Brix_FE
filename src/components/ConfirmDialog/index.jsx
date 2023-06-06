import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const ConfirmDialog = ({
  visible,
  title,
  confirmText,
  onConfirm = () => {},
  onClose = () => {},
  children,
}) => {
  const theme = useTheme();

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
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
      Animated.spring(scale, {
        toValue: 0,
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            zIndex: -1,
          }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: "white",
            minWidth: "80%",
            maxWidth: "80%",
            borderRadius: theme.sizes.base,
            overflow: "hidden",
            transform: [{ scale: scale }],
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          {children ? (
            children
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: theme.sizes.medium,
                height: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  textAlign: "center",
                  color: "rgba(22,24,35,0.84)",
                }}
              >
                {title}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
                {
                  backgroundColor: "#f08025",
                  flex: 1,
                  borderRightColor: "white",
                  borderRightWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: theme.sizes.medium,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "500",
                }}
              >
                Hủy
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
                {
                  backgroundColor: "#f08025",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: theme.sizes.medium,
                },
              ]}
              onPress={onConfirm}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "500",
                }}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default ConfirmDialog;
