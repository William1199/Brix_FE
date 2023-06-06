import { AntDesign, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import MaskInput, { createNumberMask } from "react-native-mask-input";
import { useTheme } from "react-native-paper";
import * as Yup from "yup";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { ConfirmDialog, CustomButton } from "~/components";
import { API_RESPONSE_CODE, FORMAT_DATE_REGEX, ROUTE } from "~/constants";
import { formatStringToCurrency } from "~/utils/helper";
import { DateTimeField, DropdownField } from "../../components/Form-field";

const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});

const MOCK_DATA = {
  maximumDate: moment().subtract(12, "years").toDate(),
  miniumDate: moment().subtract(100, "years").toDate(),
  _salary_default_value: {
    masked: "",
    unMasked: "",
  },
  _default_validate: {
    min: { valid: true, message: "" },
    max: { valid: true, message: "" },
  },
};

const validationSchema = Yup.object().shape({
  members: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Hãy nhập tên thành viên"),
      dob: Yup.string().required("Hãy nhập ngày sinh thành viên"),
      typeName: Yup.string().required("Hãy nhập loại thành viên"),
      verifyId: Yup.string().required("Hãy nhập CCCD thành viên"),
      skillAssessment: Yup.string().required("Hãy nhập kĩ năng"),
      behaviourAssessment: Yup.string().required("Hãy nhập độ thành thạo"),
    })
  ),
});

const ApplyGroupScreen = ({ route, navigation }) => {
  const { id, salaryRange, video } = route.params || {};
  const { _salary_default_value, _default_validate } = MOCK_DATA;
  const { top, bottom } = useSafeAreaInsets();

  const theme = useTheme();
  const {
    formState: { errors },
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      members: [
        {
          name: "",
          dob: "",
          typeName: "",
          verifyId: "",
          skillAssessment: "",
          behaviourAssessment: "",
        },
      ],
    },
    resolver: yupResolver(validationSchema),
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: "members",
  });

  const [typeList, setTypeList] = useState([]);
  const [salary, setSalary] = useState(_salary_default_value);
  const [validate, setValidate] = useState(_default_validate);
  const [isOpen, setIsOpen] = useState({ isShow: false, data: [] });
  const [error, setError] = useState("");

  let min;
  let max;
  if (salaryRange.includes("+")) {
    min = Number(salaryRange.split("+")[1].replace(".", ""));
    max = min + 500000;
  } else {
    min = Number(salaryRange.split("-")[0].replace(".", ""));
    max = Number(salaryRange.split("-")[1].replace(".", ""));
  }

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

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get("type");
      if (+res.code === API_RESPONSE_CODE.success) {
        const list = [];
        res.data.map((item) => {
          list.push({
            label: item.name,
            value: item.id,
          });
        });
        setTypeList(list);
      }
    })();
  }, []);

  const onSubmit = async () => {
    const data = isOpen.data;
    try {
      let members = [];
      data.members.map((member) => {
        members.push({
          name: member.name,
          dob: moment(member.dob).toISOString(),
          typeID: member.typeName,
          verifyId: member.verifyId,
          behaviourAssessment: +member.behaviourAssessment,
          skillAssessment: member.skillAssessment,
        });
      });

      const request = {
        postId: id,
        groupMember: members,
        wishSalary: +salary.unMasked,
        video,
      };

      const res = await axiosInstance.post("contractorpost/applied", request);
      if (+res.code === API_RESPONSE_CODE.success) {
        Toast.show({
          type: "success",
          text1: "Ứng tuyển đội nhóm thành công",
          position: "bottom",
          visibilityTime: 2500,
        });
        return navigation.navigate(ROUTE.postDetail, { id });
      } else {
        setError(res.message);

        setTimeout(() => {
          setError("");
        }, 3000);
      }
      setIsOpen({ isShow: false, data: [] });
    } catch (e) {
      console.log(`Apply group error ${e}`);
    }
  };

  return (
    <>
      <StatusBar style="light" />

      <ConfirmDialog
        visible={isOpen.isShow}
        confirmText="Xác nhận"
        onClose={() => setIsOpen((prev) => ({ ...prev, isShow: false }))}
        onConfirm={() => {
          if (handleValidate()) {
            onSubmit();
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
              placeholder="Bắt buộc"
              style={{
                flex: 1,
                marginLeft: theme.sizes.base / 2,
                color: "blue",
              }}
              clearButtonMode="while-editing"
              keyboardType="numeric"
              value={salary.masked}
              onBlur={handleValidate}
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

      {/* header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.primary400,
          paddingBottom: theme.sizes.medium,
          paddingTop: top + theme.sizes.small,
        }}
      >
        <AntDesign
          name="close"
          size={22}
          color="white"
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: theme.sizes.large,
            top: top + theme.sizes.small,
          }}
        />

        <Text
          style={{
            fontSize: theme.sizes.large,
            color: "#fff",
            alignSelf: "center",
            fontWeight: "semi-bold",
          }}
        >
          Ứng tuyển đội nhóm
        </Text>
      </View>

      {/* main */}
      <KeyboardAwareScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        behavior="padding"
        contentContainerStyle={{
          padding: 25,
          paddingBottom: 70,
          backgroundColor: "white",
        }}
      >
        {/* warning  */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: theme.sizes.font,
            backgroundColor: "rgba(237,164,74, 0.15)",
            marginBottom: 24,
          }}
        >
          <AntDesign
            name="exclamationcircle"
            size={18}
            color={theme.colors.highlight}
          />
          <Text
            style={{
              marginLeft: theme.sizes.font,
              lineHeight: theme.sizes.font * 1.35,
              fontSize: theme.sizes.font,
              flex: 1,
              color: theme.colors.highlight,
            }}
          >
            Lưu ý hãy báo cáo thông tin đúng sự thật, bạn sẽ chịu toàn bộ trách
            nhiệm cho tất cả thông tin mà bạn cung cấp.
          </Text>
        </View>

        {error && (
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 0,
              right: 0,
              zIndex: 1000,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 14,
                minWidth: "60%",
                maxWidth: "70%",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "white", fontSize: 16, textAlign: "center" }}
              >
                {error}
              </Text>
            </View>
          </View>
        )}

        {fields.map((field, index) => {
          return (
            <View
              key={field.id}
              style={{
                borderWidth: 1,
                borderColor: "rgba(22,24,35,0.34)",
                borderRadius: 20,
                padding: 25,
                marginBottom: 24,
                backgroundColor: theme.colors.primary25,
                zIndex: 100 - index,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: theme.colors.primary300,
                    textTransform: "capitalize",
                    marginBottom: theme.sizes.small,
                  }}
                >
                  Thành viên {index + 1}
                </Text>

                {fields.length > 1 && (
                  <Pressable
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.25,
                      },
                      {
                        position: "absolute",
                        top: 2,
                        right: 0,
                        marginBottom: 10,
                      },
                    ]}
                    onPress={() => {
                      remove(index);
                    }}
                  >
                    <Ionicons
                      name="ios-remove-circle-outline"
                      size={theme.sizes.large}
                      color={theme.colors.error}
                    />
                  </Pressable>
                )}
              </View>

              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                Tên
              </Text>

              <Controller
                name={`members.${index}.name`}
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: errors?.members?.[index]?.name
                        ? theme.colors.error
                        : "rga(22,24,35)",
                      paddingVertical: theme.sizes.base / 2,
                    }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: 15,
                  marginTop: 15,
                  ...(Platform.OS !== "android"
                    ? {
                        zIndex: 10,
                      }
                    : {
                        zIndex: -1,
                      }),
                }}
              >
                CCCD
              </Text>

              <Controller
                name={`members.${index}.verifyId`}
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: errors?.members?.[index]?.name
                        ? theme.colors.error
                        : "rga(22,24,35)",
                      paddingVertical: theme.sizes.base / 2,
                    }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: 15,
                  marginTop: 15,
                }}
              >
                Ngày sinh
              </Text>

              <DateTimeField
                control={control}
                showLabel={false}
                name={`members.${index}.dob`}
                placeholder="Bắt buộc"
                isOutline
                mode="date"
                maximumDate={MOCK_DATA.maximumDate}
                minimumDate={MOCK_DATA.miniumDate}
                display="spinner"
                containerStyle={{
                  marginTop: 10,
                }}
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
                  borderRadius: theme.sizes.base - 2,
                  borderColor: errors?.members?.[index]?.dob
                    ? theme.colors.error
                    : "rgb(22,24,35)",
                }}
              />

              <DropdownField
                name={`members.${index}.typeName`}
                control={control}
                errors={errors}
                label="Loại thợ"
                listData={typeList}
                searchable={false}
                listMode="SCROLLVIEW"
                dropDownDirection="BOTTOM"
                placeholderStyle={{
                  color: "rgba(22,24,35,0.34)",
                }}
                style={{
                  backgroundColor: "transparent",
                  borderColor: errors?.members?.[index]?.typeName
                    ? theme.colors.error
                    : "rgb(22,24,35)",
                  borderWidth: 1,
                  borderRadius: theme.sizes.base - 2,
                }}
                labelStyle={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: 15,
                  marginBottom: 8,
                }}
                dropDownContainerStyle={{
                  borderColor: "rgb(22,24,35)",
                  borderWidth: 0.75,
                }}
                placeholder="Bắt buộc"
                containerStyle={{ zIndex: 10 }}
              />

              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                Đánh giá chất lượng
              </Text>

              <View
                style={{
                  borderColor:
                    errors?.members?.[index]?.skillAssessment ||
                    errors?.members?.[index]?.behaviourAssessment
                      ? theme.colors.error
                      : "rgb(22,24,35)",
                  borderWidth: 0.5,
                  borderRadius: theme.sizes.base / 2,
                  padding: theme.sizes.font,
                  marginTop: theme.sizes.small,
                }}
              >
                <View style={{ marginBottom: theme.sizes.small }}>
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: 15,
                      marginBottom: theme.sizes.base,
                    }}
                  >
                    Kĩ năng
                  </Text>

                  <Controller
                    name={`members.${index}.skillAssessment`}
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        placeholder="Bắt buộc"
                        style={{
                          borderWidth: 0.5,
                          borderColor: errors?.members?.[index]?.skillAssessment
                            ? theme.colors.error
                            : "rga(22,24,35)",
                          paddingVertical: theme.sizes.font,
                          paddingHorizontal: theme.sizes.small,
                          borderRadius: theme.sizes.base / 2,
                        }}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </View>

                <View style={{ zIndex: 1, marginTop: theme.sizes.base }}>
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: 15,
                      marginBottom: theme.sizes.base,
                    }}
                  >
                    Độ thành thạo
                  </Text>

                  <Controller
                    name={`members.${index}.behaviourAssessment`}
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        placeholder="Bắt buộc"
                        style={{
                          borderWidth: 0.5,
                          borderColor: errors?.members?.[index]
                            ?.behaviourAssessment
                            ? theme.colors.error
                            : "rga(22,24,35)",
                          paddingVertical: theme.sizes.font,
                          paddingHorizontal: theme.sizes.small,
                          borderRadius: theme.sizes.base / 2,
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <View style={{ marginTop: theme.sizes.base }}>
                    <Text
                      style={{
                        color: "rgba(22,24,35,0.64)",
                        marginBottom: theme.sizes.base / 2,
                        fontSize: theme.sizes.small + 3,
                        fontStyle: "italic",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.error,
                        }}
                      >
                        *
                      </Text>
                      Giá trị từ 1 - 10
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
            onPress={() =>
              append({
                name: "",
                dob: "",
                typeName: "",
                verifyId: "",
                skillAssessment: "",
              })
            }
          >
            <AntDesign name="plus" size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      <View
        style={{
          padding: theme.sizes.font,
          paddingBottom: bottom + 14,
          backgroundColor: "white",
          borderTopColor: "rgba(22,24,35,0.06)",
          borderTopWidth: 1,
          zIndex: 10,
        }}
      >
        <CustomButton
          variant="primary"
          onPress={handleSubmit((data) =>
            setIsOpen({ data: data, isShow: true })
          )}
        >
          Ứng tuyển
        </CustomButton>
      </View>
    </>
  );
};

export default ApplyGroupScreen;
