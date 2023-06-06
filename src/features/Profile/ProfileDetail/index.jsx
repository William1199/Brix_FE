import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ImageViewer from "react-native-image-zoom-viewer";
import { Avatar, useTheme } from "react-native-paper";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import axiosInstance from "~/app/api";
import { Loading, StatusBarComp } from "~/components";
import {
  API_RESPONSE_CODE,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  PLACES,
  PROFILE_FORM,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import GuestContext from "~/context/GuestContext";
import { UsersServices } from "~/services";
import { formatStringToCurrency } from "~/utils/helper";
import InfoModal from "./InfoModal";
import InviteModal from "./InviteModal";

import Toast from "react-native-toast-message";
import { chatClient } from "~/app/chatConfig";
const MOCK_DATA = {
  COLOR: {
    blue400: "#5252ff",
    blue300: "rgba(100, 149, 237, 0.18)",
  },
  MODAL_VISIBLE: {
    invite: "invite",
    type: "type",
    construction: "construction",
  },
};

const ProfileScreen = ({ navigation, route }) => {
  const { COLOR, MODAL_VISIBLE } = MOCK_DATA;
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);

  const { id, builderId } = route.params || {};
  const { top, bottom } = useSafeAreaInsets();

  const { verifyAccount } = useContext(GuestContext);

  const { setChannel } = useContext(ChatContext);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [visible, setVisible] = useState({
    [MODAL_VISIBLE.invite]: false,
    [MODAL_VISIBLE.type]: false,
    [MODAL_VISIBLE.construction]: false,
  });
  const [zoom, setZoom] = useState({ isShow: false, list: [] });
  const [posts, setPosts] = useState({ list: [], pagination: {} });
  const [commitments, setCommitments] = useState([]);
  const [construction, setConstruction] = useState();
  const [bottomHeight, setBottomHeight] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [data, { code, data: _commitments }] = await Promise.all([
        UsersServices.getProfileById(id),
        axiosInstance.get("commitment/builder/:id".replace(":id", builderId)),
      ]);
      if (+code === API_RESPONSE_CODE.success) {
        setCommitments(_commitments);
      }
      setLoading(false);
      setProfile(data);
      if (userInfo?.status != 2) {
        Toast.show({
          type: "error",
          text1:
            "Bạn phải xác thực tài khoản để xem thông tin cá nhân người khác",
          position: "bottom",
          visibilityTime: 2500,
        });
      }
      if (!userInfo.premium) {
        Toast.show({
          type: "error",
          text1:
            "Bạn phải kích hoạt tài khoản để xem thông tin cá nhân người khác",
          position: "bottom",
          visibilityTime: 2500,
        });
      }
      if (userInfo?.role.toLowerCase() === ROLE.contractor) {
        const res = await axiosInstance.get("invite/checkInvite", {
          params: {
            builderID: builderId,
          },
        });

        setPosts({
          list: res.data,
          pagination: {},
        });
      }
    })();
  }, [id]);

  const handleChat = async () => {
    const channel = chatClient.channel("messaging", {
      members: [userInfo?.id, id],
    });
    await channel.create();

    setChannel(channel);

    navigation.navigate(ROUTE.channel);
  };

  const renderActions = () =>
    userInfo?.role.toLowerCase() === ROLE.contractor ? (
      <View
        style={{
          backgroundColor: theme.colors.highlight,
          borderRadius: theme.sizes.base - 2,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            {
              padding: 12,
              justifyContent: "center",
              alignItems: "center",
            },
            pressed && {
              backgroundColor: "rgba(22,24,35,.06)",
            },
          ]}
          onPress={() => {
            if (userInfo?.status != 2) {
              Toast.show({
                type: "error",
                text1:
                  "Bạn phải xác thực tài khoản để mời",
                position: "bottom",
                visibilityTime: 2500,
              });
            } else if (!userInfo?.premium) {
              Toast.show({
                type: "error",
                text1: "Bạn phải kích hoạt tài khoản để mời",
                position: "bottom",
                visibilityTime: 2500,
              });
            } else {
              setVisible((prev) => ({ ...prev, [MODAL_VISIBLE.invite]: true }));
            }
          }}
        >
          <Text
            style={{
              fontSize: theme.sizes.medium + 1,
              color: "#fff",
              fontWeight: "500",
            }}
          >
            Mời ứng tuyển
          </Text>
        </Pressable>
      </View>
    ) : null;

  const renderPostItem = ({ item, index }) => {
    return (
      <Pressable
        key={index}
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
            borderBottomColor: "#ddd",
            borderBottomWidth: index !== commitments?.length - 1 ? 1 : 0,
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
            {/* <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            ></View> */}

            <View>
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
                {`${formatStringToCurrency(item.salaries)} / ngày`}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderBuilderType = (typeId) => {
    switch (typeId) {
      case "4ace8fcb-95eb-48c0-9deb-240e8b4e10e0":
        return "Thợ xây hay thợ xây dựng là một người công nhân xây dựng là những người có tay nghề hoặc được đào tạo chuyên nghiệp thực hiện việc lao động trực tiếp và tham gia xây dựng cơ sở hạ tầng, các công trình, nhà cửa.... để nhận thù lao hay lương tháng, đây là một hoạt động mang tính dịch vụ, bán sức lao động.";
      case "bd880489-5c76-4854-93ab-66e3a541bf24":
        return "Thợ hồ hay thợ nề đảm nhiệm công việc tiếp xúc với vật liệu xây dựng, phụ trách việc nhỏ nhặt như xách nước, trộn vữa, khuân gạch, đào đất, vác cây, gạch ngói, khiêng tôn, quét vôi";
      case "ce9fa65b-d005-46b6-953e-e6462a59cfb3":
        return "Thợ sơn tường là người chịu trách nhiệm chuẩn bị các bề mặt để sơn, phủ lớp phủ tường của các tòa nhà, cầu và các công trình khác. Yêu cầu hàng đầu đối với thợ sơn tường là sơn đều bề mặt với số lượng lớp phủ thích hợp và tuân theo các hướng dẫn an toàn";
      case "cf9fa65b-d005-46b6-953e-e6462a59cfb3":
        return "Thợ hàn là người sử dụng một thiết bị chuyên dụng để gắn kết các mảnh kim loại lại với nhau. Người ra, họ cũng làm công việc cắt những vật kim loại thành các phần nhỏ hơn.";
    }
  };

  const renderConstructionType = (constructionType) => {
    switch (constructionType) {
      case "Nhà ở":
        return "Nhà ở là công trình xây dựng với mục đích để ở và phục vụ các nhu cầu sinh hoạt của hộ gia đình, cá nhân";
      case "Tòa nhà chung cư":
        return "Tòa nhà chung cư là một khối nhà (block) độc lập hoặc một số khối nhà có chung khối đế nổi trên mặt đất được xây dựng theo quy hoạch và hồ sơ dự án do cơ quan có thẩm quyền phê duyệt.";
      case "Công trình công cộng":
        return "Công trình công cộng là công trình được xây dựng bằng ngân sách nhà nước hoặc từ nguồn vay các doanh nghiệp trong và ngoài nước hoặc không dùng vốn ngân sách nhà nước cũng có thể tham gia vào dự án xây dựng công trình công cộng.Công trình công cộng dùng để phục vụ cho nhu cầu dân sinh như y tế, trường học, văn hóa, thể thao, tôn giáo, tín ngưỡng";
      default:
        return constructionType;
    }
  };

  const renderGender = (gender) => {
    switch (gender) {
      case 0:
        return "Anh ấy";
      default:
        return "Cô ấy";
    }
  };

  const renderDetailContent = (form) => {
    switch (form) {
      case PROFILE_FORM.skills: {
        const { builder: { builderSkills = [] } = {} } = profile || {};

        if (builderSkills.length === 0) return;

        return (
          <>
            <Text
              style={{
                fontSize: theme.sizes.medium,
                fontWeight: "600",
                textTransform: "capitalize",
                marginTop: theme.sizes.large,
              }}
            >
              {PROFILE_FORM.skills}
            </Text>
            <View
              style={{
                marginTop: theme.sizes.font,
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {builderSkills.map((item, index, array) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: COLOR.blue300,
                    paddingVertical: theme.sizes.small,
                    paddingHorizontal: theme.sizes.font,
                    borderRadius: theme.sizes.large,
                    marginRight:
                      index !== array.length - 1 ? theme.sizes.base : 0,
                    marginBottom: theme.sizes.base,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.medium - 1,
                      fontWeight: "600",
                      color: COLOR.blue400,
                      textTransform: "capitalize",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        );
      }
      case PROFILE_FORM.experience: {
        const { builder: { experienceDetail } = {} } = profile || {};

        const experienceList = experienceDetail
          ? experienceDetail?.split("|")
          : [];
        if (experienceList.length === 0) return;

        return (
          <>
            <View style={[styles.container]}>
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {PROFILE_FORM.experience}
              </Text>

              <View
                style={{
                  marginTop: theme.sizes.font,
                }}
              >
                {experienceList.map((item, index, array) => {
                  const [position, companyName, from, to] = item.split(";");

                  const diff = moment(to, FORMAT_DATE_REGEX["DD/MM/YYYY"]).diff(
                    moment(from, FORMAT_DATE_REGEX["DD/MM/YYYY"]),
                    "months"
                  );

                  return (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "rgba(22,24,35,0.06)",
                        padding: theme.sizes.font,
                        paddingBottom: theme.sizes.small,
                        borderRadius: theme.sizes.base,
                        marginBottom:
                          index !== array.length - 1
                            ? theme.sizes.small + 2
                            : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.sizes.medium - 1,
                          fontWeight: "600",
                          marginBottom: theme.sizes.base / 2,
                        }}
                      >
                        {position}
                      </Text>

                      <Text>Tại {companyName}</Text>

                      {from !== "undefined" ? (
                        <Text
                          style={{
                            marginTop: theme.sizes.base / 2,
                            fontSize: theme.sizes.small + 2,
                            color: "rgba(22,24,35,0.84)",
                          }}
                        >
                          {`${from} - ${to === "undefined" ? "Hiện Tại" : to}`}

                          {!isNaN(diff) && diff !== 0 ? (
                            <Text> ({diff} tháng)</Text>
                          ) : null}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            <View
              style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.05)" }}
            ></View>
          </>
        );
      }
      default: {
        const { builder: { certificate } = {} } = profile || {};
        const certificateList = certificate ? certificate?.split("|") : [];

        if (certificateList.length === 0) return;

        return (
          <>
            <View style={[styles.container]}>
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {PROFILE_FORM.certificate}
              </Text>

              <View
                style={{
                  marginTop: theme.sizes.font,
                }}
              >
                {certificateList.map((item, index, array) => {
                  const [name, companyName, from, path] = item.split(";");
                  return (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "rgba(22,24,35,0.06)",
                        padding: theme.sizes.font,
                        paddingBottom: theme.sizes.small,
                        borderRadius: theme.sizes.base,
                        marginBottom:
                          index !== array.length - 1 ? theme.sizes.base : 0,
                        minHeight: 50,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.sizes.medium - 1,
                          fontWeight: "600",
                          marginBottom: theme.sizes.base / 2,
                        }}
                      >
                        {name}
                      </Text>

                      {companyName ? (
                        <Text>{`${companyName}${
                          from !== "undefined" ? ` - ${from.slice(-4)}` : ""
                        }`}</Text>
                      ) : null}

                      {path ? (
                        <Pressable
                          style={({ pressed }) => [
                            pressed && {
                              opacity: 0.25,
                            },
                          ]}
                          onPress={() =>
                            setZoom({ isShow: true, list: [{ url: path }] })
                          }
                        >
                          <Text
                            style={{
                              color: "#5050fd",
                              marginTop: theme.sizes.base,
                            }}
                          >
                            Đường dẫn chứng chỉ
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            <View
              style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.05)" }}
            ></View>
          </>
        );
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />

      <Modal visible={zoom.isShow} transparent animationType="fade">
        <ImageViewer
          imageUrls={zoom.list}
          onSwipeDown={() => setZoom({ isShow: false, list: [] })}
          onCancel={() => setZoom({ isShow: false, list: [] })}
          enableSwipeDown
          useNativeDriver
          swipeDownThreshold={64}
          renderHeader={() => (
            <Pressable
              style={{
                position: "absolute",
                top: top + theme.sizes.font,
                left: 20,
                zIndex: 1000,
              }}
              onPress={() => setZoom({ isShow: false, list: [] })}
            >
              <Ionicons
                name="close"
                size={theme.sizes.extraLarge}
                color="white"
              />
            </Pressable>
          )}
        />
      </Modal>
      {posts.list.length > 0 && (
        <InviteModal
          visible={visible[MODAL_VISIBLE.invite]}
          title="Chọn bài viết muốn mời"
          onClose={() =>
            setVisible((prev) => ({ ...prev, [MODAL_VISIBLE.invite]: false }))
          }
          data={{ profile, invites: posts }}
        />
      )}

      <InfoModal
        visible={visible[MODAL_VISIBLE.type]}
        title="Mô tả loại thợ"
        onClose={() =>
          setVisible((prev) => ({ ...prev, [MODAL_VISIBLE.type]: false }))
        }
      >
        <View style={{ padding: theme.sizes.font }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.black,
              textAlign: "center",
              lineHeight: 14 * 1.5,
            }}
          >
            {renderBuilderType(profile?.builder?.typeID)}
          </Text>
        </View>
      </InfoModal>

      <InfoModal
        visible={visible[MODAL_VISIBLE.construction]}
        title="Mô tả loại công trình"
        onClose={() =>
          setVisible((prev) => ({
            ...prev,
            [MODAL_VISIBLE.construction]: false,
          }))
        }
      >
        <View style={{ padding: theme.sizes.font }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.black,
              textAlign: "center",
              lineHeight: 14 * 1.5,
            }}
          >
            {renderConstructionType(construction)}
          </Text>
        </View>
      </InfoModal>

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary400,
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
              size={theme.sizes.large + 2}
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
              Hồ sơ cá nhân
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <View style={styles.container}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Avatar.Image
                source={{ uri: profile?.avatar || NO_IMAGE_URL }}
                size={80}
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: theme.sizes.extraLarge,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    maxWidth: 80,
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(22,24,35,0.6)",
                      textAlign: "center",
                      lineHeight: 13 * 1.15,
                      fontSize: theme.sizes.font - 1,
                    }}
                  >
                    Năm kinh nghiệm
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.sizes.font,
                      fontWeight: "500",
                      marginTop: theme.sizes.base - 2,
                    }}
                  >
                    {profile?.builder?.experience || 0}
                  </Text>
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    maxWidth: 80,
                    marginLeft: theme.sizes.extraLarge,
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(22,24,35,0.6)",
                      fontSize: theme.sizes.small,
                      textAlign: "center",
                      lineHeight: 13 * 1.15,
                      fontSize: theme.sizes.font - 1,
                    }}
                  >
                    Lời mời việc làm
                  </Text>
                  <Text
                    style={{
                      marginTop: theme.sizes.base - 2,

                      fontSize: theme.sizes.font,
                      fontWeight: "500",
                    }}
                  >
                    {profile?.builder?.inviteCount || 0}
                  </Text>
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    maxWidth: 80,
                    marginLeft: theme.sizes.extraLarge,
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(22,24,35,0.6)",
                      fontSize: theme.sizes.small,
                      textAlign: "center",
                      lineHeight: 13 * 1.15,
                      fontSize: theme.sizes.font - 1,
                    }}
                  >
                    Việc làm ứng tuyển
                  </Text>
                  <Text
                    style={{
                      marginTop: theme.sizes.base - 2,

                      fontSize: theme.sizes.font,
                      fontWeight: "500",
                    }}
                  >
                    {profile?.builder?.appliedCount || 0}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    marginTop: theme.sizes.medium,
                    fontSize: theme.sizes.medium,
                    fontWeight: "600",
                    marginBottom: theme.sizes.base / 4,
                  }}
                >
                  {profile?.firstName +
                    " " +
                    profile?.lastName +
                    " - " +
                    moment().diff(profile?.dob, "years") +
                    " tuổi"}
                </Text>
                {userInfo && userInfo?.status === 2 && userInfo?.premium ? (
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
                  marginTop: theme.sizes.small,
                }}
              >
                {profile?.address ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: theme.sizes.base / 2,
                    }}
                  >
                    <Ionicons name="location" size={theme.sizes.medium} />
                    <Text
                      style={{
                        marginLeft: theme.sizes.base,
                        fontSize: theme.sizes.font - 2,
                        textTransform: "capitalize",
                      }}
                    >
                      {userInfo && userInfo?.status === 2 && userInfo?.premium
                        ? profile?.address
                        : profile?.address.slice(0, -10) + "**********"}
                    </Text>
                  </View>
                ) : null}
                {profile?.email ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: theme.sizes.base / 2,
                    }}
                  >
                    <Ionicons name="mail" size={theme.sizes.medium} />
                    <Text
                      style={{
                        marginLeft: theme.sizes.base,
                        fontSize: theme.sizes.font - 2,
                      }}
                    >
                      {userInfo && userInfo?.status === 2 && userInfo?.premium
                        ? profile?.email
                        : profile?.email.slice(0, -15) + "***************"}
                    </Text>
                  </View>
                ) : null}

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather name="phone" size={theme.sizes.medium} />
                  <Text
                    style={{
                      marginLeft: theme.sizes.base,
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    {userInfo && userInfo?.status === 2 && userInfo?.premium
                      ? profile?.phone
                      : profile?.phone.slice(0, -5) + "*****"}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                marginTop: theme.sizes.small,
              }}
            >
              {renderActions()}
            </View>
          </View>

          <View
            style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.09)" }}
          ></View>

          <View
            style={[
              styles.container,
              {
                backgroundColor: "white",
                marginVertical: theme.sizes.base,
                paddingTop: theme.sizes.small,
              },
            ]}
          >
            <View
              style={{
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                hồ sơ brix
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: theme.sizes.base / 2,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.font,
                  }}
                >
                  {renderGender(profile?.gender) + " là"}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      opacity: 0.55,
                    },
                    {
                      marginHorizontal: 5,
                    },
                  ]}
                  onPress={() =>
                    setVisible((prev) => ({
                      ...prev,
                      [MODAL_VISIBLE.type]: true,
                    }))
                  }
                >
                  <Text
                    style={{
                      color: COLOR.blue400,
                      fontSize: theme.sizes.font,
                      textDecorationLine: "underline",
                      textTransform: "lowercase",
                      fontWeight: "bold",
                    }}
                  >
                    {profile?.builder?.typeName}
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontSize: theme.sizes.font,
                  }}
                >
                  chuyên làm
                </Text>
                <View>
                  {profile?.builder?.constructionType.map((item, idx) => {
                    return (
                      <Pressable
                        key={idx}
                        style={({ pressed }) => [
                          pressed && {
                            opacity: 0.55,
                          },
                          {
                            marginLeft: 5,
                          },
                        ]}
                        onPress={() => {
                          setConstruction(item.name);
                          setVisible((prev) => ({
                            ...prev,
                            [MODAL_VISIBLE.construction]: true,
                          }));
                        }}
                      >
                        <Text
                          style={{
                            color: COLOR.blue400,
                            fontSize: theme.sizes.font,
                            textDecorationLine: "underline",
                            textTransform: "lowercase",
                            fontWeight: "bold",
                          }}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {renderDetailContent(PROFILE_FORM.skills)}
          </View>

          <View
            style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.05)" }}
          ></View>

          {[PROFILE_FORM.experience, PROFILE_FORM.certificate].map(
            (item, idx) => {
              return <View key={idx}>{renderDetailContent(item)}</View>;
            }
          )}

          {commitments.length !== 0 ? (
            <View
              style={[
                styles.container,
                {
                  backgroundColor: "white",
                  paddingBottom: 0,
                  marginBottom: bottomHeight,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                Công trình đã tham gia
              </Text>

              <View>
                {commitments.map((item, index) =>
                  renderPostItem({ item, index })
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Animated.View
        onLayout={({
          nativeEvent: {
            layout: { height },
          },
        }) => setBottomHeight(height - bottom)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          backgroundColor: "white",
          padding: theme.sizes.font,
          paddingBottom: bottom === 0 ? theme.sizes.font : bottom,
          borderTopColor: "rgba(22,24,35,0.06)",
          borderTopWidth: 1,
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [240, 250, 280, 300],
                outputRange: [200, 200, 0, 0],
                extrapolateLeft: "clamp",
              }),
            },
          ],
        }}
      >
        {renderActions()}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default ProfileScreen;
