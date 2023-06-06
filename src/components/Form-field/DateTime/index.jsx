import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { Dimensions, Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "react-native-paper";
import { FORMAT_DATE_REGEX } from "~/constants";
const WIDTH = Dimensions.get("window").width;

const DateTime = ({
  name,
  label = name,
  placeholder = label,
  errors,
  control,
  showLabel = true,
  showError = true,
  locale = "vi-vn",
  containerStyle = {},
  inputStyle = {},
  labelStyle = {},
  isOutline,
  textHelpers = [],
  disabled = false,
  typeErrorMsg,
  mode = "datetime",
  ...props
}) => {
  const theme = useTheme();

  const [isVisible, setIsVisible] = useState(false);
  let styles = {};

  if (showError) {
    styles = useMemo(() => {
      if (isOutline)
        return {
          borderColor: errors?.[name]
            ? theme.colors.error
            : "rgba(22,24,35,0.12)",
          borderWidth: 1,
          backgroundColor: "transparent",
        };
      return {
        backgroundColor: "rgba(22,24,35,0.06)",
        borderColor: theme.colors.error,
        borderWidth: errors?.[name] ? 1 : 0,
      };
    }, [isOutline, errors?.[name]]);
  }

  const inputDisabledProps = useMemo(
    () =>
      disabled
        ? {
            backgroundColor: "rgba(22,24,35,0.06)",
            borderWidth: 0,
          }
        : {},
    [disabled]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, onBlur } }) => (
        <View
          style={[
            {
              marginVertical: theme.sizes.base / 2,
            },
            containerStyle,
          ]}
        >
          {showLabel && (
            <Text
              style={[
                {
                  marginBottom: theme.sizes.base - 2,
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: theme.sizes.font - 2,
                },
                labelStyle,
              ]}
            >
              {label}
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              pressed &&
                !disabled && {
                  opacity: 0.55,
                },
              {
                width: "100%",
                marginBottom: theme.sizes.base / 2,
              },
            ]}
            onPress={() => {
              if (!disabled) {
                setIsVisible(true);
              }
            }}
          >
            <View
              style={[
                styles,
                {
                  borderRadius: theme.sizes.base / 2,
                  paddingVertical: theme.sizes.small + 2,
                  paddingHorizontal: theme.sizes.small + 2,
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
                inputStyle,
                inputDisabledProps,
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {mode == "time" ? (
                  <AntDesign
                    name="clockcircleo"
                    size={theme.sizes.large}
                    color="rgba(22,24,35,0.64)"
                  />
                ) : (
                  <AntDesign
                    name="calendar"
                    size={theme.sizes.large}
                    color="rgba(22,24,35,0.64)"
                  />
                )}

                <Text
                  style={{
                    letterSpacing: 0.5,
                    color: value ? "rgb(22,24,35)" : "rgba(22,24,35,0.34)",
                    marginLeft: theme.sizes.small,
                  }}
                >
                  {value
                    ? mode != "time"
                      ? moment(value).format(
                          FORMAT_DATE_REGEX["DD / MM / YYYY"]
                        )
                      : moment(value).format("hh:mm a")
                    : placeholder}
                </Text>
              </View>

              <AntDesign
                name="right"
                size={theme.sizes.large}
                color="rgba(22,24,35,0.44)"
              />
            </View>

            <DateTimePickerModal
              date={value || props?.maximumDate || new Date()}
              isVisible={isVisible}
              mode={mode}
              display="inline"
              locale="vi-vn"
              textColor="rgba(22,24,35,1)"
              themeVariant="light"
              accentColor={theme.colors.primary300}
              customCancelButtonIOS={() => {}}
              pickerContainerStyleIOS={{
                width: WIDTH - 20,
                alignSelf: "center",
              }}
              pickerStyleIOS={{ alignSelf: "center" }}
              customHeaderIOS={() => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: theme.sizes.font,
                    paddingVertical: theme.sizes.font,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <Pressable
                    style={({ pressed }) =>
                      pressed && {
                        opacity: 0.25,
                      }
                    }
                  >
                    <Text
                      style={{
                        color: theme.colors.highlight,
                        fontSize: theme.sizes.medium - 1,
                      }}
                      onPress={() => {
                        onChange("");
                        onBlur();
                        setIsVisible(false);
                      }}
                    >
                      Xóa
                    </Text>
                  </Pressable>
                </View>
              )}
              customConfirmButtonIOS={({ onPress }) => {
                return (
                  <Pressable
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.25,
                      },
                      {
                        position: "absolute",
                        right: 10,
                        top: 14,
                      },
                    ]}
                    onPress={onPress}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.medium,
                        fontWeight: "600",
                      }}
                    >
                      Xong
                    </Text>
                  </Pressable>
                );
              }}
              onConfirm={(selectedDate) => {
                onChange(selectedDate);
                onBlur();
                setIsVisible(false);
              }}
              onCancel={() => {
                setIsVisible(false);
                onBlur();
              }}
              {...props}
            />
          </Pressable>

          {!value && (
            <View style={{ marginTop: theme.sizes.base / 2 }}>
              {textHelpers.map((x, idx) => (
                <Text
                  key={idx}
                  style={{
                    color: "rgba(22,24,35,0.5)",
                    marginBottom: theme.sizes.base / 2,
                    fontSize: theme.sizes.small + 2,
                  }}
                >
                  <Text style={{ color: theme.colors.error }}>*</Text>
                  {x}
                </Text>
              ))}
            </View>
          )}

          {errors?.[name] && showError && (
            <Text
              style={{
                color: theme.colors.error,
                paddingLeft: !showLabel ? theme.sizes.base / 2 : 0,
              }}
            >
              {typeErrorMsg && errors[name]?.type === "typeError"
                ? typeErrorMsg
                : errors[name]?.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default DateTime;
