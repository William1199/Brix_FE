import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import axiosInstance from "~/app/api";

// import { auth } from "~/app/firebase";

import { API_RESPONSE_CODE, ROUTE } from "~/constants";

import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import firebase from "~/app/firebase";
import { InputField } from "~/components/Form-field";

const firebaseConfig = {
  apiKey: "AIzaSyAelyrP0GomMDVfXyX-2lBq0yiWL1Z4HLk",
  authDomain: "capstone-project-e5c70.firebaseapp.com",
  projectId: "capstone-project-e5c70",
  storageBucket: "capstone-project-e5c70.appspot.com",
  messagingSenderId: "533432664281",
  appId: "1:533432664281:web:628ae970b9c3ee946a7ec8",
};

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
  confirmPassword: Yup.string()
    .min(8, "Mật khẩu tối thiểu là 8 kí tự")
    .max(12, "Mật khẩu tối đa là 12 kí tự")
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Hãy nhập xác nhận mật khẩu"),
  otp: Yup.string()
    .min(6, "Mã OTP phải có 6 chữ số")
    .max(6, "Mã OTP phải có 6 chữ số")
    .required("Hãy nhập mã OTP"),
});

const MOCK_DATA = {
  FORM_ENUM: {
    verifired: "verifired",
    info: "info",
  },
  initialValues: {
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    otp: "",
  },
};

const RegisterForm = () => {
  const { FORM_ENUM, initialValues } = MOCK_DATA;
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onBlur",
    defaultValues: initialValues,
    resolver: yupResolver(SignupSchema),
  });

  const watchPhoneNumber = watch("phoneNumber");
  const watchCode = watch("otp");

  const [form, setForm] = useState(FORM_ENUM.verifired);
  //when confirm otp code success -> setVerifiedPhone(true)

  // If null, no SMS has been sent
  const [verificationId, setVerificationId] = useState(null);

  const recaptchaVerifier = useRef(null);

  const theme = useTheme();

  // Handle the button press
  const handleVerifyPhoneNumber = async () => {
    let phoneNumber;
    phoneNumber = watchPhoneNumber;
    while (phoneNumber.charAt(0) === "0") {
      phoneNumber = phoneNumber.substring(1);
      phoneNumber = "+84 " + phoneNumber;
    }
    try {
      const phoneProvider = new PhoneAuthProvider(firebase.getAuth());
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );

      setVerificationId(verificationId);
    } catch (err) {
      console.log(err);
    }
  };

  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        watchCode
      );
      await signInWithCredential(firebase.getAuth(), credential);
      setForm(FORM_ENUM.info);
    } catch (err) {
      console.log(err);
    }
  };

  const renderForm = () => {
    switch (form) {
      case FORM_ENUM.verifired:
        return (
          <>
            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={firebaseConfig}
            />
            <InputField
              name="phoneNumber"
              control={control}
              errors={errors}
              label="Số điện thoại"
              keyboardType="phone-pad"
              isOutline
              buttonTitle={
                watchPhoneNumber.length == 10 && !isNaN(watchPhoneNumber)
                  ? "Gửi OTP"
                  : ""
              }
              onButtonPress={handleVerifyPhoneNumber}
            />

            {verificationId && (
              <InputField
                name="otp"
                control={control}
                errors={errors}
                label="Nhập mã OTP đã gửi"
                keyboardType="number-pad"
                isOutline
                buttonTitle={
                  watchCode.length == 6 && !isNaN(watchCode) ? "Xác nhận" : ""
                }
                onButtonPress={confirmCode}
              />
            )}
          </>
        );
      default:
        return (
          <>
            <InputField
              name="password"
              control={control}
              errors={errors}
              label="Mật khẩu mới"
              mode="password"
            />

            <InputField
              name="confirmPassword"
              control={control}
              errors={errors}
              label="Xác nhận mật khẩu"
              mode="password"
            />

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
                zIndex: -1,
                shadowColor: "#000000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.5,
                marginTop: 14,
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
                Xác nhận
              </Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  const onSubmit = async (values) => {
    try {
      const request = {
        phoneNumber: values.phoneNumber,
        newPassword: values.password,
      };

      const res = await axiosInstance.post("users/resetPassword", request);

      if (+res.code === API_RESPONSE_CODE.success) {
        Toast.show({
          type: "success",
          text1: "Mật khẩu mới đã được cập nhật",
          position: "bottom",
          visibilityTime: 2500,
        });
        navigation.navigate(ROUTE.login);
      }
    } catch (e) {
      console.log(`Register error ${e}`);
    }
  };
  return <View style={{ justifyContent: "center" }}>{renderForm()}</View>;
};

export default RegisterForm;
