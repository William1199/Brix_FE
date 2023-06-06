import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const Loading = () => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.sizes.large,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1003,
        backgroundColor: "rgba(0,0,0,0.47)",
      }}
    >
      <ActivityIndicator size="large" color="white" />

      <Text
        style={{
          color: "white",
          fontSize: theme.sizes.font,
          fontWeight: "bold",
          textTransform: "capitalize",
          marginVertical: theme.sizes.small,
        }}
      >
        Đang xác thực thông tin
      </Text>
    </View>
  );
};

export default Loading;
