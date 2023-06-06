import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Text,
  View,
} from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Badge,
  IconButton,
  Provider as PaperProvider,
  useTheme,
} from "react-native-paper";
import Animated, {
  Layout,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { Provider } from "react-redux";
import { Chat, OverlayProvider } from "stream-chat-expo";

import "firebase/compat/storage";

import axios from "axios";
import { useFonts } from "expo-font";
import { applyAuthTokenInterceptor } from "react-native-axios-jwt";
import axiosInstance from "~/app/api";
import { chatClient } from "~/app/chatConfig";
import theme, { FONTS } from "~/app/theme";
import { ConnectChatClient } from "~/app/useChatClient";
import {
  ASYNC_STORAGE_KEY,
  BASE_URL,
  chatTheme,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext, { AuthProvider } from "~/context/AuthContext";
import { ChatContext, ChatProvider } from "~/context/ChatContext";
import { GuestProvider } from "~/context/GuestContext";
import NotificationContext, {
  NotificationProvider,
} from "~/context/NotificationContext";
import {
  ApplyGroupScreen,
  BillDetailScreen,
  ChatScreen,
  ChooseRoleScreen,
  CMNDVerifyScreen,
  CommitmentDetailScreen,
  ConstructorProfileScreen,
  CreateBillScreen,
  CreateCommitmentScreen,
  CreateTestScreen,
  DynamicProfileFormScreen,
  ForgotPwdScreen,
  HomeScreen,
  ListQuizScreen,
  LoginScreen,
  Menu,
  MyProfileScreen,
  NotificationScreen,
  PaymentHistoryScreen,
  PostDetailScreen,
  PremiumScreen,
  ProductDetailScreen,
  ProfileScreen,
  RegisterScreen,
  ReportedPostScreen,
  ReportedProductScreen,
  SearchScreen,
  StoreDetailScreen,
  TestScreen,
  TrackingProgressScreen,
  UploadedScreen,
  UploadScreen,
  VerifyAccountScreen,
  ViewAllAppliedScreen,
  ViewAllBillScreen,
  ViewAllCommitmentScreen,
  ViewAllScreen,
} from "~/features";
import CartScreen from "~/features/Cart";
import ChannelScreen from "~/features/Channel";
import Demo from "~/features/DEMO";
import { store } from "~/store/redux";
import { setAsyncStorage } from "~/utils/helper";

const MIDDLE_BTN_SIZE = 55;

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#07BC0C",
        backgroundColor: Platform.OS === "ios" ? "rgba(0,0,0,0.6)" : "white",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: Platform.OS === "ios" ? "white" : "rgb(22,24,35)",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#E74C3C",
        backgroundColor: Platform.OS === "ios" ? "rgba(0,0,0,0.6)" : "white",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: Platform.OS === "ios" ? "white" : "rgb(22,24,35)",
      }}
    />
  ),
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Menu {...props} />}
      screenOptions={{
        drawerStyle: {
          width: Dimensions.get("screen").width * 0.85,
        },
      }}
    >
      <Drawer.Screen
        name={ROUTE.tabNavigator}
        component={BottomTabNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

const BottomTabNavigator = () => {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const { unReadList } = useContext(NotificationContext);
  const { unreadCount, setUnreadCount } = useContext(ChatContext);
  let Comp = UploadedScreen;

  useEffect(() => {
    (async () => {
      if (userInfo) {
        const list = await chatClient.queryChannels(
          {
            members: {
              $in: [userInfo.id],
            },
          },
          {
            last_message_at: -1,
          }
        );

        setUnreadCount(
          list.reduce((init, cur) => {
            return cur.state.unreadCount === 0 ? init : init + 1;
          }, 0)
        );
      }
    })();
  }, []);

  if (userInfo?.role?.toLowerCase() === ROLE.store) Comp = StoreDetailScreen;

  return (
    <>
      <Tab.Navigator
        initialRouteName={ROUTE.home}
        tabBar={(props) => {
          return (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              layout={Layout.duration(250)}
            >
              <BottomTabBar {...props} />
            </Animated.View>
          );
        }}
        screenOptions={{
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
          },
        }}
      >
        <Tab.Screen
          name={ROUTE.home}
          component={HomeScreen}
          options={{
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color: focused ? theme.colors.primary400 : color,
                  fontSize: theme.sizes.small,
                }}
              >
                Trang chủ
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "md-home" : "md-home-outline"}
                size={24}
                color={focused ? theme.colors.primary400 : color}
              />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name={ROUTE.uploaded}
          component={Comp}
          options={{
            headerShown: false,
            tabBarLabel: ({ color, focused }) =>
              userInfo?.role?.toLowerCase() === ROLE.store ? (
                <Text
                  style={{
                    color: focused ? theme.colors.primary400 : color,
                    fontSize: theme.sizes.small,
                  }}
                >
                  Cửa hàng
                </Text>
              ) : userInfo?.role?.toLowerCase() === ROLE.contractor ? (
                <Text
                  style={{
                    color: focused ? theme.colors.primary400 : color,
                    fontSize: theme.sizes.small,
                  }}
                >
                  Đã đăng
                </Text>
              ) : (
                <Text
                  style={{
                    color: focused ? theme.colors.primary400 : color,
                    fontSize: theme.sizes.small,
                  }}
                >
                  Yêu thích
                </Text>
              ),

            tabBarIcon: ({ color, focused }) => {
              let name = focused ? "documents" : "documents-outline";
              if (userInfo?.role?.toLowerCase() === ROLE.store) {
                name = focused ? "basket" : "basket-outline";
              }
              return (
                <Ionicons
                  name={name}
                  size={24}
                  color={focused ? theme.colors.primary400 : color}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name={ROUTE.upload}
          component={UploadScreen}
          options={{
            headerShown: false,
            presentation: "containedTransparentModal",
            tabBarButton:
              userInfo?.role?.toLowerCase() !== ROLE.builder
                ? ({
                    accessibilityState: { selected },
                    activeTintColor,
                    ...props
                  }) => {
                    return (
                      <IconButton
                        icon="plus"
                        iconColor={
                          selected
                            ? theme.colors.textColor400
                            : theme.colors.textColor300
                        }
                        size={40}
                        {...props}
                        style={{
                          marginTop: -MIDDLE_BTN_SIZE / 2,
                          width: MIDDLE_BTN_SIZE,
                          height: MIDDLE_BTN_SIZE,
                          backgroundColor: selected
                            ? theme.colors.primary400
                            : theme.colors.primary300,
                          borderRadius: MIDDLE_BTN_SIZE / 2,
                        }}
                      />
                    );
                  }
                : () => {},
          }}
        />

        <Tab.Screen
          name={ROUTE.chat}
          component={ChatScreen}
          options={{
            headerShown: false,
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color: focused ? theme.colors.primary400 : color,
                  fontSize: theme.sizes.small,
                }}
              >
                Chat
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <View>
                <Ionicons
                  name={focused ? "chatbox" : "chatbox-outline"}
                  s
                  size={24}
                  color={focused ? theme.colors.primary400 : color}
                />
                {unreadCount !== 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      transform: [
                        {
                          translateX: 6,
                        },
                        {
                          translateY: -6,
                        },
                      ],
                    }}
                  >
                    <Badge size={18} color="red">
                      {unreadCount}
                    </Badge>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={ROUTE.notification}
          component={NotificationScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View>
                <Ionicons
                  name={focused ? "notifications" : "notifications-outline"}
                  size={24}
                  color={focused ? theme.colors.primary400 : color}
                />

                {unReadList?.length !== 0 && !focused && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      transform: [
                        {
                          translateX: 4,
                        },
                        {
                          translateY: -3,
                        },
                      ],
                    }}
                  >
                    <Badge size={16} color={theme.colors.error}>
                      {unReadList.length}
                    </Badge>
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const App = () => {
  const {
    isLoading,
    refreshToken,
    errMessage,
    isChooseRole,
    setUserInfo,
    userInfo,
  } = useContext(AuthContext);
  const requestRefresh = async (refresh) => {
    const {
      data: {
        data: { accessToken, ...rest },
      },
    } = await axios.post(`${BASE_URL}users/refresh`, {
      refreshToken: refresh,
    });
    const user = { ...rest };
    setUserInfo(user);
    await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);

    return accessToken;
  };

  applyAuthTokenInterceptor(axiosInstance, {
    requestRefresh,
    header: "Authorization",
    headerPrefix: "Bearer ",
  });

  const [fontsLoaded] = useFonts({
    [FONTS.thin]: require("./src/assets/fonts/BeVietnamPro-Thin.ttf"),
    [FONTS.light]: require("./src/assets/fonts/BeVietnamPro-Light.ttf"),
    [FONTS.regular]: require("./src/assets/fonts/BeVietnamPro-Regular.ttf"),
    [FONTS.medium]: require("./src/assets/fonts/BeVietnamPro-Medium.ttf"),
    [FONTS.semibold]: require("./src/assets/fonts/BeVietnamPro-SemiBold.ttf"),
    [FONTS.bold]: require("./src/assets/fonts/BeVietnamPro-Bold.ttf"),
    [FONTS.extrabold]: require("./src/assets/fonts/BeVietnamPro-ExtraBold.ttf"),
    [FONTS.black]: require("./src/assets/fonts/BeVietnamPro-Black.ttf"),
  });
  if (!fontsLoaded) {
    return null;
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }
  return (
    <>
      <StatusBar style="auto" />
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <GuestProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <OverlayProvider value={{ theme: chatTheme }}>
                    <Chat client={chatClient}>
                      <ConnectChatClient />
                      <Stack.Navigator
                        initialRouteName={errMessage?.from || ROUTE.drawer}
                      >
                        <Stack.Screen
                          name={ROUTE.applyGroup}
                          component={ApplyGroupScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.paymentHistory}
                          component={PaymentHistoryScreen}
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.drawer}
                          component={DrawerNavigator}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={"test123"}
                          component={Demo}
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.viewReportedProduct}
                          component={ReportedProductScreen}
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.viewReportedPost}
                          component={ReportedPostScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.createTest}
                          component={CreateTestScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.test}
                          component={TestScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.constructorProfile}
                          component={ConstructorProfileScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.cart}
                          component={CartScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.productDetail}
                          component={ProductDetailScreen}
                          options={{ headerShown: false }}
                        />

                        <Stack.Screen
                          name={ROUTE.verifyAccount}
                          component={VerifyAccountScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.verifyCMND}
                          component={CMNDVerifyScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.premium}
                          component={PremiumScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.profile}
                          component={ProfileScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.storeDetail}
                          component={StoreDetailScreen}
                          options={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "white" },
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.createBill}
                          component={CreateBillScreen}
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.channel}
                          component={ChannelScreen}
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.myProfile}
                          component={MyProfileScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.viewAllCommitment}
                          component={ViewAllCommitmentScreen}
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name={ROUTE.viewAllApplied}
                          component={ViewAllAppliedScreen}
                          options={{ headerShown: false }}
                        />

                        <Stack.Screen
                          name={ROUTE.createCommitment}
                          component={CreateCommitmentScreen}
                          options={{
                            headerShown: false,
                            animation: "fade",
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.dynamicProfileForm}
                          component={DynamicProfileFormScreen}
                          options={{
                            presentation: "formSheet",
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.listQuiz}
                          component={ListQuizScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.commitmentDetail}
                          component={CommitmentDetailScreen}
                          options={{
                            headerShown: false,
                            animation: "fade",
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.viewAll}
                          component={ViewAllScreen}
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name={ROUTE.search}
                          component={SearchScreen}
                          options={{
                            headerShown: false,
                            animation: "fade",
                          }}
                        />
                        <Stack.Screen
                          name={ROUTE.postDetail}
                          component={PostDetailScreen}
                          options={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "white" },
                          }}
                        />

                        <Stack.Screen
                          name={ROUTE.viewAllBill}
                          component={ViewAllBillScreen}
                          options={{ headerShown: false }}
                        />

                        <Stack.Screen
                          name={ROUTE.billProgress}
                          component={TrackingProgressScreen}
                        />

                        <Stack.Screen
                          name={ROUTE.billDetail}
                          component={BillDetailScreen}
                          options={{
                            headerShown: false,
                          }}
                        />

                        {/* <Stack.Screen
                            name={ROUTE.landing}
                            component={LandingScreen}
                            options={{ headerShown: false }}
                          /> */}

                        <Stack.Screen
                          name={ROUTE.login}
                          component={LoginScreen}
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name={ROUTE.forgotPwd}
                          component={ForgotPwdScreen}
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name={ROUTE.register}
                          component={RegisterScreen}
                          options={{ headerShown: false }}
                        />
                        {isChooseRole == true && (
                          <Stack.Screen
                            name={ROUTE.chooseRole}
                            component={ChooseRoleScreen}
                            options={{
                              headerShown: false,
                            }}
                          />
                        )}
                      </Stack.Navigator>
                    </Chat>
                  </OverlayProvider>
                </GestureHandlerRootView>
              </GuestProvider>
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </Provider>
    </>
  );
};

const jsx = () => (
  <AuthProvider>
    <ChatProvider>
      <NotificationProvider>
        <App />
        <Toast config={toastConfig} />
      </NotificationProvider>
    </ChatProvider>
  </AuthProvider>
);

export default jsx;
