import { useCallback } from "react";
import { Alert, Linking, Pressable } from "react-native";

const OpenURL = ({ children, url, style, autoOpen = false }) => {
  if (autoOpen) {
    handlePress();
  }
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Không biết cách mở URL này: ${url}`);
    }
  }, [url]);

  return (
    <Pressable
      style={[
        style,
        {
          alignSelf: "flex-start",
        },
      ]}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
};

export default OpenURL;
