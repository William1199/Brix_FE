import { AntDesign } from "@expo/vector-icons";
import { Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");
const maskColWidth = (width - 200) / 2;

const RectangleFocus = () => {
  return (
    <View
      style={{
        flex: 25,
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
          width: 350,
          backgroundColor: "transparent",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
        {/* line */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            borderColor: "#FFFFFF",
            borderTopWidth: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 10,
            borderColor: "#FFFFFF",
            borderBottomWidth: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 20,
            height: "100%",
            borderColor: "#FFFFFF",
            borderLeftWidth: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 20,
            height: "100%",
            borderColor: "#FFFFFF",
            borderRightWidth: 1,
          }}
        />

        {/* corner */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 30,
            height: 30,
            borderColor: "#FFFFFF",
            borderTopWidth: 4,
            borderLeftWidth: 4,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 30,
            height: 30,
            borderColor: "#FFFFFF",
            borderTopWidth: 4,
            borderRightWidth: 4,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 30,
            height: 30,
            borderColor: "#FFFFFF",
            borderBottomWidth: 4,
            borderLeftWidth: 4,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 30,
            height: 30,
            borderColor: "#FFFFFF",
            borderBottomWidth: 4,
            borderRightWidth: 4,
          }}
        />
      </View>

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

export default RectangleFocus;
