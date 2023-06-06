import { AntDesign, Ionicons } from "@expo/vector-icons";
import _ from "lodash";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { RadioGroup } from "react-native-radio-buttons-group";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { BILL_STATUS_ENUM, ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { BillServices } from "~/services";

const BASE_RADIO_STYLE = {
  containerStyle: {
    marginBottom: 15,
  },
  borderSize: 1.35,
  borderColor: "rgba(22,24,35,0.44)",
  size: 20,
  color: "#6D45C1",
  labelStyle: {
    marginLeft: 14,
    fontSize: 13.5,
  },
  selected: false,
};

const MOCK_DATA = {
  REASON_LIST: [
    {
      id: _.uniqueId(),
      label: "Tôi muốn thay đổi sản phẩm (kích thước, màu sắc, số lượng...)",
      value: 0,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Đơn đặt hàng được tạo do có sự nhầm lẫn",
      value: 1,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Tôi tìm thấy chỗ mua khác tốt hơn (Rẻ hơn, uy tín hơn...)",
      value: 2,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Tôi không có nhu cầu mua nữa",
      value: 5,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Tôi không tìm thấy lý do hủy phù hợp",
      value: 6,
      ...BASE_RADIO_STYLE,
    },
  ],
  REASON_LIST_RP: [
    {
      id: _.uniqueId(),
      label: "Tên sản phẩm không hợp lệ",
      value: 0,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Mô tả sản phẩm không đúng",
      value: 1,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Giá sản phẩm không hợp lệ",
      value: 2,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Hình ảnh sản phẩm không hợp lệ",
      value: 3,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Sản phẩm không cập nhật số lượng",
      value: 4,
      ...BASE_RADIO_STYLE,
    },
  ],
  REASON_LIST_POST: [
    {
      id: _.uniqueId(),
      label: "Tên bài viết không hợp lệ",
      value: 0,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Mức lương quá thấp với công việc",
      value: 1,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Mô tả bài viết không hợp lệ",
      value: 2,
      ...BASE_RADIO_STYLE,
    },
    {
      id: _.uniqueId(),
      label: "Ngày giờ làm việc không hợp lý",
      value: 3,
      ...BASE_RADIO_STYLE,
    },
  ],
};

const ReasonModal = ({
  type,
  visible,
  onClose,
  billID,
  callback = () => {},
}) => {
  const { REASON_LIST, REASON_LIST_RP, REASON_LIST_POST } = MOCK_DATA;
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(
    _.cloneDeep(
      type == 0 ? REASON_LIST : type == 1 ? REASON_LIST_RP : REASON_LIST_POST
    )
  );

  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isDirty = useMemo(() => list.some((x) => x.selected), [list]);

  const handledSubmit = async () => {
    setLoading(true);
    const selectedItem = list.find((x) => x.selected);
    if (type === 0) {
      const { isSuccess, data } = await BillServices.updateBillStatus(billID, {
        status:
          userInfo?.role?.toLowerCase() === ROLE.store
            ? BILL_STATUS_ENUM.indexOf("Decline")
            : BILL_STATUS_ENUM.indexOf("Cancel"),
        message: selectedItem.label,
      });
      if (isSuccess) {
        callback({ reason: selectedItem.label, data });
      }
      setLoading(false);
      onClose();
    } else {
      callback({ reason: selectedItem.label, data: selectedItem.value });
      setLoading(false);
      onClose();
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 1,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 200,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 0,
        tension: 100,
        friction: 30,
        delay: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.27)",
            zIndex: -1,
          }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: "white",
            transform: [{ translateY: translateY }],
            opacity: opacity,
            borderTopLeftRadius: theme.sizes.base / 2,
            borderTopRightRadius: theme.sizes.base / 2,
          }}
        >
          {loading && (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.67)",
                padding: theme.sizes.small,
                position: "absolute",
                top: "15%",
                left: "50%",
                zIndex: 1000,
                transform: [{ translateX: -20 }],
              }}
            >
              <ActivityIndicator size={24} color="white" />
            </View>
          )}

          {/* header */}
          <View
            style={{
              paddingVertical: theme.sizes.large,
              justifyContent: "center",
              alignItems: "center",
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: theme.sizes.medium, fontWeight: "600" }}>
              {type == 0
                ? "Cho chúng tôi biết lí do bạn hủy"
                : type == 1
                ? "Cho chúng tôi biết lí do bạn báo cáo sản phẩm"
                : "Cho chúng tôi biết lí do bạn báo cáo bài viết"}
            </Text>

            <View
              style={{
                width: 25,
                height: 25,
                position: "absolute",
                right: theme.sizes.font,
                top: "60%",
                zIndex: 1,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.06)",
                  },
                  { flex: 1, justifyContent: "center", alignItems: "center" },
                ]}
                onPress={onClose}
              >
                <Ionicons name="close" size={22} color="black" />
              </Pressable>
            </View>
          </View>

          <View>
            {/* warning  */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: theme.sizes.font,
                backgroundColor: "rgba(237,164,74, 0.1)",
              }}
            >
              <AntDesign
                name="exclamationcircle"
                size={18}
                color={theme.colors.highlight}
              />
              <Text
                style={{
                  marginLeft: theme.sizes.font,
                  lineHeight: theme.sizes.font * 1.25,
                  fontSize: theme.sizes.font - 1,
                  flex: 1,
                  color: theme.colors.highlight,
                }}
              >
                {type == 0
                  ? "Bạn có biết? Nếu bạn xác nhận hủy, toàn bộ đơn hàng sẽ được hủy. Chọn lí do hủy phù hợp nhất với bạn nhé!"
                  : "Lưu ý hãy báo cáo đúng sự thật để ứng dụng mang đến trải nghiệm tốt nhất"}
              </Text>
            </View>

            {/* reason list */}
            <RadioGroup
              containerStyle={{
                alignItems: "flex-start",
                width: "100%",
                paddingRight: 14,
                paddingLeft: theme.sizes.base / 2,
                paddingTop: theme.sizes.font,
                paddingBottom: theme.sizes.extraLarge,
              }}
              radioButtons={list}
              onPress={(_list) => setList([..._list])}
            />

            {/* footer */}
            <View
              style={{
                paddingTop: theme.sizes.small,
                paddingHorizontal: theme.sizes.small,
                paddingBottom: bottom === 0 ? theme.sizes.large : bottom,
                borderTopColor: "rgba(22,24,35,0.12)",
                borderTopWidth: 1,
                flexDirection: "row",
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: isDirty
                    ? theme.colors.primary400
                    : "rgba(22,24,35,0.12)",
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
                      padding: theme.sizes.font,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                  onPress={handledSubmit}
                >
                  <Text
                    style={{
                      color: isDirty ? "white" : "rgba(22,24,35,0.34)",
                      fontSize: theme.sizes.medium,
                      fontWeight: "600",
                    }}
                  >
                    Xác nhận
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ReasonModal;
