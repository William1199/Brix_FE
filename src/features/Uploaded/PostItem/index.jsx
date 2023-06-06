import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import axiosInstance from "~/app/api";
import { SHADOWS } from "~/app/theme";
import { API_RESPONSE_CODE, NO_IMAGE_URL, PLACES, ROUTE } from "~/constants";
import { parseCurrencyText } from "~/utils/helper";

const PostItem = ({
  item,
  index,
  renderSaved,
  isReport = false,
  handleReason = {},
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [isSave, setIsSave] = useState(item.isSave);

  const handleSave = async (item) => {
    let request = {
      contractorPostId: item.id || item.postId || item.contractorPostId,
    };

    try {
      let res;
      if (isSave) {
        res = await axiosInstance.put("savepost", request);
      } else {
        res = await axiosInstance.post("savepost", request);
      }
      if (+res.code === API_RESPONSE_CODE.success) {
        setIsSave(!isSave);
      }
    } catch (e) {
      console.log(`save post error ${e}`);
    }
  };
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor:
            item.status == 3 || !item.status ? "white" : "rgba(22,24,35,0.06)",
          marginTop: index === 0 ? theme.sizes.font : 0,
          marginBottom: theme.sizes.font,
          borderRadius: theme.sizes.base,
          // ...SHADOWS.light,
        },
        pressed && {
          opacity: 0.55,
        },
      ]}
      onPress={() => navigation.navigate(ROUTE.postDetail, { id: item.id })}
    >
      <View
        style={{
          flexDirection: "row",
          paddingVertical: theme.sizes.medium,
          marginHorizontal: theme.sizes.font,
        }}
      >
        <View>
          <View
            style={{
              width: 65,
              height: 65,
              borderColor: "#ddd",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: theme.sizes.base,
              padding: theme.sizes.base / 2,
              backgroundColor: "white",
            }}
          >
            <Image
              source={{
                uri:
                  (item?.avatar ? item?.avatar : item?.author?.avatar) ||
                  NO_IMAGE_URL,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
          {isReport && (
            <View
              style={{
                backgroundColor: theme.colors.highlight,
                borderRadius: theme.sizes.base - 2,
                marginTop: 10,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  {
                    padding: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  pressed && {
                    backgroundColor: "rgba(22,24,35,.06)",
                  },
                ]}
                onPress={() => handleReason(item.problems || null)}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: theme.sizes.font - 1,
                  }}
                >
                  Lý do
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: theme.sizes.font,
          }}
        >
          {renderSaved && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                justifyContent: "flex-end",
                alignItems: "center",
                zIndex: 110001000,
              }}
            >
              <Pressable onPress={() => handleSave(item)}>
                <AntDesign
                  name={isSave ? "heart" : "hearto"}
                  size={24}
                  color={isSave ? theme.colors.highlight : "#bebebe"}
                />
              </Pressable>
            </View>
          )}

          <View style={{ minWidth: "82%" }}>
            <Text
              style={{ fontWeight: "bold", fontSize: theme.sizes.font + 1 }}
              numberOfLines={2}
            >
              {item?.title || item?.contractorPostName}
            </Text>
            <Text
              style={{
                marginVertical: theme.sizes.base - 2,
                fontSize: theme.sizes.font - 1,
              }}
              numberOfLines={1}
            >
              {item?.authorName ||
                item?.builderName ||
                item?.author?.firstName + " " + item?.author?.lastName}
            </Text>

            <Text
              style={{
                marginBottom: theme.sizes.base - 2,
                fontSize: theme.sizes.font - 1,
              }}
            >
              {PLACES[item?.place] || PLACES[item?.places]}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.highlight,
                  fontSize: theme.sizes.font - 1,
                }}
              >
                {parseCurrencyText(item?.salaries)}
              </Text>
              {item.status == 10 && (
                <Text
                  style={{
                    color: "red",
                    fontSize: theme.sizes.font - 1,
                    fontWeight: "semi-bold",
                  }}
                >
                  Đã ngưng tuyển
                </Text>
              )}
              {item.status == 11 && (
                <Text
                  style={{
                    color: "red",
                    fontSize: theme.sizes.font - 1,
                    fontWeight: "semi-bold",
                  }}
                >
                  Đã vô hiệu hóa
                </Text>
              )}
              {item.status == 5 && (
                <Text
                  style={{
                    color: "red",
                    fontSize: theme.sizes.font - 1,
                    fontWeight: "semi-bold",
                  }}
                >
                  Cần bài kiểm tra
                </Text>
              )}
            </View>

            {isReport && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: theme.sizes.base - 2,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: theme.sizes.font - 1,
                    marginBottom: theme.sizes.base - 2,

                    color: item.status !== 3 ? "red" : theme.colors.highlight,
                  }}
                  numberOfLines={1}
                >
                  {item.status == 3
                    ? "Cần vô hiệu hóa"
                    : item.reportCount == 5
                    ? "Đã tự động vô hiệu hóa"
                    : ""}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default PostItem;
