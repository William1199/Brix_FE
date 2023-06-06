import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import { useLayoutEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ROUTE } from "~/constants";

const ListQuizScreen = ({ navigation, route }) => {
  const { quizzes = [], type = [], postId } = route.params || {};
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="light" />
      {/* header */}
      <View
        style={{
          paddingTop: top + theme.sizes.base,
          paddingBottom: theme.sizes.small + 2,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          backgroundColor: theme.colors.primary400,
        }}
      >
        <AntDesign
          name="close"
          size={theme.sizes.extraLarge}
          color="white"
          onPress={() => navigation.goBack()}
          style={{
            marginRight: 10,
            position: "absolute",
            top: top + theme.sizes.small,
            left: 14,
          }}
        />
        <Text
          style={{
            color: "white",
            fontSize: theme.sizes.medium + 1,
            fontWeight: "600",
            textTransform: "capitalize",
            letterSpacing: 0.5,
          }}
        >
          Danh sách bài kiểm tra
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: theme.sizes.font,
        }}
      >
        {quizzes.map((item, idx) => {
          const typeName = type.find((x) => x.id === item.typeID)?.name;
          return (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.02)",
                },
                {
                  padding: theme.sizes.small,
                  borderColor: "rgba(22,24,35,0.06)",
                  borderWidth: 1,
                  marginBottom: theme.sizes.font,
                  borderRadius: theme.sizes.base / 2,
                },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE.test, {
                  postId,
                  isReadOnly: true,
                  id: item.id,
                })
              }
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {item.name}
              </Text>
              {typeName && (
                <Text
                  style={{
                    marginTop: theme.sizes.base / 2,
                    fontSize: theme.sizes.font - 1,
                  }}
                >
                  Loại thợ: {typeName}
                </Text>
              )}
              <Text
                style={{
                  marginTop: theme.sizes.base / 2,
                  fontSize: theme.sizes.font - 1,
                  color: "rgba(22,24,35,0.44)",
                }}
              >
                {moment(item.lastModifiedAt).fromNow()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ListQuizScreen;
