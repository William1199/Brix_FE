import { AntDesign } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import ListScreen from "./ListScreen";

const SelectedField = ({
  name,
  label = name,
  placeholder = label,
  errors,
  control,
  showLabel = true,
  showError = true,
  isOutline = false,
  isRequired = false,
  containerStyle = {},
  labelStyle = {},
  inputStyle = {},
  list,
  schema = { label: "name", value: "value" },
  shouldOpen = true,
}) => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
          <ListScreen
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            value={value}
            title={label}
            list={list}
            schema={schema}
            callback={onChange}
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

            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
                {
                  width: "100%",
                  marginBottom: theme.sizes.base / 2,
                },
              ]}
              onPress={() => {
                if (shouldOpen) {
                  setIsModalVisible(true);
                }
              }}
            >
              <View
                style={[
                  {
                    padding: theme.sizes.small + 2,
                    paddingRight: theme.sizes.small + 2,
                    backgroundColor: showLabel
                      ? "rgba(22,24,35,0.06)"
                      : "transparent",
                    borderRadius: theme.sizes.base,
                    fontSize: theme.sizes.font + 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                  },
                  inputOutlineProps,
                  inputStyle,
                ]}
              >
                <Text
                  style={{
                    color:
                      value || value === 0
                        ? "rgb(22,24,35)"
                        : "rgba(22,24,35,0.34)",
                  }}
                >
                  {(list.find((x) => x[schema.value] === value) &&
                    list.find((x) => x[schema.value] === value)[
                      schema.label
                    ]) ||
                    placeholder}
                </Text>
                <AntDesign
                  name="right"
                  size={theme.sizes.large}
                  color="rgba(22,24,35,0.44)"
                />
              </View>
            </Pressable>

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

export default SelectedField;
