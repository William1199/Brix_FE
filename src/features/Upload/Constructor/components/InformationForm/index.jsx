import { yupResolver } from "@hookform/resolvers/yup";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import moment from "moment/moment";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, Pressable, Text, View } from "react-native";
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view";
import { useTheme } from "react-native-paper";
import * as Yup from "yup";

import {
  CheckboxField,
  DateTimeField,
  DropdownField,
  InputField,
} from "~/components/Form-field";
import { CATEGORIES, CONSTRUCTIONTYPE, PLACES } from "~/constants";
import { hideTabBar, isCloseToBottom, showTabBar } from "~/utils/helper";
import DescriptionModal from "./components/DescriptionModal";

const InformationSchema = Yup.object().shape({
  title: Yup.string().required("Hãy nhập tiêu đề"),
  description: Yup.string().required("Hãy nhập thông tin công việc"),
  benefit: Yup.string().required("Hãy nhập lí do nên ứng tuyển"),
  required: Yup.string().required("Hãy nhập yêu cầu công việc"),
  starDate: Yup.date().required("Hãy chọn thời gian bắt đầu"),
  endDate: Yup.date().required("Hãy chọn thời gian kết thúc"),
  place: Yup.string().required("Hãy chọn khu vực"),
  postCategories: Yup.string().required("Hãy chọn thể loại"),
  constructionType: Yup.string().required("Hãy chọn loại công trình"),
  startTime: Yup.date().required("Hãy chọn giờ vào làm"),
  endTime: Yup.date().required("Hãy chọn giờ tan làm"),
  accommodation: Yup.bool(),
  transport: Yup.bool(),
  videoRequired: Yup.bool(),
});

const MOCK_DATA = {
  initialValues: {
    postCategories: "",
    title: "",
    description: "",
    benefit: "",
    required: "",
    starDate: new Date(),
    endDate: moment().add(7, "days").toDate(),
    place: "",
    constructionType: "",
    startTime: "",
    endTime: "",
    accommodation: false,
    transport: false,
    quizRequired: false,
    videoRequired: false,
  },
};

const InformationForm = ({ step, currentPosition, isReset, onNextStep }) => {
  const { initialValues } = MOCK_DATA;
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
    resetField,
    reset,
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(InformationSchema),
  });

  const navigation = useNavigation();
  const height = useBottomTabBarHeight();
  const [offset, setOffset] = useState(0);
  const [bottomTabBarHeight] = useState(height);
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [otherClick, setOtherClick] = useState(false);

  const scrollRef = useRef();
  const isFirstTime = useRef(true);

  const isDescNotValid = useMemo(() => {
    if (isFirstTime.current) return true;

    return !!errors.benefit || !!errors.description || !!errors.required;
  }, [
    errors.benefit,
    errors.description,
    errors.required,
    isFirstTime.current,
  ]);

  const onSubmit = (data) => {
    onNextStep({
      ...data,
      projectName: data.title,
      place: PLACES.indexOf(data.place),
      postCategories: +data.postCategories,
      starDate: moment(data.starDate).toISOString(),
      endDate: moment(data.endDate).toISOString(),
      constructionType: data.constructionType,
      startTime: moment(data.startTime).format("hh:mm a").toString(),
      endTime: moment(data.endTime).format("hh:mm a").toString(),
      accommodation: data.accommodation,
      transport: data.transport,
    });
  };

  useEffect(() => {
    if (isReset) {
      isFirstTime.current = true;
      reset(initialValues);
    }
  }, [isReset]);

  useEffect(() => {
    resetField("constructionType");
  }, [otherClick]);

  useLayoutEffect(() => {
    if (currentPosition === 0) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      setOffset(0);
    }
  }, [currentPosition]);

  return (
    <>
      <DescriptionModal
        visible={isDescModalOpen}
        isReset={isReset}
        control={control}
        errors={errors}
        onClose={() => setIsDescModalOpen(false)}
        onReset={() => {
          reset((formValues) => ({
            ...formValues,
            description: "",
            benefit: "",
            required: "",
          }));
        }}
        onSubmit={async () => {
          const result = await trigger(["description", "benefit", "required"]);
          isFirstTime.current = false;
          if (result) setIsDescModalOpen(false);
        }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: theme.sizes.large,
        }}
      >
        <KeyboardAvoidingScrollView
          behavior="padding"
          ref={scrollRef}
          style={{
            paddingHorizontal: theme.sizes.font,
          }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={({ nativeEvent }) => {
            const currentOffset = nativeEvent.contentOffset.y;
            let _direction = currentOffset >= offset ? "down" : "up";

            if (isCloseToBottom(nativeEvent) && currentOffset <= 0) return;

            // change when beside top or bottom
            if (isCloseToBottom(nativeEvent) && offset > 0) {
              hideTabBar({ navigation });
              return;
            } else if (currentOffset <= 0) {
              showTabBar({
                navigation,
                theme,
                height: bottomTabBarHeight,
              });
              return;
            }

            // change when scroll
            if (_direction === "down" && offset > 0) {
              hideTabBar({ navigation });
            } else {
              showTabBar({
                navigation,
                theme,
                height: bottomTabBarHeight,
              });
            }
            setOffset(currentOffset);
          }}
        >
          {/* header */}
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: theme.colors.primary300,
                fontWeight: "600",
                fontSize: theme.sizes.medium,
                letterSpacing: 0.5,
              }}
            >
              Thông tin bài viết
            </Text>
            <Text
              style={{
                color: "rgba(22,24,35,0.6)",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Step {step + 1} - 4
            </Text>
          </View>

          {/* form */}
          <View
            style={{
              marginTop: theme.sizes.small,
            }}
          >
            <InputField
              name="title"
              control={control}
              errors={errors}
              label="Đặt tiêu đề cụ thể cho công việc"
              inputStyle={{
                borderRadius: theme.sizes.base / 2,
                paddingVertical: theme.sizes.small + 2,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: errors.title
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
              }}
              containerStyle={{ marginVertical: theme.sizes.base - 2 }}
            />

            <Pressable
              onPress={() => setIsDescModalOpen(true)}
              style={{
                marginBottom: theme.sizes.base / 2,
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.font - 2,
                  marginBottom: theme.sizes.base / 2,
                }}
              >
                Thông tin chi tiết về mô tả công việc
              </Text>
              <View
                style={{
                  borderRadius: theme.sizes.base / 2,
                  padding: theme.sizes.small + 2,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: errors.title
                    ? theme.colors.error
                    : "rgba(22,24,35,0.12)",
                  minHeight: 150,
                }}
              >
                <Text
                  style={{
                    color: !isDescNotValid
                      ? "rgba(22,24,35,1)"
                      : "rgba(22,24,35,0.3)",
                    fontSize: theme.sizes.font + 1,
                  }}
                >
                  {!isDescNotValid
                    ? "Đã cập nhật thông tin"
                    : "Thông tin chi tiết về mô tả công việc"}
                </Text>
              </View>
            </Pressable>

            <DropdownField
              name="place"
              control={control}
              errors={errors}
              label="Khu vực"
              listData={PLACES.map((v) => ({ value: v, label: v }))}
              searchPlaceholder="Nhập địa danh"
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              dropDownDirection="BOTTOM"
              placeholderStyle={{
                color: "rgba(22,24,35,0.34)",
              }}
              style={{
                backgroundColor: "transparent",
                borderColor: errors.place
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
                borderWidth: 1,
                borderRadius: theme.sizes.base - 2,
              }}
              zIndex={3}
            />

            <View
              style={{
                marginBottom: theme.sizes.base,
              }}
            >
              {otherClick ? (
                <>
                  <InputField
                    name="constructionType"
                    control={control}
                    errors={errors}
                    label="Loại công trình"
                    inputStyle={{
                      borderRadius: theme.sizes.base / 2,
                      paddingVertical: theme.sizes.font,
                      backgroundColor: "transparent",
                      borderWidth: 1,
                      borderColor: errors.constructionType
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                    }}
                    containerStyle={{
                      marginVertical: theme.sizes.base - 2,
                    }}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      {},
                      pressed && {
                        opacity: 0.25,
                      },
                    ]}
                    onPress={() => setOtherClick(false)}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.font - 1,
                        color: "blue",
                        textDecorationLine: "underline",
                      }}
                    >
                      Mặc định
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <DropdownField
                    name="constructionType"
                    control={control}
                    errors={errors}
                    label="Loại công trình"
                    searchable={false}
                    listData={CONSTRUCTIONTYPE}
                    dropDownDirection="BOTTOM"
                    listMode="SCROLLVIEW"
                    placeholderStyle={{
                      color: "rgba(22,24,35,0.34)",
                    }}
                    style={{
                      backgroundColor: "transparent",
                      borderColor: errors.constructionType
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      borderRadius: theme.sizes.base - 2,
                      marginRight: 10,
                    }}
                    zIndex={2}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      {},
                      pressed && {
                        opacity: 0.25,
                      },
                    ]}
                    onPress={() => setOtherClick(true)}
                  >
                    <Text
                      style={{
                        fontSize: theme.sizes.font - 1,
                        color: "blue",
                        textDecorationLine: "underline",
                      }}
                    >
                      Lựa chọn khác
                    </Text>
                  </Pressable>
                </>
              )}
            </View>

            <DropdownField
              name="postCategories"
              control={control}
              errors={errors}
              label="Phong cách thiết kế"
              searchable={false}
              listData={CATEGORIES}
              dropDownDirection="BOTTOM"
              listMode="SCROLLVIEW"
              schema={{
                label: "name",
                value: "value",
              }}
              placeholderStyle={{
                color: "rgba(22,24,35,0.34)",
              }}
              style={{
                backgroundColor: "transparent",
                borderColor: errors.place
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
                borderWidth: 1,
                borderRadius: theme.sizes.base - 2,
              }}
              zIndex={-1}
            />

            <DateTimeField
              control={control}
              errors={errors}
              name="starDate"
              label="Ngày bắt đầu tuyển nhân viên"
              isOutline
              mode="date"
              display={Platform.OS === "android" && "default"}
              minimumDate={initialValues.starDate}
              containerStyle={{
                marginVertical: theme.sizes.base - 2,
                zIndex: -2,
              }}
            />

            <DateTimeField
              control={control}
              errors={errors}
              name="endDate"
              label="Thời hạn tuyển dụng hồ sơ dự thầu"
              isOutline
              mode="date"
              display={Platform.OS === "android" && "default"}
              minimumDate={initialValues.endDate}
              containerStyle={{
                marginVertical: theme.sizes.base - 2,
                zIndex: -2,
              }}
            />
            <DateTimeField
              control={control}
              errors={errors}
              name="startTime"
              label="Giờ vào làm"
              isOutline
              mode="time"
              display={Platform.OS === "android" ? "default" : "spinner"}
              containerStyle={{
                marginVertical: theme.sizes.base - 2,
                zIndex: -2,
              }}
            />
            <DateTimeField
              control={control}
              errors={errors}
              name="endTime"
              label="Giờ tan làm"
              isOutline
              mode="time"
              display={Platform.OS === "android" ? "default" : "spinner"}
              containerStyle={{
                marginVertical: theme.sizes.base - 2,
                zIndex: -2,
              }}
            />

            <CheckboxField
              name="quizRequired"
              control={control}
              errors={errors}
              label="Yêu cầu có bài kiểm tra"
              style={{
                width: theme.sizes.large + 2,
                height: theme.sizes.large + 2,
              }}
            />

            <CheckboxField
              name="videoRequired"
              control={control}
              errors={errors}
              label="Yêu cầu video khả năng làm việc"
              style={{
                width: theme.sizes.large + 2,
                height: theme.sizes.large + 2,
              }}
            />

            <CheckboxField
              name="accommodation"
              control={control}
              errors={errors}
              label="Có hỗ trợ chỗ ở không?"
              style={{
                width: theme.sizes.large + 2,
                height: theme.sizes.large + 2,
              }}
            />

            <CheckboxField
              name="transport"
              control={control}
              errors={errors}
              label="Có hỗ trợ đi lại không?"
              style={{
                width: theme.sizes.large + 2,
                height: theme.sizes.large + 2,
              }}
            />
          </View>

          <View
            style={{
              alignItems: "flex-end",
              marginTop: theme.sizes.small,
              zIndex: -1,
            }}
          >
            <Pressable
              style={({ pressed }) =>
                pressed && {
                  opacity: 0.75,
                }
              }
              onPress={handleSubmit(onSubmit)}
            >
              <View
                style={{
                  paddingVertical: theme.sizes.base,
                  backgroundColor: theme.colors.primary300,
                  minWidth: 110,
                  minHeight: 28,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: theme.colors.textColor300,
                    fontWeight: "bold",
                  }}
                >
                  Tiếp
                </Text>
              </View>
            </Pressable>
          </View>
        </KeyboardAvoidingScrollView>
      </View>
    </>
  );
};

export default InformationForm;
