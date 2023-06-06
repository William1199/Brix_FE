import { useContext, useLayoutEffect } from "react";
import { Text, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBarComp } from "~/components";
import { ROLE, ROUTE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import GuestContext from "~/context/GuestContext";
import AppliedPost from "./AppliedPost";
import InvitedPost from "./InvitedPost";
import SavePost from "./SavePost";
import UploadedPost from "./UploadedPost";

const MOCK_DATA = {
  BAR: {
    uploaded: "Đã đăng",
    save: "Đã lưu",
    applied: "Đã ứng tuyển",
    invited: "Được mời",
  },
};

const UploadedScreen = () => {
  const { BAR } = MOCK_DATA;
  const { userInfo } = useContext(AuthContext);
  const { verifyAccount } = useContext(GuestContext);
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  useLayoutEffect(() => {
    verifyAccount(ROUTE.uploaded);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {userInfo && (
        <>
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
                Yêu thích
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              {userInfo?.role.toLowerCase() == ROLE.contractor ? (
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
                  initialTabName={BAR.save}
                >
                  <Tabs.Tab name={BAR.save}>
                    <SavePost />
                  </Tabs.Tab>
                  <Tabs.Tab name={BAR.uploaded}>
                    <UploadedPost />
                  </Tabs.Tab>
                </Tabs.Container>
              ) : (
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
                  initialTabName={BAR.save}
                >
                  <Tabs.Tab name={BAR.save}>
                    <SavePost />
                  </Tabs.Tab>
                  <Tabs.Tab name={BAR.applied}>
                    <AppliedPost />
                  </Tabs.Tab>
                  <Tabs.Tab name={BAR.invited}>
                    <InvitedPost />
                  </Tabs.Tab>
                </Tabs.Container>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default UploadedScreen;
