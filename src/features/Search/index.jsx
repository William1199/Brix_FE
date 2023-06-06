import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ASYNC_STORAGE_KEY, CATEGORIES, ROUTE } from "~/constants";
import { getAsyncStorage, setAsyncStorage } from "~/utils/helper";
import BlockItem from "./components/BlockItem";
import Header from "./components/Header";

const SearchScreen = ({ route, navigation }) => {
  const {
    placeholder,
    searchValue,
    isProduct = false,
    ...rest
  } = route.params || {};
  const theme = useTheme();

  const [_history, setHistory] = useState([]);

  useEffect(() => {
    //interact with async storage to get history
    (async () => {
      try {
        const value = await getAsyncStorage(
          isProduct
            ? ASYNC_STORAGE_KEY.search_product
            : ASYNC_STORAGE_KEY.search_history
        );

        if (Array.isArray(value)) {
          setHistory(value);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  //interact with async storage to update history
  useEffect(() => {
    (async () => {
      try {
        await setAsyncStorage(
          isProduct
            ? ASYNC_STORAGE_KEY.search_product
            : ASYNC_STORAGE_KEY.search_history,
          _history
        );
      } catch (e) {
        console.log(e);
      }
    })();
  }, [_history]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        navigation={navigation}
        placeholder={placeholder}
        searchValue={searchValue}
        isProduct={isProduct}
        {...rest}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: "#eeeeee",
        }}
      >
        {_history.length !== 0 && (
          <BlockItem title="tìm kiếm gần đây" onPress={() => setHistory([])}>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: theme.sizes.medium,
              }}
            >
              {_history.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    navigation.navigate(
                      isProduct ? ROUTE.storeDetail : ROUTE.viewAll,
                      {
                        searchValue: item.name,
                        ...rest,
                      }
                    )
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      borderColor: "rgba(22,24,35,0.12)",
                      borderTopWidth: 1,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: theme.sizes.font,
                      }}
                    >
                      <AntDesign
                        name="clockcircleo"
                        size={theme.sizes.large + 2}
                        color="rgba(22,24,35,0.2)"
                        style={{ marginRight: theme.sizes.font }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: theme.sizes.medium - 1,
                          }}
                        >
                          {item.name}{" "}
                          <Text
                            style={{
                              color: "rgba(22,24,35,0.3)",
                              fontSize: theme.sizes.font,
                            }}
                          >
                            {item.resultLength}{" "}
                            {isProduct ? "sản phẩm" : "việc làm"}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    <AntDesign
                      name="close"
                      color="rgba(22,24,35,0.34)"
                      size={theme.sizes.large}
                      onPress={() =>
                        setHistory((prev) =>
                          prev.filter((x) => x.id !== item.id)
                        )
                      }
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </BlockItem>
        )}

        <BlockItem
          title="từ khóa phổ biến"
          showClearButton={false}
          style={{ flex: 1 }}
        >
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: theme.sizes.medium,
              flex: 1,
            }}
          >
            {CATEGORIES.map((item, idx) => (
              <Pressable
                onPress={() =>
                  navigation.navigate(
                    isProduct ? ROUTE.storeDetail : ROUTE.viewAll,
                    {
                      searchValue: item.name,
                      ...rest,
                    }
                  )
                }
                key={idx}
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    borderColor: "rgba(22,24,35,0.12)",
                    borderTopWidth: 1,
                  },
                ]}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: theme.sizes.font,
                  }}
                >
                  <FontAwesome5
                    name="fire"
                    size={theme.sizes.large + 2}
                    color="rgba(22,24,35,0.2)"
                    style={{ marginRight: theme.sizes.font }}
                  />
                  <View>
                    <Text
                      style={{
                        textTransform: "capitalize",
                        fontSize: theme.sizes.medium - 1,
                      }}
                    >
                      {item.name}{" "}
                      <Text
                        style={{
                          color: "rgba(22,24,35,0.3)",
                        }}
                      >
                        ({item.name})
                      </Text>
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </BlockItem>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
