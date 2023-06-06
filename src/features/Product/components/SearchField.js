import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";
import colors from "../config/colors";
import SPACING from "../config/SPACING";

import { Ionicons } from "@expo/vector-icons";

const SearchField = () => {
  return (
    <View
      style={{
        borderRadius: SPACING,
        overflow: "hidden",
      }}
    >
      <BlurView
        intensity={30}
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(22,24,35,0.06)",
        }}
      >
        <TextInput
          style={{
            width: "100%",
            color: colors.dark,
            fontSize: SPACING * 1.7,
            padding: SPACING,
            paddingLeft: SPACING * 3.5,
          }}
          placeholder="Gõ để tìm sản phẩm..."
          placeholderTextColor="#000"
        />
        <Ionicons
          style={{
            position: "absolute",
            left: SPACING,
          }}
          name="search"
          color="#000"
          size={SPACING * 2}
        />
      </BlurView>
    </View>
  );
};

export default SearchField;

const styles = StyleSheet.create({});
