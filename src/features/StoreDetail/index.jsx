import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Avatar, Badge, useTheme } from "react-native-paper";
import { Rating } from "react-native-ratings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chatClient } from "~/app/chatConfig";
import { SearchBar, StatusBarComp } from "~/components";
import { NO_IMAGE_URL, ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import GuestContext from "~/context/GuestContext";
import { CartServices } from "~/services";
import ProductPage from "./ProductPage";
const MOCK_DATA = {
  BAR: {
    home: "Trang chủ",
    product: "Sản phẩm",
  },
};

const StoreDetailScreen = ({ navigation, route }) => {
  const { verifyAccount } = useContext(GuestContext);

  const { setChannel } = useContext(ChatContext);
  const { userInfo } = useContext(AuthContext);
  const { id, storeInfo, userId, searchValue } = route.params || {
    id: userInfo?.storeID,
    storeInfo: {
      firstName: userInfo?.firstName,
      lastName: userInfo?.lastName,
      avatar: userInfo?.avatar,
    },
    userId: userInfo?.id,
  };

  const { BAR } = MOCK_DATA;
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({ length: 0, list: [] });
  const [totalSold, setTotalSold] = useState(0);

  const hasBottomBar = useMemo(
    () => (route.params ? false : true),
    [route.params]
  );

  const fetchData = async () => {
    setLoading(true);
    const { data, pagination } = await CartServices.getList();
    setCart({ list: data, length: pagination?.totalRecords });
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleChat = async () => {
    if (verifyAccount(ROUTE.storeDetail, { userId })) {
      const channel = chatClient.channel("messaging", {
        members: [userInfo?.id, userId],
      });
      await channel.create();

      setChannel(channel);

      navigation.navigate(ROUTE.channel);
    }
  };

  const renderHeader = () => (
    <View style={{ zIndex: -1 }}>
      {/* store-info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: theme.sizes.large,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Avatar.Image
            size={userInfo && userInfo?.storeID === id ? 80 : 60}
            source={{ uri: storeInfo.avatar || NO_IMAGE_URL }}
          />

          <View style={{ marginLeft: theme.sizes.small }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  marginRight: theme.sizes.base,
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {`${storeInfo?.firstName} ${storeInfo?.lastName}`}
              </Text>
              <FontAwesome
                name="angle-right"
                size={theme.sizes.medium}
                color="rgba(22,24,35,0.55)"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.sizes.base,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingRight: theme.sizes.base,
                }}
              >
                <Rating
                  startingValue={4.5}
                  readonly
                  ratingCount={5}
                  imageSize={theme.sizes.small}
                  style={{ paddingRight: 10 }}
                />
                <Text
                  style={{
                    color: "rgba(22,24,35,0.64)",
                    fontSize: theme.sizes.small + 1,
                  }}
                >
                  4.7
                </Text>
              </View>

              <View
                style={{
                  width: 1,
                  height: "55%",
                  backgroundColor: "rgba(22,24,35,0.12)",
                }}
              />

              <Text
                style={{
                  paddingLeft: theme.sizes.base,
                  fontSize: theme.sizes.small + 2,
                  color: "rgba(22,24,35,0.7)",
                }}
              >
                Đã bán {totalSold}
              </Text>
            </View>

            {userInfo?.storeID === id && (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  {
                    marginTop: theme.sizes.base,
                  },
                ]}
                onPress={() => navigation.navigate(ROUTE.myProfile)}
              >
                <View
                  style={{
                    backgroundColor: "rgba(22,24,35,0.08)",
                    paddingHorizontal: theme.sizes.small + 2,
                    paddingVertical: theme.sizes.base,
                    borderRadius: theme.sizes.base / 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(22,24,35,0.5)",
                      fontSize: theme.sizes.small + 2,
                      textTransform: "capitalize",
                      fontWeight: "600",
                    }}
                  >
                    Chỉnh sửa thông tin
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
        {userInfo?.storeID !== id && (
          <Pressable
            style={{
              paddingHorizontal: theme.sizes.small,
              paddingVertical: theme.sizes.base / 2,
              borderColor: "rgba(22,24,35,0.12)",
              borderWidth: 1,
              borderRadius: 2,
            }}
            onPress={() => handleChat()}
          >
            <Text
              style={{ fontSize: theme.sizes.small + 2, fontWeight: "600" }}
            >
              trò chuyện
            </Text>
          </Pressable>
        )}
      </View>

      {/* divider */}
      <View
        style={{
          height: theme.sizes.base,
          backgroundColor: "rgba(22,24,35,0.065)",
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ transparent: false, style: "light" }}
      />
      <View style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            paddingTop: top + theme.sizes.base,
            paddingBottom: theme.sizes.small,
            flexDirection: "row",
            alignItems: "center",
            zIndex: 100,
            backgroundColor: theme.colors.primary400,
            paddingRight: userInfo?.role.toLowerCase() === ROLE.store ? 20 : 0,
          }}
        >
          <Pressable
            style={{
              paddingHorizontal: theme.sizes.small,
            }}
            onPress={
              hasBottomBar
                ? () => navigation.openDrawer()
                : () => navigation.goBack()
            }
          >
            <Feather
              name={hasBottomBar ? "menu" : "chevron-left"}
              size={
                hasBottomBar
                  ? theme.sizes.extraLarge
                  : theme.sizes.extraLarge * 1.25
              }
              color="white"
            />
          </Pressable>

          <SearchBar
            value={searchValue}
            showSoftInputOnFocus={false}
            onFocus={() =>
              navigation.navigate(ROUTE.search, {
                placeholder: "Tìm kiếm trong cửa hàng",
                searchValue,
                isProduct: true,
                id,
                storeInfo,
                userId,
              })
            }
            autoCapitalize="none"
            style={{ flex: 1, backgroundColor: "#fff" }}
            placeholder="Tìm kiếm trong cửa hàng"
          />
          {userInfo?.role?.toLowerCase() !== ROLE.store && (
            <Pressable
              style={{
                paddingHorizontal: theme.sizes.font - 2,
              }}
              onPress={() => {
                if (verifyAccount(ROUTE.storeDetail, { userId })) {
                  navigation.navigate(ROUTE.cart, { userId });
                }
              }}
            >
              <Ionicons
                name="ios-cart-outline"
                size={theme.sizes.extraLarge * 1.15}
                color="white"
              />
              {cart.length > 0 && (
                <Badge
                  style={{
                    position: "absolute",
                    right: 8,
                    top: -5,
                    backgroundColor: theme.colors.highlight,
                  }}
                  size={theme.sizes.medium}
                >
                  {cart.length}
                </Badge>
              )}
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Tabs.Container
            renderHeader={renderHeader}
            renderTabBar={(props) => (
              <MaterialTabBar
                {...props}
                indicatorStyle={{
                  backgroundColor: "rgba(22,24,35,1)",
                  height: 1.75,
                }}
                inactiveColor="rgba(22,24,35,0.64)"
                activeColor="rgba(22,24,35,1)"
                tabStyle={{
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                }}
                labelStyle={{
                  fontSize: theme.sizes.small + 2,
                  fontWeight: "600",
                }}
              />
            )}
            initialTabName={BAR.product}
          >
            <Tabs.Tab name={BAR.home}>
              <View>
                <Text>home</Text>
              </View>
            </Tabs.Tab>
            <Tabs.Tab name={BAR.product}>
              <ProductPage
                id={id}
                setTotalSold={setTotalSold}
                hasBottomBar={route.params ? false : true}
                searchValue={searchValue}
              />
            </Tabs.Tab>
          </Tabs.Container>
        </View>
      </View>
    </View>
  );
};

export default StoreDetailScreen;
