import { Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const CheckBox = ({
  name,
  errors,
  control,
  label = name,
  showLabel = true,
  showError = true,
  containerStyle = {},
  style = {},
}) => {
  const theme = useTheme();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <View
          style={[
            {
              marginVertical: theme.sizes.base,
            },
            containerStyle,
          ]}
        >
          {showLabel ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.font - 2,
                }}
              >
                {label}
              </Text>

              <Pressable onPress={() => onChange(!value)}>
                <View
                  style={[
                    {
                      height: theme.sizes.large,
                      width: theme.sizes.large,
                      borderRadius: 12,
                      borderWidth: 1.25,
                      borderColor: errors[name] ? theme.colors.error : "black",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    style,
                  ]}
                >
                  {value ? (
                    <View
                      style={{
                        height: theme.sizes.large / 2,
                        width: theme.sizes.large / 2,
                        borderRadius: 6,
                        backgroundColor: "#000",
                      }}
                    />
                  ) : null}
                </View>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => onChange(!value)}>
              <View
                style={[
                  {
                    height: theme.sizes.large,
                    width: theme.sizes.large,
                    borderRadius: 12,
                    borderWidth: 1.25,
                    borderColor: errors[name] ? theme.colors.error : "black",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  style,
                ]}
              >
                {value ? (
                  <View
                    style={{
                      height: theme.sizes.large / 2,
                      width: theme.sizes.large / 2,
                      borderRadius: 6,
                      backgroundColor: "#000",
                    }}
                  />
                ) : null}
              </View>
            </Pressable>
          )}

          {showError && errors[name] && (
            <Text
              style={{
                color: theme.colors.error,
                paddingLeft: theme.sizes.base / 2,
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

export default CheckBox;
