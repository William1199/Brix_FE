import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import RegisterForm from "~/features/Auth/components/RegisterForm";

// import GoogleSVG from "~/assets/images/google.svg";
import { ROUTE } from "~/constants";
import GoogleSignIn from "../GoogleSignIn";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
const { height, width } = Dimensions.get("window");

const image = {
  uri: "https://i.ibb.co/k3yHgvf/BRIX.png",
};
const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  // const [firstName, setFirstName] = useState(null);
  // const [lastName, setLastName] = useState(null);
  // const [phoneNumber, setPhoneNumber] = useState(null);
  // const [password, setPassword] = useState(null);
  // const [roleId, setRoleId] = useState(null);
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={image}
        style={{
          height: height / 2,
          width: width,
        }}
      ></ImageBackground>
      <View
        style={{
          marginTop: -50,
          zIndex: 100,
          backgroundColor: "#fff",
          borderTopLeftRadius: 60,
          borderTopRightRadius: 60,
          flex: 1,
          paddingBottom: bottom,
        }}
      >
        <KeyboardAwareScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          behavior="padding"
          contentContainerStyle={{
            padding: 40,
          }}
          style={{
            flex: 1,
          }}
        >
          <View>
            <Text style={{ alignSelf: "flex-end" }}>Bạn đã có tài khoản?</Text>
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
              }}
              onPress={() => navigation.navigate(ROUTE.login)}
            >
              <Text
                style={{
                  color: theme.colors.highlight,
                  fontStyle: "italic",
                }}
              >
                Đăng nhập ngay
              </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 24 }}>
              <RegisterForm />
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

export default RegisterScreen;
