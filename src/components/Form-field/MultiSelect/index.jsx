import { useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "react-native-paper";

const MultiSelect = ({
  label,
  value,
  setValue,
  placeholder,
  showLabel = true,
  data,
  zIndex,
  searchable = true,
  labelStyle = {},
  containerStyle = {},
  ...props
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
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
          items={data}
          autoScroll
          placeholder={placeholder}
          open={isOpen}
          setOpen={setIsOpen}
          value={value}
          setValue={(callback) => {
            setValue((prev) => callback(prev));
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
    </View>
  );
};

export default MultiSelect;
