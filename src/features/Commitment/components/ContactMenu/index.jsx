import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useRef, useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { Menu, useTheme } from "react-native-paper";
import { ROUTE } from "~/constants";

const ContactMenu = ({ item, handleCreateCommitment, videoUrl }) => {
  const [visible, setVisible] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [status, setStatus] = useState({});

  const navigation = useNavigation();
  const theme = useTheme();
  const { height, width } = Dimensions.get("window");
  const video = useRef(null);

  return (
    <View style={{ flex: 1, marginTop: 10, zIndex: 9000 }}>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            style={{
              zIndex: 10000,
            }}
            onPress={() => setVisible(true)}
          >
            <Text style={{ color: "blue" }}>Liên hệ</Text>
          </TouchableOpacity>
        }
        onDismiss={() => setVisible(false)}
      >
        <Menu.Item
          onPress={() => {
            setVisible(false);
            navigation.navigate(ROUTE.profile, {
              id: item.userID,
              builderId: item.builderID,
            });
          }}
          leadingIcon={({ size, color }) => (
            <Ionicons name="ios-person-outline" size={size - 3} color={color} />
          )}
          titleStyle={{
            fontSize: theme.sizes.font,
          }}
          title="Trang cá nhân"
        />

        <Menu.Item
          onPress={() => {
            setVisible(false);
            handleCreateCommitment(item.builderID);
          }}
          title="Tạo cam kết"
          leadingIcon={({ size, color }) => (
            <Ionicons name="documents-outline" size={size} color={color} />
          )}
          titleStyle={{
            fontSize: theme.sizes.font,
          }}
        />
        {videoUrl && (
          <Menu.Item
            onPress={() => {
              setVisible(false);
              setVideoModal(true);
            }}
            title="Xem video"
            leadingIcon={({ size, color }) => (
              <MaterialCommunityIcons
                name="file-video"
                size={size}
                color={color}
              />
            )}
            titleStyle={{
              fontSize: theme.sizes.font,
            }}
          />
        )}
      </Menu>
      {videoUrl && (
        <Modal visible={videoModal} animationType="slide" transparent={false}>
          <Video
            ref={video}
            source={{
              uri: videoUrl,
            }}
            style={{
              alignSelf: "center",
              height: height / 1.2,
              width: width,
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
          <TouchableOpacity
            style={{ marginTop: height/40, alignSelf: "center" }}
            onPress={() => setVideoModal(false)}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={90}
              color={theme.colors.primary400}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default ContactMenu;
