import { AntDesign, Ionicons } from "@expo/vector-icons";
import { PermissionStatus, useCameraPermissions } from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import firebase from "~/app/firebase";

import IMAGE_1 from "~/assets/images/image_1.jpg";
import IMAGE_2 from "~/assets/images/image_2.jpg";
import { CustomCamera } from "~/components";
import { CAMERA_SHAPE, PROFILE_FORM, ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import ErrModal from "../../CMNDVerify/ErrModal";
import Loading from "../Loading";

const { width } = Dimensions.get("screen");
const storage = firebase.getStorage();

const MOCK_DATA = {
  STEP_CONTENT: [
    {
      step: 0,
      title: "Chụp mặt trước",
      desc: "Hãy đặt chứng từ trên mặt phẳng và đảm bảo hình chụp không bị mờ, tối hoặc chói sáng",
      imageName: "frontID",
    },
    {
      step: 1,
      title: "Chụp mặt sau",
      desc: "Hãy đặt chứng từ trên mặt phẳng và đảm bảo hình chụp không bị mờ, tối hoặc chói sáng",
      imageName: "backID",
    },
    {
      step: 2,
      title: "Chụp gương mặt",
      desc: "Đảm bảo hình chụp không bị mờ, tối hoặc chói sáng",
      imageName: "faceImage",
    },
  ],
};

const CMNDVerify = ({ onClose, visible, onSubmit }) => {
  const { STEP_CONTENT } = MOCK_DATA;
  const theme = useTheme();
  const { bottom, top } = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);
  const [cameraPermission, requestPermission] = useCameraPermissions();

  const [cameraContent, setCameraContent] = useState(STEP_CONTENT[0]);
  const [showCamera, setShowCamera] = useState(false);
  const [verifyData, setVerifyData] = useState({
    frontID: "",
    backID: "",
    faceImage: "",
  });
  const [faceDetectedLength, setFaceDetectedLength] = useState(0);
  const [showErr, setShowErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const shape = useMemo(
    () =>
      cameraContent.step === STEP_CONTENT.length - 1
        ? CAMERA_SHAPE.circle
        : CAMERA_SHAPE.rectangle,
    [cameraContent]
  );

  const isTotalSubmit = useMemo(
    () => verifyData.frontID && verifyData.backID && verifyData.faceImage,
    [verifyData]
  );

  const verifyPermissions = async () => {
    if (cameraPermission.status === PermissionStatus.UNDETERMINED) {
      const response = await requestPermission();
      return response.granted;
    }

    if (cameraPermission.status === PermissionStatus.DENIED) {
      return false;
    }

    return true;
  };

  const handleSubmitImage = async (res) => {
    try {
      if (faceDetectedLength === 0 && cameraContent.step !== 1) {
        setShowErr(true);
        return;
      }

      setIsLoading(true);
      setShowCamera(false);
      const url = await uploadImageAsync(res.uri);
      setVerifyData((prev) => ({ ...prev, [cameraContent.imageName]: url }));
      if (cameraContent.step < STEP_CONTENT.length - 1) {
        setCameraContent((prev) => STEP_CONTENT[prev.step + 1]);
        setShowCamera(true);
      }
    } catch (error) {
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(
      storage,
      `VerifyData/${userInfo?.id}/${cameraContent.imageName}`
    );
    const snapshot = await uploadBytes(storageRef, blob);

    return await getDownloadURL(snapshot.ref);
  };

  const fetchData = async () => {};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Modal
      animationType={
        userInfo?.role?.toLowerCase() === ROLE.builder ? "none" : "slide"
      }
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onClose}
    >
      {showCamera && (
        <CustomCamera
          onClose={() => {
            setShowCamera(false);
            setCameraContent(STEP_CONTENT[0]);
          }}
          onSubmit={handleSubmitImage}
          onFacesDetected={({ faces }) => {
            setFaceDetectedLength(faces.length);
          }}
          shape={shape}
          {...cameraContent}
        />
      )}

      {showCamera && showErr && <ErrModal onClose={() => setShowErr(false)} />}

      {isLoading && <Loading content="Đang xác thực thông tin" />}

      <StatusBar style="dark" />

      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          paddingTop: top + theme.sizes.small,
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
            paddingHorizontal: theme.sizes.extraLarge,
            backgroundColor: "white",
          }}
        >
          <AntDesign
            name={
              userInfo?.role?.toLowerCase() === ROLE.builder ? "left" : "close"
            }
            size={theme.sizes.large + 2}
            color="rgb(22,24,35)"
            onPress={onClose}
            style={{
              position: "absolute",
              top: 0,
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

        {/* title */}
        <View
          style={{
            paddingTop: theme.sizes.extraLarge * 1.5,
            paddingHorizontal: theme.sizes.extraLarge,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
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
                color={"#E42773"}
                style={{ position: "absolute", top: 0, right: 0 }}
              />
            </View>

            <Text
              style={{
                fontSize: theme.sizes.extraLarge - 2,
                fontWeight: "bold",
                letterSpacing: 0.5,
                marginTop: theme.sizes.medium,
              }}
            >
              Chụp giấy tờ tùy thân
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: theme.sizes.small + 3,
                color: "rgba(22,24,35,0.44)",
                fontWeight: "500",
                marginTop: theme.sizes.base,
              }}
            >
              Thông tin của bạn chỉ được dùng cho mục đích xác thực tài khoản và
              hoàn toàn được bảo mật.
            </Text>
          </View>

          <View style={{ marginTop: theme.sizes.extraLarge }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.large,
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 70,
                  backgroundColor: "rgba(22,24,35,0.02)",
                  padding: theme.sizes.small,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: theme.sizes.small,
                }}
              >
                <Image
                  source={IMAGE_1}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.64)",
                    fontWeight: "600",
                    marginLeft: theme.sizes.font,
                  }}
                >
                  Giấy CMND/CCCD bản gốc và còn hiệu lực
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.large,
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 70,
                  backgroundColor: "rgba(22,24,35,0.02)",
                  padding: theme.sizes.small,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: theme.sizes.small,
                }}
              >
                <Image
                  source={IMAGE_1}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />

                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 11,
                    height: 11,
                    borderColor: theme.colors.primary300,
                    borderTopWidth: 4,
                    borderLeftWidth: 4,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 11,
                    height: 11,
                    borderColor: theme.colors.primary300,
                    borderTopWidth: 4,
                    borderRightWidth: 4,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 11,
                    height: 11,
                    borderColor: theme.colors.primary300,
                    borderBottomWidth: 4,
                    borderLeftWidth: 4,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 11,
                    height: 11,
                    borderColor: theme.colors.primary300,
                    borderBottomWidth: 4,
                    borderRightWidth: 4,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.64)",
                    fontWeight: "600",
                    marginLeft: theme.sizes.font,
                  }}
                >
                  Giữ giấy tờ nằm thẳng trong khung hình
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.sizes.large,
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 70,
                  backgroundColor: "rgba(22,24,35,0.02)",
                  padding: theme.sizes.small,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: theme.sizes.small,
                }}
              >
                <Image
                  source={IMAGE_2}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(22,24,35,0.64)",
                    fontWeight: "600",
                    marginLeft: theme.sizes.font,
                  }}
                >
                  Tránh chụp tối, mờ, lóe sáng
                </Text>
              </View>
            </View>
          </View>
        </View>

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
            onPress={
              isTotalSubmit
                ? () => onSubmit(verifyData)
                : () => {
                    if (!verifyPermissions()) return;
                    setShowCamera(true);
                  }
            }
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
                {isTotalSubmit ? "Hoàn tất" : "Bắt đầu chụp"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default CMNDVerify;
