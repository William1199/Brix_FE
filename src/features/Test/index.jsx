import { AntDesign } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { StatusBar } from "expo-status-bar";
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";

import { Loading, Radio } from "~/components";
import { ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ContractorServices, QuizServices } from "~/services";

const MOCK_DATA = {
  BOTTOM_ACTION_HEIGHT: 70,
};

const validationSchema = Yup.object().shape({
  quiz: Yup.array().of(
    Yup.object()
      .nullable()
      .shape({
        answer: Yup.number().required("Hãy chọn câu trả lời!"),
      })
  ),
});

const BlockItem = ({
  questionName,
  answers,
  index,
  onChange,
  value,
  errors,
  isReadOnly = false,
}) => {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  return (
    <View
      style={{
        borderColor:
          Array.isArray(errors?.quiz) && errors?.quiz[index]?.answer
            ? theme.colors.error
            : "rgb(22,24,35)",
        borderWidth: 1,
        paddingVertical: theme.sizes.small,
        paddingHorizontal: theme.sizes.font,
        borderRadius: theme.sizes.base - 2,
        marginBottom: theme.sizes.large,
      }}
    >
      <Text style={{ fontWeight: "bold", marginBottom: theme.sizes.base / 2 }}>
        Câu hỏi {index + 1}:
      </Text>

      <Text style={{ fontSize: theme.sizes.medium - 1 }}>{questionName}</Text>

      <View style={{ marginTop: theme.sizes.large }}>
        {answers.map((item, idx) => (
          <Fragment key={idx}>
            <Radio
              label={item.answerName}
              index={idx}
              isSelected={
                isReadOnly
                  ? userInfo?.role?.toLowerCase() === ROLE.builder
                    ? item.answerId === item.answer
                    : item.isCorrect
                  : value === item.answerId
              }
              labelStyle={{
                color:
                  userInfo?.role?.toLowerCase() === ROLE.contractor &&
                  item.isCorrect &&
                  "rgb(33, 199, 33)",
              }}
              onPress={() => {
                if (!isReadOnly) onChange(item.answerId);
              }}
            />
          </Fragment>
        ))}

        {Array.isArray(errors?.quiz) && errors?.quiz[index]?.answer && (
          <Text
            style={{
              color: theme.colors.error,
              fontSize: theme.sizes.font - 1,
              marginTop: theme.sizes.base / 2,
            }}
          >
            {errors?.quiz[index]?.answer?.message}
          </Text>
        )}
      </View>
    </View>
  );
};

const TestScreen = ({ navigation, route }) => {
  const { BOTTOM_ACTION_HEIGHT } = MOCK_DATA;
  const {
    id,
    wishSalary,
    postId,
    isReadOnly = false,
    builderId,
    videoUrl,
    isGroup,
    salaryRange,
  } = route.params || {};
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);

  const scrollY = useRef(new Animated.Value(0)).current;
  const offsetAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [rootData, setRootData] = useState();

  const {
    formState: { errors },
    control,
    handleSubmit,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "quiz",
  });

  const score = useMemo(() => {
    if (isReadOnly && userInfo?.role?.toLowerCase() === ROLE.builder) {
      const correctNum = fields.reduce((init, cur) => {
        const correctAnswer = cur.answers.find((x) => x.isCorrect);
        return correctAnswer.answer === correctAnswer.answerId
          ? init + 1
          : init;
      }, 0);
      return (correctNum / fields.length) * 100;
    }
  }, [fields, userInfo]);

  // animation bottom actions
  const clampedScroll = Animated.diffClamp(
    Animated.add(
      scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: "clamp",
      }),
      offsetAnim
    ),
    0,
    BOTTOM_ACTION_HEIGHT
  );

  const onSubmit = async ({ quiz }) => {
    const answerId = quiz.map((x) => x.answer);
    try {
      const { isSuccess, message } = await ContractorServices.applyPosts({
        postId,
        wishSalary,
        quizSubmit: {
          answerId,
        },
        video: videoUrl,
        isGroup,
      });

      if (isSuccess) {
        if (isGroup) {
          return navigation.navigate(ROUTE.applyGroup, { id, salaryRange });
        } else {
          Toast.show({
            type: "success",
            text1: "Ứng tuyển thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          return navigation.navigate(ROUTE.postDetail, { id: postId });
        }
      }

      Toast.show({
        type: "error",
        text1: message,
        position: "top",
        visibilityTime: 2500,
      });
    } catch (e) {
      console.log(`Apply Individual error ${e}`);
    }
  };

  useEffect(() => {
    // call api
    (async () => {
      setLoading(true);
      const data =
        isReadOnly && userInfo?.role?.toLowerCase() === ROLE.builder
          ? await QuizServices.getUserAnswers({
              quizId: id,
              builderId: builderId || userInfo?.builderID,
            })
          : await QuizServices.getDetail(id);
      if (data) {
        replace(data?.questions);
        setRootData(data);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />

      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: top + theme.sizes.small,
            paddingBottom: theme.sizes.font,
            backgroundColor: theme.colors.primary400,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.25 },
              {
                position: "absolute",
                left: theme.sizes.font,
                top: top + theme.sizes.small,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color={"white"} />
          </Pressable>

          <View>
            <Text
              style={{
                fontSize: theme.sizes.medium + 1,
                fontWeight: "500",
                letterSpacing: 0.5,
                color: "white",
              }}
            >
              {isReadOnly && userInfo?.role?.toLowerCase() === ROLE.contractor
                ? rootData?.quizName
                : "Kiểm tra"}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: theme.sizes.medium,
            paddingBottom: isReadOnly
              ? theme.sizes.font
              : BOTTOM_ACTION_HEIGHT + theme.sizes.font * 2,
          }}
        >
          {isReadOnly ? (
            <>
              {/* result */}
              {userInfo?.role?.toLowerCase() === ROLE.builder && (
                <View>
                  <Text
                    style={{
                      fontSize: theme.sizes.font + 1,
                      fontWeight: "600",
                    }}
                  >
                    Kết quả của bạn
                  </Text>

                  <View
                    style={{
                      marginTop: theme.sizes.font,
                    }}
                  >
                    <AnimatedCircularProgress
                      size={100}
                      width={12}
                      fill={score}
                      tintColor="#00e0ff"
                      backgroundColor="rgba(22,24,35,0.06)"
                      lineCap="round"
                    >
                      {() => (
                        <Text style={{ fontWeight: "600" }}>{score}%</Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                </View>
              )}

              {/* answers */}
              <View
                style={{
                  marginTop:
                    userInfo?.role?.toLowerCase() === ROLE.builder
                      ? theme.sizes.extraLarge
                      : 0,
                }}
              >
                {userInfo?.role?.toLowerCase() === ROLE.builder && (
                  <Text
                    style={{
                      fontSize: theme.sizes.font + 1,
                      fontWeight: "600",
                    }}
                  >
                    Đáp án của bạn
                  </Text>
                )}

                <View
                  style={{
                    marginTop:
                      userInfo?.role?.toLowerCase() === ROLE.builder
                        ? theme.sizes.font
                        : 0,
                  }}
                >
                  {fields.map((field, index) => {
                    return (
                      <Controller
                        key={field.id}
                        name={`quiz.${index}.answer`}
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <BlockItem
                              answers={field.answers}
                              questionName={field.questionName}
                              onChange={onChange}
                              value={value}
                              errors={errors}
                              index={index}
                              isReadOnly
                            />
                          );
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            fields.map((field, index) => {
              return (
                <Controller
                  key={field.id}
                  name={`quiz.${index}.answer`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <BlockItem
                      answers={field.answers}
                      questionName={field.questionName}
                      onChange={onChange}
                      value={value}
                      errors={errors}
                      index={index}
                    />
                  )}
                />
              );
            })
          )}
        </ScrollView>
      </View>

      {/* footer */}
      {!isReadOnly && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: theme.sizes.small,
            paddingHorizontal: theme.sizes.large,
            paddingBottom: bottom === 0 ? theme.sizes.large : bottom,
            borderTopColor: "rgba(22,24,35,0.12)",
            borderTopWidth: 1,
            flexDirection: "row",
            minHeight: BOTTOM_ACTION_HEIGHT,
            backgroundColor: "white",
            opacity: clampedScroll.interpolate({
              inputRange: [0, 30, BOTTOM_ACTION_HEIGHT],
              outputRange: [1, 0.5, 0],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: clampedScroll.interpolate({
                  inputRange: [0, BOTTOM_ACTION_HEIGHT],
                  outputRange: [1, BOTTOM_ACTION_HEIGHT],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary400,
              borderRadius: theme.sizes.base / 2,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(0,0,0,0.27)",
                },
                {
                  padding: theme.sizes.medium,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: theme.sizes.medium,
                  fontWeight: "600",
                  fontSize: theme.sizes.font + 1,
                }}
              >
                Nộp bài
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default TestScreen;
