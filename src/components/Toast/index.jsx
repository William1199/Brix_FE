import { Text, View } from "react-native";

const Toast = ({ message, isTop = false, value = 16 }) => {
  if (!message) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: isTop ? undefined : 16,
        left: 0,
        right: 0,
        top: isTop ? value : undefined,
        zIndex: 10000,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: 14,
          minWidth: "60%",
          maxWidth: "70%",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
          {message}
        </Text>
      </View>
    </View>
  );
};

export default Toast;
