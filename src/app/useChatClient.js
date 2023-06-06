// useChatClient.js
import { useContext, useEffect } from "react";
import AuthContext from "~/context/AuthContext";
import { chatClient } from "./chatConfig";

export const ConnectChatClient = () => {
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const setupClient = async () => {
      const chatUserId = userInfo?.id;
      const chatUserName = userInfo?.firstName + " " + userInfo?.lastName;

      const user = {
        id: chatUserId,
        name: chatUserName,
      };
      try {
        chatClient.connectUser(user, chatClient.devToken(chatUserId));

        // connectUser is an async function. So you can choose to await for it or not depending on your use case (e.g. to show custom loading indicator)
        // But in case you need the chat to load from offline storage first then you should render chat components
        // immediately after calling `connectUser()`.
        // BUT ITS NECESSARY TO CALL connectUser FIRST IN ANY CASE.
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `An error occurred while connecting the user: ${error.message}`
          );
        }
      }
    };

    // If the chat client has a value in the field `userID`, a user is already connected
    // and we can skip trying to connect the user again.
    if (!chatClient.userID && userInfo) {
      setupClient();
    }
  }, [userInfo]);

  return null;
};
