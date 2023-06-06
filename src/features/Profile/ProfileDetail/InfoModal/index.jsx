import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const InfoModal = ({ title, visible, onClose, children }) => {
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.27)",
            zIndex: -1,
          }}
          onPress={onClose}
        />

        <View
          style={{
            backgroundColor: "white",
            maxWidth: "80%",
            borderRadius: theme.sizes.small,
          }}
        >
          {/* header */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: theme.sizes.font,
              paddingBottom: 0,
            }}
          >
            <Text
              style={{
                textTransform: "capitalize",
                fontWeight: "600",
                fontSize: theme.sizes.large,
              }}
            >
              {title}
            </Text>
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
};

export default InfoModal;
