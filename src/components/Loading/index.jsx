import { ActivityIndicator, Modal, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const Loading = ({ size = "small", color, content, isModal = false }) => {
  const theme = useTheme();
  if (isModal)
    return (
      <Modal animationType="fade" transparent={true} visible>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              minWidth: 60,
              minHeight: 60,
              padding: theme.sizes.small,
              backgroundColor: "rgba(0,0,0,0.67)",
              borderRadius: theme.sizes.base - 2,
            }}
          >
            <ActivityIndicator size={size} color={color || "white"} />
            {content && (
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.font - 2,
                  textTransform: "capitalize",
                  marginTop: theme.sizes.base / 2,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {content}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.sizes.large,
      }}
    >
      <ActivityIndicator size={size} color={color || theme.colors.primary300} />
      {content && (
        <Text
          style={{
            color: "rgba(22,24,35,0.34)",
            fontSize: theme.sizes.font - 2,
            textTransform: "capitalize",
            marginVertical: theme.sizes.base / 2,
          }}
        >
          {content}
        </Text>
      )}
    </View>
  );
};

export default Loading;
