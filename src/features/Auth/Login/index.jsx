import {
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "react-native-paper";

import LoginForm from "~/features/Auth/components/LoginForm";

import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { ROUTE } from "~/constants";
import GoogleSignIn from "../GoogleSignIn";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import AuthContext from "~/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { height, width } = Dimensions.get("window");
const image = {
  uri: "https://i.ibb.co/k3yHgvf/BRIX.png",
};
const LoginScreen = ({ navigation, route }) => {
  const { top } = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);
  const { to, ...rest } = route.params || { to: ROUTE.drawer };
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ImageBackground
        source={image}
        style={{
          height: height / 2,
          width: width,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.25 },
            {
              position: "absolute",
              top: top + 20,
              left: 24,
              zIndex: 100,
            },
          ]}
          onPress={() => navigation.navigate(ROUTE.drawer)}
        >
          <Ionicons
            name="home"
            size={theme.sizes.extraLarge}
            color="rgba(22,24,35,0.64)"
          />
        </Pressable>
      </ImageBackground>

      <View
        style={{
          marginTop: -50,
          zIndex: 100,
          backgroundColor: "#fff",
          borderTopLeftRadius: 60,
          borderTopRightRadius: 60,
          flex: 1,
        }}
      >
        <KeyboardAwareScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          behavior="padding"
          contentContainerStyle={{
            padding: 40,
          }}
        >
          <View>
            {/* <Text
              style={{
                color: theme.colors.darklight,
                fontSize: 34,
                fontWeight: "bold",
              }}
            >
              Xin chào
            </Text> */}
            <Text style={{ alignSelf: "flex-end" }}>
              Bạn chưa có tài khoản?
            </Text>
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
              }}
              onPress={() => navigation.navigate(ROUTE.register)}
            >
              <Text
                style={{
                  color: theme.colors.highlight,
                  fontStyle: "italic",
                }}
              >
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 24 }}>
              <LoginForm to={to} {...rest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                hoặc đăng nhập với
              </Text>
              <GoogleSignIn />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default LoginScreen;
