import { AntDesign, Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import _ from "lodash";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Badge, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { Loading, OpenURL, SearchBar } from "~/components";
import {
  API_RESPONSE_CODE,
  ASYNC_STORAGE_KEY,
  FILTER_DEFAULT_VALUE,
  NO_IMAGE_URL,
  PLACES,
  ROLE,
  ROUTE,
  SALARIES,
  SORT_BY,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ContractorServices, StoreServices } from "~/services";
import {
  getAsyncStorage,
  getRandomBetween,
  parseCurrencyText,
  setAsyncStorage,
} from "~/utils/helper";
import FilterModal from "./components/FilterModal";
import PlaceModal from "./components/PlaceModal";

const ViewAllScreen = ({ route, navigation }) => {
  const { roleId, searchValue, filterRequest } = route.params;
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState(
    !_.isEmpty(filterRequest) ? filterRequest : FILTER_DEFAULT_VALUE
  );
  const [sortBy, setSortBy] = useState(SORT_BY.time);
  const [pagination, setPagination] = useState();
  const [page, setPage] = useState(1);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const _orderBy = useRef(-1);

  const filterLength = useMemo(
    () =>
      _.values(filter).filter((x) => (Array.isArray(x) ? x.length !== 0 : x))
        .length,
    [filter]
  );

  const renderListHeader = () => (
    <>
      <View
        style={{
          backgroundColor: "rgba(22,24,35,0.06)",
          padding: theme.sizes.font,
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {/* places */}
        <Pressable
          onPress={() => setIsPlaceModalOpen(true)}
          style={({ pressed }) => [
            { maxWidth: "55%" },
            pressed && {
              opacity: 0.25,
            },
          ]}
        >
          <View
            style={{
              backgroundColor: _.isEmpty(filter?.places)
                ? "rgba(22,24,35,0.06)"
                : theme.colors.primary300,
              flexDirection: "row",
              alignItems: "center",
              padding: theme.sizes.base,
              paddingHorizontal: theme.sizes.small,
              borderRadius: 100,
            }}
          >
            <View
              style={{
                maxWidth: "90%",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: _.isEmpty(filter?.places)
                    ? "rgba(22,24,35,1)"
                    : theme.colors.textColor300,
                  fontSize: theme.sizes.font - 2,
                }}
                numberOfLines={1}
              >
                {_.isEmpty(filter?.places)
                  ? "Địa điểm"
                  : filter.places.map((x) => PLACES[x]).join(", ")}
              </Text>
            </View>
            <Entypo
              name="chevron-down"
              size={theme.sizes.large}
              color={
                _.isEmpty(filter?.places)
                  ? "rgba(22,24,35,1)"
                  : theme.colors.textColor200
              }
            />
          </View>
        </Pressable>

        {/* filter */}
        <Pressable
          style={({ pressed }) => [
            pressed && {
              opacity: 0.25,
            },
          ]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <FontAwesome
              name="filter"
              size={theme.sizes.medium}
              color="rgba(22,24,35,0.6)"
            />
            <Text
              style={{
                marginHorizontal: theme.sizes.base / 2,
                fontSize: theme.sizes.font - 1,
              }}
            >
              Bộ lọc
            </Text>
            <Badge
              size={17}
              style={{
                backgroundColor: theme.colors.secondary,
              }}
            >
              {filter.places.length !== 0 ? filterLength - 1 : filterLength}
            </Badge>
          </View>
        </Pressable>
      </View>

      {posts.length !== 0 && (
        <Text
          style={{
            padding: theme.sizes.font,
            paddingBottom: theme.sizes.small,
          }}
        >
          {pagination?.totalRecords} công việc
        </Text>
      )}
    </>
  );

  const renderSuggestListHeader = () => (
    <View
      style={{
        paddingTop: theme.sizes.large,
        marginHorizontal: theme.sizes.font,
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          fontSize: theme.sizes.medium,
        }}
      >
        Việc làm đề xuất
      </Text>
    </View>
  );

  const handleSave = async (post) => {
    let request;
    if (post.contractorID) {
      request = {
        contractorPostId: post.id,
        builderPostId: null,
      };
    } else {
      request = {
        contractorPostId: null,
        builderPostId: post.id,
      };
    }
    try {
      let res;
      if (post?.isSave) {
        res = await axiosInstance.put("savepost", request);
      } else {
        res = await axiosInstance.post("savepost", request);
      }
      if (+res.code === API_RESPONSE_CODE.success) {
        setPosts((prev) => {
          const _clone = [...prev];
          const cur = prev.find((x) => x.id === post.id);
          const idx = prev.findIndex((x) => x.id === post.id);
          _clone[idx] = { ...cur, isSave: !cur.isSave };
          return _clone;
        });
      }
    } catch (e) {
      console.log(`save post error ${e}`);
    }
  };

  const renderPostItem = ({ item }) => {
    if (roleId === ROLE.store)
      return (
        <Pressable
          style={({ pressed }) =>
            pressed && {
              opacity: 0.55,
            }
          }
          onPress={() =>
            navigation.navigate(ROUTE.storeDetail, {
              id: item.id,
              storeInfo: item,
              userId: item.userId,
            })
          }
        >
          <View
            style={{
              flexDirection: "row",
              paddingVertical: theme.sizes.large,
              marginHorizontal: theme.sizes.font,
              borderBottomColor: "#ddd",
              borderBottomWidth: 1,
            }}
          >
            <View
              style={{
                width: 65,
                height: 65,
                borderColor: "#ddd",
                borderWidth: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: theme.sizes.base / 2,
                padding: theme.sizes.base / 2,
                backgroundColor: "white",
              }}
            >
              <Image
                source={{ uri: item.avatar || NO_IMAGE_URL }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: theme.sizes.font,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font + 1,
                }}
                numberOfLines={2}
              >
                {`${item.firstName} ${item.lastName}`}
              </Text>

              <Text
                style={{
                  marginVertical: theme.sizes.base / 2,
                  color: "rgba(22,24,35,0.64)",
                  fontSize: theme.sizes.small + 3,
                }}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              <OpenURL url={item.webstie}>
                <Text
                  style={{
                    marginVertical: theme.sizes.base / 2,
                    color: "blue",
                  }}
                  numberOfLines={1}
                >
                  {item.webstie}
                </Text>
              </OpenURL>

              <Text style={{ marginTop: theme.sizes.base / 2 }}>
                {PLACES[item.place]}
              </Text>
            </View>
          </View>
        </Pressable>
      );

    return (
      <Pressable
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
        onPress={() => navigation.navigate(ROUTE.postDetail, { id: item.id })}
      >
        <View
          style={{
            flexDirection: "row",
            paddingVertical: theme.sizes.medium,
            marginHorizontal: theme.sizes.font,
            borderBottomColor: "#ddd",
            borderBottomWidth: 1,
          }}
        >
          <View
            style={{
              width: 65,
              height: 65,
              borderColor: "#ddd",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: theme.sizes.base / 2,
              padding: theme.sizes.base / 2,
              backgroundColor: "white",
            }}
          >
            <Image
              source={{ uri: item.avatar || NO_IMAGE_URL }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: theme.sizes.font,
            }}
          >
            {userInfo?.id !== item._createdBy && (
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  height: "100%",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Pressable onPress={() => handleSave(item)}>
                  <AntDesign
                    name={item.isSave ? "heart" : "hearto"}
                    size={24}
                    color={item.isSave ? theme.colors.highlight : "#bebebe"}
                  />
                </Pressable>
              </View>
            )}

            <View style={{ maxWidth: "85%" }}>
              <Text
                style={{ fontWeight: "bold", fontSize: theme.sizes.font + 1 }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                style={{ marginVertical: theme.sizes.base - 2 }}
                numberOfLines={1}
              >
                {item.authorName}
              </Text>

              <Text style={{ marginBottom: theme.sizes.base - 2 }}>
                {PLACES[item.place]}
              </Text>
              <Text style={{ color: theme.colors.highlight }}>
                {parseCurrencyText(item.salaries)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderListEmpty = () => (
    <View
      style={{
        backgroundColor: "rgba(22,24,35,0.06)",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.sizes.font - 2,
          backgroundColor: "white",
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
          Hiện chưa có công việc nào theo tiêu chí bạn tìm
        </Text>
      </View>

      {relatedPosts.length !== 0 &&
        userInfo?.role?.toLowerCase() === ROLE.builder && (
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
            }}
          >
            {renderSuggestListHeader()}

            {relatedPosts.map((item, idx) => (
              <View key={idx}>{renderPostItem({ item })}</View>
            ))}
          </View>
        )}
    </View>
  );

  // update result length for history search
  const updateSearchHistory = async (list) => {
    const _history =
      (await getAsyncStorage(ASYNC_STORAGE_KEY.search_history)) || [];
    const clone = [..._history];
    const index = _.findIndex(clone, (o) => o.name == searchValue);
    if (index !== -1) {
      clone[index].resultLength = list.length;
      await setAsyncStorage(ASYNC_STORAGE_KEY.search_history, clone);
    }
  };

  const memoizedRenderPostItem = useMemo(() => renderPostItem, [posts]);

  // call api to filter
  useEffect(() => {
    (async () => {
      setLoading(true);
      switch (roleId) {
        case ROLE.contractor: {
          const { data, pagination } = await ContractorServices.getPosts({
            filterRequest: {
              title: searchValue || "",
              ...filter,
              salary:
                typeof filter.salary === "number"
                  ? [
                      Array.isArray(SALARIES[filter.salary])
                        ? SALARIES[filter.salary].join("-")
                        : filter.salary === SALARIES.length - 1
                        ? `+${SALARIES[filter.salary]}`
                        : `0-${SALARIES[filter.salary]}`,
                    ]
                  : filter.salary,
            },
            _sortBy: sortBy,
            pageNumber: page,
          });

          if (searchValue) {
            await updateSearchHistory(data);
          }

          setPosts(data);
          setPagination(pagination);
          break;
        }

        default: {
          const { data, pagination } = await StoreServices.getPosts({
            filterRequest: {
              title: searchValue || "",
              ...filter,
              salary:
                typeof filter.salary === "number"
                  ? [
                      Array.isArray(SALARIES[filter.salary])
                        ? SALARIES[filter.salary].join("-")
                        : filter.salary === SALARIES.length - 1
                        ? `+${SALARIES[filter.salary]}`
                        : `0-${SALARIES[filter.salary]}`,
                    ]
                  : filter.salary,
            },
            _sortBy: sortBy,
            pageNumber: page,
          });

          if (searchValue) {
            await updateSearchHistory(data);
          }

          setPosts(data);
          setPagination(pagination);
          break;
        }
      }
      setLoading(false);
      setRefreshing(false);
    })();
  }, [roleId, filter, searchValue, page]);

  useEffect(() => {
    (async () => {
      const { data } = await ContractorServices.getPosts({
        pageSize: 10,
        filterRequest: {
          title: "",
          ...FILTER_DEFAULT_VALUE,
          places: userInfo?.builder?.place ? [userInfo?.builder?.place] : [],
          types: userInfo?.builder?.typeID ? [userInfo?.builder?.typeID] : [],
        },
      });
      setRelatedPosts(data);
    })();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <StatusBar style="dark" />

      {isPlaceModalOpen && (
        <PlaceModal
          isShow={isPlaceModalOpen}
          onRequestClose={() => setIsPlaceModalOpen(false)}
          onClose={() => setIsPlaceModalOpen(false)}
          onSubmit={(places) =>
            setFilter((prev) => ({ ...prev, places: [...places] }))
          }
          value={
            filter?.places?.reduce(
              (init, cur) => ({
                ...init,
                [PLACES[cur]]: true,
              }),
              {}
            ) || {}
          }
        />
      )}

      {isFilterModalOpen && (
        <FilterModal
          isShow={isFilterModalOpen}
          onRequestClose={() => setIsFilterModalOpen(false)}
          onClose={() => setIsFilterModalOpen(false)}
          onSubmit={({ _sortBy, ...rest }) => {
            setFilter((prev) => ({ ...prev, ...rest }));
            setSortBy(_sortBy);
          }}
          value={{
            categories: filter?.categories,
            salary: filter?.salary,
            sortBy,
            participant: filter.participant,
            types: filter.types,
          }}
        />
      )}

      <View style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            height: 60,
            padding: theme.sizes.small,
            borderBottomColor: "#DDD",
            borderBottomWidth: 1,
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
          <SearchBar
            value={searchValue}
            style={{ flex: 1, backgroundColor: "rgba(22,24,35,0.06)" }}
            placeholder="Nhập chức danh"
            showSoftInputOnFocus={false}
            onFocus={() =>
              navigation.navigate(ROUTE.search, {
                placeholder: "Nhập chức danh",
                searchValue: searchValue,
                roleId,
              })
            }
            autoCapitalize="none"
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          {loading ? (
            <Loading />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={() => getRandomBetween(1000, 10000)}
              renderItem={memoizedRenderPostItem}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderListEmpty}
              ListFooterComponent={loading ? <Loading /> : null}
              refreshControl={
                <RefreshControl
                  tintColor={theme.colors.primary200}
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    setFilter({ ...FILTER_DEFAULT_VALUE });
                  }}
                />
              }
              onEndReachedThreshold={0}
              onEndReached={() =>
                pagination?.hasNext && setPage((prev) => prev + 1)
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewAllScreen;
