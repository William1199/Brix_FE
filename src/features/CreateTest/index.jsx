import { AntDesign, Feather } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { StatusBar } from "expo-status-bar";
import { Fragment, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";

import { InputField } from "~/components/Form-field";
import { ROUTE } from "~/constants";
import { QuizServices } from "~/services";

const validationSchema = Yup.object().shape({
  quizName: Yup.string().required("Hãy nhập tiêu đề"),
  questions: Yup.array().of(
    Yup.object()
      .nullable()
      .shape({
        questionName: Yup.string().required("Hãy nhập câu hỏi"),
        answers: Yup.array().of(
          Yup.object()
            .nullable()
            .shape({
              answerName: Yup.string().required("Hãy nhập câu trả lời"),
            })
        ),
      })
  ),
  // .min(5, "Bài kiểm tra phải tối thiểu 5 câu hỏi"),
});

const BlockItem = ({ control, errors, index, dynamicError, onRemove }) => {
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const renderRightActions = (item) => {
    return (
      <View
        style={{
          width: 180,
          flexDirection: "row",
          borderTopRightRadius: theme.sizes.base - 2,
          borderBottomRightRadius: theme.sizes.base - 2,
          backgroundColor: "red",
          borderColor: "rgba(22,24,35,0.12)",
          borderWidth: 1,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed && { backgroundColor: "rgba(22,24,35,0.06)" },
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={onRemove}
        >
          <Feather name="trash-2" size={24} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      containerStyle={{
        marginBottom: theme.sizes.small + 2,
      }}
      renderRightActions={() => renderRightActions()}
      onSwipeableWillOpen={() => setIsOpen(true)}
      onSwipeableWillClose={() => setIsOpen(false)}
    >
      <View
        style={{
          borderColor: "rgba(22,24,35, 0.12)",
          borderWidth: 1,
          paddingVertical: theme.sizes.small,
          paddingHorizontal: theme.sizes.font,
          borderRadius: theme.sizes.base - 2,
          borderTopRightRadius: isOpen ? 0 : theme.sizes.base - 2,
          borderBottomRightRadius: isOpen ? 0 : theme.sizes.base - 2,
          backgroundColor: "white",
        }}
      >
        <InputField
          name={`questions.${index}.questionName`}
          control={control}
          errors={errors}
          label={`Câu hỏi ${index + 1}`}
          placeholder="Bắt buộc"
          showError={false}
          inputStyle={{
            borderRadius: theme.sizes.base / 2,
            paddingVertical: theme.sizes.small,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor:
              Array.isArray(errors?.questions) &&
              errors?.questions[index]?.questionName
                ? theme.colors.error
                : "rgba(22,24,35,0.12)",
            fontSize: theme.sizes.font - 0.5,
          }}
          labelStyle={{ fontSize: theme.sizes.font, fontWeight: "600" }}
          inputConfig={{ clearButtonMode: "never" }}
        />

        <Text
          style={{
            marginTop: theme.sizes.medium,
            marginBottom: theme.sizes.small,
            fontWeight: "600",
          }}
        >
          Câu trả lời:
        </Text>

        <View>
          {[...new Array(4)].map((_, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.base / 2,
              }}
            >
              <Controller
                name={`questions.${index}.answers.${idx}.isCorrect`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Pressable onPress={() => onChange(!value)}>
                    <View
                      style={[
                        {
                          height: theme.sizes.large,
                          width: theme.sizes.large,
                          borderRadius: 12,
                          borderWidth: 1.25,
                          borderColor: dynamicError?.[index]
                            ? "black"
                            : theme.colors.error,
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      ]}
                    >
                      {value ? (
                        <View
                          style={{
                            height: theme.sizes.large / 2,
                            width: theme.sizes.large / 2,
                            borderRadius: 6,
                            backgroundColor: "#000",
                          }}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                )}
              />

              <InputField
                name={`questions.${index}.answers.${idx}.answerName`}
                control={control}
                errors={errors}
                label="Câu trả lời"
                placeholder="Bắt buộc"
                showError={false}
                containerStyle={{ flex: 1, marginLeft: theme.sizes.font }}
                inputStyle={{
                  borderRadius: 0,
                  paddingVertical: theme.sizes.base / 2,
                  backgroundColor: "transparent",
                  borderBottomWidth: 1,
                  borderBottomColor: errors?.questions?.[index]?.answers?.[idx]
                    ?.answerName
                    ? theme.colors.error
                    : "rgba(22,24,35,0.12)",
                  fontSize: theme.sizes.font - 0.5,
                }}
                labelStyle={{ fontSize: theme.sizes.font }}
                inputConfig={{ clearButtonMode: "never" }}
                showLabel={false}
              />
            </View>
          ))}
        </View>

        {!dynamicError?.[index] && (
          <Text
            style={{
              color: theme.colors.error,
              fontSize: theme.sizes.font - 2,
              marginTop: 2,
            }}
          >
            Chỉ chọn duy nhất 1 đáp án đúng
          </Text>
        )}
      </View>
    </Swipeable>
  );
};

const MOCK_DATA = {
  BOTTOM_ACTION_HEIGHT: 70,
  default_value: {
    quizName: "",
    questions: [
      {
        questionName: "",
        answers: [
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
        ],
      },
      {
        questionName: "",
        answers: [
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
          {
            answerName: "",
            isCorrect: false,
          },
        ],
      },
    ],
  },
  default_questions_value: [
    {
      questionName: "",
      answers: [
        {
          answerName: "",
          isCorrect: false,
        },
        {
          answerName: "",
          isCorrect: false,
        },
        {
          answerName: "",
          isCorrect: false,
        },
        {
          answerName: "",
          isCorrect: false,
        },
      ],
    },
  ],
};

const CreateTestScreen = ({ navigation, route }) => {
  const { typeId, postId, name } = route.params || {};
  const { BOTTOM_ACTION_HEIGHT, default_value, default_questions_value } =
    MOCK_DATA;
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;
  const offsetAnim = useRef(new Animated.Value(0)).current;

  const {
    formState: { errors },
    watch,
    control,
    handleSubmit,
  } = useForm({
    defaultValues: default_value,
    resolver: yupResolver(validationSchema),
  });

  const questions = watch("questions");

  const dynamicError = questions.reduce((init, cur, index) => {
    if (cur.answers.every((x) => x.answerName))
      init[index] = cur.answers.filter((x) => x.isCorrect).length === 1;
    else init[index] = true;

    return init;
  }, []);

  const { append, remove, fields } = useFieldArray({
    control,
    name: "questions",
  });

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

  const onSubmit = async (data) => {
    const { isSuccess, message } = await QuizServices.createQuiz({
      typeId,
      postId,
      ...data,
    });
    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: message,
        position: "bottom",
        visibilityTime: 2500,
      });
      return navigation.replace(ROUTE.postDetail, {
        id: postId,
      });
    }

    Toast.show({
      type: "error",
      text1: message,
      position: "bottom",
      visibilityTime: 2500,
    });
  };

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
                fontSize: theme.sizes.large,
                fontWeight: "500",
                letterSpacing: 0.5,
                color: "white",
              }}
            >
              Bài kiểm tra {name?.toLowerCase()}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            contentContainerStyle={{
              padding: theme.sizes.medium,
              paddingBottom: BOTTOM_ACTION_HEIGHT + theme.sizes.medium,
            }}
            scrollEventThrottle={1}
          >
            <InputField
              name="quizName"
              control={control}
              errors={errors}
              label="Tiêu đề"
              placeholder="Bắt buộc"
              showError={false}
              inputStyle={{
                borderRadius: theme.sizes.base / 2,
                paddingVertical: theme.sizes.small,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: errors?.quizName?.message
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
                fontSize: theme.sizes.font - 0.5,
              }}
              labelStyle={{ fontSize: theme.sizes.font }}
            />

            <View style={{ marginTop: theme.sizes.small }}>
              {fields.map((field, index) => {
                return (
                  <Fragment key={field.id}>
                    <BlockItem
                      control={control}
                      errors={errors}
                      index={index}
                      dynamicError={dynamicError}
                      onRemove={() => remove(index)}
                    />
                  </Fragment>
                );
              })}

              <View
                style={{
                  backgroundColor: theme.colors.highlight,
                  alignSelf: "center",
                  borderRadius: 100,
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      padding: theme.sizes.base,
                      borderRadius: 100,
                    },
                    pressed && {
                      backgroundColor: "rgba(22,24,35,0.12)",
                    },
                  ]}
                  onPress={() => append(default_questions_value)}
                >
                  <AntDesign name="plus" size={18} color="white" />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* footer */}
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
            inputRange: [0, 15, BOTTOM_ACTION_HEIGHT],
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
    </View>
  );
};

export default CreateTestScreen;
