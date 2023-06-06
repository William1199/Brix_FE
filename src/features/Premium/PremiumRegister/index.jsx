import { useContext, useEffect, useState } from "react";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import axiosInstance from "~/app/api";
import { ASYNC_STORAGE_KEY, BASE_URL, ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { setAsyncStorage } from "~/utils/helper";

const Premium = ({ navigation, route }) => {
  const { setUserInfo, userInfo } = useContext(AuthContext);
  const theme = useTheme();
  const [url, setUrl] = useState(null);
  const [check, setCheck] = useState(false);

  const handleCallback = async (_url) => {
    setCheck(true);

    var api = _url.split("api/")[1];
    const response = await fetch(BASE_URL + api);
    const data = await response.json();
    const request = {
      userId: userInfo?.id,
      orderDescription: data.orderDescription,
      transactionId: data.transactionId,
      orderId: data.orderId,
      paymentId: data.paymentId,
      vnPayResponseCode: data.vnPayResponseCode,
      amount: data.amount,
    };

    const res = await axiosInstance.post("VNPay/StorePayment", request);
    if (res === "00") {
      const user = {
        ...userInfo,
        premium: true,
      };
      setUserInfo(user);
      await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);
      Toast.show({
        type: "success",
        text1: "Thanh toán kích hoạt tài khoản thành công",
        position: "bottom",
        visibilityTime: 2500,
      });
      navigation.push(ROUTE.drawer);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const request = {
          orderType: "250006",
          amount:
            userInfo?.role.toLowerCase() === ROLE.contractor ? 200000 : 300000,
          orderDescription: userInfo?.role.charAt(0).toUpperCase() + " Premium",
          name: userInfo?.firstName + " " + userInfo?.lastName,
        };

        const res = await axiosInstance.post("VNPay", request);
        if (res) {
          setUrl(res);
        }
      } catch (e) {
        console.log(`Premium api error ${e}`);
      }
    })();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary400 }}>
      {url && (
        <WebView
          source={{ uri: url }}
          onNavigationStateChange={(e) => {
            console.log(e);
            if (e.url.includes("ResponseCode=00") && !check) {
              handleCallback(e.url);
            }
            if (e.url.includes("ResponseCode=24")) {
              navigation.navigate(ROUTE.home);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Premium;
