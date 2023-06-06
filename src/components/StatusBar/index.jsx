import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatusBarComp = ({ backgroundColor, statusConfig = {} }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View style={{ zIndex: 1000 }}>
      <View
        style={{
          height: insets.top,
          backgroundColor: backgroundColor || theme.colors.primary400,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }}
      />
      <StatusBar {...statusConfig} />
    </View>
  );
};

export default StatusBarComp;
