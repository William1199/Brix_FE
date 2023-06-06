import { useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Header from "../Header";

const Content = () => (
  <View>
    <Text>Hello</Text>
  </View>
);

const SearchWrapper = ({ children, searchConfig }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Header
        inputConfig={{
          ...searchConfig,
          value: searchQuery,
          setValue: setSearchQuery,
          onFocus: ({ nativeEvent }) => {
            setIsFocus(true);
          },
        }}
      />

      <View style={{ flex: 1, paddingBottom: theme.sizes.medium }}>
        {isFocus ? <Content /> : children}
      </View>
    </View>
  );
};

export default SearchWrapper;
