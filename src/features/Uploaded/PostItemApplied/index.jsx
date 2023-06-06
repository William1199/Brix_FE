import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import axiosInstance from "~/app/api";
import { SHADOWS } from "~/app/theme";
import { API_RESPONSE_CODE, NO_IMAGE_URL, PLACES, ROUTE } from "~/constants";
import { formatStringToCurrency, parseCurrencyText } from "~/utils/helper";

const PostItemApplied = ({ item, index }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [isSave, setIsSave] = useState(item.isSave);
  const handleSave = async (item) => {
    let request = {
      contractorPostId: item.postId,
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
          ...SHADOWS.light,
        },
        pressed && {
          opacity: 0.55,
        },
      ]}
      onPress={() => navigation.navigate(ROUTE.postDetail, { id: item.postId })}
    >
      <View
        style={{
          flexDirection: "row",
          paddingVertical: theme.sizes.medium,
          marginHorizontal: theme.sizes.font,
          alignItems: "flex-start",
        }}
      >
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
            source={{ uri: item.avatar || NO_IMAGE_URL }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: theme.sizes.font,
          }}
        >
          <View style={{ maxWidth: "90%" }}>
            <Text
              style={{ fontWeight: "bold", fontSize: theme.sizes.font + 1 }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={{
                marginVertical: theme.sizes.base - 2,
                fontSize: theme.sizes.font - 1,
              }}
              numberOfLines={1}
            >
              {item.authorName}
            </Text>

            <Text
              style={{
                marginBottom: theme.sizes.base - 2,
                fontSize: theme.sizes.font - 1,
              }}
            >
              {PLACES[item.place]}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  marginBottom: theme.sizes.base - 2,
                  fontSize: theme.sizes.font - 1,
                }}
              >
                {"Ngày ứng tuyển: " +
                  moment(item.appliedDate).format("DD/MM/yy")}
              </Text>
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  height: "100%",
                  justifyContent: "flex-end",
                  alignItems: "center",
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
            </View>

            {item.wishSalary && (
              <Text
                style={{
                  color: theme.colors.highlight,
                  fontSize: theme.sizes.font - 1,
                }}
              >
                {"Lương mong muốn: " +
                  formatStringToCurrency(item.wishSalary.toString())}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default PostItemApplied;
