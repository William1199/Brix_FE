import { HubConnectionBuilder } from "@microsoft/signalr";
import _ from "lodash";
import moment from "moment";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import Toast from "react-native-toast-message";
import { ASYNC_STORAGE_KEY, BASE_URL, ROLE } from "~/constants";
import { NotificationServices } from "~/services";
import { setAsyncStorage } from "~/utils/helper";
import AuthContext from "./AuthContext";

export default NotificationContext = createContext({
  notificationData: [],
  pagination: {},
  loading: true,
  unReadList: [],
  refreshing: false,
  fetchMoreLoading: false,
  handlePageNotification: () => {},
  handleUpdateIsRead: () => {},
  handleRefresh: () => {},
});

const MOCK_DATA = {
  LIST: [
    {
      title: "Mới",
      data: [],
    },
    {
      title: "Trước đó",
      data: [],
    },
  ],
};

export const NotificationProvider = ({ children }) => {
  const { LIST } = MOCK_DATA;
  const { userInfo, setUserInfo } = useContext(AuthContext);

  const [notificationData, setNotificationData] = useState([...LIST]);
  const [rootData, setRootData] = useState([]);
  const [page, setPage] = useState({ value: 1 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);

  const unReadList = useMemo(
    () => (Array.isArray(rootData) ? rootData.filter((x) => !x.isRead) : []),
    [rootData]
  );

  const handleUpdateIsRead = (id) => {
    setRootData((prev) => {
      const clone = _.cloneDeep(prev);
      const index = clone.findIndex((x) => x.id === id);
      clone[index].isRead = true;
      return [...clone];
    });
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, pagination } = await NotificationServices.getList({
      pageNumber: page.value,
    });

    setRootData((prev) => (page.value === 1 ? data : [...prev, ...data]));
    setPagination(pagination);
    setLoading(false);
    setRefreshing(false);
    setFetchMoreLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage({ value: 1 });
  };

  const handlePageNotification = () => {
    setFetchMoreLoading(true);
    setPage(({ value }) => ({ value: value + 1 }));
  };

  // connect signalR
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(
        `${BASE_URL.replace("/api/", "")}/NotificationUserHub?userId=${
          userInfo?.id
        }`
      )
      .build();

    if (userInfo?.id) {
      connection.on("sendToUser", (data) => {
        setRootData((prev) => [
          { ...data, type: data.notificationType, isRead: false },
          ...prev,
        ]);
      });
      connection.on("UpdateProfile", async ({ id, isSuccess }) => {
        if (userInfo?.id === id) {
          let stt;
          let testCase;
          switch (userInfo?.role?.toLowerCase()) {
            case ROLE.builder: {
              testCase =
                userInfo?.avatar &&
                userInfo?.idNumber &&
                userInfo?.builder?.place &&
                userInfo?.builder?.typeID;
              break;
            }
            case ROLE.contractor: {
              testCase =
                userInfo?.avatar &&
                userInfo?.idNumber &&
                userInfo?.contractor?.companyName;
              break;
            }
            default: {
              testCase =
                userInfo?.avatar &&
                userInfo?.detailMaterialStore?.taxCode &&
                userInfo?.detailMaterialStore?.place;
              break;
            }
          }

          if (testCase) {
            stt = isSuccess ? 2 : 1;
          } else {
            stt = isSuccess ? 0 : 3;
          }
          const user = { ...userInfo, status: stt };
          Toast.show({
            type: isSuccess ? "success" : "error",
            text1: isSuccess
              ? "Bạn đã xác thực tài khoản thành công"
              : "Xác thực tài khoản thất bại",
            position: "bottom",
            visibilityTime: 2500,
          });
          setUserInfo(user);
          await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);
        }
      });

      connection
        .start()
        .then(() => console.log("Connected signalR !"))
        .catch(console.error);
    }

    return () => {
      connection.stop().then(() => console.log("Disconnected signalR!"));
    };
  }, [userInfo]);

  useEffect(() => {
    fetchData();
  }, [page, userInfo]);

  useEffect(() => {
    if (!Array.isArray(rootData)) return;

    const mapList = rootData.reduce((init, cur) => {
      if (moment(cur.lastModifiedAt).isSame(new Date(), "day")) {
        // now
        init[0].data.push(cur);
      } else {
        // prev
        init[LIST.length - 1].data.push(cur);
      }
      return init;
    }, _.cloneDeep(LIST));

    setNotificationData(mapList);
  }, [rootData]);

  return (
    <NotificationContext.Provider
      value={{
        loading,
        notificationData,
        pagination,
        unReadList,
        refreshing,
        fetchMoreLoading,
        handlePageNotification,
        handleUpdateIsRead,
        handleRefresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
