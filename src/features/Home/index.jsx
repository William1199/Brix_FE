import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from "@react-navigation/native";
import { useCallback, useContext, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import {
  Carousel,
  Header,
  MessageUser,
  OpenURL,
  StatusBarComp,
} from "~/components";
import {
  API_RESPONSE_CODE,
  CATEGORIES,
  FILTER_DEFAULT_VALUE,
  NO_IMAGE_URL,
  PLACES,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import {
  BuilderServices,
  CartServices,
  ContractorServices,
  StoreServices,
} from "~/services";
import { getRandomBetween, parseCurrencyText } from "~/utils/helper";
import InviteModal from "../Profile/ProfileDetail/InviteModal";

const MOCK_DATA = {
  carousel: [
    {
      id: 1,
      imageUri:
        "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
      title: "Surface",
      desc: "Follow us @Surface – Laptops designed by Microsoft, Follow us @Surface – Laptops designed by Microsoft",
    },
    {
      id: 2,
      imageUri:
        "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
      title: "Anita Austvika",
      desc: "Photographer, Support via PayPal, Latvia",
    },
    {
      id: 3,
      imageUri:
        "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
      title: "Surface",
      desc: "Follow us @Surface – Laptops designed by Microsoft",
    },
    {
      id: 4,
      imageUri:
        "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
      title: "Anita Austvika",
      desc: "Photographer, Support via PayPal, Latvia",
    },
  ],
  PAGE_SIZE: 10,
};

const BlockItem = ({
  list = [],
  containerStyle = {},
  renderContent,
  title,
  isReadMore = false,
  onReadMorePress,
  callBack = () => {},
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

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
        callBack(post, post?.isSave ? false : true);
      }
    } catch (e) {
      console.log(`save post error ${e}`);
    }
  };

  return (
    <View style={containerStyle}>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontSize: theme.sizes.medium + 0.5,
            fontWeight: "bold",
            textTransform: "capitalize",
          }}
        >
          {title}
        </Text>

        {isReadMore && (
          <Pressable
            style={({ pressed }) => [
              pressed && {
                opacity: 0.35,
              },
            ]}
            onPress={onReadMorePress}
          >
            <Text
              style={{
                textTransform: "capitalize",
                color: "blue",
                textDecorationLine: "underline",
              }}
            >
              xem thêm
            </Text>
          </Pressable>
        )}
      </View>
      {typeof renderContent === "function" ? (
        renderContent()
      ) : (
        <View>
          {list.map((item, idx, arr) => (
            <Pressable
              key={idx}
              onPress={() =>
                navigation.navigate(ROUTE.postDetail, { id: item.id })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: theme.sizes.large,
                  borderBottomColor: idx !== arr.length - 1 && "#ddd",
                  borderBottomWidth: idx !== arr.length - 1 ? 1 : 0,
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
                  {userInfo?.id !== item?._createdBy && (
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
                          color={
                            item.isSave ? theme.colors.highlight : "#bebebe"
                          }
                        />
                      </Pressable>
                    </View>
                  )}

                  <View style={{ maxWidth: "85%" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: theme.sizes.font + 1,
                      }}
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
          ))}
        </View>
      )}
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const height = useBottomTabBarHeight();
  const { userInfo } = useContext(AuthContext);

  const [refreshing, setRefreshing] = useState(false);
  const [contractorPosts, setContractorPosts] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [favoriteConstructors, setFavoriteConstructors] = useState([]);
  const [favoriteBuilders, setFavoriteBuilders] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [totalRecords, setTotalRecords] = useState({
    contractorPosts: 0,
    store: 0,
  });
  const [bottomTabBarHeight] = useState(height);

  const scrollViewRef = useRef(null);

  useScrollToTop(scrollViewRef);
  const [cart, setCart] = useState({ length: 0, list: [] });

  const fetchData = async () => {
    if (userInfo) {
      const [
        {
          data: contractorData,
          pagination: { totalRecords: contractorTotalRecords },
        },
        {
          data: _storeData,
          pagination: { totalRecords: storeDataTotalRecords },
        },
        { data: _favoriteConstructors },
        { data: _favoriteBuilder },
        { data: _favoriteStore },
        { data: _cartData, pagination: cartPagination },
      ] = await Promise.all([
        ContractorServices.getPosts({ pageSize: MOCK_DATA.PAGE_SIZE }),
        StoreServices.getPosts({ pageSize: MOCK_DATA.PAGE_SIZE }),
        ContractorServices.getFavoriteInfoList({
          pageSize: MOCK_DATA.PAGE_SIZE,
        }),
        BuilderServices.getFavoriteInfoList({ pageSize: MOCK_DATA.PAGE_SIZE }),
        StoreServices.getFavoriteInfoList({ pageSize: MOCK_DATA.PAGE_SIZE }),
        CartServices.getList(),
      ]);

      setStoreData(_storeData);
      setFavoriteBuilders(_favoriteBuilder);
      setFavoriteConstructors(_favoriteConstructors);
      setContractorPosts(contractorData);
      setFavoriteStores(_favoriteStore);
      setTotalRecords({
        contractorPosts: contractorTotalRecords,
        store: storeDataTotalRecords,
      });
      setCart({ list: _cartData, length: cartPagination?.totalRecords });
      setRefreshing(false);
    } else {
      const [
        {
          data: contractorData,
          pagination: { totalRecords: contractorTotalRecords },
        },
        {
          data: _storeData,
          pagination: { totalRecords: storeDataTotalRecords },
        },
        { data: _favoriteConstructors },
        { data: _favoriteBuilder },
        { data: _favoriteStore },
      ] = await Promise.all([
        ContractorServices.getPosts({ pageSize: MOCK_DATA.PAGE_SIZE }),
        StoreServices.getPosts({ pageSize: MOCK_DATA.PAGE_SIZE }),
        ContractorServices.getFavoriteInfoList({
          pageSize: MOCK_DATA.PAGE_SIZE,
        }),
        BuilderServices.getFavoriteInfoList({ pageSize: MOCK_DATA.PAGE_SIZE }),
        StoreServices.getFavoriteInfoList({ pageSize: MOCK_DATA.PAGE_SIZE }),
      ]);

      setStoreData(_storeData);
      setFavoriteBuilders(_favoriteBuilder);
      setFavoriteConstructors(_favoriteConstructors);
      setContractorPosts(contractorData);
      setFavoriteStores(_favoriteStore);
      setTotalRecords({
        contractorPosts: contractorTotalRecords,
        store: storeDataTotalRecords,
      });
      setRefreshing(false);
    }
  };

  const renderPopularConstructor = (isManually = false) => {
    const rootData = isManually
      ? favoriteBuilders
      : userInfo?.role?.toLowerCase() === ROLE.contractor
      ? favoriteBuilders
      : favoriteConstructors;

    const renderItem = ({ item, index }) => (
      <Pressable
        style={({ pressed }) => [
          pressed && {
            opacity: 0.25,
          },
          {
            minWidth: 230,
            maxWidth: 230,
            minHeight: 200,
            marginRight: index !== rootData.length - 1 ? theme.sizes.small : 0,
            borderColor: "rgba(22,24,35,0.06)",
            borderWidth: 0.5,
            borderRadius: theme.sizes.small,
            overflow: "hidden",
            backgroundColor: "white",
          },
        ]}
        onPress={() => {
          const route = isManually
            ? ROUTE.profile
            : userInfo?.role?.toLowerCase() === ROLE.contractor
            ? ROUTE.profile
            : ROUTE.constructorProfile;

          const dynamicParam = isManually
            ? item?.builder?.id
            : userInfo?.role?.toLowerCase() === ROLE.contractor
            ? item?.builder?.id
            : item?.contractor?.id;

          navigation.navigate(route, {
            id: item.userId,
            builderId: dynamicParam,
          });
        }}
      >
        <View>
          <Image
            source={{
              uri: "https://i.ibb.co/k3yHgvf/BRIX.png",
            }}
            style={{
              width: "100%",
              height: 111,
            }}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.sizes.font,
            transform: [
              {
                translateY: -25,
              },
            ],
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: 50,
              height: 50,
              borderRadius: theme.sizes.small,
              borderColor: "rgba(22,24,35,0.06)",
              borderWidth: 0.5,
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: item.avatar || NO_IMAGE_URL,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>

          <Text
            style={{
              textTransform: "uppercase",
              fontWeight: "600",
              fontSize: theme.sizes.medium - 1,
              marginTop: theme.sizes.small,
            }}
          >
            {`${item.firstName} ${item.lastName}`}
          </Text>

          <Text
            style={{
              fontSize: theme.sizes.font - 2,
              marginTop: theme.sizes.base / 2,
              color: "rgba(22,24,35,0.64)",
            }}
          >
            {item.email}
          </Text>
        </View>
      </Pressable>
    );

    return (
      <FlatList
        data={
          isManually
            ? favoriteBuilders
            : userInfo?.role?.toLowerCase() === ROLE.contractor
            ? favoriteBuilders
            : favoriteConstructors
        }
        keyExtractor={() => getRandomBetween(1000, 10000)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.sizes.font,
          paddingBottom: theme.sizes.extraLarge,
        }}
      />
    );
  };

  const renderPopularStore = () => {
    const renderItem = ({ item, index }) => (
      <Pressable
        style={{
          minWidth: 230,
          maxWidth: 230,
          minHeight: 200,
          marginRight:
            index !== favoriteStores.length - 1 ? theme.sizes.small : 0,
          borderColor: "rgba(22,24,35,0.06)",
          borderWidth: 0.5,
          borderRadius: theme.sizes.small,
          overflow: "hidden",
          backgroundColor: "white",
        }}
        onPress={() =>
          navigation.navigate(ROUTE.storeDetail, {
            id: item.detailMaterialStore.id,
            storeInfo: {
              firstName: item.firstName,
              lastName: item.lastName,
              avatar: item.avatar,
            },
            userId: item.userId,
          })
        }
      >
        <Image
          source={{
            uri: item.avatar || NO_IMAGE_URL,
          }}
          style={{
            width: "100%",
            height: 120,
          }}
          resizeMode="cover"
        />

        <View
          style={{
            flex: 1,
            padding: theme.sizes.font,
          }}
        >
          <View style={{ marginBottom: theme.sizes.font }}>
            <Text
              style={{
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              {`${item.firstName} ${item.lastName}`}
            </Text>

            <Text
              style={{
                fontSize: theme.sizes.small + 2,
                marginTop: theme.sizes.base / 2,
                color: "rgba(22,24,35,0.44)",
              }}
              numberOfLines={3}
            >
              {item.description}
            </Text>
          </View>

          <View
            style={{
              marginTop: "auto",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="location"
              size={theme.sizes.font}
              color="rgba(22,24,35,0.64)"
            />
            <Text
              style={{
                fontSize: theme.sizes.small + 3,
                color: "rgba(22,24,35,0.64)",
                marginLeft: theme.sizes.base / 2,
                textTransform: "capitalize",
              }}
            >
              {PLACES[item.detailMaterialStore.place]}
            </Text>
          </View>
        </View>
      </Pressable>
    );

    return (
      <FlatList
        data={favoriteStores}
        keyExtractor={() => getRandomBetween(1000, 10000)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.sizes.font,
          paddingBottom: theme.sizes.extraLarge,
        }}
      />
    );
  };

  const renderStoreData = () => {
    return (
      <View>
        {storeData.map((item, idx, arr) => (
          <Pressable
            key={idx}
            onPress={() =>
              navigation.navigate(ROUTE.storeDetail, {
                id: item.id,
                storeInfo: {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  avatar: item.avatar,
                },
                userId: item.userId,
              })
            }
          >
            <View
              style={{
                flexDirection: "row",
                paddingVertical: theme.sizes.large,
                borderBottomColor: idx !== arr.length - 1 && "#ddd",
                borderBottomWidth: idx !== arr.length - 1 ? 1 : 0,
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
        ))}
      </View>
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderCategoryItem = ({ item, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
      >
        <View
          style={{
            width: 120,
            minHeight: 130,
            flex: 1,
            backgroundColor: theme.colors.primary25,
            marginRight: theme.sizes.font,
            padding: theme.sizes.small,
            paddingTop: theme.sizes.medium,
            alignItems: "center",
            borderRadius: theme.sizes.base / 2,
          }}
        >
          <Image
            source={{ uri: item.imageUri }}
            style={{ width: 70, height: 70 }}
            resizeMode="cover"
          />
          <Text
            style={{
              marginVertical: theme.sizes.small,
              textAlign: "center",
              fontWeight: "bold",
              color: theme.colors.textColor100,
            }}
          >
            {item.name}
          </Text>
        </View>
      </Pressable>
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userInfo])
  );
  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />

      <SafeAreaView
        style={{
          flex: 1,
          paddingBottom: theme.sizes.small,
          backgroundColor: "#fff",
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <Header cartLength={cart?.length} />

          <ScrollView
            style={{ flex: 1, paddingVertical: theme.sizes.medium }}
            ref={scrollViewRef}
            alwaysBounceVertical={false}
            scrollEventThrottle={64}
            contentContainerStyle={{ paddingBottom: bottomTabBarHeight + 40 }}
            refreshControl={
              <RefreshControl
                tintColor={theme.colors.primary200}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View style={{ paddingHorizontal: theme.sizes.medium }}>
              <Carousel
                data={MOCK_DATA.carousel}
                style={{
                  marginBottom: theme.sizes.base - 2,
                }}
              />
            </View>
            {userInfo && (
              <MessageUser
                profile={userInfo}
                showDivider={false}
                isRadius
                containerStyle={{
                  marginHorizontal: 16,
                  marginTop: 16,
                }}
              />
            )}

            <View
              style={{
                marginTop: theme.sizes.extraLarge * 1.5,
                paddingHorizontal: theme.sizes.medium,
                paddingBottom: theme.sizes.extraLarge,
              }}
            >
              <Text
                style={{
                  textTransform: "capitalize",
                  fontSize: theme.sizes.large,
                  fontWeight: "bold",
                  marginBottom: theme.sizes.font,
                }}
              >
                Phong cách thiết kế công trình
              </Text>
              <FlatList
                data={CATEGORIES}
                keyExtractor={() => getRandomBetween(1000, 10000)}
                renderItem={({ item }) =>
                  renderCategoryItem({
                    item,
                    onPress: () => {
                      navigation.navigate(ROUTE.viewAll, {
                        roleId: ROLE.contractor,
                        filterRequest: {
                          ...FILTER_DEFAULT_VALUE,
                          categories: [item.value],
                        },
                      });
                    },
                  })
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {!userInfo && (
              <BlockItem
                title={"Ứng cử viên nổi bật"}
                containerStyle={{
                  backgroundColor: "rgba(22,24,35,0.06)",
                  paddingHorizontal: theme.sizes.medium,
                  paddingTop: theme.sizes.extraLarge,
                }}
                renderContent={() => renderPopularConstructor(true)}
              />
            )}
            {userInfo?.role?.toLowerCase() === ROLE.contractor ? (
              <BlockItem
                title="Cửa hàng phù hợp với bạn"
                containerStyle={{
                  paddingHorizontal: theme.sizes.medium,
                  paddingTop: theme.sizes.extraLarge,
                }}
                renderContent={renderStoreData}
                isReadMore={totalRecords.store > MOCK_DATA.PAGE_SIZE}
                onReadMorePress={() => {
                  navigation.navigate(ROUTE.viewAll, {
                    roleId: ROLE.store,
                  });
                }}
              />
            ) : (
              <BlockItem
                title="Gợi ý việc làm cho bạn"
                list={contractorPosts}
                containerStyle={{
                  paddingHorizontal: theme.sizes.medium,
                  paddingTop: theme.sizes.extraLarge,
                }}
                callBack={(item, val) => {
                  setContractorPosts((prev) => {
                    const index = prev.findIndex((x) => x.id === item.id);
                    const currentItem = prev[index];
                    prev[index] = { ...currentItem, isSave: val };
                    return [...prev];
                  });
                }}
              />
            )}

            <BlockItem
              title={
                userInfo?.role?.toLowerCase() === ROLE.contractor
                  ? "Ứng cử viên nổi bật"
                  : "Nhà tuyển dụng nổi bật"
              }
              containerStyle={{
                backgroundColor: "rgba(22,24,35,0.06)",
                paddingHorizontal: theme.sizes.medium,
                paddingTop: theme.sizes.extraLarge,
              }}
              renderContent={renderPopularConstructor}
            />

            <BlockItem
              title="Việc làm mới nhất"
              list={contractorPosts}
              containerStyle={{
                paddingHorizontal: theme.sizes.medium,
                paddingTop: theme.sizes.extraLarge,
              }}
              callBack={(item, val) => {
                setContractorPosts((prev) => {
                  const index = prev.findIndex((x) => x.id === item.id);
                  const currentItem = prev[index];
                  prev[index] = { ...currentItem, isSave: val };
                  return [...prev];
                });
              }}
            />
            {userInfo?.role?.toLowerCase() !== ROLE.builder && (
              <BlockItem
                title="Cửa hàng nổi bật"
                containerStyle={{
                  backgroundColor: "rgba(22,24,35,0.06)",
                  paddingHorizontal: theme.sizes.medium,
                  paddingTop: theme.sizes.extraLarge,
                }}
                renderContent={renderPopularStore}
              />
            )}

            <BlockItem
              title="Bạn có thể quan tâm"
              list={contractorPosts}
              containerStyle={{
                paddingHorizontal: theme.sizes.medium,
                paddingTop: theme.sizes.extraLarge,
              }}
              callBack={(item, val) => {
                setContractorPosts((prev) => {
                  const index = prev.findIndex((x) => x.id === item.id);
                  const currentItem = prev[index];
                  prev[index] = { ...currentItem, isSave: val };
                  return [...prev];
                });
              }}
              isReadMore={totalRecords.contractorPosts > MOCK_DATA.PAGE_SIZE}
              onReadMorePress={() => {
                navigation.navigate(ROUTE.viewAll, { roleId: ROLE.contractor });
              }}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
