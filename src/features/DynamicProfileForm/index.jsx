import { AntDesign, Feather } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { ConfirmDialog } from "~/components";
import {
  BadgeField,
  DateTimeField,
  EditorField,
  InputField,
  SelectedField,
} from "~/components/Form-field";
import {
  ASYNC_STORAGE_KEY,
  FORMAT_DATE_REGEX,
  GENDER,
  PLACES,
  PROFILE_FORM,
  PROVINCES,
  ROLE,
  ROUTE,
  TODAY,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import {
  BuilderServices,
  ContractorServices,
  SkillServices,
  StoreServices,
  TypeServices,
} from "~/services";
import { setAsyncStorage } from "~/utils/helper";

const Schema = {
  [ROLE.builder]: {
    [PROFILE_FORM.general]: Yup.object().shape({
      firstName: Yup.string().required(),
      lastName: Yup.string().required(),
      experience: Yup.number().required(),
      typeID: Yup.string().required(),
      place: Yup.number().required("Chọn địa điểm"),
      idNumber: Yup.string()
        .required()
        .min(9, "CCCD/CMND ít nhất 9 số")
        .max(12, "CCCD/CMND tối đa 12 số"),
    }),
    [PROFILE_FORM.personal]: Yup.object().shape({
      district: Yup.number().required(),
      province: Yup.number().required(),
      street: Yup.string().required(),
      gender: Yup.number().required(),
      dob: Yup.date().required(),
    }),
    [PROFILE_FORM.skills]: Yup.object().shape({
      skill: Yup.string().required(),
    }),
    [PROFILE_FORM.experience]: Yup.object().shape({
      position: Yup.string().required("Nhập chức danh"),
      companyName: Yup.string().required("Nhập công ty"),
      description: Yup.string().required("Nhập mô tả"),
      isEnabled: Yup.boolean(),
      to: Yup.mixed().when(["from", "isEnabled"], {
        is: (from, isEnabled) => !!from && !isEnabled,
        then: Yup.date().min(
          Yup.ref("from"),
          "ngày kết thúc phải lớn hơn ngày bắt đầu"
        ),
        otherwise: Yup.mixed(),
      }),
    }),
    [PROFILE_FORM.certificate]: Yup.object().shape({
      name: Yup.string().required("Vui lòng nhập thông tin"),
      path: Yup.string().url("Đường dẫn không hợp lệ"),
    }),
  },

  [ROLE.contractor]: {
    [PROFILE_FORM.general]: Yup.object().shape({
      firstName: Yup.string().required(),
      lastName: Yup.string().required(),
      email: Yup.string().required("Nhập email").email("Email không hợp lệ"),
      idNumber: Yup.string()
        .required()
        .min(9, "CCCD/CMND ít nhất 9 số")
        .max(12, "CCCD/CMND tối đa 12 số"),
    }),
    [PROFILE_FORM.personal]: Yup.object().shape({
      district: Yup.number().required(),
      province: Yup.number().required(),
      street: Yup.string().required("Nhập địa chỉ"),
      gender: Yup.number().required(),
      dob: Yup.date().required("Nhập ngày sinh"),
    }),
    [PROFILE_FORM.company]: Yup.object().shape({
      website: Yup.string()
        .required("Nhập đường dẫn")
        .url("Đường dẫn không hợp lệ"),
      companyName: Yup.string().required("Nhập tổ chức"),
      description: Yup.string().required("Nhập mô tả"),
    }),
  },

  [ROLE.store]: {
    [PROFILE_FORM.general]: Yup.object().shape({
      firstName: Yup.string().required(),
      lastName: Yup.string().required(),
      email: Yup.string().required("Nhập email").email("Email không hợp lệ"),
      place: Yup.number().required("Nhập địa điểm cửa hàng"),
      idNumber: Yup.string()
        .required()
        .min(9, "CCCD/CMND ít nhất 9 số")
        .max(12, "CCCD/CMND tối đa 12 số"),
    }),
    [PROFILE_FORM.personal]: Yup.object().shape({
      district: Yup.number().required(),
      province: Yup.number().required(),
      street: Yup.string().required("Nhập địa chỉ"),
      gender: Yup.number().required(),
      dob: Yup.date().required("Nhập ngày sinh"),
    }),
    [PROFILE_FORM.company]: Yup.object().shape({
      website: Yup.string()
        .required("Nhập đường dẫn")
        .url("Đường dẫn không hợp lệ"),
      taxCode: Yup.string().required("Nhập mã số thuế"),
      description: Yup.string().required("Nhập mô tả"),
    }),
  },
};

const MOCK_DATA = {
  maximumDate: moment(TODAY).subtract(12, "years").toDate(),
  miniumDate: moment(TODAY).subtract(100, "years").toDate(),
};

const DynamicProfileFormScreen = ({ navigation, route }) => {
  const { form, default_value, data, prev } = route.params || {};
  const theme = useTheme();
  const { userInfo, setUserInfo } = useContext(AuthContext);

  const {
    formState: { errors, dirtyFields },
    control,
    watch,
    reset,
    setError,
    clearErrors,
    setValue,
    handleSubmit,
  } = useForm({
    mode: "onBlur",
    defaultValues: data
      ? {
          ...data,
          dob: data.dob ? new Date(data.dob) : "",
          from:
            !data.from || data.from === "undefined"
              ? ""
              : moment(data.from, FORMAT_DATE_REGEX["DD/MM/YYYY"]).toDate(),
          to:
            !data.to || data.to === "undefined"
              ? ""
              : moment(data.to, FORMAT_DATE_REGEX["DD/MM/YYYY"]).toDate(),
        }
      : default_value,
    resolver: Schema?.[userInfo?.role.toLowerCase()]?.[form]
      ? yupResolver(Schema[userInfo?.role.toLowerCase()][form])
      : null,
  });

  const [isSkillSuggestShown, setIsSkillSuggestShown] = useState(false);
  const [skillList, setSkillList] = useState([]);
  const [totalSkillList, setTotalSkillList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [isConfirmDialogShow, setIsConfirmDialogShow] = useState(false);

  const province = watch("province");
  const district = watch("district");
  const skill = watch("skill");
  const from = watch("from");
  const to = watch("to");
  const isEnabled = watch("isEnabled");

  const translateY = useRef(new Animated.Value(0)).current;
  const isFirstTime = useRef(true);

  const skillSuggestList = useMemo(
    () =>
      skillList.filter((x) =>
        x.name.toLowerCase().includes(skill.toLowerCase())
      ),
    [skill, skillList]
  );

  const isDirty = useMemo(() => {
    switch (form) {
      case PROFILE_FORM.general: {
        if (userInfo?.role?.toLowerCase() === ROLE.builder)
          return (
            dirtyFields.firstName ||
            dirtyFields.lastName ||
            dirtyFields.experience ||
            dirtyFields.typeID ||
            dirtyFields.idNumber
          );
        else if (userInfo?.role?.toLowerCase() === ROLE.contractor)
          return (
            dirtyFields.firstName ||
            dirtyFields.lastName ||
            dirtyFields.email ||
            dirtyFields.idNumber
          );
        else
          return (
            dirtyFields.firstName ||
            dirtyFields.lastName ||
            dirtyFields.email ||
            dirtyFields.place ||
            dirtyFields.place ||
            dirtyFields.idNumber
          );
      }

      case PROFILE_FORM.personal:
        return (
          dirtyFields.province ||
          dirtyFields.district ||
          dirtyFields.street ||
          dirtyFields.gender ||
          dirtyFields.dob
        );

      case PROFILE_FORM.skills:
        return dirtyFields.skill && skillList.some((x) => x.name === skill);

      case PROFILE_FORM.experience: {
        if (data)
          return (
            dirtyFields.position ||
            dirtyFields.companyName ||
            dirtyFields.isEnabled ||
            dirtyFields.from ||
            dirtyFields.to ||
            dirtyFields.description
          );

        return (
          dirtyFields.position &&
          dirtyFields.companyName &&
          dirtyFields.description
        );
      }

      case PROFILE_FORM.certificate: {
        if (data)
          return (
            dirtyFields.name ||
            dirtyFields.companyName ||
            dirtyFields.from ||
            dirtyFields.path
          );

        return dirtyFields.name;
      }

      case PROFILE_FORM.company: {
        if (userInfo?.role?.toLowerCase() === ROLE.contractor)
          return (
            dirtyFields.companyName ||
            dirtyFields.website ||
            dirtyFields.description
          );
        else
          return (
            dirtyFields.taxCode ||
            dirtyFields.website ||
            dirtyFields.description
          );
      }
    }
  }, [{ ...dirtyFields }, skillList]);

  useLayoutEffect(() => {
    if (form) {
      navigation.setOptions({
        title: form,
        headerLeft: () => {
          return (
            <AntDesign
              name="close"
              size={theme.sizes.large + 4}
              color="rgb(22,24,35)"
              onPress={() => navigation.goBack()}
              style={Platform.OS === "android" && { marginRight: 10 }}
            />
          );
        },
        headerTitleStyle: {
          fontSize: theme.sizes.large,
        },
      });
    }
  }, [form]);

  // form personal
  useEffect(() => {
    // ignore the first time when already have data
    if (data?.district && data?.province && isFirstTime.current) {
      isFirstTime.current = false;
      return;
    }

    // reset district when choose provinces
    if ((province || province === 0) && (district || district === 0)) {
      reset((prev) => ({ ...prev, district: "" }));
    }
  }, [province]);

  // form experience
  useEffect(() => {
    if (isEnabled) {
      setValue("to", "", {
        shouldValidate: true,
        shouldDirty: false,
      });
      clearErrors("to");
    } else {
      if (data) {
        setValue(
          "to",
          data.to === "undefined"
            ? ""
            : moment(data.to, FORMAT_DATE_REGEX["DD/MM/YYYY"]).toDate(),
          {
            shouldValidate: true,
            shouldDirty: false,
          }
        );
      }
    }
  }, [isEnabled]);

  // form experience
  useEffect(() => {
    if (!from || isEnabled || to) {
      clearErrors("to");
    } else if (from && !isEnabled && !to) {
      setError("to", { type: "custom", message: "Nhập ngày đến" });
    }
  }, [from, to, isEnabled]);

  // animation  push footer when  open keyboard & fetch Data
  useEffect(() => {
    const animationFooter = (value) => {
      Animated.spring(translateY, {
        toValue: value,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }).start();
    };

    const _keyboardWillShow = (event) => {
      if (form !== PROFILE_FORM.skills) {
        const height = event.endCoordinates.height;
        animationFooter(-height);
        return;
      } else {
        setIsSkillSuggestShown(true);
      }
    };

    const _keyboardWillHide = () => {
      if (form !== PROFILE_FORM.skills) {
        animationFooter(0);
      } else {
        setIsSkillSuggestShown(false);
      }
    };

    Keyboard.addListener("keyboardWillShow", _keyboardWillShow);
    Keyboard.addListener("keyboardWillHide", _keyboardWillHide);

    fetchData();

    return () => {
      Keyboard.removeAllListeners("keyboardWillShow");
      Keyboard.removeAllListeners("keyboardWillHide");
    };
  }, []);

  const renderForm = () => {
    switch (form) {
      case PROFILE_FORM.general:
        return (
          <View>
            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Họ"
                name="firstName"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
                isRequired
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="lastName"
                label="Tên"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
                isRequired
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="idNumber"
                label="Số CCCD/CMND"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
                isRequired
                inputConfig={{ keyboardType: "number-pad", maxLength: 12 }}
              />
            </View>

            {userInfo?.role?.toLowerCase() === ROLE.builder ? (
              <>
                <View
                  style={{
                    paddingBottom: theme.sizes.base,
                    marginBottom: theme.sizes.font - 2,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <InputField
                    control={control}
                    errors={errors}
                    label="Số năm kinh nghiệm"
                    name="experience"
                    placeholder="Bắt buộc"
                    isOutline
                    isRequired
                    showError={false}
                    keyboardType="number-pad"
                    inputConfig={{
                      maxLength: 2,
                    }}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: theme.sizes.font,
                    }}
                    inputStyle={{
                      paddingVertical: theme.sizes.font,
                      borderRadius: theme.sizes.base - 2,
                    }}
                  />
                </View>

                <View
                  style={{
                    paddingBottom: theme.sizes.base,
                    marginBottom: theme.sizes.font - 2,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <SelectedField
                    control={control}
                    errors={errors}
                    list={PLACES.map((x, idx) => ({ name: x, value: idx }))}
                    label="Địa điểm"
                    name="place"
                    isRequired
                    placeholder="Bắt buộc"
                    isOutline
                    showError={false}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: theme.sizes.font,
                    }}
                    inputStyle={{
                      paddingVertical: theme.sizes.font,
                      borderRadius: theme.sizes.base - 2,
                    }}
                  />
                </View>

                <View
                  style={{
                    paddingBottom: theme.sizes.base,
                    marginBottom: theme.sizes.font - 2,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <BadgeField
                    control={control}
                    errors={errors}
                    name="typeID"
                    isRequired
                    label="Loại thợ"
                    showError={false}
                    list={typeList}
                    isMultiple={false}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: theme.sizes.font,
                    }}
                    schema={{
                      label: "name",
                      value: "id",
                    }}
                  />
                </View>
              </>
            ) : userInfo?.role?.toLowerCase() === ROLE.contractor ? (
              <View
                style={{
                  paddingBottom: theme.sizes.base,
                  marginBottom: theme.sizes.font - 2,
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                }}
              >
                <InputField
                  control={control}
                  errors={errors}
                  name="email"
                  label="Email"
                  isOutline
                  showError={data?.email ? false : true}
                  labelStyle={{
                    fontWeight: "bold",
                    fontSize: theme.sizes.font,
                  }}
                  inputStyle={{
                    paddingVertical: theme.sizes.font,
                    borderRadius: theme.sizes.base - 2,
                  }}
                />
              </View>
            ) : (
              <>
                <View
                  style={{
                    paddingBottom: theme.sizes.base,
                    marginBottom: theme.sizes.font - 2,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <InputField
                    control={control}
                    errors={errors}
                    name="email"
                    label="Email"
                    isOutline
                    showError={data?.email ? false : true}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: theme.sizes.font,
                    }}
                    inputStyle={{
                      paddingVertical: theme.sizes.font,
                      borderRadius: theme.sizes.base - 2,
                    }}
                  />
                </View>

                <View
                  style={{
                    paddingBottom: theme.sizes.base,
                    marginBottom: theme.sizes.font - 2,
                    borderBottomColor: "rgba(22,24,35,0.12)",
                    borderBottomWidth: 1,
                  }}
                >
                  <SelectedField
                    control={control}
                    errors={errors}
                    list={PLACES.map((x, idx) => ({ name: x, value: idx }))}
                    label="Địa điểm"
                    name="place"
                    isRequired
                    placeholder="Bắt buộc"
                    isOutline
                    showError={false}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: theme.sizes.font,
                    }}
                    inputStyle={{
                      paddingVertical: theme.sizes.font,
                      borderRadius: theme.sizes.base - 2,
                    }}
                  />
                </View>
              </>
            )}
          </View>
        );

      case PROFILE_FORM.personal:
        return (
          <View>
            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Số điện thoại"
                name="phone"
                isOutline
                showError={false}
                showingPrefix
                disabled
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <SelectedField
                control={control}
                errors={errors}
                list={PLACES.map((x, idx) => ({ name: x, value: idx }))}
                label="Tỉnh / Thành phố"
                name="province"
                placeholder="Bắt buộc"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <SelectedField
                control={control}
                errors={errors}
                list={
                  PROVINCES[province]?.map((x, idx) => ({
                    name: x,
                    value: idx,
                  })) || []
                }
                label="Quận"
                name="district"
                placeholder="Bắt buộc"
                isOutline
                showError={false}
                shouldOpen={province || province === 0 ? true : false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Địa chỉ"
                placeholder="Bắt buộc"
                name="street"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.font,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <BadgeField
                control={control}
                errors={errors}
                name="gender"
                label="Giới tính"
                showError={false}
                list={GENDER.map((x, idx) => ({ name: x, value: idx }))}
                isMultiple={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
              />
            </View>

            <View>
              <DateTimeField
                control={control}
                errors={errors}
                name="dob"
                label="Ngày sinh"
                placeholder="Bắt buộc"
                isOutline
                mode="date"
                maximumDate={MOCK_DATA.maximumDate}
                minimumDate={MOCK_DATA.miniumDate}
                display="spinner"
                textHelpers={[
                  `Ngày tối thiểu ${moment(MOCK_DATA.miniumDate).format(
                    FORMAT_DATE_REGEX["DD-MM-YYYY"]
                  )}`,
                  `Ngày tối đa ${moment(MOCK_DATA.maximumDate).format(
                    FORMAT_DATE_REGEX["DD-MM-YYYY"]
                  )}`,
                ]}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>
          </View>
        );

      case PROFILE_FORM.skills:
        return (
          <View style={{ flex: 1 }}>
            <View
              style={{
                paddingBottom: isSkillSuggestShown ? 0 : theme.sizes.base,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: isSkillSuggestShown ? 0 : 1,
                zIndex: 10,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Kỹ năng"
                placeholder="Bắt buộc"
                name="skill"
                isOutline
                showError={errors?.skill?.type === "custom" ? true : false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            {isSkillSuggestShown ? (
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={{
                  flex: 1,
                  maxHeight: 270,
                }}
              >
                {skillSuggestList.map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.25,
                      },
                      {
                        paddingVertical: theme.sizes.medium,
                        borderBottomColor: "rgba(22,24,35,0.12)",
                        borderBottomWidth: 1,
                      },
                    ]}
                    onPress={() => {
                      setValue("skill", item.name, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      Keyboard.dismiss();
                    }}
                  >
                    <Text>{item.name}</Text>
                  </Pressable>
                ))}

                {skillSuggestList.length === 0 && (
                  <View
                    style={{
                      paddingBottom: theme.sizes.font,
                      paddingTop: theme.sizes.base,
                      borderBottomColor: "rgba(22,24,35,0.12)",
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text>không có kết quả nào</Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              data && (
                <Pressable
                  style={({ pressed }) => [
                    pressed && { opacity: 0.25 },
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: theme.sizes.font,
                    },
                  ]}
                  onPress={() => setIsConfirmDialogShow(true)}
                >
                  <Feather name="trash-2" size={24} color="#f08025" />
                  <Text
                    style={{
                      marginLeft: theme.sizes.base / 2,
                      color: "#f08025",
                      fontSize: theme.sizes.font + 1,
                    }}
                  >
                    Xóa kĩ năng
                  </Text>
                </Pressable>
              )
            )}
          </View>
        );

      case PROFILE_FORM.experience:
        return (
          <View>
            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Chức danh"
                name="position"
                placeholder="Bắt buộc"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="companyName"
                label="Công ty"
                placeholder="Bắt buộc"
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingTop: theme.sizes.base / 2,
                paddingBottom: theme.sizes.font,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Công việc hiện tại</Text>
              <Switch
                trackColor={{ false: "rgba(22,24,35,0.06)", true: "#2323fc" }}
                thumbColor="white"
                ios_backgroundColor="rgba(22,24,35,0.06)"
                onValueChange={() =>
                  setValue("isEnabled", !isEnabled, {
                    shouldValidate: false,
                    shouldDirty: true,
                  })
                }
                value={isEnabled}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <DateTimeField
                control={control}
                errors={errors}
                name="from"
                label="Từ ngày"
                placeholder="dd / mm / yyyy"
                isOutline
                mode="date"
                maximumDate={TODAY}
                minimumDate={MOCK_DATA.miniumDate}
                display="spinner"
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <DateTimeField
                control={control}
                errors={errors}
                name="to"
                label="Đến ngày"
                placeholder="dd / mm / yyyy"
                isOutline
                mode="date"
                disabled={isEnabled}
                maximumDate={TODAY}
                minimumDate={MOCK_DATA.miniumDate}
                display="spinner"
                typeErrorMsg="Nhập ngày đến"
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: data && theme.sizes.base,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: data ? 1 : 0,
              }}
            >
              <EditorField
                name="description"
                control={control}
                errors={errors}
                label="Mô tả"
                placeholder="Bắt buộc"
                containerStyle={{
                  marginVertical: theme.sizes.base - 2,
                }}
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
              />
            </View>

            {data && (
              <Pressable
                style={({ pressed }) => [
                  pressed && { opacity: 0.25 },
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: theme.sizes.font,
                  },
                ]}
                onPress={() => setIsConfirmDialogShow(true)}
              >
                <Feather name="trash-2" size={24} color="#f08025" />
                <Text
                  style={{
                    marginLeft: theme.sizes.base / 2,
                    color: "#f08025",
                    fontSize: theme.sizes.font + 1,
                  }}
                >
                  Xóa kinh nghiệm
                </Text>
              </Pressable>
            )}
          </View>
        );

      case PROFILE_FORM.certificate:
        return (
          <View>
            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                label="Tên chứng chỉ"
                name="name"
                placeholder="Bắt buộc"
                isOutline
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="companyName"
                label="Tổ chức"
                placeholder=""
                isOutline
                showError={false}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <DateTimeField
                control={control}
                errors={errors}
                name="from"
                label="Ngày"
                placeholder="dd / mm / yyyy"
                isOutline
                mode="date"
                maximumDate={MOCK_DATA.maximumDate}
                minimumDate={MOCK_DATA.miniumDate}
                display="spinner"
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="path"
                label="Đường dẫn chứng chỉ"
                placeholder=""
                isOutline
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            {data && (
              <Pressable
                style={({ pressed }) => [
                  pressed && { opacity: 0.25 },
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: theme.sizes.font,
                  },
                ]}
                onPress={() => setIsConfirmDialogShow(true)}
              >
                <Feather name="trash-2" size={24} color="#f08025" />
                <Text
                  style={{
                    marginLeft: theme.sizes.base / 2,
                    color: "#f08025",
                    fontSize: theme.sizes.font + 1,
                  }}
                >
                  Xóa chứng chỉ
                </Text>
              </Pressable>
            )}
          </View>
        );

      case PROFILE_FORM.company: {
        return (
          <View>
            {userInfo?.role?.toLowerCase() === ROLE.contractor ? (
              <View
                style={{
                  paddingBottom: theme.sizes.base,
                  marginBottom: theme.sizes.font - 2,
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                }}
              >
                <InputField
                  control={control}
                  errors={errors}
                  label="Tổ chức"
                  name="companyName"
                  placeholder="Bắt buộc"
                  isOutline
                  isRequired
                  showError={data?.companyName ? false : true}
                  labelStyle={{
                    fontWeight: "bold",
                    fontSize: theme.sizes.font,
                  }}
                  inputStyle={{
                    paddingVertical: theme.sizes.font,
                    borderRadius: theme.sizes.base - 2,
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  paddingBottom: theme.sizes.base,
                  marginBottom: theme.sizes.font - 2,
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                }}
              >
                <InputField
                  control={control}
                  errors={errors}
                  label="Mã số thuế"
                  name="taxCode"
                  isRequired
                  placeholder="Bắt buộc"
                  isOutline
                  showError={data?.taxCode ? false : true}
                  keyboardType="number-pad"
                  inputConfig={{
                    maxLength: 13,
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    fontSize: theme.sizes.font,
                  }}
                  inputStyle={{
                    paddingVertical: theme.sizes.font,
                    borderRadius: theme.sizes.base - 2,
                  }}
                />
              </View>
            )}

            <View
              style={{
                paddingBottom: theme.sizes.base,
                marginBottom: theme.sizes.font - 2,
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderBottomWidth: 1,
              }}
            >
              <InputField
                control={control}
                errors={errors}
                name="website"
                label="Đường dẫn của tổ chức"
                placeholder="Bắt buộc"
                isOutline
                isRequired
                showError={data?.website ? false : true}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
                inputStyle={{
                  paddingVertical: theme.sizes.font,
                  borderRadius: theme.sizes.base - 2,
                }}
              />
            </View>

            <View
              style={{
                paddingBottom: data && theme.sizes.base,
              }}
            >
              <EditorField
                name="description"
                control={control}
                errors={errors}
                label="Mô tả"
                placeholder="Bắt buộc"
                isRequired
                showError={data?.description ? false : true}
                containerStyle={{
                  marginVertical: theme.sizes.base - 2,
                }}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: theme.sizes.font,
                }}
              />
            </View>
          </View>
        );
      }

      default: {
        break;
      }
    }
  };

  const handleDeleteSkill = async () => {
    const { skill } = data;
    const skillID = skillList.find((x) => x.name === skill)?.id;
    const result = prev.filter((x) => x !== skillID);
    const isSuccess = await BuilderServices.updateProfile({
      skills: result,
    });

    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Kĩ năng này đã được xóa",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.navigate(ROUTE.myProfile, {
        isFetchData: true,
        form,
        updatedData: totalSkillList.filter((x) => result.includes(x.id)),
      });
    }
  };

  const handleDeleteExperienceDetail = async () => {
    const { position, companyName, from, to, description } = data;
    const prevExperienceDetail = `${position};${companyName};${from};${to};${description}`;
    const experienceDetail = prev
      .filter((x) => x !== prevExperienceDetail)
      .join("|");

    const isSuccess = await BuilderServices.updateProfile({
      experienceDetail: experienceDetail || null,
    });
    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Kinh nghiệm này đã được xóa",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.navigate(ROUTE.myProfile, {
        updatedData: { experienceDetail },
        isFetchData: true,
        form,
      });
    }
  };

  const handleDeleteCertificate = async () => {
    const { name, companyName, from, path } = data;
    const prevCertificate = `${name};${companyName};${from};${path}`;
    const certificate = prev.filter((x) => x !== prevCertificate).join("|");

    const isSuccess = await BuilderServices.updateProfile({
      certificate: certificate || null,
    });
    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Chứng chỉ này đã được xóa",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.navigate(ROUTE.myProfile, {
        updatedData: { certificate },
        isFetchData: true,
        form,
      });
    }
  };

  const onSubmit = async (_data) => {
    switch (form) {
      case PROFILE_FORM.general: {
        const { dob, from, to, ...props } = _data;
        let _isSuccess = false;
        let _status;
        if (userInfo?.role?.toLowerCase() === ROLE.builder) {
          const { isSuccess, data } = await BuilderServices.updateProfile({
            ...props,
          });
          _isSuccess = isSuccess;
          _status = data;
        } else if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
          const { isSuccess, data } = await ContractorServices.updateProfile({
            ...props,
          });
          _isSuccess = isSuccess;
          _status = data;
        } else {
          const { isSuccess, data } = await StoreServices.updateProfile({
            ...props,
          });
          _isSuccess = isSuccess;
          _status = data;
        }

        if (_isSuccess) {
          Toast.show({
            type: "success",
            text1: "Cập nhật thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          if (_status) setUserInfo((prev) => ({ ...prev, status: +_status }));
          await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, {
            ...userInfo,
            status: +_status,
          });
          return navigation.navigate(ROUTE.myProfile, {
            updatedData: props,
            isFetchData: true,
            form,
          });
        }
        break;
      }

      case PROFILE_FORM.personal: {
        const { from, to, province, district, street, dob, ...props } = _data;

        const address = `${street}, ${PROVINCES[province][district]}, ${PLACES[province]}`;
        let _isSuccess = false;
        if (userInfo?.role?.toLowerCase() === ROLE.builder) {
          const { isSuccess } = await BuilderServices.updateProfile({
            ...props,
            address,
            dob: moment(dob).toISOString(true),
          });
          _isSuccess = isSuccess;
        } else if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
          const { isSuccess } = await ContractorServices.updateProfile({
            ...props,
            address,
            dob: moment(dob).toISOString(true),
          });
          _isSuccess = isSuccess;
        } else {
          const { isSuccess } = await StoreServices.updateProfile({
            ...props,
            address,
            dob: moment(dob).toISOString(true),
          });
          _isSuccess = isSuccess;
        }

        if (_isSuccess) {
          Toast.show({
            type: "success",
            text1: "Cập nhật thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          return navigation.navigate(ROUTE.myProfile, {
            form,
            isFetchData: true,
            updatedData: {
              ...props,
              province,
              district,
              street,
              dob: moment(dob).toISOString(true),
            },
          });
        }
        break;
      }

      case PROFILE_FORM.skills: {
        const { skill } = _data;
        const skillID = skillList.find((x) => x.name === skill)?.id;
        let _clone = [...prev];

        if (skillList.find((x) => x.name === skill)) {
          if (data) {
            const { skill: prevSkill } = data;
            const prevSkillID = skillList.find((x) => x.name === prevSkill)?.id;
            const prevIndex = _clone.findIndex((x) => x === prevSkillID);
            _clone[prevIndex] = skillID;
          } else {
            if (skillID || skillID === 0) {
              _clone.push(skillID);
            }
          }

          const { isSuccess } = await BuilderServices.updateProfile({
            skills: _clone,
          });

          if (isSuccess) {
            Toast.show({
              type: "success",
              text1: data
                ? "Kĩ năng của bạn đã được cập nhật thành công"
                : "Kĩ năng của bạn đã được thêm thành công",
              position: "bottom",
              visibilityTime: 2500,
            });
            return navigation.navigate(ROUTE.myProfile, {
              isFetchData: true,
              form,
              updatedData: totalSkillList.filter((x) => _clone.includes(x.id)),
            });
          }

          return;
        }
        setError("skill", {
          type: "custom",
          message: "Kĩ năng không tồn tại",
        });

        break;
      }

      case PROFILE_FORM.experience: {
        const { position, companyName, from, to, description } = _data;
        const _clone = [...prev];

        const experienceDetail = `${position};${companyName};${
          typeof from.getMonth === "function"
            ? moment(from).format(FORMAT_DATE_REGEX["DD/MM/YYYY"])
            : undefined
        };${
          typeof to.getMonth === "function"
            ? moment(to).format(FORMAT_DATE_REGEX["DD/MM/YYYY"])
            : undefined
        };${description}`;

        if (data) {
          const { position, companyName, from, to, description } = data;
          const prevVal = `${position};${companyName};${from};${to};${description}`;

          const idx = _clone.indexOf(prevVal);
          _clone[idx] = experienceDetail;
        } else {
          _clone.push(experienceDetail);
        }

        const { isSuccess } = await BuilderServices.updateProfile({
          experienceDetail: _clone.join("|"),
        });
        if (isSuccess) {
          Toast.show({
            type: "success",
            text1: data
              ? "Kinh nghiệm của bạn đã được cập nhật thành công"
              : "Kinh nghiệm của bạn đã được thêm thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          return navigation.navigate(ROUTE.myProfile, {
            updatedData: { experienceDetail: _clone.join("|") },
            isFetchData: true,
            form,
          });
        }

        break;
      }

      case PROFILE_FORM.certificate: {
        const { name, companyName, from, path } = _data;
        const _clone = [...prev];

        const certificate = `${name};${companyName};${
          typeof from.getMonth === "function"
            ? moment(from).format(FORMAT_DATE_REGEX["DD/MM/YYYY"])
            : undefined
        };${path}`;

        if (data) {
          const { name, companyName, from, path } = data;
          const prevVal = `${name};${companyName};${from};${path}`;

          const idx = _clone.indexOf(prevVal);
          _clone[idx] = certificate;
        } else {
          _clone.push(certificate);
        }

        const { isSuccess } = await BuilderServices.updateProfile({
          certificate: _clone.join("|"),
        });
        if (isSuccess) {
          Toast.show({
            type: "success",
            text1: data
              ? "Chứng chỉ của bạn đã được cập nhật thành công"
              : "Chứng chỉ của bạn đã được thêm thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          return navigation.navigate(ROUTE.myProfile, {
            updatedData: { certificate: _clone.join("|") },
            isFetchData: true,
            form,
          });
        }

        break;
      }

      case PROFILE_FORM.company: {
        const { dob, from, to, ...props } = _data;
        let _isSuccess = false;
        let _status;
        if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
          const { isSuccess, data } = await ContractorServices.updateProfile({
            ...props,
          });
          _isSuccess = isSuccess;
          _status = data;
        } else {
          const { isSuccess, data } = await StoreServices.updateProfile({
            ...props,
          });
          _isSuccess = isSuccess;
          _status = data;
        }

        if (_isSuccess) {
          Toast.show({
            type: "success",
            text1: "Cập nhật thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          if (_status) setUserInfo((prev) => ({ ...prev, status: +_status }));
          await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, {
            ...userInfo,
            status: +_status,
          });
          return navigation.navigate(ROUTE.myProfile, {
            updatedData: props,
            isFetchData: true,
            form,
          });
        }
      }
    }
  };

  const fetchData = async () => {
    switch (form) {
      case PROFILE_FORM.general: {
        const _typeList = await TypeServices.getList();
        setTypeList(_typeList);
        break;
      }
      case PROFILE_FORM.personal:
        break;
      case PROFILE_FORM.skills: {
        const _skillList = await SkillServices.getList();
        if (data) {
          const _skillID = _skillList.find((x) => x.name === data.skill)?.id;
          setSkillList(
            _skillList.filter((x) => !prev.includes(x.id) || x.id === _skillID)
          );
        } else {
          setSkillList(_skillList.filter((x) => !prev.includes(x.id)));
        }
        setTotalSkillList(_skillList);
        break;
      }
      default:
        break;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        marginTop: Platform.OS === "ios" ? 0 : 80,
      }}
    >
      <ConfirmDialog
        visible={isConfirmDialogShow}
        title={
          form === PROFILE_FORM.experience
            ? "Bạn có muốn xóa kinh nghiệm này"
            : form === PROFILE_FORM.certificate
            ? "Bạn có muốn xóa chứng chỉ này"
            : "Bạn có muốn xóa kĩ năng này"
        }
        confirmText="Xóa"
        onClose={() => setIsConfirmDialogShow(false)}
        onConfirm={
          form === PROFILE_FORM.experience
            ? handleDeleteExperienceDetail
            : form === PROFILE_FORM.certificate
            ? handleDeleteCertificate
            : handleDeleteSkill
        }
      />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={
          form !== PROFILE_FORM.skills && Platform.OS === "ios" ? 180 : null
        }
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps={
              form !== PROFILE_FORM.skills ? "handled" : "always"
            }
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: theme.sizes.font,
            }}
          >
            {renderForm()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* footer */}
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          borderTopColor: "rgba(22,24,35,0.12)",
          borderTopWidth: 1,
          transform: [{ translateY: translateY }],
          left: 0,
          right: 0,
          backgroundColor: "white",
          width: Dimensions.get("screen").width,
          padding: theme.sizes.medium,
          paddingHorizontal: theme.sizes.large,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed &&
              isDirty && {
                opacity: 0.25,
              },
            { width: "100%" },
          ]}
          onPress={isDirty ? handleSubmit(onSubmit) : () => {}}
        >
          <View
            style={{
              backgroundColor: isDirty ? "#f08025" : "rgba(22,24,35,0.12)",
              padding: theme.sizes.font,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: theme.sizes.base - 2,
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.large,
                color: isDirty ? "white" : "rgba(22,24,35,0.34)",
                fontWeight: "500",
              }}
            >
              Lưu
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default DynamicProfileFormScreen;
