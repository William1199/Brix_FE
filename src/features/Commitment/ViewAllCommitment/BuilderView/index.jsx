import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SHADOWS } from "~/app/theme";
import { NO_IMAGE_URL, ROUTE } from "~/constants";
import { formatStringToCurrency } from "~/utils/helper";

const BuilderView = ({ item }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Pressable
      style={({ pressed }) => [
        pressed && {
          opacity: 0.25,
        },
        {
          marginBottom: theme.sizes.large,
        },
      ]}
      onPress={() =>
        navigation.navigate(ROUTE.commitmentDetail, {
          id: item.id,
        })
      }
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          padding: theme.sizes.font,
          borderRadius: theme.sizes.base - 2,
          ...SHADOWS.light,
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderColor: "#ddd",
            borderWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: theme.sizes.base / 2,
            padding: 6,
          }}
        >
          <Image
            style={{ width: "100%", height: "100%" }}
            source={{
              uri: item.constructorAvatar || NO_IMAGE_URL,
            }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 10,
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: theme.colors.darklight,
              marginBottom: theme.sizes.base / 2,
            }}
            numberOfLines={1}
          >
            {item.projectName}
          </Text>
          <Text style={{ marginBottom: theme.sizes.base / 2 }}>
            Tên công ty:
            <Text style={{ fontWeight: "600" }}>
              {" " + item.constructorName}
            </Text>
          </Text>

          <Text
            style={{
              color: theme.colors.highlight,
              fontWeight: "bold",
            }}
          >
            Mức lương:
            <Text>{" " + formatStringToCurrency(item.salary.toString())}</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default BuilderView;
