import { Entypo, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import moment from "moment";
import { useContext, useLayoutEffect, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { Avatar, Badge, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Loading } from "~/components";
import { NOTIFICATION_TYPE, NO_IMAGE_URL, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import GuestContext from "~/context/GuestContext";
import NotificationContext from "~/context/NotificationContext";
import { NotificationServices } from "~/services";
import { getRandomBetween } from "~/utils/helper";

const NotificationScreen = ({ navigation }) => {
  const { verifyAccount } = useContext(GuestContext);
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();
  const bottomBarHeight = useBottomTabBarHeight();
  const {
    refreshing,
    fetchMoreLoading,
    pagination,
    notificationData,
    loading,
    handleRefresh,
    unReadList,
    handleUpdateIsRead,
    handlePageNotification,
  } = useContext(NotificationContext);

  const renderItem = ({ item }) => {
    return (
      <View>
        <Pressable
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.sizes.font,
              paddingVertical: theme.sizes.base,
              backgroundColor: !item.isRead
                ? theme.colors.primary25
                : "transparent",
            },
            pressed && {
              backgroundColor: "rgba(22,24,35,0.06)",
            },
          ]}
          onPress={async () => {
            let isSuccess = true;
            if (!item.isRead) {
              isSuccess = await NotificationServices.updateIsRead(item.id);
            }
            if (isSuccess) {
              !item.isRead && handleUpdateIsRead(item.id);
              if (item.navigateId) {

                switch (item.type) {
                  case NOTIFICATION_TYPE.postDetail: {
                    return navigation.navigate(ROUTE.postDetail, {
                      id: item.navigateId,
                    });
                  }
                  case NOTIFICATION_TYPE.billDetail: {
                    return navigation.navigate(ROUTE.billDetail, {
                      id: item.navigateId,
                    });
                  }
                  case NOTIFICATION_TYPE.commitmentDetail: {
                    return navigation.navigate(ROUTE.commitmentDetail, {
                      id: item.navigateId,
                    });
                  }
                  case NOTIFICATION_TYPE.reportDetail: {
                    return navigation.navigate(ROUTE.productDetail, {
                      id: item.navigateId,
                    });
                  }
                }
              }
            }

            Toast.show({
              type: "error",
              text1: "Không thể chuyển trang này!",
              position: "bottom",
              visibilityTime: 2500,
            });
          }}
        >
          <Avatar.Image
            source={{ uri: item?.author?.avatar || NO_IMAGE_URL }}
            size={70}
          />

          <View style={{ flex: 1, marginLeft: theme.sizes.small }}>
            <Text
              numberOfLines={3}
              style={{
                lineHeight: theme.sizes.large,
                fontSize: theme.sizes.font - 0.5,
              }}
            >
              <Text
                style={{ fontWeight: "600", fontSize: theme.sizes.font + 1 }}
              >
                {`${item.author.firstName} ${item.author.lastName}`}{" "}
              </Text>
              {item.message.replace("Someone ", "")?.toLowerCase()}
            </Text>
            <Text
              style={{
                marginTop: theme.sizes.base / 2,
                fontSize: theme.sizes.small + 1.5,
                color: "rgba(22,24,35,0.64)",
              }}
            >
              {moment(item.lastModifiedAt).fromNow()}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const memoizedRenderItem = useMemo(() => renderItem, [notificationData]);

  useLayoutEffect(() => {
    if (verifyAccount(ROUTE.notification)) {
      navigation.setOptions({
        tabBarIcon: ({ color, focused }) => (
          <View>
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={focused ? theme.colors.primary400 : color}
            />

            {unReadList?.length !== 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  transform: [
                    {
                      translateX: 4,
                    },
                    {
                      translateY: -3,
                    },
                  ],
                }}
              >
                <Badge size={16} color={theme.colors.error}>
                  {unReadList.length}
                </Badge>
              </View>
            )}
          </View>
        ),
      });
    }
  }, [unReadList]);

  return (
    <>
      {loading && <Loading isModal />}
      {userInfo && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <SectionList
            alwaysBounceVertical={false}
            sections={notificationData}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: bottomBarHeight + theme.sizes.extraLarge,
            }}
            keyExtractor={() => getRandomBetween(1000, 10000)}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                tintColor={theme.colors.primary200}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListHeaderComponent={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: theme.sizes.font,
                  paddingVertical: theme.sizes.small,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Pressable
                    style={{
                      paddingRight: theme.sizes.base,
                    }}
                    onPress={() => navigation.openDrawer()}
                  >
                    <Entypo
                      name="menu"
                      size={24}
                      color="black"
                      style={{ marginLeft: -3 }}
                    />
                  </Pressable>

                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "bold",
                      fontSize: theme.sizes.extraLarge,
                    }}
                  >
                    Thông báo
                  </Text>
                </View>

                <Pressable
                  style={{
                    padding: theme.sizes.base / 1.75,
                    backgroundColor: "rgba(22,24,35,0.12)",
                    borderRadius: 1000,
                  }}
                >
                  <Ionicons name="search" size={20} color="black" />
                </Pressable>
              </View>
            }
            renderItem={memoizedRenderItem}
            renderSectionHeader={({ section: { title, data } }) =>
              data.length > 0 ? (
                <Text
                  style={{
                    paddingTop: theme.sizes.base / 2,
                    paddingHorizontal: theme.sizes.font,
                    fontWeight: "600",
                    fontSize: theme.sizes.medium,
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  {title}
                </Text>
              ) : null
            }
            ListFooterComponent={() =>
              fetchMoreLoading || pagination?.hasNext ? (
                <Loading />
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: theme.sizes.small,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.small + 2,
                      color: "rgba(22,24,35,.44)",
                    }}
                  >
                    Không còn thông báo nào khác
                  </Text>
                </View>
              )
            }
            onEndReachedThreshold={0}
            onEndReached={() => {
              if (pagination?.hasNext) {
                handlePageNotification();
              }
            }}
          />
        </SafeAreaView>
      )}
    </>
  );
};

export default NotificationScreen;
