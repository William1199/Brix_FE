import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { EditorField } from "~/components/Form-field";

const DescriptionModal = ({
  visible,
  onClose,
  onReset,
  onSubmit,
  control,
  errors,
}) => {
  const theme = useTheme();

  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, padding: theme.sizes.large }}>
        <Pressable
          style={({ pressed }) => [
            pressed && {
              opacity: 0.25,
            },
            {
              position: "absolute",
              top: 0,
              left: 0,
              padding: theme.sizes.small,
              zIndex: 10,
            },
          ]}
          onPress={onClose}
        >
          <Ionicons
            name="close-outline"
            size={theme.sizes.extraLarge + 4}
            color="rgba(22,24,35,0.64)"
          />
        </Pressable>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: theme.sizes.font,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: theme.sizes.medium,
              color: theme.colors.primary300,
            }}
          >
            Thông tin chi tiết về mô tả công việc
          </Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={50}
        >
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <EditorField
              name="benefit"
              control={control}
              errors={errors}
              label="Vì sao nên ứng tuyển"
              containerStyle={{ marginVertical: theme.sizes.base - 2 }}
            />

            <EditorField
              name="description"
              control={control}
              errors={errors}
              label="Mô tả cụ thể cho công việc"
              containerStyle={{ marginVertical: theme.sizes.base - 2 }}
            />

            <EditorField
              name="required"
              control={control}
              errors={errors}
              label="Yêu cầu công việc"
              containerStyle={{ marginVertical: theme.sizes.base - 2 }}
            />

            {/* footer */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.sizes.large,
                zIndex: -1,
              }}
            >
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.25,
                  }
                }
                onPress={onReset}
              >
                <View
                  style={{
                    paddingHorizontal: theme.sizes.font,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "blue",
                      fontWeight: "500",
                    }}
                  >
                    Đặt lại
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.75,
                  },
                  {
                    marginLeft: theme.sizes.base,
                  },
                ]}
                onPress={onSubmit}
              >
                <View
                  style={{
                    paddingVertical: theme.sizes.base,
                    backgroundColor: theme.colors.primary300,
                    minWidth: 110,
                    minHeight: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 3,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: theme.colors.textColor300,
                      fontWeight: "bold",
                    }}
                  >
                    Lưu
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default DescriptionModal;
