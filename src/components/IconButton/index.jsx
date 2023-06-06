import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const IconButton = ({ icon, size, color, style, onPress, rounded }) => {
  return (
    <View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          borderRadius: rounded ? 100 : 0,
        },
        style,
      ]}
    >
      <Pressable
        android_ripple={{ color: "#ddd" }}
        onPress={onPress}
        style={({ pressed }) =>
          pressed && {
            opacity: 0.25,
          }
        }
      >
        <View>
          <Ionicons name={icon} size={size} color={color} />
        </View>
      </Pressable>
    </View>
  );
};

export default IconButton;
