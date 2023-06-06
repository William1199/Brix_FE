import { AntDesign } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { initializeApp } from "firebase/app";
import { useContext, useEffect } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import AuthContext from "~/context/AuthContext";

initializeApp({
  apiKey: "AIzaSyAelyrP0GomMDVfXyX-2lBq0yiWL1Z4HLk",
  authDomain: "capstone-project-e5c70.firebaseapp.com",
  projectId: "capstone-project-e5c70",
  storageBucket: "capstone-project-e5c70.appspot.com",
  messagingSenderId: "533432664281",
  appId: "1:533432664281:web:628ae970b9c3ee946a7ec8",
});

WebBrowser.maybeCompleteAuthSession();

//web: 1021264317438-vclnlhb5slrd4h2hdfo309qlfo0i4lo4.apps.googleusercontent.com
//ios: 1021264317438-fjicrggga0kkb8l380hdrrb9qs85cdof.apps.googleusercontent.com
//android: 1021264317438-fjo78t3tbtpemuao72regpn075lqgjcm.apps.googleusercontent.com

const GoogleSignIn = ({ navigation }) => {
  const { loginGoogle } = useContext(AuthContext);
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId:
        "1021264317438-fjo78t3tbtpemuao72regpn075lqgjcm.apps.googleusercontent.com",
      clientId:
        "1021264317438-o12lv5bm76gr6a2p6ie7ig5hr3geguo2.apps.googleusercontent.com",
      iosClientId:
        "1021264317438-fjicrggga0kkb8l380hdrrb9qs85cdof.apps.googleusercontent.com",
    },
    {
      scopes: ["email"],
    },
    {}
  );

  useEffect(() => {
    if (response?.type === "success") {
      fetchUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (accessToken) => {
    let user = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await user.json();
    if (userInfo) {
      loginGoogle(
        userInfo.email,
        userInfo.family_name,
        userInfo.given_name,
        userInfo.picture
      );
    } else {
      Alert.alert("Đăng nhập với Google thất bại");
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#fff",
        // marginLeft: width / 3.7,
        shadowColor: "rgba(22,24,35,1)",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 5,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
      }}
      disabled={!request}
      onPress={() => {
        promptAsync();
      }}
    >
      <AntDesign name="google" size={24} />
      <Text style={{ marginLeft: 15 }}>Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleSignIn;
