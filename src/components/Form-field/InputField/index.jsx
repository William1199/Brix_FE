import { useId, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Flag from "react-native-flags";
import { useTheme } from "react-native-paper";

const MOCK_DATA = {
  buttonHeight: 20,
};

const InputField = ({
  inputStyle,
  name,
  label = name,
  placeholder = label,
  keyboardType,
  errors,
  control,
  showLabel = true,
  showError = true,
  showingPrefix = false,
  disabled = false,
  inputConfig = {},
  mode,
  onButtonPress = () => {},
  buttonTitle,
  isOutline = false,
  isRequired = false,
  buttonStyle = {},
  buttonTextStyle = {},
  containerStyle = {},
  labelStyle = {},
}) => {
  const { buttonHeight } = MOCK_DATA;
  const theme = useTheme();
  const id = useId();

  const [buttonWidth, setButtonWidth] = useState(0);

  const inputNonLabelStyles = useMemo(
    () =>
      !showLabel
        ? {
            borderBottomColor: errors[name]
              ? theme.colors.error
              : "rgba(22,24,35,0.12)",
            borderBottomWidth: 1,
            paddingVertical: theme.sizes.base / 2,
            paddingHorizontal: theme.sizes.base - 2,
            paddingRight: buttonTitle
              ? theme.sizes.base - 2 + buttonWidth
              : theme.sizes.base - 2,
          }
        : {
            borderColor: errors[name] && theme.colors.error,
            borderWidth: errors[name] && 1,
          },
    [showLabel, errors[name]]
  );

  const inputPasswordProps = useMemo(
    () =>
      mode === "password"
        ? {
            secureTextEntry: true,
            textContentType: "oneTimeCode",
          }
        : {},
    [mode]
  );

  const inputOutlineProps = useMemo(
    () =>
      isOutline
        ? {
            borderRadius: theme.sizes.base / 2,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: errors[name]
              ? theme.colors.error
              : "rgba(22,24,35,0.12)",
          }
        : {},
    [isOutline, errors[name]]
  );

  const inputDisabledProps = useMemo(
    () =>
      disabled
        ? {
            backgroundColor: "rgba(22,24,35,0.06)",
            borderWidth: 0,
            color: "rgba(22,24,35,0.64)",
          }
        : {},
    [disabled]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View
          style={[{ marginVertical: theme.sizes.base / 2 }, containerStyle]}
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
              {isRequired && (
                <Text
                  style={{
                    marginLeft: theme.sizes.base,
                    color: theme.colors.error,
                  }}
                >
                  *
                </Text>
              )}
            </Text>
          )}

          <View
            style={{
              width: "100%",
              marginBottom: theme.sizes.base / 2,
              flexDirection: "row",
            }}
          >
            {/* prefix */}
            {showingPrefix && (
              <View
                style={[
                  {
                    borderColor: "rgba(22,24,35,0.12)",
                    borderWidth: 1,
                    paddingHorizontal: theme.sizes.small,
                    marginRight: theme.sizes.base / 2,
                    borderRadius: theme.sizes.base - 2,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                  inputDisabledProps,
                ]}
              >
                <Flag code="VN" size={24} />
                <Text
                  style={{
                    marginLeft: theme.sizes.base,
                    color: disabled ? "rgba(22,24,35,0.64)" : "rgb(22,24,35)",
                  }}
                >
                  +84
                </Text>
              </View>
            )}

            <TextInput
              placeholder={placeholder}
              keyboardType={keyboardType}
              style={[
                {
                  flex: 1,
                  padding: theme.sizes.small + 2,
                  paddingRight: buttonTitle
                    ? theme.sizes.small + 2 + buttonWidth
                    : theme.sizes.small + 2,
                  backgroundColor: showLabel
                    ? "rgba(22,24,35,0.06)"
                    : "transparent",
                  borderRadius: theme.sizes.base,
                  fontSize: theme.sizes.font + 1,
                  minHeight: inputConfig.multiline && 110,
                },
                inputNonLabelStyles,
                inputOutlineProps,
                inputDisabledProps,
                inputStyle,
              ]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              cursorColor={theme.colors.primary400}
              autoCapitalize={inputConfig.multiline ? "sentences" : "none"}
              autoCorrect={inputConfig.multiline || false}
              clearButtonMode="while-editing"
              textAlignVertical={inputConfig.multiline ? "top" : "center"}
              editable={!disabled}
              inputAccessoryViewID={id}
              {...inputPasswordProps}
              {...inputConfig}
            />
            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={id}>
                <View
                  style={{
                    backgroundColor: "#f1f1f1",
                    padding: theme.sizes.font,
                    justifyContent: "flex-end",
                    borderTopColor: "rgba(22,24,35,0.06)",
                    borderTopWidth: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: theme.sizes.font - 1,
                        color: "rgba(22,24,35,0.3)",
                      }}
                    >
                      {placeholder}
                    </Text>
                  </View>

                  <View
                    style={{
                      position: "absolute",
                      right: 15,
                      top: 13,
                    }}
                  >
                    <Pressable
                      style={({ pressed }) =>
                        pressed && {
                          opacity: 0.25,
                        }
                      }
                      onPress={Keyboard.dismiss}
                    >
                      <Text
                        style={{
                          fontSize: theme.sizes.medium,
                          fontWeight: "600",
                          color: "rgba(22,24,35,0.64)",
                        }}
                      >
                        Xong
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </InputAccessoryView>
            )}

            {buttonTitle && (
              <Pressable
                onLayout={({
                  nativeEvent: {
                    layout: { width },
                  },
                }) => {
                  setButtonWidth(width);
                }}
                style={({ pressed }) => [
                  {
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: [{ translateY: -(buttonHeight / 2) }],
                    minHeight: buttonHeight,
                    minWidth: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  buttonStyle,
                  pressed && {
                    opacity: 0.25,
                  },
                ]}
                onPress={onButtonPress}
              >
                <Text
                  style={[
                    {
                      color: theme.colors.highlight,
                      fontWeight: "700",
                    },
                    buttonTextStyle,
                  ]}
                >
                  {buttonTitle}
                </Text>
              </Pressable>
            )}
          </View>
          {errors[name] && showError && (
            <Text
              style={{
                color: theme.colors.error,
                paddingLeft: !showLabel ? theme.sizes.base / 2 : 0,
                fontSize: theme.sizes.font - 2,
                marginTop: 2,
              }}
            >
              {errors[name]?.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default InputField;
