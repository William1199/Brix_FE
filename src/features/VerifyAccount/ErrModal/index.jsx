import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const ErrModal = ({ onClose = () => {}, onSecondSubmit = () => {} }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1002,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: theme.sizes.base,
          paddingVertical: theme.sizes.font,
          paddingHorizontal: theme.sizes.medium,
          maxWidth: "90%",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: theme.sizes.medium }}>
          Giấy tờ không hợp lệ
        </Text>
        <View
          style={{
            marginTop: theme.sizes.small,
            marginBottom: theme.sizes.medium,
          }}
        >
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            Hình ảnh nhận diện không phải là mặt trước CMND/CCCD.
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            Có thể do các nguyên nhân sau:
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            1. Hình chứng từ là hình photocopy
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            2. Hình ảnh mờ, kém chất lượng hoặc đã bị tẩy xóa
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            3. Chứng từ đã bị cắt góc hoặc bấm lỗ
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.84)",
              fontSize: theme.sizes.font + 1,
            }}
          >
            Bạn vui lòng kiểm tra và thử lại
          </Text>
        </View>

        <View>
          <Pressable
            style={{
              backgroundColor: theme.colors.primary400,
              padding: theme.sizes.font - 1,
              borderRadius: theme.sizes.base,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: theme.sizes.base / 2,
            }}
            onPress={onClose}
          >
            <Text
              style={{
                color: "white",
                fontSize: theme.sizes.medium,
                fontWeight: "600",
              }}
            >
              Chụp lại
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "rgba(22,24,35,0.06)",
              padding: theme.sizes.font - 1,
              borderRadius: theme.sizes.base,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onSecondSubmit}
          >
            <Text
              style={{
                fontSize: theme.sizes.medium,
                fontWeight: "bold",
              }}
            >
              Xem hướng dẫn
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ErrModal;
