import { FontAwesome } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Loading } from "~/components";
import { ASYNC_STORAGE_KEY, NO_IMAGE_URL, ROUTE } from "~/constants";
import { StoreServices } from "~/services";
import {
  formatStringToCurrency,
  getAsyncStorage,
  getRandomBetween,
  setAsyncStorage,
} from "~/utils/helper";

const MOCK_DATA = {
  FILTER: [
    {
      label: "Đề xuất",
      value: "id",
    },
    {
      label: "Hàng bán chạy nhất",
      value: "soldQuantities",
    },
    {
      label: "Hàng mới ra mắt",
      value: "name",
    },
    {
      label: "Giá",
      icon: [
        { icon: FontAwesome, name: "sort-up", value: 1 },
        { icon: FontAwesome, name: "sort-down", value: -1 },
      ],
      value: "unitPrice",
    },
  ],
};

const height = Dimensions.get("window").height;
let bottomBarHeight = 0;

const ProductPage = ({ id, setTotalSold, hasBottomBar, searchValue }) => {
  const { FILTER } = MOCK_DATA;
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();
  if (hasBottomBar) {
    bottomBarHeight = useBottomTabBarHeight();
  }

  const [selectedFilter, setSelectedFilter] = useState({
    _sortBy: FILTER[0].value,
    _orderBy: -1,
  });
  const [products, setProducts] = useState({ list: [], pagination: {} });
  const [page, setPage] = useState({ value: 1 });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);

  const renderItem = ({ item }) => (
    <Pressable
      style={{
        width: "48%",
        borderColor: "rgba(22,24,35,0.12)",
        borderWidth: 1,
        borderRadius: theme.sizes.base / 2,
        marginRight: theme.sizes.small + 2,
        marginBottom: theme.sizes.small + 2,
      }}
      onPress={() => {
        // product detail
        navigation.navigate(ROUTE.productDetail, { id: item.id });
      }}
    >
      <Image
        source={{ uri: item.image || NO_IMAGE_URL }}
        style={{ width: "100%", height: 180 }}
        resizeMode="cover"
      />
      <View
        style={{
          flex: 1,
          padding: theme.sizes.base,
          paddingTop: theme.sizes.small,
        }}
      >
        <Text style={{ textTransform: "uppercase" }} numberOfLines={2}>
          {item.name}
        </Text>
        <View
          style={{
            marginTop: theme.sizes.base - 2,
          }}
        >
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
      </View>
    </Pressable>
  );

  const memoizedRenderItem = useMemo(() => renderItem, [products.list]);

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 22,
        marginLeft: -theme.sizes.base,
        backgroundColor: "white",
      }}
    >
      {FILTER.map((item, idx, arr) => (
        <Pressable
          key={idx}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRightColor: "rgba(22,24,35,0.12)",
            borderRightWidth: idx !== arr.length - 1 ? 1 : 0,
            paddingHorizontal: theme.sizes.base,
            paddingVertical: 2,
          }}
          onPress={() => {
            setSelectedFilter((prev) => ({
              _sortBy: item.value,
              _orderBy:
                item.label === "Giá" ? (prev._orderBy === 1 ? -1 : 1) : -1,
            }));
          }}
        >
          <Text
            style={{
              color:
                selectedFilter._sortBy === item.value
                  ? "rgba(22,24,35,1)"
                  : "rgba(22,24,35, 0.45)",
              fontWeight: "500",
              fontSize: theme.sizes.font - 1,
            }}
          >
            {item.label}
          </Text>
          {item.icon?.length > 0 && (
            <View style={{ marginLeft: theme.sizes.base - 2 }}>
              {item.icon.map((_item, _index, _arr) => {
                const Icon = _item.icon;
                return (
                  <Icon
                    key={_index}
                    name={_item.name}
                    size={theme.sizes.font}
                    color={
                      selectedFilter._orderBy === _item.value &&
                      selectedFilter._sortBy === item.value
                        ? "rgba(22,24,35,1)"
                        : "rgba(22,24,35, 0.45)"
                    }
                    style={{
                      marginTop: _index === _arr.length - 1 ? -13 : 0,
                    }}
                  />
                );
              })}
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );

  // update result length for history search
  const updateSearchHistory = async (list) => {
    const _history =
      (await getAsyncStorage(ASYNC_STORAGE_KEY.search_product)) || [];
    const clone = [..._history];
    const index = _.findIndex(clone, (o) => o.name == searchValue);
    if (index !== -1) {
      clone[index].resultLength = list.length;
      await setAsyncStorage(ASYNC_STORAGE_KEY.search_product, clone);
    }
  };

  useEffect(() => {
    // call api
    (async () => {
      const { data, pagination } = await StoreServices.getProducts({
        storeID: id,
        pageNumber: page.value,
        _sortBy: selectedFilter._sortBy,
        _orderBy: selectedFilter._orderBy,
        keyword: searchValue || undefined,
      });
      let list = [];
      setProducts((prev) => {
        list = page.value === 1 ? data : [...prev.list, ...data];
        return {
          list: page.value === 1 ? data : [...prev.list, ...data],
          pagination,
        };
      });

      if (searchValue) {
        await updateSearchHistory(data);
      }

      setTotalSold(list.reduce((init, cur) => init + cur.soldQuantities, 0));
      setRefreshing(false);
      setFetchMoreLoading(false);
    })();
  }, [selectedFilter, page, searchValue]);

  return (
    <Tabs.FlatList
      data={products.list}
      renderItem={memoizedRenderItem}
      keyExtractor={() => getRandomBetween(1000, 10000)}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={{
        paddingHorizontal: theme.sizes.small,
        paddingBottom:
          bottom +
          (height >= 844 ? 40 : 20) +
          (height >= 844 ? bottomBarHeight - 20 : bottomBarHeight * 1.5),
      }}
      style={{ backgroundColor: "white" }}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={() =>
        fetchMoreLoading || products.pagination?.hasNext ? (
          <Loading />
        ) : (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.small + 2,
                color: "rgba(22,24,35,.44)",
              }}
            >
              Không còn sản phẩm nào khác
            </Text>
          </View>
        )
      }
      refreshControl={
        <RefreshControl
          tintColor={theme.colors.primary200}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setPage({ value: 1 });
          }}
        />
      }
      onEndReachedThreshold={0}
      onEndReached={() => {
        if (products.pagination?.hasNext) {
          setFetchMoreLoading(true);
          setPage(({ value }) => ({ value: value + 1 }));
        }
      }}
    />
  );
};

export default ProductPage;
