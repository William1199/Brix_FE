import { AntDesign, Feather } from "@expo/vector-icons";
import { Camera, CameraType, ImageType } from "expo-camera";
import {
  FaceDetectorClassifications,
  FaceDetectorLandmarks,
  FaceDetectorMode,
} from "expo-face-detector";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CAMERA_SHAPE } from "~/constants";
import Loading from "../Loading";
import CircleFocus from "./CircleFocus";
import RectangleFocus from "./RectangleFocus";

const { height } = Dimensions.get("window");
const maskRowHeight = Math.round((height - 200) / 20);

const CustomCamera = ({
  zoom = 0,
  title,
  desc,
  onClose,
  onSubmit,
  shape = CAMERA_SHAPE.rectangle,
  ...props
}) => {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const [onReady, setOnReady] = useState(false);

  const cameraRef = useRef();

  const renderFocusShape = () => {
    switch (shape) {
      case CAMERA_SHAPE.rectangle:
        return <RectangleFocus />;
      default:
        return <CircleFocus />;
    }
  };

  return (
    <>
      {!onReady && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 1001,
            backgroundColor: "white",
          }}
        >
          <Loading />
        </View>
      )}

      <StatusBar style={onReady ? "light" : "dark"} />

      <Camera
        ref={cameraRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          zIndex: 1000,
        }}
        type={
          shape === CAMERA_SHAPE.rectangle ? CameraType.back : CameraType.front
        }
        zoom={zoom}
        onCameraReady={() => {
          setOnReady(true);
        }}
        {...props}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {/* close */}
          <Pressable
            style={({ pressed }) => [
              {
                position: "absolute",
                top: top + theme.sizes.small,
                left: theme.sizes.large,
                zIndex: 3,
              },
              pressed && {
                opacity: 0.25,
              },
            ]}
            onPress={onClose}
          >
            <AntDesign name="left" size={24} color="white" />
          </Pressable>

          {/* focus shape */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              zIndex: 2,
            }}
          >
            {/* top */}
            <View
              style={{
                flex: maskRowHeight,
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.47)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: theme.sizes.extraLarge,
              }}
            >
              {title && (
                <Text
                  style={{
                    fontSize: theme.sizes.extraLarge - 2,
                    fontWeight: "bold",
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {title}
                </Text>
              )}
              {desc && (
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    marginTop: theme.sizes.large,
                    fontWeight: "500",
                  }}
                >
                  {desc}
                </Text>
              )}
            </View>

            {/* main */}
            {renderFocusShape()}

            {/* bottom */}
            <View
              style={{
                flex: maskRowHeight,
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.47)",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  backgroundColor: theme.colors.primary400,
                  borderColor: "white",
                  borderWidth: 1,
                  borderRadius: 100,
                  overflow: "hidden",
                  marginBottom: bottom + theme.sizes.extraLarge * 1.5,
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    },
                    pressed && {
                      backgroundColor: "rgba(22,24,35,0.12)",
                    },
                  ]}
                  onPress={async () => {
                    await cameraRef.current.takePictureAsync({
                      quality: 0.2,
                      exif: false,
                      onPictureSaved: (res) => {
                        onSubmit(res);
                      },
                    });
                  }}
                >
                  <Feather name="camera" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Camera>
    </>
  );
};

export default CustomCamera;
