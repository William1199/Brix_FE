import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const BlockItem = ({
  title,
  children,
  showClearButton = true,
  style,
  onPress,
}) => {
  const theme = useTheme();
  return (
    <View style={style}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: theme.sizes.font,
          marginVertical: theme.sizes.font,
        }}
      >
        <Text
          style={{
            fontSize: theme.sizes.medium,
            fontWeight: "bold",
            textTransform: "capitalize",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>

        {showClearButton && (
          <Pressable
            style={({ pressed }) =>
              pressed && {
                opacity: 0.25,
              }
            }
            onPress={onPress}
          >
            <Text style={{ color: "blue" }}>Xóa tất cả</Text>
          </Pressable>
        )}
      </View>

      {children}
    </View>
  );
};

export default BlockItem;
