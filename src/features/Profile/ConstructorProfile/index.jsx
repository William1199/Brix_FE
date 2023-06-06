import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Avatar, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";

import { Loading, OpenURL, StatusBarComp, Toast } from "~/components";
import {
  API_RESPONSE_CODE,
  NO_IMAGE_URL,
  PLACES,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import { UsersServices } from "~/services";

import _ from "lodash";
import RenderHTML from "react-native-render-html";
import { chatClient } from "~/app/chatConfig";
import { ChatContext } from "~/context/ChatContext";
import { parseCurrencyText } from "~/utils/helper";
const WIDTH = Dimensions.get("window").width;

const ConstructorProfileScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const { setChannel } = useContext(ChatContext);
  const { id } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState([]);

  const handleChat = async () => {
    const channel = chatClient.channel("messaging", {
      members: [userInfo?.id, id],
    });
    await channel.create();

    setChannel(channel);

    navigation.navigate(ROUTE.channel);
  };

  const handleSave = async (post) => {
    try {
      let res;
      if (post?.isSave) {
        res = await axiosInstance.put("savepost", {
          contractorPostId: post.id,
        });
      } else {
        res = await axiosInstance.post("savepost", {
          contractorPostId: post.id,
        });
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await UsersServices.getProfileById(id);

        const { data, pagination } = await axiosInstance.post(
          `contractorpost/${id}`,
          {}
        );
        setProfile(res);
        setPosts(data);
        setLoading(false);
        if (userInfo?.status != 2) {
          Toast.show({
            type: "error",
            text1: "Bạn phải xác thực tài khoản để xem thông tin nhà thầu",
            position: "bottom",
            visibilityTime: 2500,
          });
        }
      } catch (error) {}
    })();
  }, []);

  const renderPostItem = (item, index) => {
    return (
      <Pressable
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
        key={index}
        onPress={() => navigation.navigate(ROUTE.postDetail, { id: item.id })}
      >
        <View
          style={{
            flexDirection: "row",
            paddingVertical: theme.sizes.medium,
            borderBottomColor: "rgba(22,24,35,0.12)",
            borderBottomWidth: index !== posts.length - 1 ? 1 : 0,
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
                {moment(item.lastModifiedAt).format("DD/MM/YYYY")}
              </Text>

              <Text style={{ marginBottom: theme.sizes.base - 2 }}>
                {PLACES[item.place]}
              </Text>
              <Text style={{ color: theme.colors.highlight }}>
                {parseCurrencyText(item.salaries)}
              </Text>
            </View>

            {userInfo && userInfo?.id !== item._createdBy && (
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
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) return <Loading />;

  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.primary400,
            justifyContent: "center",
            paddingBottom: 14,
            paddingTop: theme.sizes.small,
            zIndex: 1,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.25 },
              {
                position: "absolute",
                top: theme.sizes.small,
                left: theme.sizes.small,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Entypo
              name="chevron-thin-left"
              size={theme.sizes.extraLarge}
              color="#fff"
            />
          </Pressable>
          <View>
            <Text
              style={{
                fontSize: theme.sizes.large,
                color: "white",
                alignSelf: "center",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              Thông tin nhà thầu
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          scrollEventThrottle={16}
        >
          {/* profile */}
          <View
            style={[
              styles.container,
              {
                backgroundColor: "white",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: theme.sizes.small,
              }}
            >
              <Avatar.Image
                source={{ uri: profile?.avatar || NO_IMAGE_URL }}
                size={80}
              />

              {/* grid number */}
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  maxWidth: 65,
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    marginBottom: theme.sizes.small + 2,
                  }}
                >
                  {profile?.contractor?.postCount || 0}
                </Text>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.6)",
                    fontSize: theme.sizes.small + 2,
                    textAlign: "center",
                    lineHeight: 12,
                  }}
                >
                  Bài đã đăng
                </Text>
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  maxWidth: 65,
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    marginBottom: theme.sizes.small + 2,
                  }}
                >
                  {profile?.contractor?.billCount || 0}
                </Text>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.6)",
                    fontSize: theme.sizes.small + 2,
                    textAlign: "center",
                    lineHeight: 12,
                  }}
                >
                  Đơn hàng đã mua
                </Text>
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  maxWidth: 65,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.small + 1,
                    fontWeight: "500",
                    marginBottom: theme.sizes.small + 2,
                  }}
                >
                  {moment(profile?.lastModifiedAt).format("DD/MM/YYYY") || 0}
                </Text>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.6)",
                    fontSize: theme.sizes.small + 2,
                    textAlign: "center",
                    lineHeight: 12,
                  }}
                >
                  Lần cuối chỉnh sửa
                </Text>
              </View>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  marginTop: theme.sizes.medium,
                  marginBottom: theme.sizes.small,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.medium,
                    fontWeight: "600",
                    flex: 1,
                    marginRight: theme.sizes.small,
                  }}
                >
                  {profile?.firstName + " " + profile?.lastName}
                </Text>

                {userInfo &&
                userInfo?.role?.toLowerCase() === ROLE.builder &&
                userInfo?.status === 2 ? (
                  <Pressable
                    style={{
                      padding: 10,
                      borderColor: "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      borderRadius: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => handleChat()}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.small + 2,
                        fontWeight: "600",
                      }}
                    >
                      trò chuyện
                    </Text>
                  </Pressable>
                ) : userInfo && userInfo?.premium && userInfo?.status === 2 ? (
                  <Pressable
                    style={{
                      padding: 10,
                      borderColor: "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      borderRadius: 5,
                    }}
                    onPress={() => handleChat()}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.small + 2,
                        fontWeight: "600",
                      }}
                    >
                      trò chuyện
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  {profile?.address && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: theme.sizes.base / 2,
                      }}
                    >
                      <Ionicons
                        name="location"
                        size={theme.sizes.medium}
                        color="rgba(22,24,35,0.36)"
                      />
                      <Text
                        style={{
                          marginLeft: theme.sizes.base,
                          fontSize: theme.sizes.font - 1,
                          textTransform: "capitalize",
                        }}
                      >
                        {userInfo && userInfo.status === 2
                          ? profile?.address
                          : `${_.padEnd(
                              profile?.address?.slice(
                                0,
                                profile?.address?.length / 2
                              ),
                              profile?.address?.length,
                              "*"
                            )}`}
                      </Text>
                    </View>
                  )}

                  {profile?.email && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: theme.sizes.base / 2,
                      }}
                    >
                      <Ionicons
                        name="mail"
                        size={theme.sizes.medium}
                        color="rgba(22,24,35,0.36)"
                      />
                      <Text
                        style={{
                          marginLeft: theme.sizes.base,
                          fontSize: theme.sizes.font - 1,
                        }}
                      >
                        {userInfo && userInfo.status === 2
                          ? profile?.email
                          : `${_.padEnd(
                              profile?.email?.slice(
                                0,
                                profile?.email?.length / 2
                              ),
                              profile?.email?.length,
                              "*"
                            )}`}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: theme.sizes.base / 2,
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={theme.sizes.medium}
                      color="rgba(22,24,35,0.36)"
                    />
                    <Text
                      style={{
                        marginLeft: theme.sizes.base,
                        fontSize: theme.sizes.font - 1,
                      }}
                    >
                      {userInfo && userInfo.status === 2
                        ? profile?.phone
                        : `${_.padEnd(
                            profile?.phone?.slice(
                              0,
                              profile?.phone?.length / 2
                            ),
                            profile?.phone?.length,
                            "*"
                          )}`}
                    </Text>
                  </View>

                  {profile?.contractor?.website && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="globe-outline"
                        size={theme.sizes.medium}
                        color="rgba(22,24,35,0.36)"
                      />
                      <OpenURL url={profile?.contractor?.website}>
                        <Text
                          style={{
                            marginLeft: theme.sizes.base,
                            fontSize: theme.sizes.font - 1,
                            color: "blue",
                            textDecorationLine: "underline",
                          }}
                        >
                          {userInfo && userInfo.status === 2
                            ? profile?.contractor?.website
                            : `${_.padEnd(
                                profile?.contractor?.website?.slice(
                                  0,
                                  profile?.contractor?.website?.length / 2
                                ),
                                profile?.contractor?.website?.length,
                                "*"
                              )}`}
                        </Text>
                      </OpenURL>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* divider */}

          <View style={[styles.container, { backgroundColor: "white" }]}>
            {/* title */}
            {profile?.contractor?.companyName && (
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                  marginBottom: profile?.contractor?.description
                    ? theme.sizes.base - 2
                    : 0,
                }}
              >
                {"Công ty: " + profile?.contractor?.companyName}
              </Text>
            )}

            {profile?.contractor?.description && (
              <RenderHTML
                contentWidth={WIDTH}
                source={{
                  html: profile?.contractor?.description,
                }}
                defaultTextProps={{
                  style: {
                    lineHeight: 20,
                  },
                }}
              />
            )}

            {/* detail */}
          </View>

          {posts.length > 0 && (
            <>
              {/* divider */}
              <View style={{ padding: 4, backgroundColor: "#ddd" }}></View>

              <View
                style={{
                  paddingHorizontal: theme.sizes.large,
                  paddingVertical: theme.sizes.font,
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.large,
                    fontWeight: "600",
                  }}
                >
                  Bài viết đã đăng
                </Text>

                <View style={{ marginTop: theme.sizes.base }}>
                  {posts.map((item, idx) => renderPostItem(item, idx))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});

export default ConstructorProfileScreen;
