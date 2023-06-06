import { Dimensions, View } from "react-native";

const { height, width } = Dimensions.get("window");
const maskColWidth = (width - 200) / 2;

const CircleFocus = () => {
  return (
    <View
      style={{
        flex: 40,
        flexDirection: "row",
      }}
    >
      {/* left */}
      <View
        style={{
          width: maskColWidth,
          backgroundColor: "rgba(0,0,0,0.47)",
        }}
      />

      {/* center */}
      <View
        style={{
          width: 300,
          backgroundColor: "transparent",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 1000,
          borderColor: "white",
          borderWidth: 1,
        }}
      ></View>

      {/* right */}
      <View
        style={{
          width: maskColWidth,
          backgroundColor: "rgba(0,0,0,0.47)",
        }}
      />
    </View>
  );
};

export default CircleFocus;
