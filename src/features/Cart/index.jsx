import { Feather, Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { chatClient } from "~/app/chatConfig";
import { SHADOWS } from "~/app/theme";
import { StatusBarComp } from "~/components";
import { ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import BoughtCart from "./BoughtCart";
import TotalCart from "./TotalCart";

const MOCK_DATA = {
  SWIPE_CONTENT: [TotalCart, BoughtCart],
  BAR: ["Tất cả", "Mua lần nữa"],
};

const CartScreen = ({ navigation, route }) => {
  const { BAR, SWIPE_CONTENT } = MOCK_DATA;
  const { userId } = route.params || {};
  const theme = useTheme();
  const { setChannel } = useContext(ChatContext);
  const { userInfo } = useContext(AuthContext);

  const [position, setPosition] = useState({
    value: 0,
    index: 0,
  });
  const [barItemWidth, setBarItemWidth] = useState(0);
  const [cartLength, setCartLength] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  const handleChat = async () => {
    const channel = chatClient.channel("messaging", {
      members: [userInfo?.id, userId],
    });
    await channel.create();

    setChannel(channel);

    navigation.navigate(ROUTE.channel);
  };

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: position.value,
      tension: 100,
      friction: 30,
      useNativeDriver: true,
    }).start();
  }, [position]);

  return (
    <>
      <StatusBarComp
        statusConfig={{
          style: "dark",
        }}
        backgroundColor="white"
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            paddingVertical: theme.sizes.font,
            ...SHADOWS.light,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                paddingHorizontal: 2,
                marginRight: theme.sizes.small,
              },
              ,
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="chevron-left"
              size={theme.sizes.extraLarge + 8}
              color="rgba(22,24,35,0.65)"
            />
          </Pressable>

          <Text style={{ fontWeight: "500", fontSize: theme.sizes.large }}>
            Giỏ hàng
          </Text>

          <Pressable
            style={({ pressed }) => [
              {
                paddingHorizontal: 2,
                marginRight: theme.sizes.small,
              },
              ,
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={handleChat}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={theme.sizes.extraLarge - 2}
              color="black"
            />
          </Pressable>
        </View>

        {/* swiper */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              paddingVertical: theme.sizes.small,
              backgroundColor: "white",
              borderBottomColor: "rgba(22,24,35,0.12)",
              borderBottomWidth: 1,
            }}
          >
            {BAR.map((item, idx) => (
              <Pressable
                key={idx}
                onLayout={({ nativeEvent }) => {
                  setBarItemWidth(nativeEvent.layout.width);
                }}
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                  { flex: 1, justifyContent: "center", alignItems: "center" },
                ]}
                onPress={() => {
                  setPosition({
                    value: idx === 0 ? 0 : barItemWidth,
                    index: idx,
                  });
                }}
              >
                <Text
                  style={{
                    color: position.index === idx ? "#D40011" : "rgb(22,24,35)",
                    fontWeight: position.index === idx ? "600" : "normal",
                  }}
                >
                  {`${item}${idx === 0 ? ` (${cartLength})` : ""}`}
                </Text>
              </Pressable>
            ))}

            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                transform: [{ translateX: translateX }],
                width: barItemWidth,
                backgroundColor: "#D40011",
                height: 1.5,
              }}
            ></Animated.View>
          </View>

          <Swiper
            loop={false}
            index={position.index}
            autoplay={false}
            scrollEnabled={false}
            showsButtons={false}
            showsPagination={false}
            onIndexChanged={(position) =>
              setPosition({
                value: position === 0 ? 0 : barItemWidth,
                index: position,
              })
            }
          >
            {SWIPE_CONTENT.map((page, idx) => {
              const Comp = page;
              return (
                <Comp
                  key={idx}
                  step={idx}
                  currentPosition={position.index}
                  setCartLength={setCartLength}
                />
              );
            })}
          </Swiper>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CartScreen;
