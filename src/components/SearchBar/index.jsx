import { useId } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import IconButton from "../IconButton";
import { Platform } from "react-native";

const SearchBar = ({
  style,
  placeholder,
  value,
  setValue,
  showSoftInputOnFocus,
  childrenRef,
  ...props
}) => {
  const theme = useTheme();
  const id = useId();

  return (
    <>
      <View
        style={[
          {
            padding: theme.sizes.base,
            paddingVertical: theme.sizes.base,
            flexDirection: "row",
            borderRadius: theme.sizes.base - 2,
          },
          style,
        ]}
      >
        <IconButton
          icon="search"
          size={20}
          color="rgba(22,24,35,0.34)"
          style={{
            marginRight: 8,
          }}
        />
        <TextInput
          ref={childrenRef}
          inputAccessoryViewID={showSoftInputOnFocus && id}
          style={{ flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          showSoftInputOnFocus={showSoftInputOnFocus}
          {...props}
        />
      </View>

      {showSoftInputOnFocus && Platform.OS === "ios" && (
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
                  style={{ fontSize: theme.sizes.medium, fontWeight: "bold" }}
                >
                  Xong
                </Text>
              </Pressable>
            </View>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
};

export default SearchBar;
