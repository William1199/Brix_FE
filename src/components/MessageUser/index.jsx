import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import IMAGE from "~/assets/images/image_3.png";
import { BILL_STATUS_ENUM, PROFILE_FORM, ROLE, ROUTE } from "~/constants";

const MOCK_DATA = {
  [ROLE.builder]: {
    general_default_value: {
      firstName: "",
      lastName: "",
      experience: "",
      typeID: "",
    },
  },

  [ROLE.contractor]: {
    company_default_value: {
      companyName: "",
      description: 0,
      website: "",
    },
  },

  [ROLE.store]: {
    general_default_value: {
      firstName: "",
      lastName: "",
      email: "",
      place: "",
    },
    company_default_value: {
      taxCode: "",
      description: 0,
      website: "",
    },
  },
};

const progressList = {
  [ROLE.builder]: [
    {
      form: PROFILE_FORM.general,
      default_value: MOCK_DATA[ROLE.builder].general_default_value,
      data: undefined,
    },
  ],
  [ROLE.contractor]: [
    {
      form: PROFILE_FORM.company,
      default_value: MOCK_DATA[ROLE.contractor].company_default_value,
      data: undefined,
    },
  ],
  [ROLE.store]: [
    {
      form: PROFILE_FORM.general,
      default_value: MOCK_DATA[ROLE.store].general_default_value,
      data: undefined,
    },
    {
      form: PROFILE_FORM.company,
      default_value: MOCK_DATA[ROLE.store].company_default_value,
      data: undefined,
    },
  ],
};

const MessageUser = ({
  profile,
  showDivider = true,
  isRadius = false,
  containerStyle = {},
}) => {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();

  const renderMessage = () => {
    switch (userInfo?.status) {
      case BILL_STATUS_ENUM.indexOf("Success"):
      case BILL_STATUS_ENUM.indexOf("Level2"):
        return userInfo?.role?.toLowerCase() === ROLE.builder
          ? "Chụp CMND/CCCD ngay"
          : "Xác thực tài khoản ngay";
      case BILL_STATUS_ENUM.indexOf("Level1"):
        return "Cập nhật thông tin tài khoản";
    }
  };

  const handlePress = () => {
    switch (userInfo?.status) {
      case BILL_STATUS_ENUM.indexOf("Success"):
      case BILL_STATUS_ENUM.indexOf("Level2"):
        return navigation.navigate(
          userInfo?.role?.toLowerCase() === ROLE.builder
            ? ROUTE.verifyCMND
            : ROUTE.verifyAccount
        );
      case BILL_STATUS_ENUM.indexOf("Level1"): {
        return navigation.navigate(ROUTE.myProfile);
      }
    }
  };
  if (!userInfo) return null;
  if (userInfo?.status === BILL_STATUS_ENUM.indexOf("Level3")) return null;

  return (
    <>
      {/* divider */}
      {showDivider && (
        <View
          style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.09)" }}
        ></View>
      )}

      <View
        style={[
          {
            paddingHorizontal: theme.sizes.font,
            paddingVertical: theme.sizes.small,
            backgroundColor:
              userInfo?.status === 12
                ? "rgba(92, 184, 92, 0.44)"
                : "rgba(255, 76, 58, 0.12)",
            borderRadius: isRadius ? theme.sizes.base : 0,
          },
          containerStyle,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Image
            source={IMAGE}
            style={{
              width: 50,
              height: 50,
              borderRadius: theme.sizes.base,
            }}
            resizeMode="cover"
          />

          <View style={{ marginLeft: theme.sizes.small, flex: 1 }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: theme.sizes.font + 1,
              }}
            >
              Tăng cường bảo mật
            </Text>
            <Text
              style={{
                color: "rgba(22,24,35,0.74)",
                marginTop: theme.sizes.base - 2,
                lineHeight: 20,
              }}
            >
              {userInfo?.status === 12
                ? "Thông tin của bạn đang được hệ thống của chúng tôi xác thực thông tin cá nhân, quá trình có thể sẽ mất một chút thời gian, cảm ơn bạn đã tin tưởng hệ thống chúng tôi!"
                : "Để bảo vệ tài khoản và sử dụng chức năng của app, bạn cần xác thực thông tin cá nhân. Thông tin của bạn chỉ được dùng cho mục đích xác thực tài khoản"}
            </Text>
          </View>
        </View>

        {userInfo?.status !== 12 && (
          <View
            style={{
              backgroundColor: theme.colors.primary400,
              borderRadius: theme.sizes.base,
              marginTop: theme.sizes.font,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  padding: theme.sizes.small,
                  justifyContent: "center",
                  alignItems: "center",
                },
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.12)",
                },
              ]}
              onPress={handlePress}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {renderMessage()}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
};

export default MessageUser;
