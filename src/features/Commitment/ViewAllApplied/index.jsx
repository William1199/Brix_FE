import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { Menu, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { StatusBarComp } from "~/components";
import { API_RESPONSE_CODE, NO_IMAGE_URL, PLACES, ROUTE } from "~/constants";
import { formatStringToCurrency } from "~/utils/helper";
import { ContactMenu } from "../components";

const HEIGHT_IMG = 100;
const ITEM_PADDING = 10;
const ITEM_MARGIN_BOTTOM = 20;
const ITEM_SIZE = HEIGHT_IMG + ITEM_PADDING * 2 + ITEM_MARGIN_BOTTOM;

const { height, width } = Dimensions.get("window");

moment.locale("vi");

const ViewAllAppliedScreen = ({ navigation, route }) => {
  const {
    projectName,
    id,
    startDate,
    endDate,
    peopleRemained,
    numberPeople,
    place,
  } = route.params;

  const theme = useTheme();

  const scrollY = useRef(new Animated.Value(0)).current;

  const [isLoading, setIsLoading] = useState(true);
  const [appliedList, setAppliedList] = useState([]);

  const renderListEmpty = () => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: theme.sizes.large,
        marginTop: 24,
      }}
    >
      <Image
        source={{
          uri: "https://cdni.iconscout.com/illustration/premium/thumb/find-a-doctor-online-1946841-1648368.png",
        }}
        style={{ width: 150, height: 150 }}
        resizeMode="cover"
      />
      <Text
        style={{
          maxWidth: "70%",
          textAlign: "center",
          fontSize: theme.sizes.medium,
          fontWeight: "bold",
        }}
      >
        Hiện chưa có ai ứng tuyển vào bài viết
      </Text>
    </View>
  );

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get(
        "contractorpost/applied/:id".replace(":id", id)
      );
      if (+res.code === API_RESPONSE_CODE.success) {
        setAppliedList(res.data);
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCreateCommitment = async (builderId) => {
    const { code, message, data } = await axiosInstance.get("commitment/load", {
      params: { postId: id, builderId: builderId },
    });
    if (+code === API_RESPONSE_CODE.success) {
      navigation.navigate(ROUTE.createCommitment, {
        id: id,
        builderId: builderId,
        projectName: data.projectName,
        description: data.description,
        benefit: data.benefit,
        required: data.required,
        startDate: data.startDate,
        endDate: data.endDate,
        salary: data.salaries,
        partyA: data.partyA,
        partyB: data.partyB,
        group: data.group,
      });
    }
  };

  const renderItem = ({ item, index }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)],
      outputRange: [1, 1, 1, 0],
    });

    const opacity = scrollY.interpolate({
      inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 0.6)],
      outputRange: [1, 1, 1, 0],
    });
    return (
      <Animated.View
        style={{
          paddingTop: ITEM_PADDING + 6,
          paddingHorizontal: ITEM_PADDING,
          transform: [{ scale }],
          opacity,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              alignItems: "center",
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
                borderRadius: theme.sizes.base / 2,
                padding: theme.sizes.base,
              }}
            >
              <Image
                style={{ width: "100%", height: "80%" }}
                source={{
                  uri: item.avatar || NO_IMAGE_URL,
                }}
                resizeMode="cover"
              />
            </View>
            <ContactMenu
              item={item}
              handleCreateCommitment={handleCreateCommitment}
              videoUrl={item.video || null}
            />
          </View>

          <View
            style={{
              marginLeft: theme.sizes.font,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.medium,
                fontWeight: "600",
                color: theme.colors.darklight,
                marginBottom: theme.sizes.base / 2,
              }}
            >
              {item.firstName + " " + item.lastName}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.base / 2,
              }}
            >
              <Text
                style={{
                  color: theme.colors.darklight,
                }}
              >
                Ứng tuyển vào ngày:
              </Text>
              <Text style={{ color: theme.colors.darklight }}>
                {" " + moment(item.appliedDate).format("DD/MM/yy")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.base / 2,
              }}
            >
              <Text
                style={{
                  color: theme.colors.darklight,
                }}
              >
                Loại thợ:
              </Text>
              <Text style={{ color: theme.colors.darklight }}>
                {" " + item.typeName}
              </Text>
            </View>
            {item.quizName && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.darklight,
                    }}
                  >
                    Bài kiểm tra:{" "}
                  </Text>
                  <Pressable
                    onPress={() => {
                      navigation.navigate(ROUTE.test, {
                        postId: id,
                        isReadOnly: true,
                        builderId: item.builderID,
                        id: item.quizId,
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.darklight,
                        color: "blue",
                        textDecorationLine: "underline",
                      }}
                    >
                      {`${item.quizName}`}
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.darklight,
                    }}
                  >
                    Câu trả lời đúng:{" "}
                  </Text>
                  <Text style={{ color: theme.colors.darklight }}>
                    {`${item.totalCorrectAnswers} / ${item.totalNumberQuestion}`}
                  </Text>
                </View>
              </>
            )}

            {item.wishSalary && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: theme.colors.highlight,
                    fontWeight: "bold",
                  }}
                >
                  Lương đề nghị:
                </Text>
                <Text
                  style={{
                    color: theme.colors.highlight,
                    fontWeight: "bold",
                  }}
                >
                  {" " + formatStringToCurrency(item.wishSalary?.toString())}
                </Text>
              </View>
            )}

            {item.groups &&
              item.groups?.map((member, index) => {
                return (
                  <Fragment key={index}>
                    {index == 0 && (
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: theme.colors.darklight,
                          marginTop: 10,
                        }}
                      >
                        Đội nhóm
                      </Text>
                    )}

                    <Text
                      style={[
                        {
                          color: theme.colors.darklight,

                          marginTop: index == 0 ? 10 : 5,
                        },
                      ]}
                    >
                      {member.name}
                    </Text>
                    <Text
                      style={[
                        {
                          color: theme.colors.darklight,
                        },
                      ]}
                    >
                      {member.typeName}
                    </Text>
                  </Fragment>
                );
              })}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "rgba(22,24,35,0.12)",
            height: 1,
            width: "100%",
            marginTop: 10,
          }}
        ></View>
      </Animated.View>
    );
  };

  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary300}
        statusConfig={{ style: "light" }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <View
              style={{
                paddingHorizontal: 40,
                paddingVertical: 20,
                backgroundColor: theme.colors.primary300,
                width: width,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "bold",
                    color: theme.colors.textColor200,
                    alignSelf: "center",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {projectName}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: "white",
                    alignSelf: "center",
                    marginTop: 10,
                    fontWeight: "600",
                  }}
                >
                  {PLACES[place]}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center",
                  justifyContent: "space-between",
                  borderTopWidth: 0.5,
                  borderColor: "white",
                  marginTop: 20,
                }}
              >
                <View style={{ marginRight: 24 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 10,
                      alignSelf: "center",
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Bắt đầu
                  </Text>
                  <Text
                    style={{
                      fontWeight: "semi-bold",
                      fontSize: 15,
                      color: theme.colors.textColor200,
                      alignSelf: "center",
                    }}
                  >
                    {moment(startDate).format("DD/MM/yy")}
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 10,
                      color: "white",
                      marginBottom: 4,
                      alignSelf: "center",
                      fontWeight: "600",
                    }}
                  >
                    Số lượng đã tuyển
                  </Text>
                  <Text
                    style={{
                      fontWeight: "semi-bold",

                      fontSize: 15,
                      color: theme.colors.textColor200,

                      alignSelf: "center",
                    }}
                  >
                    {numberPeople - peopleRemained + "/" + numberPeople}
                  </Text>
                </View>

                <View style={{ marginLeft: 24 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 10,
                      color: "white",
                      marginBottom: 4,
                      alignSelf: "center",
                      fontWeight: "600",
                    }}
                  >
                    Kết thúc
                  </Text>
                  <Text
                    style={{
                      fontWeight: "semi-bold",
                      fontSize: 15,
                      color: theme.colors.textColor200,

                      alignSelf: "center",
                    }}
                  >
                    {moment(endDate).format("DD/MM/yy")}
                  </Text>
                </View>
              </View>
            </View>
            <Animated.FlatList
              data={appliedList}
              renderItem={renderItem}
              ListEmptyComponent={renderListEmpty}
              keyExtractor={(item) => item.builderID}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
            />
          </>
        )}
      </SafeAreaView>
    </>
  );
};

export default ViewAllAppliedScreen;
