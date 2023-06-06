import { Text, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBarComp } from "~/components";
import Done from "./Done";
import NotDone from "./NotDone";

const MOCK_DATA = {
  BAR: {
    notDone: "Chưa hoàn thành",
    done: "Đã hoàn thành",
  },
};

const ViewAllCommitmentScreen = () => {
  const { BAR } = MOCK_DATA;
  const { top } = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ transparent: false, style: "light" }}
      />

      <View style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            paddingTop: top + theme.sizes.base,
            paddingBottom: theme.sizes.small + 2,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backgroundColor: theme.colors.primary400,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: theme.sizes.medium + 1,
              fontWeight: "600",
              textTransform: "capitalize",
              letterSpacing: 0.5,
            }}
          >
            Cam kết
          </Text>
        </View>

        <View style={{ flex: 1 }}>
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
            initialTabName={BAR.notDone}
          >
            <Tabs.Tab name={BAR.notDone}>
              <NotDone />
            </Tabs.Tab>
            <Tabs.Tab name={BAR.done}>
              <Done />
            </Tabs.Tab>
          </Tabs.Container>
        </View>
      </View>
    </View>
  );
};

export default ViewAllCommitmentScreen;
