import { useState } from "react";
import { Controller } from "react-hook-form";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import RenderHtml from "react-native-render-html";
import EditorScreen from "./EditorScreen";

const EditorField = ({
  inputStyle,
  name,
  label = name,
  placeholder = label,
  errors,
  control,
  showLabel = true,
  showError = true,
  inputConfig = {},
  containerStyle = {},
  labelStyle = {},
  isRequired = false,
}) => {
  const theme = useTheme();
  const [isEditorShown, setIsEditorShown] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <EditorScreen
            placeholder={placeholder}
            visible={isEditorShown}
            onClose={() => setIsEditorShown(false)}
            value={value}
            callback={onChange}
            onBlur={onBlur}
            inputConfig={inputConfig}
          />

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
              }}
            >
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.45,
                  }
                }
                onPress={() => setIsEditorShown(true)}
              >
                <View
                  style={[
                    {
                      borderRadius: theme.sizes.base / 2,
                      paddingVertical: theme.sizes.small + 2,
                      paddingHorizontal: theme.sizes.small + 2,
                      minHeight: 90,
                      borderWidth: 1,
                      borderColor: errors[name]
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                    },
                    inputStyle,
                  ]}
                >
                  <RenderHtml
                    contentWidth={Dimensions.get("window").width}
                    source={{
                      html: value || placeholder,
                    }}
                    defaultTextProps={{
                      style: {
                        color: !value ? "rgba(22,24,35,0.34)" : "rgb(22,24,35)",
                      },
                    }}
                  />
                </View>
              </Pressable>
            </View>

            {errors[name] && showError && (
              <Text
                style={{
                  color: theme.colors.error,
                  paddingLeft: !showLabel ? theme.sizes.base / 2 : 0,
                }}
              >
                {errors[name]?.message}
              </Text>
            )}
          </View>
        </>
      )}
    />
  );
};

export default EditorField;
