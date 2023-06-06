import { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, RefreshControl, Text, View } from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import axiosInstance from "~/app/api";
import { Loading } from "~/components";
import { API_RESPONSE_CODE } from "~/constants";
import BillItem from "../BillItem";
import { getRandomBetween } from "~/utils/helper";

const height = Dimensions.get("window").height;

const AllBill = () => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [billData, setBillData] = useState({ list: [], pagination: {} });
  const [page, setPage] = useState({ value: 1 });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);

  const memoizedRenderItem = useMemo(
    () =>
      ({ item, index }) =>
        (
          <View>
            <BillItem item={item} />
            {/* divider */}

            {index !== billData.list.length - 1 && (
              <View
                style={{
                  backgroundColor: "rgba(22,24,35,0.06)",
                  height: 10,
                }}
              ></View>
            )}
          </View>
        ),
    [billData.list]
  );

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.post("billController/getAll", {
        pageNumber: page.value,
      });
      if (+res.code === API_RESPONSE_CODE.success) {
        setRefreshing(false);
        setFetchMoreLoading(false);
        setBillData((prev) => ({
          list: page.value === 1 ? res.data : [...prev.list, ...res.data],
          pagination: res.pagination,
        }));
        setIsLoading(false);
      }
    })();
  }, [page]);

  if (isLoading) return <Loading />;

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      data={billData.list}
      renderDi
      renderItem={memoizedRenderItem}
      keyExtractor={() => getRandomBetween(1000, 10000)}
      contentContainerStyle={{
        paddingBottom: bottom + (height >= 844 ? 40 : 20),
        paddingTop: Platform.OS === "android" ? 30 : 14,
      }}
      ListFooterComponent={() =>
        fetchMoreLoading || billData.pagination?.hasNext ? (
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
              Không còn đơn hàng nào khác
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
        if (billData.pagination?.hasNext) {
          setFetchMoreLoading(true);
          setPage(({ value }) => ({ value: value + 1 }));
        }
      }}
    />
  );
};

export default AllBill;
