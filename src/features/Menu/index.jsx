import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { ConfirmDialog, ModalView } from "~/components";
import { FORMAT_DATE_REGEX, NOW, NO_IMAGE_URL, ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import ActivationModal from "./components/ActivationModal";

const Menu = ({ navigation }) => {
  const WIDTH = Dimensions.get("window").width;
  const theme = useTheme();
  const [endDate, setEndDate] = useState(new Date());
  const [isOver, setIsOver] = useState(false);
  const [check, setCheck] = useState(true);

  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const { logout, userInfo } = useContext(AuthContext);
  const { setUnreadCount } = useContext(ChatContext);
  const [confirm, setConfirm] = useState(false);
  const [confirm2, setConfirm2] = useState(false);

  const handlePremium = async () => {
    try {
      const res = await axiosInstance.post("payment/checkRefund");
      if (res.data) {
        setEndDate(res.data.endDate);
        setIsOver(res.data.isOver);
        setCheck(false);
      } else {
        setEndDate(new Date());
        setIsOver(false);
        setCheck(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleRefund = async () => {
    try {
      await axiosInstance.post("payment/UpdateRefund");
      setCheck(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      handlePremium();
    }
  }, []);
  return (
    <SafeAreaView style={{ paddingTop: theme.sizes.font, flex: 1 }}>
      {/* header */}
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor: "rgba(22,24,35,0.06)",
            borderBottomWidth: 1,
          },
          styles.container,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.25 }}
            onPress={() => navigation.closeDrawer()}
          >
            <Entypo
              name="chevron-thin-left"
              size={theme.sizes.extraLarge}
              color="rgba(22,24,35,0.64)"
            />
          </Pressable>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: theme.sizes.extraLarge,
              marginLeft: theme.sizes.small,
            }}
          >
            Thông tin
          </Text>
        </View>

        <Pressable>
          <Ionicons
            style={{
              opacity: 0,
            }}
            name="search-outline"
            size={theme.sizes.extraLarge}
          />
        </Pressable>
      </View>

      {/* profile */}
      {userInfo && (
        <>
          <View
            style={[
              {
                backgroundColor: "rgba(100, 149, 237, 0.15)",
                padding: theme.sizes.font,
                paddingHorizontal: theme.sizes.large,
                paddingTop: theme.sizes.font,
                flexDirection: "row",
                alignItems: "flex-start",
                width: "100%",
              },
              styles.container,
            ]}
          >
            <Image
              source={{ uri: userInfo?.avatar || NO_IMAGE_URL }}
              style={{
                width: 75,
                height: 75,
                borderRadius: 100,
              }}
            />
            <View
              style={{
                marginRight: theme.sizes.small,
                marginLeft: theme.sizes.font,
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: theme.sizes.medium,
                  marginBottom: theme.sizes.base,
                }}
              >
                {userInfo.firstName + " " + userInfo.lastName}
              </Text>
              <Text
                style={{
                  marginBottom: theme.sizes.base,
                  color: "rgba(22,24,35,0.64)",
                }}
              >
                {userInfo.status !== (0 && 2) &&
                  "Cần cập nhật thông tin bắt buộc"}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                ]}
                onPress={() => navigation.navigate(ROUTE.myProfile)}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.font + 1,
                    marginBottom: theme.sizes.base - 2,
                    color: "blue",
                    textTransform: "capitalize",
                  }}
                >
                  Thông tin tài khoản
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "space-between",
                flexWrap: "wrap",
                marginTop: 15,
              },
              styles.container,
            ]}
          >
            {userInfo?.role?.toLowerCase() !== ROLE.store ? (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  { width: "46%" },
                ]}
                onPress={() => navigation.navigate(ROUTE.viewAllCommitment)}
              >
                <View
                  style={{
                    padding: theme.sizes.small + 2,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    minHeight: 130,
                    borderWidth: 3,
                    borderColor: theme.colors.borderColor,
                  }}
                >
                  <MaterialCommunityIcons
                    name="contacts"
                    size={60}
                    color={theme.colors.primary300}
                  />
                  <Text
                    style={{
                      color: theme.colors.primary300,
                      fontWeight: "600",
                      textTransform: "capitalize",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    Xem cam kết
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  { width: "46%" },
                ]}
                onPress={() => navigation.navigate(ROUTE.viewReportedProduct)}
              >
                <View
                  style={{
                    padding: theme.sizes.small + 2,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    minHeight: 130,
                    borderWidth: 3,
                    borderColor: theme.colors.borderColor,
                  }}
                >
                  <MaterialCommunityIcons
                    name="sticker-alert"
                    size={60}
                    color={theme.colors.primary300}
                  />
                  <Text
                    style={{
                      color: theme.colors.primary300,
                      fontWeight: "600",
                      textTransform: "capitalize",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    Xem báo cáo
                  </Text>
                </View>
              </Pressable>
            )}

            {userInfo?.role?.toLowerCase() !== ROLE.builder && (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  { width: "46%", marginLeft: 4 },
                ]}
                onPress={() => navigation.navigate(ROUTE.viewAllBill)}
              >
                <View
                  style={{
                    padding: theme.sizes.small + 2,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    minHeight: 130,
                    borderWidth: 3,
                    borderColor: theme.colors.borderColor,
                  }}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={60}
                    color={theme.colors.highlight}
                  />
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      textTransform: "capitalize",
                      marginTop: 10,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Lịch sử đơn hàng
                  </Text>
                </View>
              </Pressable>
            )}

            {userInfo?.role?.toLowerCase() === ROLE.contractor && (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  { width: "46%" },
                ]}
                onPress={() => navigation.navigate(ROUTE.viewReportedPost)}
              >
                <View
                  style={{
                    padding: theme.sizes.small + 2,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    minHeight: 130,
                    borderWidth: 3,
                    borderColor: theme.colors.borderColor,
                    marginTop: 20,
                  }}
                >
                  <MaterialCommunityIcons
                    name="sticker-alert"
                    size={60}
                    color={theme.colors.primary300}
                  />
                  <Text
                    style={{
                      color: theme.colors.primary300,
                      fontWeight: "600",
                      textTransform: "capitalize",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    Xem báo cáo
                  </Text>
                </View>
              </Pressable>
            )}

            {userInfo?.role?.toLowerCase() !== ROLE.builder && (
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.55,
                  },
                  { width: "46%", marginLeft: 4, marginTop: 20 },
                ]}
                onPress={() => navigation.navigate(ROUTE.paymentHistory)}
              >
                <View
                  style={{
                    padding: theme.sizes.small + 2,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    minHeight: 130,
                    borderWidth: 3,
                    borderColor: theme.colors.borderColor,
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-cash"
                    size={60}
                    color={theme.colors.highlight}
                  />
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      textTransform: "capitalize",
                      marginTop: 10,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Lịch sử kích hoạt
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {userInfo?.role?.toLowerCase() !== ROLE.builder &&
            (check ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 150,
                  right: 0,
                  left: 0,
                  alignItems: "center",
                }}
              >
                <ActivationModal
                  type={0}
                  setConfirm={setConfirm}
                  setVisible={setVisible}
                  endDate={endDate}
                  setVisible2={setVisible2}
                  setConfirm2={setConfirm2}
                />
              </View>
            ) : (
              <View
                style={{
                  position: "absolute",
                  bottom: 150,
                  right: 0,
                  left: 0,
                  alignItems: "center",
                }}
              >
                {!isOver ? (
                  <ActivationModal
                    type={1}
                    setConfirm={setConfirm}
                    setVisible={setVisible}
                    endDate={endDate}
                    setVisible2={setVisible2}
                    setConfirm2={setConfirm2}
                  />
                ) : (
                  <ActivationModal
                    type={2}
                    setConfirm={setConfirm}
                    setVisible={setVisible}
                    endDate={endDate}
                    setVisible2={setVisible2}
                    setConfirm2={setConfirm2}
                  />
                )}
              </View>
            ))}
        </>
      )}

      <View
        style={{
          position: "absolute",
          bottom: 80,
          right: 0,
          left: 0,
          alignItems: "center",
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed && {
              opacity: 0.55,
            },
          ]}
          onPress={
            !userInfo
              ? () => navigation.navigate(ROUTE.login)
              : () => {
                  setUnreadCount(0);
                  logout();
                }
          }
        >
          <View
            style={{
              padding: theme.sizes.small + 2,
              paddingVertical: theme.sizes.small + 5,
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
              width: 150,
              backgroundColor: theme.colors.primary100,
              shadowColor: "rgba(22,24,35,1)",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: "rgba(22,24,35,1)",
                textTransform: "capitalize",
                fontWeight: "600",
              }}
            >
              {userInfo ? "Đăng xuất" : "Đăng nhập"}
            </Text>
          </View>
        </Pressable>
      </View>
      <ConfirmDialog
        visible={confirm}
        confirmText="Xác nhận"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          navigation.navigate(ROUTE.premium);
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
            Bạn có chắc chắn muốn kích hoạt tài khoản?
          </Text>
        </View>
      </ConfirmDialog>
      <ConfirmDialog
        visible={confirm2}
        confirmText="Xác nhận"
        onClose={() => setConfirm2(false)}
        onConfirm={() => {
          setConfirm2(false);
          handleRefund();
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
            Bạn có chắc chắn muốn hoàn tiền?
          </Text>
        </View>
      </ConfirmDialog>
      <ModalView
        visible={visible2}
        title="Thông tin"
        onDismiss={() => setVisible2(false)}
        cancelable
        style={{ backgroundColor: "#fff" }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.black,
              lineHeight: 16 * 1.5,
            }}
          >
            Tài khoản đã hết được kích hoạt nhưng hệ thống chưa đáp ứng được
            tiêu chí kết nối thợ xây với bài đăng của bạn nên tài khoản đã được
            gia hạn miễn phí 1 tháng
          </Text>
        </View>
      </ModalView>
      <ModalView
        visible={visible}
        title="Quyền lợi"
        onDismiss={() => setVisible(false)}
        cancelable
        style={{ backgroundColor: "#fff" }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.black,
              lineHeight: 16 * 2,
            }}
          >
            {userInfo?.role?.toLowerCase() === ROLE.contractor
              ? "- Đăng bài tìm việc không giới hạn\n- Xem được thông tin công nhân ứng tuyển\n- Chat trao đổi với công nhân và tạo cam kết\n- Được gia hạn hoặc hoàn tiền nếu bài đăng chưa kết nối đủ nhiều (30% người dùng của hệ thống)"
              : "- Đăng sản phẩm để và quản lí đơn hàng"}
          </Text>
        </View>
      </ModalView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});

export default Menu;
