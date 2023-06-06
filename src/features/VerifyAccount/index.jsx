import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Yup from "yup";

import firebase from "~/app/firebase";
import { Loading } from "~/components";
import { InputField } from "~/components/Form-field";
import { NO_IMAGE_URL } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { IdentificationServices } from "~/services";
import ActionsDialog from "./ActionsDialog";

const { width } = Dimensions.get("screen");
const storage = firebase.getStorage();

const SignupSchema = Yup.object().shape({
  businessLicense: Yup.string()
    .url("Nhập đúng đường dẫn")
    .required("Nhập giấy phép kinh doanh"),
});

const VerifyAccountScreen = ({ navigation }) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const [imagePermission, requestPermission] = useMediaLibraryPermissions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      businessLicense: "",
    },
    resolver: yupResolver(SignupSchema),
  });
  const businessLicense = watch("businessLicense");

  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isShowImage = useMemo(
    () => businessLicense?.includes("https://firebasestorage.googleapis.com"),
    [businessLicense]
  );

  const verifyPermissions = async () => {
    if (imagePermission.status === PermissionStatus.UNDETERMINED) {
      const response = await requestPermission();
      return response.granted;
    }

    if (imagePermission.status === PermissionStatus.DENIED) {
      return false;
    }

    return true;
  };

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(
      storage,
      `VerifyData/${userInfo?.id}/businessLicense`
    );
    const snapshot = await uploadBytes(storageRef, blob);

    return await getDownloadURL(snapshot.ref);
  };

  const handlePickImage = async () => {
    try {
      if (!verifyPermissions()) return;

      const { assets } = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 0.2,
      });

      setIsLoading(true);
      setShowDialog(false);
      if (Array.isArray(assets)) {
        const url = await uploadImageAsync(assets[0].uri);
        setValue("businessLicense", url);
      }
    } catch (error) {
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const isSuccess = await IdentificationServices.verifyData({
      ...data,
    });

    if (isSuccess) {
      setUserInfo((prev) => ({ ...prev, status: 12 }));
    }

    setIsSuccess(isSuccess);
  };

  return (
    <>
      {isLoading && <Loading isModal />}
      <StatusBar style="dark" />

      <ActionsDialog visible={showDialog} onClose={() => setShowDialog(false)}>
        <>
          <Pressable
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
            onPress={handlePickImage}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
              Chọn ảnh khác
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              { padding: 14 },
            ]}
            onPress={() => {
              setValue("businessLicense", "");
              setShowDialog(false);
              const desertRef = ref(
                storage,
                `VerifyData/${userInfo?.id}/businessLicense`
              );
              deleteObject(desertRef).catch((error) => {
                console.log({ error });
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
              Nhập đường dẫn
            </Text>
          </Pressable>
        </>
      </ActionsDialog>

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderBottomColor: "rgba(22,24,35,0.06)",
            borderBottomWidth: 1,
            paddingBottom: theme.sizes.small,
            paddingTop: theme.sizes.small,
            paddingHorizontal: theme.sizes.extraLarge,
            backgroundColor: "white",
          }}
        >
          <AntDesign
            name="close"
            size={theme.sizes.large + 2}
            color="rgb(22,24,35)"
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              top: "50%",
              left: theme.sizes.extraLarge,
            }}
          />

          <Text
            style={{
              fontWeight: "600",
              fontSize: theme.sizes.large,
              textTransform: "capitalize",
            }}
          >
            Xác thực thông tin
          </Text>
        </View>

        <View
          style={{
            paddingVertical: theme.sizes.font,
            paddingHorizontal: theme.sizes.medium,
          }}
        >
          {isSuccess ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: theme.sizes.extraLarge,
                maxWidth: "80%",
                alignSelf: "center",
              }}
            >
              {/* image */}
              <View>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 100,
                    backgroundColor: "rgba(22,24,35,0.04)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: "https://static.vecteezy.com/system/resources/previews/020/350/808/non_2x/id-card-icon-vector.jpg",
                    }}
                    style={{ width: "67%", height: "60%" }}
                    resizeMode="contain"
                  />
                </View>

                <Ionicons
                  name="ios-shield-checkmark"
                  size={22}
                  color="#18DD9C"
                  style={{ position: "absolute", top: 0, right: 0 }}
                />
              </View>

              <Text
                style={{
                  textAlign: "center",
                  fontSize: theme.sizes.medium - 1,
                  color: "rgba(22,24,35,0.64)",
                  fontWeight: "500",
                  marginTop: theme.sizes.font,
                }}
              >
                Yêu cầu xác thực của bạn đã được gửi thành công
              </Text>
            </View>
          ) : (
            <View>
              {isShowImage ? (
                <View>
                  <Text
                    style={{
                      marginBottom: theme.sizes.base - 2,
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    Giấy phép kinh doanh
                  </Text>
                  <View style={{ alignSelf: "flex-start" }}>
                    <View
                      style={{
                        borderColor: "rgba(22,24,35,0.06)",
                        borderWidth: 1,
                        borderRadius: theme.sizes.base / 2,
                      }}
                    >
                      <Image
                        source={{ uri: businessLicense || NO_IMAGE_URL }}
                        style={{ width: 150, height: 150 }}
                      />
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        {
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(22,24,35,0.2)",
                          borderRadius: 100,
                          padding: 4,
                        },
                        pressed && {
                          opacity: 0.55,
                        },
                      ]}
                      onPress={() => setShowDialog(true)}
                    >
                      <Feather name="edit-3" size={14} color="white" />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <InputField
                  name="businessLicense"
                  control={control}
                  errors={errors}
                  label="Giấy phép kinh doanh"
                  placeholder="Nhập đường dẫn"
                  isOutline
                  buttonTitle="Hình ảnh"
                  inputConfig={{
                    clearButtonMode: "never",
                  }}
                  onButtonPress={handlePickImage}
                  buttonTextStyle={{ color: theme.colors.primary400 }}
                />
              )}
            </View>
          )}
        </View>

        {/* actions */}
        {!isSuccess && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              borderTopColor: "rgba(22,24,35,0.12)",
              borderTopWidth: 1,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "white",
              width: width,
              padding: theme.sizes.medium,
              paddingHorizontal: theme.sizes.large,
              paddingBottom: bottom === 0 ? theme.sizes.medium : bottom,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.75,
                },
                { width: "100%" },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              <View
                style={{
                  backgroundColor: theme.colors.highlight,
                  padding: theme.sizes.font - 1,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: theme.sizes.base - 2,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.large,
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  Xác thực
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default VerifyAccountScreen;
