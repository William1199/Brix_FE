import {
  AntDesign,
  EvilIcons,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import "moment/locale/vi";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Menu, useTheme } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useIsFocused } from "@react-navigation/native";
import MaskInput, { createNumberMask } from "react-native-mask-input";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { ConfirmDialog, Dialog, Loading, SearchBar } from "~/components";
import {
  ALL_HTML_TAG,
  API_RESPONSE_CODE,
  ASYNC_STORAGE_KEY,
  CATEGORIES,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  PLACES,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import GuestContext from "~/context/GuestContext";
import { ContractorServices } from "~/services";
import {
  formatStringToCurrency,
  getAsyncStorage,
  parseCurrencyText,
  setAsyncStorage,
} from "~/utils/helper";
import ReasonModal from "../BillDetail/ReasonModal";
import VideoModal from "./VideoModal";

const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});
const MOCK_DATA = {
  _salary_default_value: {
    masked: "",
    unMasked: "",
  },
  _default_validate: {
    min: { valid: true, message: "" },
    max: { valid: true, message: "" },
  },
};

moment.locale("vi");

const width = Dimensions.get("window").width;

const PostDetailScreen = ({ navigation, route }) => {
  const { verifyAccount } = useContext(GuestContext);
  const { _salary_default_value, _default_validate } = MOCK_DATA;
  const theme = useTheme();

  const { id } = route.params;
  const { userInfo } = useContext(AuthContext);
  const { top, bottom } = useSafeAreaInsets();

  const [searchValue, setSearchValue] = useState("");
  const isFocused = useIsFocused();

  const [post, setPost] = useState();
  const [loading, setLoading] = useState(true);
  const [relatedList, setRelatedList] = useState([]);
  const [suggestedStore, setSuggestedStore] = useState([]);
  const [keyWord, setKeyWord] = useState([]);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [salary, setSalary] = useState(_salary_default_value);
  const [validate, setValidate] = useState(_default_validate);
  const [dynamicBoolean, setDynamicBoolean] = useState({
    isReadMore: { hasShow: false, bool: false },
    isMenuOpen: false,
    visible: false,
    isQuizOpen: false,
    isQuizMenuOpen: false,
    isAnimatedStart: false,
    isSalaryOpen: false,
    isGroup: false,
  });
  const [visible, setVisible] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const [confirm, setConfirm] = useState(false);
  const handleVideo = async (_video) => {
    setVideoUrl(_video);
    await setAsyncStorage(ASYNC_STORAGE_KEY.video, _video);
    if (post?.requiredQuiz) {
      setVideoModal(false);
      setDynamicBoolean((prev) => ({
        ...prev,
        visible: true,
      }));
    } else {
      const isSuccess = await ContractorServices.applyPosts({
        postId: id,
        wishSalary: salary.unMasked,
        video: _video,
      });

      if (isSuccess) {
        Toast.show({
          type: "success",
          text1: "Ứng tuyển thành công",
          position: "bottom",
          visibilityTime: 2500,
        });
        setPost((prev) => ({ ...prev, isApplied: true }));
        setVideoModal(false);
      }
    }
    // them dk dua qua man hinh apply group
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  let min;
  let max;
  if (post?.salaries?.includes("+")) {
    min = Number(post?.salaries?.split("+")[1].replace(".", ""));
    max = min + 500000;
  } else {
    min = Number(post?.salaries?.split("-")[0].replace(".", ""));
    max = Number(post?.salaries?.split("-")[1].replace(".", ""));
  }

  const hasNotApplyPost = useMemo(
    () => post?.isApplied || userInfo?.role?.toLowerCase() !== ROLE.builder,
    [post?.isApplied, userInfo?.role]
  );

  const benefit = useMemo(() => {
    if (post?.benefit) {
      return post?.benefit
        .replace(/<\/div>|<div>/g, "")
        .split("- ")
        .filter((x) => x)
        .map((x) => x.trim());
    }
  }, [post?.benefit]);

  const handleValidate = () => {
    let _validate = _default_validate;
    let _valid = true;
    if (salary.unMasked < min) {
      _validate = {
        min: {
          valid: false,
          message: `Lương tối thiểu là ${formatStringToCurrency(
            min.toString()
          )}`,
        },
      };
      _valid = false;
    }
    if (salary.unMasked > max) {
      _validate = {
        max: {
          valid: false,
          message: `Lương tối đa là ${formatStringToCurrency(max.toString())}`,
        },
      };
      _valid = false;
    }

    setValidate(_validate);
    return _valid;
  };

  const handleSave = async () => {
    let request = {
      contractorPostId: id,
    };

    try {
      let res;
      if (post?.isSave) {
        res = await axiosInstance.put("savepost", request);
      } else {
        res = await axiosInstance.post("savepost", request);
      }
      if (+res.code === API_RESPONSE_CODE.success) {
        setPost((ref) => ({
          ...ref,
          isSave: !ref.isSave,
        }));
      }
    } catch (e) {
      console.log(`save post error ${e}`);
    }
  };
  const renderPostItem = (item, idx) => {
    return (
      <Pressable
        key={idx}
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
        onPress={() => {
          navigation.push(ROUTE.postDetail, { id: item.id });
        }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingVertical: theme.sizes.medium,
            borderBottomColor: "#ddd",
            borderBottomWidth: idx !== relatedList.length - 1 ? 1 : 0,
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
              padding: theme.sizes.base / 2,
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
              <Pressable onPress={() => handleSave}>
                <AntDesign
                  name={post?.isSave ? "heart" : "hearto"}
                  size={24}
                  color={post?.isSave ? theme.colors.highlight : "#bebebe"}
                />
              </Pressable>
            </View>

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
                numberOfLines={2}
              >
                {item.authorName}
              </Text>

              <Text style={{ marginBottom: theme.sizes.base - 2 }}>
                {PLACES[item.place]}
              </Text>
              <Text
                style={{ color: theme.colors.highlight, fontWeight: "500" }}
              >
                {parseCurrencyText(post.salaries)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };
  const renderStoreItem = (item, idx) => {
    return (
      <Pressable
        key={idx}
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
        onPress={() =>
          navigation.navigate(ROUTE.storeDetail, {
            id: item.id,
            storeInfo: {
              firstName: item.firstName,
              lastName: item.lastName,
              avatar: item.avatar,
              keyWord: undefined,
            },
            userId: item.userId,
          })
        }
      >
        <View
          style={{
            flexDirection: "row",
            paddingVertical: theme.sizes.medium,
            borderBottomColor: "#ddd",
            borderBottomWidth: idx !== relatedList.length - 1 ? 1 : 0,
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
              padding: theme.sizes.base / 2,
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
                {item.firstName + " " + item.lastName}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  {
                    marginVertical: theme.sizes.base - 2,
                    zIndex: 1000,
                  },
                  pressed && {
                    opacity: 0.25,
                  },
                ]}
                onPress={() => {
                  Linking.openURL(item.webstie);
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: theme.sizes.font - 1,
                  }}
                >
                  {item.webstie}
                </Text>
              </Pressable>

              <Text style={{ marginBottom: theme.sizes.base - 2 }}>
                {PLACES[item.place]}
              </Text>
              <Text numberOfLines={1}>{item.description}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderActions = () => (
    <>
      <View
        style={{
          flex:
            userInfo?.id === post?.createdBy
              ? 1
              : userInfo?.role.toLowerCase() === ROLE.builder
              ? 2.5
              : 0,
          marginRight: theme.sizes.base,
        }}
      >
        <Menu
          visible={dynamicBoolean.isMenuOpen}
          anchor={
            userInfo?.id === post?.createdBy ? (
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.25,
                  }
                }
                onPress={() =>
                  navigation.navigate(ROUTE.viewAllApplied, {
                    id: id,
                    projectName: post.projectName,
                    startDate: post.starDate,
                    endDate: post.endDate,
                    peopleRemained: post.peopleRemained,
                    numberPeople: post.numberPeople,
                    place: post.place,
                  })
                }
              >
                <View
                  style={{
                    backgroundColor: theme.colors.highlight,
                    padding:
                      userInfo?.id !== post?.createdBy
                        ? theme.sizes.small
                        : post?.requiredQuiz
                        ? theme.sizes.small
                        : theme.sizes.font,
                    borderRadius: theme.sizes.base - 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize:
                        userInfo?.id !== post?.createdBy
                          ? theme.sizes.medium - 0.5
                          : post?.requiredQuiz
                          ? theme.sizes.medium - 0.5
                          : theme.sizes.large - 1,
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    Danh sách đã ứng tuyển
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  pressed &&
                    !hasNotApplyPost && {
                      opacity: 0.25,
                    },
                  {
                    height: "100%",
                    opacity:
                      userInfo?.role.toLowerCase() === ROLE.contractor ? 0 : 1,
                  },
                ]}
                onPress={
                  userInfo?.role?.toLowerCase() === ROLE.builder &&
                  post?.isGroup === false
                    ? () => {
                        if (verifyAccount(ROUTE.postDetail, { id })) {
                          if (userInfo?.status != 2) {
                            Toast.show({
                              type: "error",
                              text1: "Bạn phải cập nhật thông tin để ứng tuyển",
                              position: "bottom",
                              visibilityTime: 2500,
                            });
                            return navigation.navigate(ROUTE.myProfile);
                          }
                          if (hasNotApplyPost && post?.requiredQuiz) {
                            return navigation.navigate(ROUTE.test, {
                              postId: id,
                              isReadOnly: true,
                              id: post?.quizId,
                              videoUrl: videoUrl,
                            });
                          } else if (hasNotApplyPost && !post?.requiredQuiz) {
                            return;
                          }

                          setDynamicBoolean((prev) => ({
                            ...prev,
                            isMenuOpen: true,
                          }));
                        }
                      }
                    : () => {}
                }
              >
                <View
                  style={{
                    backgroundColor:
                      userInfo?.role?.toLowerCase() === ROLE.builder &&
                      post?.isApplied
                        ? post?.isGroup
                          ? "rgba(22,24,35,0.12)"
                          : post?.requiredQuiz
                          ? theme.colors.highlight
                          : "rgba(22,24,35,0.12)"
                        : theme.colors.highlight,
                    padding: theme.sizes.font,
                    borderRadius: theme.sizes.base - 2,
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color:
                        userInfo?.role?.toLowerCase() === ROLE.builder &&
                        post?.isApplied
                          ? post?.isGroup
                            ? "rgba(22,24,35,0.34)"
                            : post?.requiredQuiz
                            ? "white"
                            : "rgba(22,24,35,0.34)"
                          : "white",
                      fontSize: theme.sizes.medium,
                      fontWeight: "600",
                    }}
                  >
                    {userInfo?.role?.toLowerCase() === ROLE.builder &&
                      (post?.isApplied
                        ? post?.isGroup
                          ? "Đã ứng tuyển"
                          : post?.requiredQuiz
                          ? "Bài kiểm tra"
                          : "Đã ứng tuyển"
                        : "Ứng tuyển")}
                  </Text>
                </View>
              </Pressable>
            )
          }
          contentStyle={{ backgroundColor: "white" }}
          onDismiss={() =>
            setDynamicBoolean((prev) => ({ ...prev, isMenuOpen: false }))
          }
        >
          <Menu.Item
            onPress={() =>
              setDynamicBoolean((prev) => ({
                ...prev,
                isSalaryOpen: true,
                isMenuOpen: false,
                isGroup: false,
              }))
            }
            leadingIcon={({ size, color }) => (
              <Ionicons
                name="ios-person-outline"
                size={size - 3}
                color={color}
              />
            )}
            title="Dành cho cá nhân"
            titleStyle={{
              fontSize: theme.sizes.font,
            }}
          />

          <Menu.Item
            onPress={async () => {
              if (post?.isQuizAnswer && !post?.isApplied) {
                setDynamicBoolean((prev) => ({
                  ...prev,
                  isMenuOpen: false,
                  isGroup: true,
                }));
                return navigation.navigate(ROUTE.applyGroup, {
                  id,
                  salaryRange: post?.salaries,
                  video: await getAsyncStorage(ASYNC_STORAGE_KEY.video),
                });
              } else if (post?.videoRequired) {
                setDynamicBoolean((prev) => ({
                  ...prev,
                  isMenuOpen: false,
                  isGroup: true,
                }));
                setVideoModal(true);
                return;
              }

              setDynamicBoolean((prev) => ({
                ...prev,
                isMenuOpen: false,
                isGroup: true,
              }));
              return navigation.navigate(ROUTE.applyGroup, {
                id,
                salaryRange: post?.salaries,
              });
            }}
            title="Dành cho nhóm"
            leadingIcon={({ size, color }) => (
              <Ionicons name="ios-people-outline" size={size} color={color} />
            )}
            titleStyle={{
              fontSize: theme.sizes.font,
            }}
          />
        </Menu>
      </View>

      {userInfo?.id !== post?.createdBy ? (
        <Pressable
          style={({ pressed }) => [
            {
              flex: 1,
              marginRight:
                userInfo?.role.toLowerCase() === ROLE.contractor
                  ? width / 10
                  : 0,
            },
            pressed && {
              opacity: 0.25,
            },
          ]}
          onPress={() => {
            if (verifyAccount(ROUTE.postDetail, { id })) {
              handleSave();
            }
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(22,24,35,0.06)",
              borderColor: "rgba(22,24,35,0.12)",
              borderWidth: 1,
              padding: theme.sizes.font,
              borderRadius: theme.sizes.base / 2,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <AntDesign
              name={post?.isSave ? "heart" : "hearto"}
              size={20}
              color={
                post?.isSave ? theme.colors.highlight : "rgba(22,24,35,0.34)"
              }
            />
            <Text
              style={{
                color: "rgba(22,24,35,0.34)",
                fontSize: theme.sizes.medium,
                fontWeight: "600",
                marginLeft: theme.sizes.base / 2,
              }}
            >
              {post?.isSave ? "Đã lưu" : "Lưu"}
            </Text>
          </View>
        </Pressable>
      ) : post?.requiredQuiz ? (
        post?.quizzes?.length === post?.type?.length ? (
          <Pressable
            style={({ pressed }) => [
              {
                flex: 1,
              },
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={() =>
              navigation.navigate(ROUTE.listQuiz, {
                quizzes: post.quizzes || [],
                type: post.type,
                postId: post.id,
              })
            }
          >
            <View
              style={{
                flex: 1,
                borderColor: "rgba(22,24,35,0.12)",
                borderWidth: 1,
                padding: theme.sizes.small,
                borderRadius: theme.sizes.base / 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontSize: theme.sizes.medium - 0.5,
                  fontWeight: "500",
                  marginLeft: theme.sizes.base / 2,
                  textAlign: "center",
                }}
              >
                Danh sách bài kiểm tra
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }}>
            <Menu
              visible={dynamicBoolean.isQuizMenuOpen}
              anchor={
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      opacity: 0.25,
                    },
                    { height: "100%" },
                  ]}
                  onPress={() => {
                    if (verifyAccount(ROUTE.postDetail, { id })) {
                      setDynamicBoolean((prev) => ({
                        ...prev,
                        isQuizMenuOpen: true,
                      }));
                    }
                  }}
                >
                  <View
                    style={{
                      borderColor: "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      padding: theme.sizes.small,
                      paddingVertical: theme.sizes.large,
                      borderRadius: theme.sizes.base / 2,
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgb(22,24,35)",
                        fontSize: theme.sizes.medium - 0.5,
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                    >
                      Bài kiểm tra
                    </Text>
                  </View>
                </Pressable>
              }
              contentStyle={{ backgroundColor: "white" }}
              onDismiss={() =>
                setDynamicBoolean((prev) => ({
                  ...prev,
                  isQuizMenuOpen: false,
                }))
              }
            >
              <Menu.Item
                onPress={() => {
                  setDynamicBoolean((prev) => ({
                    ...prev,
                    isQuizMenuOpen: false,
                    isQuizOpen: true,
                  }));
                }}
                leadingIcon={({ size, color }) => (
                  <Ionicons
                    name="create-outline"
                    size={size - 3}
                    color={color}
                  />
                )}
                title="Tạo bài kiểm tra"
                titleStyle={{
                  fontSize: theme.sizes.font,
                }}
              />

              <Menu.Item
                onPress={() => {
                  setDynamicBoolean((prev) => ({
                    ...prev,
                    isQuizMenuOpen: false,
                  }));
                  navigation.navigate(ROUTE.listQuiz, {
                    quizzes: post.quizzes || [],
                    type: post.type,
                    postId: post.id,
                  });
                }}
                title="Danh sách bài kiểm tra"
                leadingIcon={({ size, color }) => (
                  <Ionicons
                    name="documents-outline"
                    size={size}
                    color={color}
                  />
                )}
                titleStyle={{
                  fontSize: theme.sizes.font,
                }}
              />
            </Menu>
          </View>
        )
      ) : null}
    </>
  );

  const renderProductItem = (item) => (
    <View
      key={item.id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.sizes.small,
      }}
    >
      <Image
        source={{ uri: item.image || NO_IMAGE_URL }}
        style={{
          width: 60,
          height: 60,
          borderRadius: theme.sizes.base,
        }}
        resizeMode="cover"
      />
      <View style={{ marginLeft: theme.sizes.base }}>
        <Text
          style={{ fontSize: theme.sizes.medium, fontWeight: "600" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={{ marginVertical: theme.sizes.base / 2 }}
          numberOfLines={1}
        >
          Quantity:{" "}
          <Text style={{ color: "rgba(22,24,35,0.64)" }}>{item.quantity}</Text>
        </Text>
      </View>
    </View>
  );

  const renderBenefitIcon = (idx) => {
    switch (idx) {
      case 0:
        return <MaterialIcons name="monetization-on" color="black" size={24} />;
      case 1:
        return <Ionicons name="school" color="black" size={24} />;
      case 2:
        return (
          <MaterialCommunityIcons name="trophy-award" size={24} color="black" />
        );
    }
  };

  const renderConfirmDialogContent = () => {
    if (userInfo?.role?.toLowerCase() === ROLE.builder) {
      return post?.type?.map((item, idx) => {
        const quiz = post?.quizzes?.find((x) => x.typeID === item.id);
        return (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              {
                padding: 14,
                borderBottomColor: "rgba(22,24,35,0.06)",
                borderBottomWidth: 1,
              },
            ]}
            onPress={() => {
              setDynamicBoolean((prev) => ({ ...prev, isQuizOpen: false }));
              navigation.navigate(ROUTE.test, {
                id: quiz.id,
                wishSalary: +salary.unMasked,
                postId: id,
                videoUrl: videoUrl,
                isGroup: dynamicBoolean.isGroup,
                salaryRange: post?.salaries,
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
              Dành cho {item.name}
            </Text>
          </Pressable>
        );
      });
    }

    const typeIDList = Array.isArray(post?.quizzes)
      ? post?.quizzes.map((x) => x.typeID)
      : [];

    const list = Array.isArray(post?.quizzes)
      ? post?.type?.filter((x) => !typeIDList.includes(x.id))
      : post?.type;

    return list.map((item, idx) => {
      return (
        <Pressable
          key={idx}
          style={({ pressed }) => [
            pressed && {
              backgroundColor: "rgba(22,24,35,0.06)",
            },
            {
              padding: 14,
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
            },
          ]}
          onPress={() => {
            setDynamicBoolean((prev) => ({ ...prev, isQuizOpen: false }));
            navigation.replace(ROUTE.createTest, {
              typeId: item.id,
              postId: id,
              name: item.name,
            });
          }}
        >
          <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
            Dành cho {item.name}
          </Text>
        </Pressable>
      );
    });
  };

  const fetchData = async () => {
    const post = await ContractorServices.getDetail(id);
    const _keyWord = [
      post?.constructionType?.toLowerCase(),
      CATEGORIES.find((x) => x.value === post.postCategories)?.name,
      post.startTime && post.endTime
        ? `${post.startTime} - ${post.endTime}`
        : "",
      post.accommodation ? "Hỗ trợ chỗ ở" : "",
      post.transport ? "Hỗ trợ phương tiện" : "",
    ];

    // isSave
    if (post) {
      const { data: _relatedList } = await ContractorServices.getPosts({
        salary: [post.salaries],
        place: [post.place],
        categories: [post.postCategories],
        participant: post.numberPeople,
        pageSize: 6,
      });

      setRelatedList(_relatedList.filter((x) => x.id !== id));
    }

    setPost(post);
    setSuggestedStore(post.recommendStore);
    setKeyWord(_keyWord.filter((x) => x));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, isFocused]);

  useEffect(() => {
    if (post?.description?.length > 100) {
      setDynamicBoolean((prev) => ({
        ...prev,
        isReadMore: { hasShow: true, bool: false },
      }));
      return;
    }
    setDynamicBoolean((prev) => ({
      ...prev,
      isReadMore: { hasShow: false, bool: true },
    }));
  }, [post?.description]);

  useEffect(() => {
    scrollY.addListener(({ value }) => {
      if (value >= 250) {
        setDynamicBoolean((prev) => ({ ...prev, isAnimatedStart: true }));
        return;
      }
      setDynamicBoolean((prev) => ({ ...prev, isAnimatedStart: false }));
    });
  }, [scrollY]);
  if (loading) return <Loading />;
  return (
    <>
      <StatusBar style="dark" />

      {/* dialog */}
      <Dialog
        visible={dynamicBoolean.isQuizOpen}
        onClose={() =>
          setDynamicBoolean((prev) => ({ ...prev, isQuizOpen: false }))
        }
        cancelLabelStyle={{ color: theme.colors.error }}
      >
        {renderConfirmDialogContent()}
      </Dialog>

      <ConfirmDialog
        visible={dynamicBoolean.visible}
        title={
          "Dự án này yêu cầu phải hoàn thành bài kiểm tra cơ bản về kĩ năng, bạn có muốn hoàn thành bài kiểm tra?"
        }
        confirmText="Tiếp tục"
        onClose={() =>
          setDynamicBoolean((prev) => ({ ...prev, visible: false }))
        }
        onConfirm={() => {
          setDynamicBoolean((prev) => ({
            ...prev,
            visible: false,
            isQuizOpen: true,
          }));
        }}
      />
      <ConfirmDialog
        visible={dynamicBoolean.isSalaryOpen}
        confirmText="Xác nhận"
        onClose={() => {
          setDynamicBoolean((prev) => ({ ...prev, isSalaryOpen: false }));
        }}
        onConfirm={async () => {
          if (handleValidate()) {
            setDynamicBoolean((prev) => ({
              ...prev,
              isSalaryOpen: false,
            }));

            if (post?.videoRequired) {
              setVideoModal(true);
            } else {
              if (post?.requiredQuiz) {
                setDynamicBoolean((prev) => ({
                  ...prev,
                  visible: true,
                }));
              } else {
                const { isSuccess, message } =
                  await ContractorServices.applyPosts({
                    postId: id,
                    wishSalary: salary.unMasked,
                  });

                if (isSuccess) {
                  Toast.show({
                    type: "success",
                    text1: "Ứng tuyển thành công",
                    position: "bottom",
                    visibilityTime: 2500,
                  });
                  setPost((prev) => ({ ...prev, isApplied: true }));
                } else {
                  setTimeout(() => {
                    Toast.show({
                      type: "error",
                      text1: message,
                      position: "bottom",
                      visibilityTime: 2500,
                    });
                  }, 280);
                }
              }
            }
          }
        }}
      >
        <View style={{ padding: theme.sizes.font }}>
          <Text
            style={{
              color: "rgb(22,24,35)",
              fontWeight: "medium",
              marginVertical: 10,
              fontWeight: "500",
            }}
          >
            Nhập lương mong muốn
          </Text>

          <View
            style={{
              borderRadius: theme.sizes.base - 2,
              borderColor:
                validate?.min?.valid === false
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
              borderWidth: 1,
              padding: theme.sizes.small,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: validate?.min?.valid ? theme.sizes.font : 0,
              width: "100%",
            }}
          >
            <View>
              <Text style={{ fontSize: theme.sizes.font - 2 }}>VND</Text>
            </View>
            <MaskInput
              mask={vndMask}
              placeholder={parseCurrencyText(post.salaries).replace(
                / VND/g,
                ""
              )}
              style={{
                flex: 1,
                marginLeft: theme.sizes.base / 2,
                color: "blue",
              }}
              clearButtonMode="while-editing"
              keyboardType="numeric"
              value={salary.masked}
              onChangeText={(masked, unMasked) => {
                setValidate((prev) => ({
                  ...prev,
                  min: { valid: true, message: "" },
                }));
                setSalary(({ index, ...prev }) => ({
                  ...prev,
                  masked,
                  unMasked,
                }));
              }}
            />
          </View>

          {validate?.min?.valid === false && (
            <Text
              style={{
                marginTop: theme.sizes.base,
                marginBottom: theme.sizes.small,
                color: theme.colors.error,
                fontSize: theme.sizes.font - 2,
              }}
            >
              {validate?.min?.message}
            </Text>
          )}

          {validate?.max?.valid === false && (
            <Text
              style={{
                marginTop: theme.sizes.base,
                marginBottom: theme.sizes.small,
                color: theme.colors.error,
                fontSize: theme.sizes.font - 2,
              }}
            >
              {validate?.max?.message}
            </Text>
          )}
        </View>
      </ConfirmDialog>

      <SafeAreaView style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            padding: theme.sizes.small,
            paddingTop: top + theme.sizes.small,
            backgroundColor: "white",
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            zIndex: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(22,24,35,0.06)",
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                paddingHorizontal: 2,
                marginRight: theme.sizes.small,
              },
              ,
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="chevron-left"
              size={theme.sizes.extraLarge + 8}
              color="rgb(22,24,35)"
            />
          </Pressable>
          <SearchBar
            value={searchValue}
            style={{ flex: 1, backgroundColor: "rgba(22,24,35,0.06)" }}
            showSoftInputOnFocus={false}
            onFocus={() =>
              navigation.navigate(ROUTE.search, {
                placeholder: "Nhập chức danh",
                searchValue,
                roleId: ROLE.contractor,
              })
            }
            autoCapitalize="none"
          />
          {userInfo &&
            userInfo?.role?.toLowerCase() != ROLE.store &&
            userInfo?.id != post.createdBy && (
              <Pressable
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 2,
                    marginLeft: theme.sizes.small,
                  },
                  pressed && {
                    opacity: 0.25,
                  },
                ]}
                onPress={() => {
                  setVisible(true);
                }}
              >
                <Feather
                  name="alert-circle"
                  size={theme.sizes.extraLarge}
                  color={theme.colors.error}
                />
              </Pressable>
            )}
          {userInfo && userInfo?.id == post.createdBy && post.status != 10 && (
            <Pressable
              style={({ pressed }) => [
                {
                  paddingHorizontal: 2,
                  marginLeft: theme.sizes.small,
                },
                pressed && {
                  opacity: 0.25,
                },
              ]}
              onPress={async () => {
                //call api cancel post
                setConfirm(true);
              }}
            >
              <Feather
                name="trash-2"
                size={theme.sizes.extraLarge}
                color={theme.colors.error}
              />
            </Pressable>
          )}
        </View>

        {post && (
          <ScrollView
            style={{ flex: 1, marginTop: 60 }}
            alwaysBounceVertical={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          >
            {/* general information */}
            <View
              style={{
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  paddingVertical: theme.sizes.large,
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                  paddingHorizontal: theme.sizes.large,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.extraLarge - 4,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    marginBottom: theme.sizes.base - 2,
                  }}
                >
                  {post.title}
                </Text>
                <Text
                  style={{
                    fontSize: theme.sizes.large,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    color: theme.colors.highlight,
                    marginBottom: theme.sizes.base - 2,
                  }}
                >
                  {parseCurrencyText(post.salaries)}
                </Text>
                <Text
                  style={{
                    fontSize: theme.sizes.font,
                    marginBottom: theme.sizes.base - 2,
                    color: "rgba(22,24,35,0.7)",
                  }}
                >
                  {PLACES[post.place]}
                </Text>
                <Text
                  style={{
                    fontSize: theme.sizes.font,
                    marginBottom: theme.sizes.base - 2,
                    color: "rgba(22,24,35,0.7)",
                  }}
                >
                  Đăng {moment(post.lastModifiedAt).fromNow()} &#8226; Bạn còn{" "}
                  {moment(post.endDate)
                    .locale("vi")
                    .fromNow()
                    .replace("trước", "")}{" "}
                  để ứng tuyển
                </Text>

                {/* action */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: theme.sizes.medium,
                    marginBottom: theme.sizes.base / 2,
                    flex: 1,
                  }}
                >
                  {!dynamicBoolean.isAnimatedStart &&
                    userInfo &&
                    userInfo.role.toLowerCase() !== ROLE.store &&
                    renderActions()}
                </View>
              </View>

              {/* author */}
              <Pressable>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: theme.sizes.large,
                    paddingVertical: theme.sizes.font,
                  }}
                >
                  <View
                    style={{
                      borderColor: "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      borderRadius: theme.sizes.base / 2,
                    }}
                  >
                    <Image
                      source={{ uri: post.author.avatar || NO_IMAGE_URL }}
                      style={{ width: 60, height: 60 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View
                    style={{
                      marginLeft: theme.sizes.base,
                      flex: 1,
                    }}
                  >
                    <Pressable
                      style={({ pressed }) =>
                        pressed && {
                          opacity: 0.45,
                        }
                      }
                      onPress={() =>
                        navigation.navigate(ROUTE.constructorProfile, {
                          id: post.createdBy,
                        })
                      }
                    >
                      <Text
                        style={{
                          color: "blue",
                          textTransform: "capitalize",
                          marginBottom: theme.sizes.base,
                          fontSize: theme.sizes.medium - 1,
                        }}
                        numberOfLines={2}
                      >{`${post.author.firstName} ${post.author.lastName}`}</Text>
                    </Pressable>

                    {post?.requiredQuiz && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: theme.sizes.base,
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={theme.sizes.medium}
                          color="rgba(22,24,35,0.64)"
                        />
                        <Text
                          style={{
                            marginLeft: theme.sizes.base / 2,
                            color: "rgba(22,24,35,0.64)",
                          }}
                        >
                          yêu cầu làm bài kiểm tra
                        </Text>
                      </View>
                    )}
                    {post?.videoRequired && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="videocam-outline"
                          size={theme.sizes.medium}
                          color="rgba(22,24,35,0.64)"
                        />
                        <Text
                          style={{
                            marginLeft: theme.sizes.base / 2,
                            color: "rgba(22,24,35,0.64)",
                          }}
                        >
                          yêu cầu gửi video
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>

            <View
              style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
            ></View>

            {/* place */}
            <View
              style={{
                paddingHorizontal: theme.sizes.large,
                paddingVertical: theme.sizes.font,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.large,
                  fontWeight: "bold",
                  marginBottom: theme.sizes.small,
                }}
              >
                Thông tin dự án
              </Text>

              <View>
                <Text>
                  <Text style={{ color: theme.colors.error }}>*</Text> Thời gian
                  bắt đầu tuyển dụng:{" "}
                  <Text style={{ fontSize: theme.sizes.font - 1 }}>
                    {moment(post.starDate).format(
                      FORMAT_DATE_REGEX["DD MMM, YYYY"]
                    )}
                  </Text>
                </Text>

                <Text style={{ marginVertical: theme.sizes.base }}>
                  <Text style={{ color: theme.colors.error }}>*</Text> Số lượng
                  đã tuyển:{" "}
                  <Text
                    style={{
                      letterSpacing: 1,
                      fontSize: theme.sizes.font - 1,
                    }}
                  >
                    {post.numberPeople -
                      post.peopleRemained +
                      "/" +
                      post.numberPeople}
                  </Text>
                </Text>

                <Text>
                  <Text style={{ color: theme.colors.error }}>*</Text> Loại công
                  trình:{" "}
                  <Text style={{ fontSize: theme.sizes.font - 1 }}>
                    {post?.constructionType}
                  </Text>
                </Text>
              </View>
            </View>

            <View
              style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
            ></View>

            {/* type-skill */}
            <View
              style={{
                paddingHorizontal: theme.sizes.large,
                paddingVertical: theme.sizes.font,
                backgroundColor: "white",
              }}
            >
              {/* benefit */}
              {Array.isArray(benefit) && (
                <View
                  style={{
                    paddingBottom: theme.sizes.font,
                    marginBottom: theme.sizes.font,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.large,
                      fontWeight: "bold",
                      marginBottom: theme.sizes.small,
                    }}
                  >
                    Vì sao cần ứng tuyển
                  </Text>

                  {Array.isArray(benefit) &&
                  benefit.length === 3 &&
                  !benefit.some((x) => ALL_HTML_TAG.test(x)) ? (
                    benefit.map((item, idx, arr) => (
                      <View
                        key={idx}
                        style={{
                          marginBottom:
                            idx !== arr.length - 1 ? theme.sizes.font : 0,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {renderBenefitIcon(idx)}
                        <Text style={{ marginLeft: theme.sizes.font, flex: 1 }}>
                          {item.trim()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <RenderHTML
                      contentWidth={width}
                      source={{
                        html: post?.benefit,
                      }}
                    />
                  )}
                </View>
              )}

              {/* desc */}
              <View
                style={
                  dynamicBoolean.isReadMore.bool
                    ? {
                        borderBottomColor: "rgba(22,24,35,0.12)",
                        borderBottomWidth: 1,
                        paddingBottom: theme.sizes.font,
                        marginBottom: theme.sizes.font,
                      }
                    : {}
                }
              >
                <Text
                  style={{
                    fontSize: theme.sizes.large,
                    fontWeight: "bold",
                    marginBottom: theme.sizes.small,
                  }}
                >
                  Mô tả công việc
                </Text>

                {/* startTime - endTime */}
                {post.startTime && post.endTime && (
                  <Text
                    style={{
                      marginBottom: theme.sizes.small,
                      fontSize: theme.sizes.medium,
                    }}
                  >
                    <Text style={{ color: theme.colors.error }}>*</Text> Thời
                    gian làm việc:{" "}
                    <Text style={{ fontSize: theme.sizes.font }}>
                      {`${post.startTime} - ${post.endTime}`}
                    </Text>
                  </Text>
                )}

                <View
                  style={{
                    maxHeight: dynamicBoolean.isReadMore.bool ? undefined : 150,
                    overflow: "hidden",
                  }}
                >
                  <RenderHTML
                    contentWidth={width}
                    source={{
                      html: post?.description,
                    }}
                    defaultTextProps={{
                      style: { lineHeight: 24, fontSize: 15 },
                    }}
                  />
                </View>
              </View>

              {/* required + skills */}
              {dynamicBoolean.isReadMore.bool && (
                <View>
                  {post?.required && (
                    <>
                      <Text
                        style={{
                          fontSize: theme.sizes.large,
                          fontWeight: "bold",
                          marginBottom: theme.sizes.small,
                        }}
                      >
                        Yêu cầu công việc
                      </Text>

                      <RenderHTML
                        contentWidth={width}
                        source={{
                          html: post?.required || "",
                        }}
                        defaultTextProps={{
                          style: { lineHeight: 24, fontSize: 15 },
                        }}
                      />
                    </>
                  )}

                  {/* skills */}
                  {post?.type?.length !== 0 && (
                    <Text
                      style={{
                        marginVertical: theme.sizes.font,
                        textTransform: "uppercase",
                      }}
                    >
                      Các kĩ năng cần có
                    </Text>
                  )}

                  <View>
                    {post?.type?.map((item, idx) => (
                      <View
                        key={idx}
                        style={{ marginBottom: theme.sizes.small }}
                      >
                        {item.name && (
                          <Text
                            style={{
                              marginBottom: theme.sizes.base / 2,
                              fontSize: theme.sizes.font + 1,
                            }}
                          >
                            {idx}. {item.name}
                          </Text>
                        )}
                        {item?.skillArr?.map((v, idx) => (
                          <Text
                            key={idx}
                            style={{
                              paddingLeft: item.name && theme.sizes.base / 2,
                              fontSize: theme.sizes.font + 1,
                            }}
                          >
                            {" "}
                            - {v.name}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {dynamicBoolean.isReadMore.hasShow && (
                <Pressable
                  style={({ pressed }) =>
                    pressed && {
                      opacity: 0.45,
                    }
                  }
                  onPress={() =>
                    setDynamicBoolean(({ isReadMore, ...rest }) => {
                      return {
                        ...rest,
                        isReadMore: { ...isReadMore, bool: !isReadMore.bool },
                      };
                    })
                  }
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: theme.sizes.font + 1,
                      fontWeight: "500",
                      color: "rgba(0, 25, 247, 0.726)",
                      marginTop: theme.sizes.base,
                    }}
                  >
                    {dynamicBoolean.isReadMore.bool ? "Thu nhỏ" : "Đọc thêm"}
                  </Text>
                </Pressable>
              )}
            </View>

            <View
              style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
            ></View>

            {/* place */}
            <View
              style={{
                paddingHorizontal: theme.sizes.large,
                paddingVertical: theme.sizes.font,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.large,
                  fontWeight: "bold",
                  marginBottom: theme.sizes.small,
                }}
              >
                Địa điểm làm việc
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: theme.sizes.font,
                }}
              >
                <EvilIcons name="location" size={theme.sizes.extraLarge} />
                <Text style={{ fontSize: theme.sizes.font + 1 }}>
                  {PLACES[post?.place]}
                </Text>
              </View>
            </View>

            <View
              style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
            ></View>

            {/* product */}
            {Array.isArray(post?.productSystem) &&
              post?.productSystem?.length !== 0 && (
                <>
                  <View
                    style={{
                      paddingHorizontal: theme.sizes.large,
                      paddingVertical: theme.sizes.font,
                      backgroundColor: "white",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.large,
                        fontWeight: "bold",
                        marginBottom: theme.sizes.small,
                      }}
                    >
                      Vật liệu xây dựng
                    </Text>

                    <View style={{ paddingHorizontal: theme.sizes.font }}>
                      {post?.productSystem?.map((x) => renderProductItem(x))}
                    </View>
                  </View>

                  <View
                    style={{
                      padding: 6,
                      backgroundColor: "rgba(22,24,35,0.06)",
                    }}
                  ></View>
                </>
              )}

            {/* categories */}
            <View
              style={{
                paddingHorizontal: theme.sizes.large,
                paddingVertical: theme.sizes.font,
                backgroundColor: "white",

                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  marginRight: theme.sizes.base / 2,
                }}
              >
                Từ khóa:{" "}
              </Text>
              {keyWord.map((item, idx) => (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    {
                      marginRight: theme.sizes.small,
                      marginBottom: theme.sizes.small,
                    },
                    pressed && {
                      opacity: 0.75,
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(22,24,35,0.06)",
                      padding: theme.sizes.base,
                      borderRadius: theme.sizes.base / 2,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(22,24,35,0.64)",
                        fontSize: theme.sizes.font + 1,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* suggested store */}
            {userInfo &&
              userInfo.role.toLowerCase() !== ROLE.builder &&
              suggestedStore?.length > 0 && (
                <>
                  <View
                    style={{
                      padding: 6,
                      backgroundColor: "rgba(22,24,35,0.06)",
                    }}
                  ></View>
                  <View
                    style={{
                      paddingHorizontal: theme.sizes.large,
                      paddingTop: theme.sizes.font,
                      paddingBottom: theme.sizes.base,
                      backgroundColor: "white",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.large,
                        fontWeight: "bold",
                        marginBottom: theme.sizes.small,
                      }}
                    >
                      Cửa hàng đề xuất
                    </Text>

                    <View>
                      {suggestedStore.map((item, idx) =>
                        renderStoreItem(item, idx)
                      )}
                    </View>
                  </View>
                </>
              )}

            {/* related post */}
            {relatedList.length !== 0 && (
              <>
                <View
                  style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
                ></View>

                <View
                  style={{
                    paddingHorizontal: theme.sizes.large,
                    paddingTop: theme.sizes.font,
                    paddingBottom: theme.sizes.base,
                    backgroundColor: "white",
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.large,
                      fontWeight: "bold",
                      marginBottom: theme.sizes.small,
                    }}
                  >
                    Việc làm tương tự
                  </Text>

                  <View style={{ marginBottom: bottomHeight }}>
                    {relatedList.map((item, idx) => renderPostItem(item, idx))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        )}

        <Animated.View
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => setBottomHeight(height - bottom)}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: "white",
            padding: theme.sizes.font,
            paddingBottom: bottom === 0 ? theme.sizes.font : bottom,
            flexDirection: "row",
            borderTopColor: "rgba(22,24,35,0.06)",
            borderTopWidth: 1,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [180, 200, 230, 250],
                  outputRange: [200, 200, 0, 0],
                  extrapolateLeft: "clamp",
                }),
              },
            ],
          }}
        >
          {dynamicBoolean.isAnimatedStart &&
            userInfo &&
            userInfo.role.toLowerCase() !== ROLE.store &&
            renderActions()}
        </Animated.View>
        <ReasonModal
          type={2}
          visible={visible}
          onClose={() => setVisible(false)}
          callback={async ({ reason, data }) => {
            try {
              const res = await axiosInstance.post("report/createReportPost", {
                contractorPostId: id,
                reportProblem: reason.toString(),
              });
              if (+res.code === API_RESPONSE_CODE.success) {
                Toast.show({
                  type: "success",
                  text1: "Đã báo cáo bài viết thành công!",
                  position: "bottom",
                  visibilityTime: 2500,
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Bạn đã báo cáo bài viết này rồi!",
                  position: "bottom",
                  visibilityTime: 2500,
                });
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Báo cáo thất bại!",
                position: "bottom",
                visibilityTime: 2500,
              });
            }
          }}
        />
        {videoModal && (
          <VideoModal
            visible={videoModal}
            onClose={() => setVideoModal(false)}
            callback={handleVideo}
            postId={id}
          />
        )}
        <ConfirmDialog
          visible={confirm}
          confirmText="Xác nhận"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            setConfirm(false);
            const res = await axiosInstance.put(
              "contractorpost/status/:id".replace(":id", id)
            );
            if (+res.code === API_RESPONSE_CODE.success) {
              Toast.show({
                type: "success",
                text1: "Bài viết đã được đóng thành công",
                position: "bottom",
                visibilityTime: 2500,
              });
              navigation.navigate(ROUTE.uploaded);
            }
          }}
        >
          <View style={{ padding: theme.sizes.font }}>
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                marginVertical: 10,
                fontWeight: "500",
              }}
            >
              Bạn có chắc chắn muốn đóng bài viết?
            </Text>
          </View>
        </ConfirmDialog>
      </SafeAreaView>
    </>
  );
};

export default PostDetailScreen;
