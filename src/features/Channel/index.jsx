import { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Channel,
  MessageInput,
  MessageList,
  useMessageContext,
  useMessageInputContext,
} from "stream-chat-expo";
import { OpenURL, StatusBarComp } from "~/components";
import { ChatContext } from "~/context/ChatContext";

const CustomMessage = () => {
  const theme = useTheme();
  const { message, isMyMessage } = useMessageContext();
  var check = false;
  message.attachments?.map((item) => {
    if (item.type == "image") {
      check = true;
    }
  });
  return (
    <View
      style={{
        alignSelf: isMyMessage ? "flex-end" : "flex-start",
        backgroundColor: isMyMessage
          ? theme.colors.primary50
          : theme.colors.primary25,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        width: check == true ? "70%" : "auto",
      }}
    >
      <View style={{}}>
        {message.attachments?.map((item, index) => {
          if (item.type == "image") {
            return (
              <View key={index}>
                <Image
                  source={{ uri: item.image_url || item.asset_url }}
                  style={{ width: "100%", height: 200, marginBottom: 10 }}
                  resizeMode="cover"
                />
              </View>
            );
          }
          if (item.type == "file") {
            return (
              <View key={index}>
                <OpenURL url={item.asset_url}>
                  <Text>{item.title}</Text>
                </OpenURL>
              </View>
            );
          }
        })}
      </View>
      <Text style={{ fontSize: 16 }}>{message?.text}</Text>
    </View>
  );
};
const CustomSendButton = () => {
  const theme = useTheme();
  const { sendMessage } = useMessageInputContext();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.highlight,
        borderRadius: 8,
        width: 50,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={sendMessage}
    >
      <Text style={{ fontSize: theme.sizes.medium, color: "#fff" }}>Gửi</Text>
    </TouchableOpacity>
  );
};
const ChannelScreen = () => {
  const { channel } = useContext(ChatContext);

  return (
    <>
      <StatusBarComp backgroundColor="white" statusConfig={{ style: "dark" }} />

      <SafeAreaView style={{ flex: 1 }}>
        <Channel
          giphyEnabled={false}
          SendButton={CustomSendButton}
          channel={channel}
          MessageSimple={CustomMessage}
        >
          <MessageList />
          <MessageInput giphyActive={false} />
        </Channel>
      </SafeAreaView>
    </>
  );
};

export default ChannelScreen;
