import { createContext, useState } from "react";

export const ChatContext = createContext({
  channel: null,
  setChannel: (channel) => {},
  thread: null,
  setThread: (thread) => {},
});

export const ChatProvider = ({ children }) => {
  const [channel, setChannel] = useState();
  const [thread, setThread] = useState();
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        channel,
        setChannel,
        thread,
        setThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
