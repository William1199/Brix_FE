import { Feather } from "@expo/vector-icons";
import { useEffect, useId, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SearchBar } from "~/components";
import { ASYNC_STORAGE_KEY, ROUTE } from "~/constants";
import { getAsyncStorage, setAsyncStorage } from "~/utils/helper";

const HEIGHT = 60;

const Header = ({
  navigation,
  placeholder,
  searchValue,
  isProduct,
  ...rest
}) => {
  const theme = useTheme();
  const id = useId();
  const [searchQuery, setSearchQuery] = useState(searchValue);

  const searchInputRef = useRef();

  // auto focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      const unsubscribe = navigation.addListener("focus", () => {
        searchInputRef.current?.focus();
      });
      return unsubscribe;
    }
  }, [navigation, searchInputRef.current]);

  const handleSubmitSearch = async () => {
    try {
      const _history =
        (await getAsyncStorage(
          isProduct
            ? ASYNC_STORAGE_KEY.search_product
            : ASYNC_STORAGE_KEY.search_history
        )) || [];

      if (searchQuery && !_history.some((x) => x.name === searchQuery)) {
        await setAsyncStorage(
          isProduct
            ? ASYNC_STORAGE_KEY.search_product
            : ASYNC_STORAGE_KEY.search_history,
          [{ id, name: searchQuery, resultLength: 0 }, ..._history].slice(0, 4)
        );
      }

      navigation.navigate(isProduct ? ROUTE.storeDetail : ROUTE.viewAll, {
        searchValue: searchQuery,
        ...rest,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: HEIGHT,
        padding: theme.sizes.small,
        borderBottomColor: "#eeeeee",
        borderBottomWidth: 1,
      }}
    >
      <Pressable
        style={({ pressed }) => [
          {
            paddingHorizontal: 2,
            marginRight: theme.sizes.small,
          },
          pressed && {
            opacity: 0.25,
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Feather
          name="chevron-left"
          size={theme.sizes.extraLarge + 8}
          color="rgba(22,24,35,0.65)"
        />
      </Pressable>

      <SearchBar
        style={{ flex: 1, backgroundColor: "#e6e6e6" }}
        placeholder={placeholder}
        setValue={setSearchQuery}
        value={searchQuery}
        childrenRef={searchInputRef}
        showSoftInputOnFocus={true}
        returnKeyType="search"
        clearButtonMode="while-editing"
        onSubmitEditing={handleSubmitSearch}
      />
    </View>
  );
};

export default Header;
