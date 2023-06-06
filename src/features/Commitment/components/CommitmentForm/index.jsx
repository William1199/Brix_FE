import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import InputField from "~/components/Form-field/InputField";

import MaskInput, { createNumberMask } from "react-native-mask-input";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { ConfirmDialog } from "~/components";
import { API_RESPONSE_CODE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import CommitmentInfo from "~/features/Commitment/components/CommitmentInfo";
import { formatStringToCurrency } from "~/utils/helper";

const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});

const MOCK_DATA = {
  initialValues: {
    optionalTerm: "",
  },
  id: 1,
  projectName: "Vinhomes Grand Park",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  startDate: "01/02/2023",
  endDate: "01/06/2023",
  salaryRange: "15+",
  partyA: {
    firstName: "Huỳnh",
    lastName: "Anh Khoa",
    phoneNumber: "0868644651",
    verifyId: "083201000037",
    companyName: "Vinhomes",
  },
  partyB: {
    firstName: "Phạm",
    lastName: "Thanh Trúc",
    phoneNumber: "0854770807",
    verifyId: "094382888857",
    builderType: "Thợ sơn nước",
  },
  group: [
    {
      name: "Nguyễn Văn A",
      dob: "01/01/2002",
      type: "Thợ phụ",
      verifyId: "047382986512",
    },
    {
      name: "Nguyễn Thị B",
      dob: "02/02/2003",
      type: "Thợ phụ",
      verifyId: "057648367281",
    },
  ],
  _salary_default_value: {
    masked: "",
    unMasked: "",
  },
  _default_validate: {
    min: { valid: true, message: "" },
    max: { valid: true, message: "" },
  },
};

const CommitmentForm = ({
  postContent,
  partyA,
  partyB,
  salaryRange,
  group,
  navigation,
}) => {
  const { initialValues, _salary_default_value, _default_validate } = MOCK_DATA;
  const [confirm, setConfirm] = useState(false);
  const [term, setTerm] = useState(undefined);
  const { userInfo } = useContext(AuthContext);

  let min;
  let max;
  if (salaryRange.includes("+")) {
    min = Number(salaryRange.split("+")[1].replace(".", ""));
    max = min + 500000;
  } else {
    min = Number(salaryRange.split("-")[0].replace(".", ""));
    max = Number(salaryRange.split("-")[1].replace(".", ""));
  }

  const SignupSchema = Yup.object().shape({
    optionalTerm: Yup.string().max(100, "Điều khoản thêm tối đa 100 kí tự"),
  });
  const [optionalTermClick, setOptionalTermClick] = useState(false);

  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onBlur",
    defaultValues: initialValues,
    resolver: yupResolver(SignupSchema),
  });
  const [salary, setSalary] = useState(_salary_default_value);
  const [validate, setValidate] = useState(_default_validate);

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
  useMemo(() => handleValidate(), [salary]);

  const onSubmit = async (data) => {
    try {
      if (userInfo.premium) {
        const request = {
          optionalTerm: data.optionalTerm,
          postContractorID: postContent.id,
          builderID: postContent.builderId,
          salaries: salary.unMasked,
        };

        const res = await axiosInstance.post("commitment", request);
        if (+res.code === API_RESPONSE_CODE.success) {
          Toast.show({
            type: "success",
            text1: "Tạo cam kết thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
          navigation.navigate(ROUTE.postDetail, { id: postContent.id });
        } else {
          Toast.show({
            type: "error",
            text1: "Thợ này đã có cam kết với dự án khác trong thời gian này",
            position: "bottom",
            visibilityTime: 2500,
          });
          navigation.navigate(ROUTE.postDetail, { id: postContent.id });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Bạn phải kích hoạt tài khoản để tạo cam kết",
          position: "bottom",
          visibilityTime: 2500,
        });
      }
    } catch (e) {
      console.log(`Create Commitment error ${e}`);
    }
  };

  return (
    <SafeAreaView
      style={{
        paddingHorizontal: 25,
        paddingBottom: 14,
      }}
    >
      <View>
        <CommitmentInfo
          postContent={postContent}
          partyA={partyA}
          partyB={partyB}
          group={group}
        />

        {optionalTermClick ? (
          <>
            <Pressable
              style={({ pressed }) => [
                {
                  minHeight: 20,
                  minWidth: 50,
                  justifyContent: "center",
                },
                pressed && {
                  opacity: 0.25,
                },
              ]}
              onPress={() => setOptionalTermClick(!optionalTermClick)}
            >
              <Text
                style={{
                  color: "blue",
                  textDecorationLine: "underline",
                }}
              >
                Bỏ thêm điều khoản
              </Text>
            </Pressable>
            <View style={{ marginVertical: theme.sizes.base / 2 }}>
              <Text
                style={{
                  color: "rgb(22,24,35)",
                  fontWeight: "medium",
                  marginBottom: theme.sizes.small,
                  fontSize: theme.sizes.medium,
                  fontWeight: "bold",
                }}
              >
                Điều khoản thêm
              </Text>
            </View>
            <InputField
              name="optionalTerm"
              control={control}
              errors={errors}
              placeholder={"Điều khoản thêm"}
              showLabel={false}
              inputConfig={{ multiline: true }}
            />
          </>
        ) : (
          <Pressable
            style={({ pressed }) => [
              {
                minHeight: 20,
                minWidth: 50,
                justifyContent: "center",
              },
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={() => setOptionalTermClick(!optionalTermClick)}
          >
            <Text
              style={{
                color: "blue",
                textDecorationLine: "underline",
              }}
            >
              Thêm điều khoản (Khung giờ làm việc, thưởng, phạt)
            </Text>
          </Pressable>
        )}
        <Text
          style={{
            color: "rgb(22,24,35)",
            fontWeight: "medium",
            marginVertical: 10,
            marginBottom: 5,
            fontSize: theme.sizes.medium,
            fontWeight: "bold",
          }}
        >
          Nhập lương cứng từ {formatStringToCurrency(min.toString())} đến{" "}
          {formatStringToCurrency(max.toString())}
        </Text>

        <MaskInput
          mask={vndMask}
          style={{
            flex: 1,
            paddingBottom: theme.sizes.base / 2,
            color: "blue",
            borderBottomColor: "rgb(22,24,35)",
            borderBottomWidth: 1,
            marginBottom: theme.sizes.base / 2,
          }}
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
        {validate?.min?.valid === false && (
          <Text
            style={{
              marginTop: theme.sizes.base / 2,
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
              marginTop: theme.sizes.base / 2,
              marginBottom: theme.sizes.small,
              color: theme.colors.error,
              fontSize: theme.sizes.font - 2,
            }}
          >
            {validate?.max?.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={
            validate.min && validate.max ? () => setConfirm(true) : () => {}
          }
          disabled={!isValid}
          style={{
            backgroundColor:
              isValid && validate.min && validate.max
                ? theme.colors.primary400
                : theme.colors.grey50,
            padding: 10,
            borderRadius: 15,
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Tạo cam kết
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={confirm}
        confirmText="Xác nhận"
        onClose={() => setConfirm(false)}
        onConfirm={handleSubmit(onSubmit)}
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
            Bạn có chắc chắn muốn tạo cam kết?
          </Text>
        </View>
      </ConfirmDialog>
    </SafeAreaView>
  );
};

export default CommitmentForm;
