import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Image, Platform, RefreshControl, Text, View } from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { Loading } from "~/components";
import { API_RESPONSE_CODE, ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { getRandomBetween } from "~/utils/helper";
import BuilderView from "../BuilderView";
import ContractorView from "../ContractorView";

const Done = () => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [posts, setPosts] = useState({
    list: [],
    pagination: {},
  });
  const [page, setPage] = useState({ value: 1 });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const renderItem = ({ item }) =>
    userInfo.role.toLowerCase() === ROLE.builder ? (
      <BuilderView item={item} />
    ) : (
      <ContractorView item={item} />
    );

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
        Hiện bạn chưa có cam kết nào đã hoàn thành
      </Text>
    </View>
  );

  useEffect(() => {
    // call api
    (async () => {
      const res = await axiosInstance.get("commitment", {
        params: { status: 3, pageNumber: page.value },
      });

      if (+res.code === API_RESPONSE_CODE.success) {
        if (userInfo.role.toLowerCase() === ROLE.builder) {
          setPosts((prev) => ({
            list: page.value === 1 ? res.data : [...prev.list, ...res.data],
            pagination: res.pagination,
          }));
          setRefreshing(false);
          setFetchMoreLoading(false);
        } else {
          const tmp = _.toPairs(_.groupBy(res.data, "projectName")).map(
            ([key, value]) => {
              return {
                projectName: key,
                data: value,
              };
            }
          );
          setPosts((prev) => ({
            list: page.value === 1 ? tmp : [...prev.list, ...tmp],
            pagination: res.pagination,
          }));
          setRefreshing(false);
          setFetchMoreLoading(false);
        }
        setLoading(false);
      }
    })();
  }, [page, isFocused]);

  if (loading) return <Loading />;

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      data={posts.list}
      renderItem={renderItem}
      keyExtractor={() => getRandomBetween(1000, 10000)}
      contentContainerStyle={{
        paddingHorizontal: theme.sizes.small,
        paddingBottom: bottom + 20,
        paddingTop: theme.sizes.large,
        marginTop: Platform.OS === "android" ? 30 : 0,
      }}
      ListEmptyComponent={renderListEmpty}
      ListFooterComponent={() =>
        posts.list.length !== 0 ? (
          fetchMoreLoading || posts.pagination?.hasNext ? (
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
                Không còn hợp đồng nào khác
              </Text>
            </View>
          )
        ) : null
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
        if (posts.pagination?.hasNext) {
          setFetchMoreLoading(true);
          setPage(({ value }) => ({ value: value + 1 }));
        }
      }}
    />
  );
};

export default Done;
