import {
  View,
  Text,
  Dimensions,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import React from "react";
import { useTheme } from "react-native-paper";
import { NO_IMAGE_URL, ROUTE } from "~/constants";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { formatStringToCurrency, getRandomBetween } from "~/utils/helper";
import axiosInstance from "~/app/api";
import { useContext } from "react";
import AuthContext from "~/context/AuthContext";
import { Loading, ModalView, StatusBarComp } from "~/components";
import { useState } from "react";
import { useEffect } from "react";

const ReportedProductScreen = ({ navigation }) => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [reasons, setReasons] = useState([
    "Lý do mặc định",
    "Lý do mặc định",
    "Lý do mặc định",
  ]);
  const { userInfo } = useContext(AuthContext);
  const { bottom, top } = useSafeAreaInsets();
  let bottomBarHeight = 0;
  const height = Dimensions.get("window").height;

  const handleReason = (reasons) => {
    setVisible(true);
    setReasons(reasons);
  };

  const renderListEmpty = () => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: theme.sizes.large,
        marginTop: 24,
      }}
    >
      <Image
        source={{
          uri: "https://cdni.iconscout.com/illustration/premium/thumb/find-a-doctor-online-1946841-1648368.png",
        }}
        style={{ width: 150, height: 150 }}
        resizeMode="cover"
      />
      <Text
        style={{
          maxWidth: "70%",
          textAlign: "center",
          fontSize: theme.sizes.medium,
          fontWeight: "bold",
        }}
      >
        Hiện bạn chưa có sản phẩm nào bị báo cáo
      </Text>
    </View>
  );

  useEffect(() => {
    // call api
    (async () => {
      const res = await axiosInstance.post("report/getAll", {});
      setProducts(res.data);
    })();
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      style={{
        width: "48%",
        borderColor: "rgba(22,24,35,0.12)",
        borderWidth: 1,
        borderRadius: theme.sizes.base / 2,
        marginRight: theme.sizes.small + 2,
        marginBottom: theme.sizes.small + 2,
        backgroundColor: item.status ? "white" : "gray",
      }}
      onPress={() => {
        // product detail
        item.status
          ? navigation.navigate(ROUTE.productDetail, { id: item.id })
          : {};
      }}
    >
      <Image
        source={{ uri: item.image || NO_IMAGE_URL }}
        style={{ width: "100%", height: 180 }}
        resizeMode="cover"
        blurRadius={item.status ? 0 : 10}
      />
      <View
        style={{
          flex: 1,
          padding: theme.sizes.base,
          paddingTop: theme.sizes.small,
        }}
      >
        <Text style={{ textTransform: "uppercase" }} numberOfLines={1}>
          {item.name}
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.highlight,
            borderRadius: theme.sizes.base - 2,
            marginTop: theme.sizes.base - 2,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                padding: 12,
                justifyContent: "center",
                alignItems: "center",
              },
              pressed && {
                backgroundColor: "rgba(22,24,35,.06)",
              },
            ]}
            onPress={() => handleReason(item.problem || null)}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Lý do
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            marginTop: theme.sizes.base - 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontWeight: "bold" }} numberOfLines={1}>
              đ
              {formatStringToCurrency(item.unitPrice.toString()).replace(
                "VND",
                ""
              )}
            </Text>
            <Text
              style={{
                fontSize: theme.sizes.small + 1,
                color: "rgba(22,24,35,0.44)",
                marginTop: theme.sizes.base / 2,
              }}
              numberOfLines={1}
            >
              Đã bán {item.soldQuantities}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: theme.sizes.small + 1,
                color: item.status
                  ? theme.colors.highlight
                  : item.reportCount == 5
                  ? "red"
                  : "green",
              }}
              numberOfLines={1}
            >
              {item.status
                ? "Cần chỉnh sửa"
                : item.reportCount == 5
                ? "Đã tự động xóa"
                : "Đã chỉnh sửa"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary400,
            padding: theme.sizes.font,
          }}
        >
          <Text
            style={{
              fontSize: theme.sizes.large,
              color: "#fff",
              alignSelf: "center",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            Sản phẩm bị báo cáo
          </Text>
        </View>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={() => getRandomBetween(1000, 10000)}
          ListEmptyComponent={renderListEmpty}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: theme.sizes.small,
            paddingBottom:
              bottom +
              (height >= 844 ? 40 : 20) +
              (height >= 844 ? bottomBarHeight - 20 : bottomBarHeight * 1.5),
          }}
          style={{ marginTop: 20 }}
        />
      </SafeAreaView>
      <ModalView
        visible={visible}
        title={reasons?.length + " lý do bị báo cáo"}
        onDismiss={() => setVisible(false)}
        cancelable
        style={{ backgroundColor: "#fff" }}
      >
        <View style={{ alignItems: "center" }}>
          {reasons?.map((item) => (
            <Text
              style={{ marginTop: 10, fontSize: 16, color: theme.colors.black }}
            >
              {item.problem}
            </Text>
          ))}
        </View>
      </ModalView>
    </>
  );
};

export default ReportedProductScreen;
