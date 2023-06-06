import { AntDesign } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { getRandomBetween } from "~/utils/helper";

const ListScreen = ({
  visible,
  title,
  list = [],
  value,
  schema = { label: "name", value: "value" },
  callback = () => {},
  onClose = () => {},
}) => {
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = useState();

  const scrollRef = useRef();

  useEffect(() => {
    const id = setTimeout(() => {
      if (value && visible) {
        const index = list.findIndex((x) => x[schema.value] === value);
        scrollRef.current &&
          index !== -1 &&
          scrollRef.current.scrollToIndex({ animated: true, index });
      }
    }, 400);
    setSelectedValue(value);

    return () => clearTimeout(id);
  }, [value, visible]);

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          paddingHorizontal: theme.sizes.font,
        }}
      >
        <Pressable
          onPress={() => {
            if (selectedValue === item[schema.value]) {
              return setSelectedValue();
            }
            setSelectedValue(item[schema.value]);
          }}
        >
          <View
            style={{
              height: 55,
              paddingVertical: theme.sizes.medium,
              borderBottomColor:
                index !== list.length - 1 && "rgba(22,24,35,0.12)",
              borderBottomWidth: index !== list.length - 1 ? 1 : 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: theme.sizes.font + 1 }}>
              {item[schema.label]}
            </Text>

            {selectedValue === item[schema.value] && (
              <AntDesign
                name="check"
                size={theme.sizes.extraLarge}
                color="#1f1fe4"
                style={{
                  position: "absolute",
                  right: 0,
                }}
              />
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.sizes.large,
            borderBottomColor: "rgba(22,24,35,0.12)",
            borderBottomWidth: 1,
          }}
        >
          <AntDesign
            name="close"
            size={22}
            color="rgb(22,24,35)"
            onPress={onClose}
            style={{ position: "absolute", left: theme.sizes.large }}
          />
          <Text
            style={{
              textTransform: "capitalize",
              fontWeight: "600",
              fontSize: theme.sizes.font + 1,
            }}
          >
            {title}
          </Text>

          {(selectedValue || selectedValue === 0) && (
            <Pressable
              style={({ pressed }) => [
                pressed && { opacity: 0.25 },
                {
                  position: "absolute",
                  right: theme.sizes.large,
                },
              ]}
              onPress={() => setSelectedValue()}
            >
              <Text
                style={{
                  textTransform: "capitalize",
                  color: "blue",
                }}
              >
                Đặt lại
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1, backgroundColor: "white" }}>
          <FlatList
            ref={scrollRef}
            data={list}
            keyExtractor={() => getRandomBetween(1000, 10000)}
            renderItem={renderItem}
            getItemLayout={(data, index) => ({
              length: 55,
              offset: 55 * index,
              index,
            })}
            style={{ flex: 1 }}
            alwaysBounceVertical={false}
          />

          {/* footer */}
          <View
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              padding: theme.sizes.font,
              backgroundColor: "white",
              borderTopColor: "rgba(22,24,35,0.12)",
              borderTopWidth: 1,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
              ]}
              onPress={() => {
                if (typeof callback === "function") {
                  callback(selectedValue);
                  onClose();
                }
              }}
            >
              <View
                style={{
                  backgroundColor: "#ff831e",
                  padding: theme.sizes.small + 2,
                  borderRadius: theme.sizes.base - 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: theme.sizes.medium,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  áp dụng
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ListScreen;
