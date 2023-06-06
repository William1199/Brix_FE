import { useId, useMemo } from "react";
import { Controller } from "react-hook-form";
import MaskInput, { createNumberMask } from "react-native-mask-input";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "react-native-paper";
const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});

const MaskInputField = ({
  name,
  label = name,
  placeholder = label,
  errors,
  control,
  showLabel,
}) => {
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={[{ marginVertical: theme.sizes.base / 2 }]}>
          {showLabel && (
            <Text
              style={[
                {
                  marginBottom: theme.sizes.base - 2,
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: theme.sizes.font - 2,
                },
              ]}
            >
              {label}
            </Text>
          )}

          <View
            style={{
              width: "100%",
              marginBottom: theme.sizes.base / 2,
              flexDirection: "row",
            }}
          >
            <MaskInput
              mask={vndMask}
              placeholder={placeholder}
              style={{
                flex: 1,
                marginLeft: theme.sizes.base / 2,
                color: "blue",
              }}
              clearButtonMode="while-editing"
              keyboardType="numeric"
              value={value.toString()}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </View>
          {errors[name] && (
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

export default MaskInputField;
