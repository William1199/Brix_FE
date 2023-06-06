import { Feather, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Modal, Portal, useTheme } from "react-native-paper";
import * as Yup from "yup";
import { InputField } from "~/components/Form-field";

const validationSchema = Yup.object().shape({
  skills: Yup.array()
    .of(
      Yup.object()
        .nullable()
        .shape({
          name: Yup.string().required("Hãy nhập kĩ năng của nhân viên"),
        })
    )
    .test({
      name: "uniq name",
      message: "Kĩ năng không thể trùng nhau !",
      test: (value) => {
        return (
          !_.filter(value, function (item) {
            return (
              _.filter(value, function (innerValue) {
                return innerValue.name === item.name;
              }).length > 1
            );
          }).length > 0
        );
      },
    }),
});

const MOCK_DATA = {
  default_value: [
    {
      name: "",
      fromSystem: false,
    },
  ],
};
const AnotherSkillModals = ({ visible, onClose, onSubmit, isReset, value }) => {
  const { default_value } = MOCK_DATA;
  const theme = useTheme();
  const {
    formState: { errors },
    watch,
    control,
    setValue,
    reset,
    handleSubmit,
  } = useForm({
    defaultValues: {
      skills: default_value,
    },
    resolver: yupResolver(validationSchema),
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: "skills",
  });
  const skills = watch("skills");
  const [isEdit, setIsEdit] = useState(false);

  const renderField = () =>
    fields.map((field, index) => {
      return (
        <View
          key={field.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.sizes.base / 2,
            zIndex: fields.length - index + 1,
          }}
        >
          <View style={{ flex: 1 }}>
            <InputField
              name={`skills.${index}.name`}
              control={control}
              errors={errors}
              label="Kĩ năng của nhân viên"
              showError={false}
              inputStyle={{
                borderRadius: theme.sizes.base / 2,
                paddingVertical: theme.sizes.small + 2,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor:
                  errors?.skills?.message ||
                  (Array.isArray(errors?.skills) && errors?.skills[index]?.name)
                    ? theme.colors.error
                    : "rgba(22,24,35,0.12)",
              }}
            />

            {Array.isArray(errors?.skills) && errors?.skills[index]?.name && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.sizes.font - 2,
                  marginTop: -theme.sizes.base / 2,
                }}
              >
                {errors?.skills[index]?.name?.message}
              </Text>
            )}
          </View>

          {isEdit && (
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  position: "absolute",
                  top: 2,
                  right: 0,
                },
              ]}
              onPress={() => {
                if (skills?.length === 2) setIsEdit(false);
                remove(index);
              }}
            >
              <Ionicons
                name="ios-remove-circle-outline"
                size={theme.sizes.large}
                color={theme.colors.error}
              />
            </Pressable>
          )}
        </View>
      );
    });

  useEffect(() => {
    if (isReset) reset({ skills: default_value });
  }, [isReset]);

  useEffect(() => {
    if (visible) {
      setValue("skills", value.length > 0 ? value : default_value);
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: "white",
          maxHeight: "90%",
          padding: theme.sizes.large,
          margin: 30,
          borderRadius: theme.sizes.base / 2,
          minHeight: 250,
          overflow: "hidden",
        }}
      >
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
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={onClose}
        >
          <Ionicons
            name="close-outline"
            size={theme.sizes.extraLarge}
            color="rgba(22,24,35,0.64)"
          />
        </Pressable>

        <KeyboardAvoidingView
          behavior="padding"
          enabled
          keyboardVerticalOffset={70}
        >
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: theme.sizes.extraLarge - 4,
                textAlign: "center",
                marginBottom: theme.sizes.font,
                textTransform: "capitalize",
                color: theme.colors.primary400,
                letterSpacing: 0.25,
              }}
            >
              Các kĩ năng khác
            </Text>

            {renderField()}

            {errors?.skills && !Array.isArray(errors?.skills) && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.sizes.font - 2,
                  marginBottom: theme.sizes.base / 2,
                }}
              >
                {errors?.skills?.message}
              </Text>
            )}

            {/* action */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                  {
                    paddingRight: theme.sizes.base / 2,
                  },
                ]}
                onPress={() => append(default_value)}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={theme.sizes.large + 2}
                />
              </Pressable>

              {skills?.length > 1 && (
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      opacity: 0.25,
                    },
                    {
                      paddingHorizontal: theme.sizes.base / 2,
                    },
                  ]}
                  onPress={() => setIsEdit(!isEdit)}
                >
                  <Feather
                    name={isEdit ? "check" : "edit-3"}
                    style={{ alignSelf: "flex-end" }}
                    size={isEdit ? theme.sizes.large + 2 : theme.sizes.large}
                    color="rgba(22,24,35,0.64)"
                  />
                </Pressable>
              )}
            </View>

            {/* footer */}
            <View
              style={{
                flexDirection: "row",
                marginTop: theme.sizes.large,
                zIndex: -1,
              }}
            >
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.75,
                  }
                }
                onPress={handleSubmit(onSubmit)}
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
      </Modal>
    </Portal>
  );
};

export default AnotherSkillModals;
