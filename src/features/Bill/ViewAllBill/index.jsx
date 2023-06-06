import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useSafeAreaInsets
} from "react-native-safe-area-context";

import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import axiosInstance from "~/app/api";
import { Loading, StatusBarComp } from "~/components";
import { API_RESPONSE_CODE } from "~/constants";
import AllBill from "./AllBill";
import CancelBill from "./CancelBill";

const MOCK_DATA = {
  BAR: {
    all: "Tất cả",
    cancel: "Đã hủy",
  },
};

const ViewAllBillScreen = ({ navigation }) => {
  const { BAR } = MOCK_DATA;
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [billList, setBillList] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await axiosInstance.post("billController/getAll", {});
      if (+res.code === API_RESPONSE_CODE.success) {
        setBillList(res.data);
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />

      <View style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary400,
            padding: theme.sizes.font,
            paddingTop: top + theme.sizes.base,
          }}
        >
          <Text
            style={{
              fontSize: theme.sizes.large,
              color: "#fff",
              alignSelf: "center",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            Đơn hàng
          </Text>
        </View>

        <View style={{ flex: 1, backgroundColor: "white" }}>
          <Tabs.Container
            renderTabBar={(props) => (
              <MaterialTabBar
                {...props}
                indicatorStyle={{
                  backgroundColor: "rgba(22,24,35,1)",
                  height: 1.75,
                }}
                inactiveColor="rgba(22,24,35,0.64)"
                activeColor="rgba(22,24,35,1)"
                tabStyle={{
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                }}
                labelStyle={{
                  fontSize: theme.sizes.font + 1,
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              />
            )}
            initialTabName={BAR.all}
          >
            <Tabs.Tab name={BAR.all}>
              <AllBill />
            </Tabs.Tab>
            <Tabs.Tab name={BAR.cancel}>
              <CancelBill />
            </Tabs.Tab>
          </Tabs.Container>
        </View>
      </View>
    </View>
  );
};

export default ViewAllBillScreen;
