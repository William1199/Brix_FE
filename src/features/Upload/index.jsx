import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useContext, useLayoutEffect } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import GuestContext from "~/context/GuestContext";
import ConstructorUploadForm from "./Constructor";
import StoreUploadForm from "./Store";

const UploadScreen = ({ navigation }) => {
  const isFocus = useIsFocused();
  const { verifyAccount } = useContext(GuestContext);
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);

  const renderFormUpload = () => {
    switch (userInfo?.role?.toLowerCase()) {
      case ROLE.contractor:
        return <ConstructorUploadForm />;
      case ROLE.store:
        return <StoreUploadForm />;
    }
  };
  useLayoutEffect(() => {
    if (!userInfo) {
      verifyAccount(ROUTE.upload);
    } else if (userInfo?.status != 2) {
      Toast.show({
        type: "error",
        text1:
          userInfo?.role.toLowerCase() == ROLE.contractor
            ? "Bạn phải cập nhật thông tin và xác thực để đăng bài"
            : "Bạn phải cập nhật thông tin và xác thực để đăng sản phẩm",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.push(ROUTE.myProfile);
    } else if (!userInfo.premium) {
      Toast.show({
        type: "error",
        text1:
          userInfo?.role.toLowerCase() == ROLE.contractor
            ? "Bạn phải kích hoạt tài khoản để đăng bài"
            : "Bạn phải kích hoạt tài khoản để đăng sản phẩm",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.navigate(ROUTE.premium);
    }
  }, [isFocus]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: theme.sizes.small,
        paddingTop: theme.sizes.large,
      }}
    >
      <StatusBar style="dark" />
      {/* title */}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: theme.colors.primary400,
            fontSize: theme.sizes.extraLarge,
            fontWeight: "bold",
            textTransform: "capitalize",
            letterSpacing: 1.2,
          }}
        >
          {userInfo?.role?.toLowerCase() === ROLE.contractor
            ? "Tạo một bài viết mới"
            : "Tạo sản phẩm mới"}
        </Text>

        <Text
          style={{
            color: "rgba(22,24,35,0.64)",
            marginTop: theme.sizes.base - 2,
          }}
        >
          Điền vào tất cả các trường mẫu
          {userInfo?.role?.toLowerCase() === ROLE.contractor
            ? " để đi bước tiếp theo"
            : ""}
        </Text>
      </View>

      {renderFormUpload()}
    </SafeAreaView>
  );
};

export default UploadScreen;
