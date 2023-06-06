import Icon from "@expo/vector-icons/Entypo";
import { useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import moment from "moment";
import { ROUTE } from "~/constants";
import { formatStringToCurrency, getRandomBetween } from "~/utils/helper";

const HEIGHT_IMG = 100;
const ITEM_PADDING = 10;
const ITEM_MARGIN_BOTTOM = 20;
const ITEM_SIZE = HEIGHT_IMG + ITEM_PADDING * 2 + ITEM_MARGIN_BOTTOM;

const ViewBillByDate = ({ navigation, data, setData = () => {} }) => {
  const theme = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  let handleClick = async (data) => {
    navigation.navigate(ROUTE.billDetail, {
      id: data.billId,
    });
  };

  const renderItem = ({ item, index }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)],
      outputRange: [1, 1, 1, 0],
    });

    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 0.6)],
      outputRange: [1, 1, 1, 0],
    });
    return (
      <Pressable
        style={{ paddingHorizontal: 10 }}
        onPress={() => handleClick(item)}
      >
        <Animated.View
          style={{
            backgroundColor: "#fff",
            // shadowColor: "#000",
            // showdowOffset: {
            //   width: 0,
            //   height: 10,
            // },
            // shadowOpacity: 0.3,
            // shadowRadius: 20,
            paddingTop: ITEM_PADDING,
            paddingHorizontal: ITEM_PADDING,
            transform: [{ scale }],
            opacity,
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 50,
              }}
            >
              <Image
                style={{ width: HEIGHT_IMG, height: 100 }}
                source={{
                  uri: "https://i.pravatar.cc/300",
                }}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                marginLeft: 10,
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  marginBottom: 10,

                  color: theme.colors.darklight,
                }}
              >
                {item.storeName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "medium",
                  color: theme.colors.darklight,
                }}
              >
                {"Thành tiền: " +
                  formatStringToCurrency(item.totalPrice.toString())}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.highlight,
                  fontWeight: "bold",
                }}
              >
                {"Trạng thái: " + item.status}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#9ca1a2",
              height: 1,
              width: "100%",
              marginTop: 10,
            }}
          ></View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", backgroundColor: "#fff" }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.primary400,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.5,
          height: 100,
          zIndex: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => setData(null)}
          style={{
            marginLeft: 20,
            marginTop: 35,
          }}
        >
          <Icon name="chevron-left" size={24} color={"#fff"} />
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 35,
            fontSize: 20,
            fontWeight: "bold",
            color: "#fff",
            marginRight: 20,
          }}
        >
          {"Ngày: " + data[0].startDate}
        </Text>
      </View>
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        style={{ marginTop: 60 }}
        keyExtractor={() => getRandomBetween(1000, 10000)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />
    </SafeAreaView>
  );
};

export default ViewBillByDate;
