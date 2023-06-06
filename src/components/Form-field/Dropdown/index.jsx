import { useState } from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "react-native-paper";

const Dropdown = ({
  name,
  label = name,
  placeholder = label,
  errors,
  control,
  showLabel = true,
  showError = true,
  listData,
  zIndex,
  searchable = true,
  containerStyle = {},
  labelStyle = {},
  ...props
}) => {
  const theme = useTheme();
  const [listOpen, setListOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <View
          style={[
            { marginVertical: theme.sizes.base / 2, zIndex: zIndex },
            containerStyle,
          ]}
        >
          {showLabel && (
            <Text
              style={[
                {
                  marginBottom: theme.sizes.base / 2,
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

          <View
            style={{
              width: "100%",
              marginBottom: theme.sizes.base / 2,
            }}
          >
            <DropDownPicker
              // search
              searchable={searchable}
              searchContainerStyle={{
                borderBottomColor: "rgba(22,24,35,0.12)",
              }}
              searchTextInputStyle={{
                borderColor: "rgba(22,24,35,0.12)",
                paddingVertical: theme.sizes.small,
              }}
              searchPlaceholderTextColor="rgba(22,24,35,0.34)"
              // disabled
              disabledItemContainerStyle={{
                backgroundColor: "rgba(235,235,235,1)",
              }}
              disabledItemLabelStyle={{ color: "rgba(22,24,35,0.34)" }}
              // message
              listMessageTextStyle={{ color: "rgba(22,24,35,0.34)" }}
              // core
              items={listData}
              autoScroll
              placeholder={placeholder}
              open={listOpen}
              setOpen={setListOpen}
              value={value}
              setValue={(callback) => {
                onChange(callback(value));
              }}
              zIndex={zIndex}
              dropDownContainerStyle={{
                borderWidth: 0,
              }}
              style={[
                {
                  paddingHorizontal: theme.sizes.small + 2,
                  backgroundColor: showLabel
                    ? "rgba(22,24,35,0.06)"
                    : "transparent",
                  borderRadius: theme.sizes.base,
                  borderWidth: 0,
                },
              ]}
              {...props}
            />
          </View>
          {errors[name] && showError && (
            <Text
              style={{
                color: theme.colors.error,
                paddingLeft: !showLabel ? theme.sizes.base / 2 : 0,
                zIndex: -1,
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

export default Dropdown;
