import { useContext } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import InputField from "~/components/Form-field/InputField";

import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { useForm } from "react-hook-form";

import AuthContext from "~/context/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ROUTE } from "~/constants";
import { useEffect } from "react";

const SignupSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .min(10, "Số điện thoại phải có 10 số")
    .max(10, "Số điện thoại phải có 10 số")
    .matches(/^[0-9]+$/, "Số điện thoại phải là số")
    .required("Hãy nhập nhập số điện thoại"),
  password: Yup.string()
    .min(8, "Mật khẩu tối thiểu là 8 kí tự")
    .max(12, "Mật khẩu tối đa là 12 kí tự")
    .matches(/^[a-zA-Z0-9_!@#$%&*]*$/, "Mật khẩu không được có khoảng trắng")
    .required("Hãy nhập mật khẩu!"),
});

const MOCK_DATA = {
  initialValues: {
    phoneNumber: "",
    password: "",
  },
};

const LoginForm = ({ to, ...rest }) => {
  const { initialValues } = MOCK_DATA;
  const { login, errMessage, userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
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
  useEffect(() => {
    if (userInfo) {
      navigation.navigate(to, { ...rest });
    }
  }, [userInfo]);
  const onSubmit = async (data) => {
    await login(data.phoneNumber, data.password, ROUTE.login);
  };
  return (
    <View>
      <InputField
        name="phoneNumber"
        control={control}
        errors={errors}
        label="Số điện thoại"
        keyboardType="phone-pad"
        isOutline
      />

      <InputField
        name="password"
        control={control}
        errors={errors}
        label="Mật khẩu"
        mode="password"
        isOutline
      />
      <TouchableOpacity onPress={() => navigation.navigate(ROUTE.forgotPwd)}>
        <Text
          style={{
            color: theme.colors.highlight,
            textAlign: "left",
            marginBottom: 10,
          }}
        >
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>

      {errMessage.msg != "" && (
        <Text
          style={{
            color: theme.colors.error,
            alignSelf: "center",
            marginVertical: 10,
          }}
        >
          {errMessage?.msg}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        style={{
          backgroundColor: isValid
            ? theme.colors.primary400
            : theme.colors.grey50,
          padding: 10,
          borderRadius: 15,
          justifyContent: "center",
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
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
          Đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;
