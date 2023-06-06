import { FontAwesome5 } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const BadgeField = ({
  list,
  isMultiple = true,
  isRequired = false,
  name,
  label = name,
  control,
  errors,
  showLabel = true,
  showError = true,
  containerStyle = {},
  labelStyle = {},
  schema = {
    label: "name",
    value: "value",
  },
}) => {
  const theme = useTheme();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <View style={[{}, containerStyle]}>
          <View
            style={{
              alignSelf: "flex-start",
            }}
          >
            {showLabel && (
              <Text
                style={[
                  {
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

            {errors[name] && !showError && (
              <View
                style={{
                  position: "absolute",
                  right: -theme.sizes.base,
                  top: 2,
                }}
              >
                <FontAwesome5
                  name="star-of-life"
                  size={theme.sizes.base - 2}
                  color={theme.colors.error}
                />
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginLeft: -theme.sizes.small,
            }}
          >
            {list.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  if (isMultiple) {
                    if (value.includes(item[schema.value])) {
                      onChange(value.filter((x) => x !== item[schema.value]));
                      return;
                    }
                    onChange([...value, item[schema.value]]);
                  } else {
                    if (value === item[schema.value]) {
                      onChange(undefined);
                      return;
                    }
                    onChange(item[schema.value]);
                  }
                }}
              >
                <View
                  style={{
                    backgroundColor: isMultiple
                      ? value.includes(item[schema.value])
                        ? "rgba(100, 149, 237, 0.18)"
                        : "rgba(22,24,35,0.06)"
                      : value === item[schema.value]
                      ? "rgba(100, 149, 237, 0.18)"
                      : "rgba(22,24,35,0.06)",
                    padding: theme.sizes.small,
                    paddingHorizontal: theme.sizes.medium,
                    borderRadius: theme.sizes.large,
                    marginTop: theme.sizes.small,
                    marginLeft: theme.sizes.small,
                    minWidth: 65,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isMultiple
                        ? value.includes(item[schema.value])
                          ? "#0606f8"
                          : "rgb(22,24,35)"
                        : value === item[schema.value]
                        ? "#0606f8"
                        : "rgb(22,24,35)",
                    }}
                  >
                    {item[schema.label]}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {errors[name] && showError && (
            <Text
              style={{
                color: theme.colors.error,
                marginTop: theme.sizes.base / 2,
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

export default BadgeField;
