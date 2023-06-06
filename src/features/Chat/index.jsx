import { useLayoutEffect } from "react";
import { useContext, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { ChannelList, ChannelPreviewMessenger } from "stream-chat-expo";
import { StatusBarComp } from "~/components";
import { ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ChatContext } from "~/context/ChatContext";
import GuestContext from "~/context/GuestContext";

const CustomListItem = (props) => {
  const { setUnreadCount } = useContext(ChatContext);

  const { unread } = props;

  return (
    <Pressable
      onPress={() => {
        if (unread != 0) {
          setUnreadCount((prev) => prev - 1);
        }
      }}
    >
      <View style={{ zIndex: 100 }}>
        <ChannelPreviewMessenger {...props} />
      </View>
    </Pressable>
  );
};

const ChatScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const { setChannel } = useContext(ChatContext);
  const { verifyAccount } = useContext(GuestContext);

  const chatUserId = userInfo?.id;

  const filters = {
    members: {
      $in: [chatUserId],
    },
  };

  const sort = {
    last_message_at: -1,
  };
  const options = {
    state: true,
    watch: true,
  };
  useLayoutEffect(() => {
    verifyAccount(ROUTE.uploaded);
  }, []);

  return (
    <>
      {userInfo && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primary400,
              shadowColor: "#000000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.5,
              height: 100,
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                color: "#fff",
                alignSelf: "center",
                fontWeight: "semi-bold",
                marginTop: 30,
              }}
            >
              Chat
            </Text>
          </View>
          <ChannelList
            Preview={CustomListItem}
            filters={filters}
            sort={sort}
            options={options}
            onSelect={(channel) => {
              setChannel(channel);
              navigation.navigate(ROUTE.channel);
            }}
          />
        </>
      )}
    </>
  );
};

export default ChatScreen;
