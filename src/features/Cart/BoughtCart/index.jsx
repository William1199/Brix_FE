import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { NO_IMAGE_URL, ROUTE } from "~/constants";
import { BillServices } from "~/services";
import { formatStringToCurrency, getRandomBetween } from "~/utils/helper";
import AddToCartModal from "../AddToCartModal";

const BoughtCart = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ list: [], pagination: {} });
  const [page, setPage] = useState({ value: 1 });
  const [selectedProduct, setSelectedProduct] = useState();

  const renderItem = ({ item }) => (
    <Pressable
      style={{ width: "49%", marginBottom: theme.sizes.small }}
      onPress={() =>
        navigation.navigate(ROUTE.productDetail, { id: item.productId })
      }
    >
      <Image
        source={{
          uri: item.image || NO_IMAGE_URL,
        }}
        style={{ width: "100%", height: 180 }}
        resizeMode="cover"
      />
      <View
        style={{ padding: theme.sizes.base, backgroundColor: "white", flex: 1 }}
      >
        <Text numberOfLines={2} style={{ marginBottom: theme.sizes.small }}>
          {item.productName}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <View>
            <Text style={{ color: "rgba(22,24,35,0.34)" }}>Đã mua 1 lần</Text>
            <Text style={{ color: "#f08025", fontSize: theme.sizes.medium }}>
              đ
              {formatStringToCurrency(item.unitPrice.toString()).replace(
                "VND",
                ""
              )}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              pressed && {
                opacity: 0.55,
              },
              {
                backgroundColor: "#f08025",
                borderRadius: 100,
                padding: 2,
              },
            ]}
            onPress={() => setSelectedProduct(item)}
          >
            <Ionicons
              name="cart-outline"
              size={theme.sizes.medium}
              color="white"
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const fetchData = async () => {
    const { data, pagination } = await BillServices.getProductsHistory({
      PageNumber: page.value,
    });
    setData({ list: data, pagination });
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <>
      {/* modal add to cart */}
      {selectedProduct && (
        <AddToCartModal
          visible={!!selectedProduct}
          onClose={() => setSelectedProduct()}
          data={selectedProduct}
        />
      )}

      <FlatList
        style={{ flex: 1, padding: theme.sizes.small }}
        contentContainerStyle={{ paddingBottom: theme.sizes.small }}
        showsVerticalScrollIndicator={false}
        data={data.list}
        keyExtractor={() => getRandomBetween(1000, 10000)}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderItem}
        numColumns={2}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.primary200}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              const { data, pagination } =
                await BillServices.getProductsHistory({
                  PageNumber: 1,
                });
              setData({ list: data, pagination });
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={() => (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Image
              source={{
                uri: "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9bdd8040b334d31946f49e36beaf32db.png",
              }}
              style={{
                width: 90,
                height: 90,
              }}
            />

            <Text
              style={{
                fontWeight: "500",
                fontSize: theme.sizes.medium,
                color: "rgba(22,24,35,0.84)",
                marginTop: theme.sizes.small,
                marginBottom: theme.sizes.base / 2,
              }}
            >
              Bạn chưa từng mua sản phẩm nào!
            </Text>

            <Text style={{ color: "rgba(22,24,35,0.54)" }}>
              Lựa hàng ngay đi
            </Text>

            <Pressable
              style={({ pressed }) => [
                {
                  borderColor: theme.colors.highlight,
                  borderWidth: 1,
                  borderRadius: 2,
                  paddingHorizontal: theme.sizes.font,
                  paddingVertical: theme.sizes.base,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: theme.sizes.small,
                },
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.06)",
                },
              ]}
              onPress={() => navigation.navigate(ROUTE.home)}
            >
              <Text style={{ color: theme.colors.highlight }}>
                Mua sắm ngay!
              </Text>
            </Pressable>
          </View>
        )}
        onEndReachedThreshold={0}
        onEndReached={() => {
          if (data.pagination?.hasNext) {
            setPage(({ value }) => ({ value: value + 1 }));
          }
        }}
      />
    </>
  );
};

export default BoughtCart;
