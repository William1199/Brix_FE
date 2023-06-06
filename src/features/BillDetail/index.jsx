import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import moment from "moment";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import "react-native-get-random-values";
import { Avatar, useTheme } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";

import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import _ from "lodash";
import { Animated } from "react-native";
import Toast from "react-native-toast-message";
import { chatClient } from "~/app/chatConfig";
import { ConfirmDialog, Loading, StatusBarComp } from "~/components";
import {
  BILL_STATUS_ENUM,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import { BillServices } from "~/services";
import { formatStringToCurrency } from "~/utils/helper";
import ReasonModal from "./ReasonModal";

const BlockItem = ({
  children,
  title,
  style = {},
  childrenStyle = {},
  renderTitleContent,
}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          paddingHorizontal: theme.sizes.large,
          paddingVertical: theme.sizes.large,
        },
        style,
      ]}
    >
      {typeof renderTitleContent === "function" ? (
        renderTitleContent()
      ) : (
        <Text
          style={{
            color: "rgba(22,24,35,1)",
            fontWeight: "600",
            fontSize: theme.sizes.font + 1,
          }}
        >
          {title}
        </Text>
      )}

      <View
        style={[
          {
            marginTop: theme.sizes.font,
          },
          childrenStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const MOCK_DATA = {
  customStyles: (theme) => ({
    stepIndicatorSize: 35,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 0,
    stepStrokeCurrentColor: theme.colors.primary300,
    stepStrokeWidth: 0,
    stepStrokeFinishedColor: theme.colors.primary300,
    separatorFinishedColor: theme.colors.primary300,
    separatorUnFinishedColor: "rgba(22,24,35,0.1)",
    stepIndicatorFinishedColor: theme.colors.primary300,
    stepIndicatorUnFinishedColor: "#e7e7e7",
    stepIndicatorCurrentColor: theme.colors.primary300,
    labelSize: 13,
    currentStepLabelColor: theme.colors.primary300,
  }),
  labels: ["Đặt hàng", "Giao hàng", "Nhận hàng", "Xác nhận"],
  BILL_DETAIL: [
    { label: "Ngày đặt hàng", value: "startDate", type: "date" },
    { label: "Ngày giao hàng", value: "_lastModifiedAt", type: "date" },
  ],
  BOTTOM_ACTION_HEIGHT: 70,
  HEADER_CONTENT: {
    [BILL_STATUS_ENUM.indexOf("Pending")]: {
      title: "Đợi xác nhận",
      desc: (startDate) =>
        `<p>Khởi tạo vào <b>${startDate}</b>. Đơn hàng của bạn sẽ sớm được xác nhận từ đơn vị dịch vụ.</p>`,
    },
    [BILL_STATUS_ENUM.indexOf("Accepted")]: {
      title: "Đang giao hàng",
      desc: (endDate) => `<p>Đơn hàng đang được giao</p>`,
    },
    [BILL_STATUS_ENUM.indexOf("Decline")]: {
      title: "Bị từ chối",
      desc: (_lastModifiedAt, reason) =>
        `<p>Đã bị từ chối vào <b>${_lastModifiedAt}</b>. Vì <b>${reason?.toLowerCase()}</b></p>`,
    },
    [BILL_STATUS_ENUM.indexOf("Cancel")]: {
      title: "Bị hủy",
      desc: (_lastModifiedAt, reason) =>
        `<p>Đã bị hủy vào <b>${_lastModifiedAt}</b>. Vì <b>${reason?.toLowerCase()}</b></p>`,
    },
    [BILL_STATUS_ENUM.indexOf("Paid")]: {
      title: "Giao hàng",
      desc: (_lastModifiedAt) =>
        `<p>Đơn hàng đã được giao cho bên vận chuyển vào <b>${_lastModifiedAt}</b></p>`,
    },
    [BILL_STATUS_ENUM.indexOf("Success")]: {
      title: "Đã giao",
      desc: (_lastModifiedAt) =>
        `<p>Đã giao hàng vào <b>${_lastModifiedAt}</b>`,
    },
  },
  PROGRESS_LABEL: {
    [BILL_STATUS_ENUM.indexOf("Pending")]: {
      title: "Đợi xác nhận",
      desc: "Đơn hàng của bạn sẽ sớm được xác nhận từ đơn vị dịch vụ.",
    },
    [BILL_STATUS_ENUM.indexOf("Accepted")]: {
      title: "Đang giao hàng",
      desc: "Đơn hàng đang được giao",
    },
    [BILL_STATUS_ENUM.indexOf("Decline")]: {
      title: "Bị từ chối",
      desc: "Đơn hàng đã bị từ chối",
    },
    [BILL_STATUS_ENUM.indexOf("Cancel")]: {
      title: "Bị hủy",
      desc: "Đơn hàng đã bị hủy",
    },
    [BILL_STATUS_ENUM.indexOf("Paid")]: {
      title: "Đang giao hàng",
      desc: "Đơn hàng đang được giao đến bạn vào thời gian sớm nhất.",
    },
    [BILL_STATUS_ENUM.indexOf("Success")]: {
      title: "Đã giao",
      desc: "Kiện hàng của bạn đã được giao",
    },
  },
};

const BillDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const {
    customStyles,
    labels,
    BILL_DETAIL,
    BOTTOM_ACTION_HEIGHT,
    HEADER_CONTENT,
    PROGRESS_LABEL,
  } = MOCK_DATA;
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const { setChannel } = useContext(ChatContext);
  const { top, bottom } = useSafeAreaInsets();

  const [billDetail, setBillDetail] = useState();
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleModal, setVisibleModal] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);
  const [confirm3, setConfirm3] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef();

  const hasRenderFooter = useMemo(() => {
    if (_.isEmpty(billDetail)) return false;

    if (
      (billDetail.bill.status === BILL_STATUS_ENUM.indexOf("Accepted") &&
        userInfo.role.toLowerCase() === ROLE.store) ||
      billDetail.bill.status === BILL_STATUS_ENUM.indexOf("Pending") ||
      (billDetail.bill.status === BILL_STATUS_ENUM.indexOf("Paid") &&
        userInfo.role.toLowerCase() !== ROLE.store) ||
      (billDetail.bill.status === BILL_STATUS_ENUM.indexOf("Cancel") &&
        userInfo.role.toLowerCase() !== ROLE.store) ||
      (billDetail.bill.status === BILL_STATUS_ENUM.indexOf("Success") &&
        userInfo.role.toLowerCase() !== ROLE.store)
    )
      return true;

    return false;
  }, [billDetail, userInfo]);

  // animation bottom actions
  const clampedScroll = Animated.diffClamp(
    Animated.add(
      scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: "clamp",
      }),
      offsetAnim
    ),
    0,
    BOTTOM_ACTION_HEIGHT
  );

  const currentPosition = useMemo(() => {
    switch (billDetail?.bill?.status) {
      case BILL_STATUS_ENUM.indexOf("Pending"):
      case BILL_STATUS_ENUM.indexOf("Decline"):
      case BILL_STATUS_ENUM.indexOf("Cancel"): {
        return 0;
      }

      case BILL_STATUS_ENUM.indexOf("Accepted"): {
        return 1;
      }

      case BILL_STATUS_ENUM.indexOf("Paid"): {
        return 2;
      }
      default: {
        return 3;
      }
    }
  }, [billDetail]);

  const BILL_DETAIL_MAP = useMemo(
    () =>
      BILL_DETAIL.map((item) => ({
        ...item,
        value:
          item.type === "date"
            ? moment(billDetail?.bill?.[item.value]).format("DD MMM, YYYY LT")
            : item.value === "custom"
            ? "Cash on delivery"
            : billDetail?.bill?.[item.value],
      })),
    [billDetail]
  );

  useEffect(() => {
    (async () => {
      const data = await BillServices.getDetail(id);

      setBillDetail(data);
      if (!_.isEmpty(data)) setLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, [])
  );

  const handleUpdateStatus = async (status) => {
    setSubLoading(true);
    const { isSuccess } = await BillServices.updateBillStatus(
      billDetail?.bill?.id,
      {
        status,
      }
    );
    setSubLoading(false);
    if (isSuccess) {
      setBillDetail((prev) => ({ ...prev, bill: { ...prev.bill, status } }));
      Toast.show({
        type: "success",
        text1: "Cập nhật trạng thái thành công!",
        position: "bottom",
        visibilityTime: 2500,
      });
    }
  };

  const handleChat = async () => {
    const channel = chatClient.channel("messaging", {
      members: [userInfo?.id, billDetail?.store.userId],
    });
    await channel.create();
    setChannel(channel);
    navigation.navigate(ROUTE.channel);
  };

  const getStepIndicatorIconConfig = useCallback(
    ({ position, stepStatus }) => {
      const iconConfig = {
        name: "feed",
        color:
          stepStatus === "current" || stepStatus === "finished"
            ? theme.colors.textColor300
            : "black",
        size: stepStatus === "current" ? theme.sizes.large : theme.sizes.medium,
      };
      switch (position) {
        case 0: {
          iconConfig.name = "ios-document-text-outline";
          break;
        }
        case 1: {
          iconConfig.name = "card";
          break;
        }
        case 2: {
          iconConfig.name = "albums-outline";
          break;
        }
        default: {
          iconConfig.name = "checkmark-done-outline";
          break;
        }
      }
      return iconConfig;
    },
    [currentPosition]
  );

  const renderLabel = ({ label, stepStatus }) => {
    return (
      <Text
        style={
          stepStatus === "current" || stepStatus === "finished"
            ? {
                fontSize: 12,
                textAlign: "center",
                fontWeight: "600",
                color: theme.colors.primary300,
              }
            : {
                fontSize: 12,
                textAlign: "center",
                fontWeight: "500",
                color: "#999999",
              }
        }
      >
        {label}
      </Text>
    );
  };

  const renderStepIndicator = (params) => (
    <Ionicons {...getStepIndicatorIconConfig(params)} />
  );

  const renderContent = () => {
    return (
      <>
        {/* product list */}
        <BlockItem
          renderTitleContent={() => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => {
                  const [firstName, ...lastName] =
                    billDetail?.store?.storeName?.split(" ");
                  const storeInfo = {
                    firstName,
                    lastName: lastName?.join(" "),
                    image: billDetail?.store?.avatar,
                  };
                  navigation.navigate(ROUTE.storeDetail, {
                    id: billDetail?.store?.id,
                    storeInfo,
                    userId: billDetail?.store?.userId,
                  });
                }}
              >
                <Avatar.Image
                  size={30}
                  source={{ uri: billDetail.store.avatar || NO_IMAGE_URL }}
                />
                <Text
                  style={{ marginLeft: theme.sizes.small, fontWeight: "bold" }}
                >
                  {billDetail.store.storeName}
                </Text>

                <Entypo
                  name="chevron-small-right"
                  size={20}
                  color="rgba(22,24,35,0.34)"
                />
              </Pressable>
              <Pressable onPress={handleChat}>
                <Feather
                  name="message-circle"
                  size={theme.sizes.large}
                  color="rgba(22,24,35,0.44)"
                />
              </Pressable>
            </View>
          )}
          childrenStyle={{
            marginTop: theme.sizes.base,
          }}
        >
          <View
            style={{
              paddingVertical: theme.sizes.small,
            }}
          >
            {billDetail?.details?.[
              billDetail?.details?.length - 1
            ]?.productBillDetail?.map((item, idx, arr) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: idx !== arr.length - 1 ? theme.sizes.medium : 0,
                }}
              >
                <View
                  style={{
                    width: 85,
                    height: 85,
                    backgroundColor: "white",
                    padding: theme.sizes.base,
                    borderColor: "rgba(22,24,35,0.06)",
                    borderWidth: 1,
                    borderRadius: 2,
                  }}
                >
                  <Image
                    source={{ uri: item.image || NO_IMAGE_URL }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                <View
                  style={{
                    marginLeft: theme.sizes.small + 2,
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: theme.sizes.font + 1,
                    }}
                    numberOfLines={2}
                  >
                    {item.productName}
                  </Text>

                  <Text
                    style={{
                      marginVertical: theme.sizes.base / 2,
                      color: "rgba(22,24,35,0.44)",
                      fontSize: theme.sizes.font - 1,
                    }}
                  >
                    {item.productBrand}
                  </Text>

                  {item.typeName && (
                    <View
                      style={{
                        backgroundColor: "rgba(22,24,35,0.05)",
                        alignSelf: "flex-start",
                        padding: theme.sizes.base / 2,
                        borderRadius: 4,
                        marginVertical: theme.sizes.base / 2,
                      }}
                    >
                      <Text
                        style={{
                          color: "rgba(22,24,35,0.54)",
                          fontSize: theme.sizes.font - 2,
                        }}
                      >
                        Phân loại: {item.typeName}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: theme.sizes.base / 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.font - 1,
                      }}
                    >
                      {formatStringToCurrency(item.unitPrice.toString())}
                    </Text>

                    <Text
                      style={{
                        fontSize: theme.sizes.font - 1,
                        marginTop: theme.sizes.base / 3,
                      }}
                      numberOfLines={1}
                    >
                      x{item.billDetailQuantity} {item.unit}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </BlockItem>

        {/* product note */}
        {billDetail?.bill?.note && (
          <BlockItem title="Ghi chú" style={{ paddingTop: theme.sizes.small }}>
            <View
              style={{
                backgroundColor: "rgb(244,246,248)",
                paddingHorizontal: theme.sizes.font,
                paddingVertical: theme.sizes.small,
                borderRadius: theme.sizes.small,
              }}
            >
              <RenderHTML
                contentWidth={width}
                source={{
                  html: billDetail?.bill?.note || "",
                }}
                defaultTextProps={{
                  style: {
                    fontWeight: "500",
                    lineHeight: theme.sizes.large,
                  },
                }}
              />
            </View>
          </BlockItem>
        )}
      </>
    );
  };

  const renderFooterContent = () => {
    switch (billDetail?.bill?.status) {
      case BILL_STATUS_ENUM.indexOf("Success"):
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
              borderColor: "rgba(22,24,35,0.12)",
              borderWidth: 1,
              marginRight: theme.sizes.small,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.12)",
                },
                {
                  flex: 1,
                  padding: theme.sizes.font - 1,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {/* <Text
                  style={{
                    color: "rgba(22,24,35,1)",
                    fontWeight: "600",
                  }}
                >
                  Mua lại
                </Text> */}
            </Pressable>
          </View>
        );

      case BILL_STATUS_ENUM.indexOf("Accepted"):
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary400,
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(0,0,0,0.27)",
                },
                {
                  padding: theme.sizes.medium,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => setConfirm2(true)}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                }}
              >
                Giao hàng
              </Text>
            </Pressable>
          </View>
        );

      case BILL_STATUS_ENUM.indexOf("Cancel"):
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary400,
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(0,0,0,0.27)",
                },
                {
                  padding: theme.sizes.medium,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                const itemChecked = billDetail.details[
                  billDetail.details.length - 1
                ].productBillDetail.reduce(
                  (init, cur) =>
                    cur.cartId ? { ...init, [cur.cartId]: true } : init,
                  {}
                );
                navigation.navigate(ROUTE.cart, {
                  defaultItemsChecked: { [billDetail.store.id]: itemChecked },
                });
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                }}
              >
                Mua lại
              </Text>
            </Pressable>
          </View>
        );

      case BILL_STATUS_ENUM.indexOf("Paid"):
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary400,
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(0,0,0,0.27)",
                },
                {
                  padding: theme.sizes.medium,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => setConfirm3(true)}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                }}
              >
                Đã nhận hàng
              </Text>
            </Pressable>
          </View>
        );

      default: {
        return userInfo?.role?.toLowerCase() === ROLE.store ? (
          <>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: theme.sizes.base / 2,
                overflow: "hidden",
                borderColor: "rgba(22,24,35,0.34)",
                borderWidth: 1,
                marginRight: theme.sizes.small,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.12)",
                  },
                  {
                    flex: 1,
                    padding: theme.sizes.font - 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setVisibleModal(true)}
              >
                <Text
                  style={{
                    color: "rga(22,24,35)",
                    fontWeight: "600",
                  }}
                >
                  Hủy bỏ
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary400,
                borderRadius: theme.sizes.base / 2,
                overflow: "hidden",
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(0,0,0,0.27)",
                  },
                  {
                    flex: 1,
                    padding: theme.sizes.font - 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setConfirm1(true)}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  Chấp nhận
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
              borderColor: "rgba(22,24,35,0.34)",
              borderWidth: 0.5,
              marginRight: theme.sizes.small,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.03)",
                },
                {
                  flex: 1,
                  padding: theme.sizes.font - 1,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => setVisibleModal(true)}
            >
              <Text
                style={{
                  color: "rga(22,24,35)",
                  fontWeight: "600",
                }}
              >
                Hủy đơn hàng
              </Text>
            </Pressable>
          </View>
        );
      }
    }
  };

  const renderHeaderDescription = useCallback(() => {
    let value = "";
    switch (billDetail?.bill?.status) {
      case BILL_STATUS_ENUM.indexOf("Accepted"):
        value = moment(billDetail?.bill?.endDate).format(
          FORMAT_DATE_REGEX["DD MMM"]
        );
        break;
      case BILL_STATUS_ENUM.indexOf("Paid"):
        value = moment(billDetail?.bill?.paymentDate).format(
          FORMAT_DATE_REGEX["DD MMM"]
        );
        break;
      default:
        value = moment(billDetail?.bill?._lastModifiedAt).format("DD MMM");
        break;
    }
    return (
      HEADER_CONTENT[billDetail?.bill?.status].desc(
        value,
        billDetail?.bill?.reason
      ) || ""
    );
  }, [billDetail]);

  if (loading) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {visibleModal && (
        <ReasonModal
          type={0}
          visible={visibleModal}
          billID={billDetail.bill.id}
          onClose={() => setVisibleModal(false)}
          callback={({ reason, data }) => {
            setBillDetail((prev) => {
              const prevDetails = _.cloneDeep(prev.details[0]);
              const newProducts = prev.details[0].productBillDetail.map((x) => {
                const item =
                  data.find((v) => v.productID === x.productId) || {};
                return { ...x, cartId: item.id };
              });

              return {
                ...prev,
                bill: {
                  ...prev.bill,
                  status:
                    userInfo?.role?.toLowerCase() === ROLE.store
                      ? BILL_STATUS_ENUM.indexOf("Decline")
                      : BILL_STATUS_ENUM.indexOf("Cancel"),
                  reason,
                },
                details: [{ ...prevDetails, productBillDetail: newProducts }],
              };
            });
            Toast.show({
              type: "success",
              text1: "Đã thành công!",
              position: "bottom",
              visibilityTime: 2500,
            });
          }}
        />
      )}
      {confirm1 && (
        <ConfirmDialog
          visible={confirm1}
          confirmText="Xác nhận"
          onClose={() => setConfirm1(false)}
          onConfirm={() => {
            setConfirm1(false);
            handleUpdateStatus(BILL_STATUS_ENUM.indexOf("Accepted"));
          }}
        >
          <View style={{ padding: theme.sizes.font }}>
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                marginVertical: 10,
                fontWeight: "500",
              }}
            >
              Bạn có chắc chắn muốn chấp nhận đơn hàng?
            </Text>
          </View>
        </ConfirmDialog>
      )}
      {confirm2 && (
        <ConfirmDialog
          visible={confirm2}
          confirmText="Xác nhận"
          onClose={() => setConfirm2(false)}
          onConfirm={() => {
            setConfirm2(false);
            handleUpdateStatus(BILL_STATUS_ENUM.indexOf("Paid"));
          }}
        >
          <View style={{ padding: theme.sizes.font }}>
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                marginVertical: 10,
                fontWeight: "500",
              }}
            >
              Bạn có chắc chắn muốn giao đơn hàng?
            </Text>
          </View>
        </ConfirmDialog>
      )}
      {confirm3 && (
        <ConfirmDialog
          visible={confirm3}
          confirmText="Xác nhận"
          onClose={() => setConfirm3(false)}
          onConfirm={() => {
            setConfirm3(false);
            handleUpdateStatus(BILL_STATUS_ENUM.indexOf("Success"));
          }}
        >
          <View style={{ padding: theme.sizes.font }}>
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                marginVertical: 10,
                fontWeight: "500",
              }}
            >
              Bạn có chắc chắn đã nhận đơn hàng?
            </Text>
          </View>
        </ConfirmDialog>
      )}

      {subLoading && <Loading isModal />}

      <StatusBarComp
        backgroundColor="transparent"
        statusConfig={{ style: "dark" }}
      />

      {/* goback button */}
      <Pressable
        style={{
          position: "absolute",
          top: top + theme.sizes.small * 1.15,
          left: theme.sizes.large,
          zIndex: 10,
        }}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="left" size={theme.sizes.extraLarge} color="black" />
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          right: theme.sizes.large,
          top: top + theme.sizes.small * 1.15,
          zIndex: 10,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed && {
              opacity: 0.25,
            },
          ]}
        >
          <Feather name="printer" size={20} color="rgba(22,24,35,1)" />
        </Pressable>
      </View>

      <Animated.View
        style={{
          minHeight: 65,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          paddingTop: top + theme.sizes.small,
          paddingBottom: theme.sizes.small,
          zIndex: 9,
          justifyContent: "center",
          alignItems: "center",
          borderBottomColor: "rgba(22,24,35,0.12)",
          borderBottomWidth: 1,
          opacity: scrollY.interpolate({
            inputRange: [0, 30],
            outputRange: [0, 1],
          }),
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: theme.sizes.medium }}>
          {HEADER_CONTENT[billDetail.bill.status].title}
        </Text>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        bounces={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        {/* linear-gradient */}
        <LinearGradient
          colors={["rgba(238,174,202,0.4)", "rgba(148,187,233,0.4)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 100,
            paddingTop: top + theme.sizes.small,
            paddingRight: theme.sizes.large,
            paddingLeft: theme.sizes.large + theme.sizes.extraLarge * 1.25,
            zIndex: 8,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: theme.sizes.extraLarge - 1,
            }}
          >
            {HEADER_CONTENT[billDetail.bill.status].title}
          </Text>

          <RenderHTML
            contentWidth={width}
            source={{
              html: renderHeaderDescription(),
            }}
            defaultTextProps={{
              style: {
                fontSize: theme.sizes.font - 1,
                marginTop: -theme.sizes.base,
              },
            }}
          />
        </LinearGradient>

        {/* general info && progress */}
        <View style={{ paddingVertical: theme.sizes.large }}>
          <StepIndicator
            stepCount={4}
            customStyles={customStyles(theme)}
            currentPosition={currentPosition}
            renderStepIndicator={renderStepIndicator}
            renderLabel={renderLabel}
            labels={labels}
          />

          {/* step progress */}
          <View
            style={{
              paddingHorizontal: theme.sizes.large,
              marginTop: theme.sizes.font,
            }}
          >
            <Pressable
              style={{
                backgroundColor: "rgba(22,24,35,0.06)",
                paddingHorizontal: theme.sizes.font,
                paddingVertical: theme.sizes.small + 2,
                borderRadius: theme.sizes.base / 2,
              }}
              onPress={() => {
                navigation.navigate(ROUTE.billProgress, {
                  data: billDetail,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "500" }}>
                  {PROGRESS_LABEL[billDetail.bill.status].title}
                </Text>
                <Entypo
                  name="chevron-right"
                  size={theme.sizes.font + 1}
                  color="rgba(22,24,35,0.34)"
                />
              </View>
              <Text
                style={{
                  fontSize: theme.sizes.small + 2,
                  color: "rgba(22,24,35,0.54)",
                  marginTop: theme.sizes.base / 2,
                }}
              >
                {PROGRESS_LABEL[billDetail.bill.status].desc}
              </Text>
            </Pressable>
          </View>

          {/* user-info */}
          <View style={{ paddingHorizontal: theme.sizes.large }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: theme.sizes.font,
                borderTopColor: "rgba(22,24,35,0.08)",
                borderTopWidth: 1,
                marginTop: theme.sizes.font,
              }}
            >
              <Ionicons
                name="ios-location-sharp"
                size={theme.sizes.font}
                color="rgba(22,24,35,0.44)"
              />
              <Text
                style={{
                  fontWeight: "600",
                  marginRight: theme.sizes.small,
                }}
              >
                {billDetail.buyerInfo.name}
              </Text>
              <Text style={{ color: "rgba(22,24,35,0.64)" }}>
                {billDetail.buyerInfo.phone}
              </Text>
            </View>

            <Text
              style={{
                color: "rgba(22,24,35,0.44)",
                fontSize: theme.sizes.small + 2,
                marginTop: theme.sizes.base / 4,
              }}
            >
              {billDetail.buyerInfo.address}
            </Text>
          </View>
        </View>

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />

        {renderContent()}

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />

        <BlockItem
          title="Tóm tắt yêu cầu"
          childrenStyle={{ marginTop: theme.sizes.extraLarge - 2 }}
        >
          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: theme.sizes.large,
            }}
          >
            <Text
              style={{
                color: "rgba(22,24,35,0.7)",
                flex: 1,
              }}
            >
              Tổng phụ
            </Text>
            <View
              style={{
                flex: 2,
                alignItems: "flex-end",
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,0.7)",
                }}
              >
                {formatStringToCurrency(billDetail.bill.totalPrice.toString())}
              </Text>
            </View>
          </View> */}

          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: theme.sizes.large,
            }}
          >
            <Text
              style={{
                color: "rgba(22,24,35,0.7)",
                flex: 1,
              }}
            >
              Thuế (10%)
            </Text>
            <View
              style={{
                flex: 2,
                alignItems: "flex-end",
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,0.7)",
                }}
              >
                {formatStringToCurrency(
                  (0.1 * billDetail.bill.totalPrice).toString()
                )}
              </Text>
            </View>
          </View> */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: theme.sizes.large,
            }}
          >
            <Text
              style={{
                color: "rgba(22,24,35,0.7)",
                flex: 1,
              }}
            >
              Tổng cộng
            </Text>
            <View
              style={{
                flex: 2,
                alignItems: "flex-end",
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,1)",
                  fontWeight: "bold",
                }}
              >
                {formatStringToCurrency(billDetail.bill.totalPrice.toString())}
              </Text>
            </View>
          </View>
        </BlockItem>

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />

        <BlockItem
          title="Chi tiết đơn hàng"
          childrenStyle={{ marginTop: theme.sizes.extraLarge - 2 }}
        >
          {BILL_DETAIL_MAP.map((item, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: theme.sizes.large,
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,0.7)",
                  flex: 1,
                }}
              >
                {item.label}
              </Text>
              <View
                style={{
                  flex: 2,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    color: "rgba(22,24,35,0.7)",
                  }}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </BlockItem>

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />

        {/* contacts */}
        <View>
          <View
            style={{
              backgroundColor: "white",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.06)",
                },
                {
                  padding: theme.sizes.large,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Pressable
                onPress={() => handleChat()}
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.12)",
                  },
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <MaterialCommunityIcons
                  name="contacts-outline"
                  size={theme.sizes.large + 2}
                  color="rgba(22,24,35,0.44)"
                />
                <Text
                  style={{
                    marginLeft: theme.sizes.font,
                    fontSize: theme.sizes.medium - 1,
                    fontWeight: "500",
                  }}
                >
                  Liên hệ với người bán
                </Text>
              </Pressable>
              <Entypo
                name="chevron-small-right"
                size={24}
                color="rgba(22,24,35,0.34)"
              />
            </Pressable>
          </View>
        </View>

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />
      </ScrollView>

      {/* footer */}
      {hasRenderFooter && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: theme.sizes.small,
            paddingHorizontal: theme.sizes.large,
            paddingBottom: bottom === 0 ? theme.sizes.large : bottom,
            borderTopColor: "rgba(22,24,35,0.12)",
            borderTopWidth: 1,
            flexDirection: "row",
            minHeight: BOTTOM_ACTION_HEIGHT,
            backgroundColor: "white",
            opacity: clampedScroll.interpolate({
              inputRange: [0, 30, BOTTOM_ACTION_HEIGHT],
              outputRange: [1, 0.5, 0],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: clampedScroll.interpolate({
                  inputRange: [0, BOTTOM_ACTION_HEIGHT],
                  outputRange: [1, BOTTOM_ACTION_HEIGHT],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          {renderFooterContent()}
        </Animated.View>
      )}
    </View>
  );
};

export default BillDetailScreen;
