import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import S3 from "aws-sdk/clients/s3";
import { Buffer } from "buffer";
import AuthContext from "~/context/AuthContext";
const { height, width } = Dimensions.get("window");
global.Buffer = global.Buffer || require("buffer").Buffer;

const VideoModal = ({ visible, onClose, callback, postId }) => {
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();

  const { bottom } = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const video = useRef(null);
  const [status, setStatus] = useState({});

  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileSizeCheck, setFileSizeCheck] = useState(false);

  const uploadToS3 = async (localUri, fileName, contentType) => {
    try {
      setLoading(true);
      const s3 = new S3({
        accessKeyId: "AKIAXBPHHEJ344324J5J",
        secretAccessKey: "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",
        region: "ap-southeast-1",
      });
      const fileContent = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const params = {
        Bucket: "amplify-capstoneproject-dev-105738-deployment",
        Key: fileName,
        ContentType: contentType,
        ACL: "public-read",
      };

      const data = await s3
        .upload({ Body: Buffer.from(fileContent, "base64"), ...params })
        .promise();

      setLoading(false);

      return data.Location;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const pickVideo = async () => {
    setLoading(true);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      selectionLimit: 1,
      quality: 0.2,
      base64: true,
    });
    setLoading(false);
    if (!result.canceled) {
      const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
      if (Number(fileInfo.size) < 70000000) {
        setFileSizeCheck(false);
        setVideoUri(result.assets[0].uri);
      } else {
        setFileSizeCheck(true);
      }
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 1,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 200,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 0,
        tension: 100,
        friction: 30,
        delay: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const uploadVideo = async () => {
    const fileName = `${userInfo?.id}-${postId}.mov`;
    const contentType = "video/mov";
    const videoUrl = await uploadToS3(videoUri, fileName, contentType);
    callback(videoUrl);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.27)",
            zIndex: -1,
          }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: "white",
            transform: [{ translateY: translateY }],
            opacity: opacity,
            borderTopLeftRadius: theme.sizes.base / 2,
            borderTopRightRadius: theme.sizes.base / 2,
          }}
        >
          {loading && (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.67)",
                padding: theme.sizes.small,
                position: "absolute",
                top: theme.sizes.extraLarge,
                left: "50%",
                transform: [{ translateX: -18 }],
              }}
            >
              <ActivityIndicator size={24} color="white" />
            </View>
          )}

          <View
            style={{
              width: 25,
              height: 25,
              position: "absolute",
              right: theme.sizes.font,
              top: theme.sizes.small,
              zIndex: 1,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.06)",
                },
                { flex: 1 },
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="black" />
            </Pressable>
          </View>

          <View
            style={{
              paddingTop: theme.sizes.font,
              borderBottomColor: "rgba(22,24,35,0.12)",
              borderBottomWidth: 1,
              marginHorizontal: theme.sizes.small,
              paddingBottom: bottom === 0 ? theme.sizes.small : bottom,
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                fontSize: 18,
                marginBottom: fileSizeCheck ? 10 : 30,
                marginTop: 30,
                fontStyle: "italic",
              }}
            >
              {
                "Cung cấp một đoạn video ngắn mô tả kỹ năng bạn muốn ứng tuyển (tối ưu 30s) "
              }
            </Text>
            {fileSizeCheck && (
              <Text
                style={{
                  fontWeight: "bold",
                  color: "red",
                  alignSelf: "center",
                  fontSize: 12,
                  marginBottom: 30,
                }}
              >
                {"Dung lượng video quá lớn (quá 70MB)"}
              </Text>
            )}

            {videoUri && !fileSizeCheck && (
              <Video
                ref={video}
                source={{
                  uri: videoUri,
                }}
                style={{
                  alignSelf: "center",
                  height: height / 4,
                  width: width / 1.2,
                  marginBottom: 30,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  pickVideo();
                }}
              >
                <MaterialCommunityIcons name="file-video" size={50} />
              </Pressable>
              {videoUri && !fileSizeCheck && (
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      backgroundColor: "rgba(22,24,35,0.06)",
                    },
                    {
                      backgroundColor: "white",
                      borderColor: theme.colors.highlight,
                      borderRadius: 20,
                      borderWidth: 2.5,
                      padding: 10,
                      shadowColor: "rgba(22,24,35,0.32)",
                      shadowOffset: {
                        width: 0,
                        height: 1.5,
                      },
                      shadowOpacity: 1,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => uploadVideo()}
                >
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    Tiếp tục
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default VideoModal;
