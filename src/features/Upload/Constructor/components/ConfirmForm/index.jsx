import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import RenderHTML from "react-native-render-html";

import AVATAR from "~/assets/images/avatar.png";
import { CustomButton } from "~/components";
import {
  ALL_HTML_TAG,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  PLACES,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import { ContractorServices } from "~/services";
import {
  formatStringToCurrency,
  hideTabBar,
  isCloseToBottom,
  showTabBar,
} from "~/utils/helper";

const BlockItem = ({ title, children, style }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          marginTop: theme.sizes.base,
          paddingBottom: theme.sizes.font,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: theme.sizes.large,
          fontWeight: "600",
          textTransform: "capitalize",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginTop: theme.sizes.font,
        }}
      >
        {children}
      </View>
    </View>
  );
};

const ConfirmForm = ({
  step,
  data,
  onResetForm,
  productList,
  currentPosition,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const height = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const { userInfo } = useContext(AuthContext);

  const [offset, setOffset] = useState(0);
  const [bottomTabBarHeight] = useState(height);
  const [isReadMore, setIsReadMore] = useState();

  const scrollRef = useRef();

  const benefit = useMemo(() => {
    if (data?.benefit) {
      return data?.benefit
        .replace(/<\/div>|<div>/g, "")
        .split("- ")
        .filter((x) => x.trim())
        .map((x) => x.trim());
    }
  }, [data?.benefit]);

  const renderBenefitIcon = (idx) => {
    switch (idx) {
      case 0:
        return <MaterialIcons name="monetization-on" color="black" size={24} />;
      case 1:
        return <Ionicons name="school" color="black" size={24} />;
      case 2:
        return (
          <MaterialCommunityIcons name="trophy-award" size={24} color="black" />
        );
    }
  };

  const handleSubmit = async () => {
    // call api
    const isSuccess = await ContractorServices.createPosts({
      ...data,
    });
    if (isSuccess) {
      onResetForm();
    }
  };

  const renderProductItem = (item) => (
    <View
      key={item.id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.sizes.small,
      }}
    >
      <Image
        source={{ uri: item.image || NO_IMAGE_URL }}
        style={{
          width: 60,
          height: 60,
          borderRadius: theme.sizes.base,
        }}
        resizeMode="cover"
      />
      <View style={{ marginLeft: theme.sizes.base }}>
        <Text
          style={{ fontSize: theme.sizes.medium, fontWeight: "600" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={{ marginVertical: theme.sizes.base / 2 }}
          numberOfLines={1}
        >
          Quantity:{" "}
          <Text style={{ color: "rgba(22,24,35,0.64)" }}>
            {data.productPost?.find((x) => x.productId === item.id)?.quantity}
          </Text>
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (data?.description?.length > 100) {
      setIsReadMore(false);
      return;
    }
    setIsReadMore(true);
  }, [data?.description]);

  useLayoutEffect(() => {
    if (currentPosition === 3) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      setOffset(0);
    }
  }, [currentPosition]);

  return (
    <ScrollView
      ref={scrollRef}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        paddingHorizontal: theme.sizes.font,
        paddingTop: theme.sizes.base,
        marginTop: theme.sizes.small,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEventThrottle={16}
      onScroll={({ nativeEvent }) => {
        const currentOffset = nativeEvent.contentOffset.y;
        let direction = currentOffset >= offset ? "down" : "up";
        // change when beside top or bottom
        if (isCloseToBottom(nativeEvent)) {
          hideTabBar({ navigation });
          return;
        } else if (currentOffset <= 0) {
          showTabBar({
            navigation,
            theme,
            height: bottomTabBarHeight,
            name: route.name,
          });
          return;
        }

        // change when scroll
        if (direction === "down") {
          hideTabBar({ navigation });
        } else {
          showTabBar({
            navigation,
            theme,
            height: bottomTabBarHeight,
            name: route.name,
          });
        }
        setOffset(currentOffset);
      }}
    >
      {/* header */}
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            color: theme.colors.primary300,
            fontWeight: "600",
            fontSize: theme.sizes.medium,
            letterSpacing: 0.5,
          }}
        >
          Xác nhận thông tin
        </Text>
        <Text
          style={{
            color: "rgba(22,24,35,0.6)",
            fontSize: theme.sizes.font - 2,
          }}
        >
          Step {step + 1} - 4
        </Text>
      </View>

      {/* author profile */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginVertical: theme.sizes.font,
        }}
      >
        {/* avatar */}
        <View
          style={{
            backgroundColor: "rgba(22,24,35,0.12)",
            padding: theme.sizes.small,
            width: 70,
            height: 70,
            borderRadius: theme.sizes.base - 2,
          }}
        >
          <Image
            source={userInfo?.avatar || AVATAR}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* info */}
        <View
          style={{
            marginLeft: theme.sizes.small,
            flex: 1,
          }}
        >
          <Text
            style={{ fontSize: theme.sizes.large, fontWeight: "600" }}
            numberOfLines={1}
          >
            {data.title}
          </Text>
          {userInfo?.firstName && userInfo?.lastName && (
            <Text
              style={{
                color: "rgba(22,24,35,0.64)",
                marginVertical: theme.sizes.base / 2,
              }}
              numberOfLines={1}
            >
              {`${userInfo?.firstName} ${userInfo?.lastName}`}
            </Text>
          )}
        </View>
      </View>

      {/* post info */}
      <View>
        {/* general grid block */}
        <View
          style={{
            flexDirection: "row",
            marginTop: theme.sizes.base,
            marginBottom: theme.sizes.font,
          }}
        >
          <View style={{ flex: 2 }}>
            <View>
              <Text
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: theme.sizes.font - 1,
                }}
              >
                ngày bắt đầu
              </Text>
              <Text style={{ marginTop: theme.sizes.base / 2 }}>
                {moment(data.starDate).format(
                  FORMAT_DATE_REGEX["DD MMM, YYYY"]
                )}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: theme.sizes.font - 1,
                  marginTop: theme.sizes.medium,
                }}
              >
                lương
              </Text>
              <Text style={{ marginTop: theme.sizes.base / 2 }}>
                {`${formatStringToCurrency(
                  data.salaries?.split("-")[0] || ""
                )} - ${formatStringToCurrency(
                  data.salaries?.split("-")[1] || ""
                )}`}{" "}
                /dự án
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View>
              <Text
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: theme.sizes.font - 1,
                }}
              >
                Ngày kết thúc
              </Text>
              <Text style={{ marginTop: theme.sizes.base / 2 }}>
                {moment(data.endDate).format(FORMAT_DATE_REGEX["DD MMM, YYYY"])}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: theme.sizes.font - 1,
                  marginTop: theme.sizes.medium,
                }}
              >
                địa điểm
              </Text>
              <Text
                style={{
                  marginTop: theme.sizes.base / 2,
                }}
              >
                {PLACES[data.place]}
              </Text>
            </View>
          </View>
        </View>

        {Array.isArray(data.productPost) && data.productPost.length !== 0 && (
          <BlockItem title="Sản phẩm sử dụng">
            {productList
              .filter((x) => data.productPost.some((v) => v.productId === x.id))
              .map((x) => renderProductItem(x))}
          </BlockItem>
        )}

        <BlockItem
          title="Vì sao nên ứng tuyển"
          style={{
            borderBottomColor: "rgba(22,24,35,0.12)",
            borderBottomWidth: 1,
          }}
        >
          {Array.isArray(benefit) &&
          benefit.length === 3 &&
          !benefit.some((x) => ALL_HTML_TAG.test(x)) ? (
            benefit.map((item, idx, arr) => (
              <View
                key={idx}
                style={{
                  marginBottom: idx !== arr.length - 1 ? theme.sizes.font : 0,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {renderBenefitIcon(idx)}
                <Text style={{ marginLeft: theme.sizes.font, flex: 1 }}>
                  {item.trim()}
                </Text>
              </View>
            ))
          ) : (
            <RenderHTML
              contentWidth={width}
              source={{
                html: data?.benefit || "",
              }}
            />
          )}
        </BlockItem>

        <BlockItem title="Mô tả công việc">
          <View
            style={{
              maxHeight: isReadMore ? undefined : 150,
              overflow: "hidden",
            }}
          >
            <RenderHTML
              contentWidth={width}
              source={{
                html: data.description || "",
              }}
            />
          </View>

          {!isReadMore && (
            <Pressable onPress={() => setIsReadMore(true)}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: theme.sizes.font + 1,
                  fontWeight: "500",
                  color: "rgba(0, 25, 247, 0.726)",
                  marginTop: theme.sizes.base,
                }}
              >
                Đọc thêm
              </Text>
            </Pressable>
          )}
        </BlockItem>

        <BlockItem
          title="Yêu cầu công việc"
          style={{
            borderTopColor: "rgba(22,24,35,0.12)",
            borderTopWidth: 1,
            paddingTop: theme.sizes.font,
          }}
        >
          <RenderHTML
            contentWidth={width}
            source={{
              html: data?.required || "",
            }}
          />
        </BlockItem>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 20,
          }}
        >
          <CustomButton
            onPress={handleSubmit}
            variant="primary"
            style={{ minWidth: 200 }}
          >
            Đăng bài
          </CustomButton>
        </View>
      </View>
    </ScrollView>
  );
};

export default ConfirmForm;
