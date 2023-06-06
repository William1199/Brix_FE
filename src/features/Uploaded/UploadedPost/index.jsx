import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Image, RefreshControl, Text, View } from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContractorServices } from "~/services";
import PostItem from "../PostItem";
import { getRandomBetween } from "~/utils/helper";

const height = Dimensions.get("window").height;

const UploadedPost = () => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const bottomBarHeight = useBottomTabBarHeight();

  const [posts, setPosts] = useState({
    list: [],
    pagination: {},
  });
  const [page, setPage] = useState({ value: 1 });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);

  const renderListEmpty = () => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: theme.sizes.large,
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
        Hiện chưa có bài đăng nào bạn tuyển dụng
      </Text>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <PostItem item={item} index={index} renderSaved={false} />
  );

  const memoizedRenderItem = useMemo(() => renderItem, [posts.list]);

  useEffect(() => {
    // call api
    (async () => {
      const { data, pagination } = await ContractorServices.getPostsHistory({
        pageNumber: page.value,
        _sortBy: "lastModifiedAt",
        _orderBy: -1,
      });
      setPosts((prev) => ({
        list: page.value === 1 ? data : [...prev.list, ...data],
        pagination,
      }));
      setRefreshing(false);
      setFetchMoreLoading(false);
    })();
  }, [page]);

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      data={posts.list}
      renderItem={memoizedRenderItem}
      keyExtractor={() => getRandomBetween(1000, 10000)}
      contentContainerStyle={{
        paddingHorizontal: theme.sizes.small,
        paddingBottom:
          bottom +
          (height >= 844 ? 40 : 20) +
          (height >= 844 ? bottomBarHeight - 20 : bottomBarHeight * 1.5),
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
                Không còn bài đăng nào khác
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

export default UploadedPost;
