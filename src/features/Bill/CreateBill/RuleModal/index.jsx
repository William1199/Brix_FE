import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RuleModal = ({ visible, onClose, title }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const { bottom } = useSafeAreaInsets();

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
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.27)",
            zIndex: -1,
          }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: "#ddd",
            transform: [{ translateY: translateY }],
            opacity: opacity,
            borderTopLeftRadius: theme.sizes.base / 2,
            borderTopRightRadius: theme.sizes.base / 2,
            maxHeight: "60%",
          }}
        >
          {loading && (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.67)",
                padding: theme.sizes.small,
                position: "absolute",
                top: theme.sizes.extraLarge,
                left: "50%",
                transform: [{ translateX: -18 }],
              }}
            >
              <ActivityIndicator size={24} color="white" />
            </View>
          )}

          <View
            style={{
              width: 25,
              height: 25,
              position: "absolute",
              right: theme.sizes.font,
              top: theme.sizes.font,
              zIndex: 1,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.06)",
                },
                { flex: 1 },
              ]}
              onPress={onClose}
            >
              <EvilIcons name="close" size={24} color="black" />
            </Pressable>
          </View>

          <View
            style={{
              paddingVertical: theme.sizes.font,
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.font - 1,
                color: theme.colors.black,
                fontWeight: "500",
              }}
            >
              Điều khoản & Điều kiện
            </Text>
          </View>

          <View
            style={{
              paddingVertical: theme.sizes.small,
              backgroundColor: "white",
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.large + 2,
                color: theme.colors.black,
                fontWeight: "600",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              backgroundColor: "white",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.black,
                padding: theme.sizes.extraLarge,
              }}
            >
              {
                "- Hệ thống chỉ hỗ trợ đặt hàng không hỗ trợ thanh toán\n- Người mua phả có trách nhiệm với đơn hàng đã đặt\n- Mọi vấn đề xảy ra sẽ được hệ thống cung cấp thông tin với cơ quan chức năng và hỗ trợ người bị hại giải quyết theo đúng quy định của pháp luật"
              }
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default RuleModal;
