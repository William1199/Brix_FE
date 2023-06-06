import { useState, useContext } from "react";
import { useTheme } from "react-native-paper";

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthContext from "~/context/AuthContext";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { DropdownField } from "~/components/Form-field";
import { Carousel } from "~/components";

const SignupSchema = Yup.object().shape({
  roleId: Yup.string().required("Hãy nhập chọn loại tài khoản"),
});

const listData = [
  { label: "Nhà thầu", value: "20efd516-f16c-41b3-b11d-bc908cd2056b" },
  { label: "Công nhân", value: "dc48ba58-ddcb-41de-96fe-e41327e5f313" },
  { label: "Cửa hàng", value: "a4fbc29e-9749-4ea0-bcaa-67fc9f104bd1" },
];

const carousel = [
  {
    id: 1,
    imageUri:
      "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Hình ảnh công trình Vinhomes Grand Park được đội ngũ công nhân BillDer hoàn thiện sau khi được liên kết qua app",
  },
  {
    id: 2,
    imageUri:
      "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Photographer, Support via PayPal, Latvia",
  },
  {
    id: 3,
    imageUri:
      "https://images.unsplash.com/photo-1664574652984-5b5f769bef07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Follow us @Surface – Laptops designed by Microsoft",
  },
  {
    id: 4,
    imageUri:
      "https://images.unsplash.com/photo-1669837127740-8234df727cb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    title: " ",
    desc: "Photographer, Support via PayPal, Latvia",
  },
];

const ChooseRoleScreen = () => {
  const { setRole, googleMail } = useContext(AuthContext);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onBlur",
    defaultValues: { roleId: "" },
    resolver: yupResolver(SignupSchema),
  });

  const onSubmit = async (values) => {
    try {
      setRole(googleMail, values.roleId);
    } catch (e) {
      console.log(`Choose Role error ${e}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <Carousel
        data={carousel}
        style={{
          padding: theme.sizes.medium,
          paddingBottom: theme.sizes.base - 2,
        }}
      ></Carousel>
      <View style={{ padding: 25, marginTop:30 }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "500",
              color: theme.colors.primary400,
              marginBottom: 30,
            }}
          >
            Chọn loại tài khoản
          </Text>
        </View>
        <DropdownField
          name="roleId"
          control={control}
          errors={errors}
          label="Chọn loại tài khoản"
          listData={listData}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          style={{
            backgroundColor: isValid
              ? theme.colors.primary300
              : theme.colors.grey50,
            padding: 10,
            borderRadius: 15,
            justifyContent: "center",
            zIndex: -1,
            marginTop:20
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
      </View>
    </SafeAreaView>
  );
};

export default ChooseRoleScreen;
