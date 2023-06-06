import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const MOCK_DATA = ["a", "b", "c", "d"];

const Radio = ({
  label,
  onPress,
  isSelected = false,
  width = 18,
  height = 18,
  index,
  labelStyle = {},
}) => {
  const theme = useTheme();

  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.sizes.base,
      }}
      onPress={onPress}
    >
      <View
        style={[
          {
            height,
            width,
            borderRadius: 12,
            borderWidth: 1.25,
            borderColor: "black",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        {isSelected ? (
          <View
            style={{
              height: height / 2,
              width: width / 2,
              borderRadius: 6,
              backgroundColor: "#000",
            }}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            marginLeft: theme.sizes.base / 2,
            fontSize: theme.sizes.medium - 1,
          }}
        >
          {MOCK_DATA[index]}.
        </Text>
        <Text
          style={[
            labelStyle,
            {
              marginLeft: theme.sizes.small,
              fontSize: theme.sizes.medium - 1,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

export default Radio;
