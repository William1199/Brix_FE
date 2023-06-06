import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import { Badge, useTheme } from "react-native-paper";
import IconButton from "../IconButton";
import SearchBar from "../SearchBar";
import { NO_IMAGE_URL, ROLE, ROUTE } from "~/constants";
import { useContext } from "react";
import GuestContext from "~/context/GuestContext";
import AuthContext from "~/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const HEIGHT = 60;

const Header = ({ style, inputConfig, cartLength }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { verifyAccount } = useContext(GuestContext);
  const { userInfo } = useContext(AuthContext);
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: HEIGHT,
          padding: theme.sizes.small,
          backgroundColor: theme.colors.primary400,
        },
        style,
      ]}
    >
      <Pressable
        style={{
          flex: 1,
          marginRight: theme.sizes.small,
        }}
        onPress={() => {
          navigation.openDrawer();
        }}
      >
        <Image
          source={{
            uri: userInfo
              ? userInfo?.avatar || NO_IMAGE_URL
              : "https://i.ibb.co/fxkcVcG/brix1.png",
          }}
          style={{
            width: 34,
            height: userInfo ? 34 : 70,
            borderRadius: 100,
          }}
        />
      </Pressable>

      <SearchBar
        style={{ flex: 9, backgroundColor: "#fff" }}
        {...inputConfig}
      />
      {userInfo && userInfo.role.toLowerCase() === ROLE.contractor && (
        <Pressable
          style={{
            paddingHorizontal: theme.sizes.font - 2,
          }}
          onPress={() => {
            if (verifyAccount(ROUTE.home)) {
              navigation.navigate(ROUTE.cart);
            }
          }}
        >
          <Ionicons
            name="ios-cart-outline"
            size={theme.sizes.extraLarge * 1.15}
            color="white"
          />
          {userInfo && cartLength > 0 && (
            <Badge
              style={{
                position: "absolute",
                right: 8,
                top: -5,
                backgroundColor: theme.colors.highlight,
              }}
              size={theme.sizes.medium}
            >
              {cartLength}
            </Badge>
          )}
        </Pressable>
      )}
    </View>
  );
};

export default Header;
