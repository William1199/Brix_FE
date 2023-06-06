import { View, Text } from "react-native";
import React from "react";
import { Button, useTheme, Surface } from "react-native-paper";
import { ROUTE } from "~/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Carousel } from "~/components";
import GoogleSignIn from "../GoogleSignIn";

const carousel = [
  {
    id: 1,
    imageUri:
      "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Hình ảnh công trình Vinhomes Grand Park được đội ngũ công nhân BillDer hoàn thiện sau khi được liên kết qua app",
  },
  {
    id: 2,
    imageUri:
      "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Photographer, Support via PayPal, Latvia",
  },
  {
    id: 3,
    imageUri:
      "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Follow us @Surface – Laptops designed by Microsoft",
  },
  {
    id: 4,
    imageUri:
      "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Photographer, Support via PayPal, Latvia",
  },
];

const LandingScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleClickLogin = () => {
    navigation.navigate(ROUTE.login);
  };
  const handleClickRegister = () => {
    navigation.navigate(ROUTE.register);
  };

  return (
    <SafeAreaView>
      <Carousel
        data={carousel}
        style={{
          padding: theme.sizes.medium,
          paddingBottom: theme.sizes.base - 2,
        }}
      ></Carousel>
      <View
        style={{
          color: "#000000",
          padding: theme.sizes.xxxLarge,
          marginTop: theme.sizes.medium,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: theme.sizes.xxLarge,
          }}
        >
          TÊN ỨNG DỤNG
        </Text>
        <Text
          style={{
            marginTop: theme.sizes.medium,
            textAlign: "center",
            fontSize: theme.sizes.font,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam maecenas
          mi non sed ut odio. Non, justo, sed facilisi et
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: theme.sizes.xxxLarge,
          justifyContent: "center",
        }}
      >
        <Surface
          elevation={5}
          style={{
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.primary400,
            width: 175,
          }}
        >
          <Button
            textColor={theme.colors.primary400}
            labelStyle={{ fontSize: theme.sizes.large }}
            onPress={handleClickLogin}
          >
            Đăng nhập
          </Button>
        </Surface>

        <Surface
          elevation={5}
          style={{
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: theme.colors.primary400,
            borderWidth: 1,
            borderColor: theme.colors.primary400,
            width: 175,
          }}
        >
          <Button
            textColor={"#ffffff"}
            labelStyle={{ fontSize: theme.sizes.large }}
            onPress={handleClickRegister}
          >
            Đăng ký
          </Button>
        </Surface>
      </View>
      <GoogleSignIn />
    </SafeAreaView>
  );
};

export default LandingScreen;
