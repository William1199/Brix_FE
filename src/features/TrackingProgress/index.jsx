import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import _ from "lodash";
import moment from "moment";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { BILL_STATUS_ENUM, NO_IMAGE_URL, ROUTE } from "~/constants";

const MOCK_DATA = [
  {
    title: "Đơn hàng đã được đặt",
    desc: "Đơn hàng của bạn đã được đặt.",
    date: new Date(),
  },
  {
    title: "Đơn hàng đang được giao",
    desc: "Đơn hàng của bạn đang được giao.",
    date: new Date(),
  },
  {
    title: "Kiện hàng đợt 1",
    desc: "Kiện hàng của bạn đã sẵn sàng vận chuyển và đang đợi thanh toán.",
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Tiến hành giao hàng",
    desc: "Kiện hàng của bạn sẽ sớm được giao, vui lòng chú ý đến thông tin giao hàng.",
    subDesc: ["Dịch vụ: Ng Đức Thịnh", "Số điện thoại: +84769745668"],
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Sẵn sàng để thanh toán",
    desc: "Đơn hàng của bạn đã được đóng gói và đang chờ vận chuyển.",
    date: new Date(),
  },
  {
    title: "Kiện hàng đợt 2",
    desc: "Kiện hàng của bạn đã sẵn sàng vận chuyển và đang đợi thanh toán.",
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Tiến hành giao hàng",
    desc: "Kiện hàng của bạn sẽ sớm được giao, vui lòng chú ý đến thông tin giao hàng.",
    subDesc: ["Dịch vụ: Ng Đức Thịnh", "Số điện thoại: +84769745668"],
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Sẵn sàng để thanh toán",
    desc: "Đơn hàng của bạn đã được đóng gói và đang chờ vận chuyển.",
    date: new Date(),
  },
  {
    title: "Kiện hàng đợt 3",
    desc: "Kiện hàng của bạn đã sẵn sàng vận chuyển và đang đợi thanh toán.",
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Tiến hành giao hàng",
    desc: "Kiện hàng của bạn sẽ sớm được giao, vui lòng chú ý đến thông tin giao hàng.",
    subDesc: ["Dịch vụ: Ng Đức Thịnh", "Số điện thoại: +84769745668"],
    date: new Date(),
    isSubStep: true,
  },
  {
    title: "Đã hoàn thành đơn hàng",
    desc: "Tất cả kiện hàng của bạn đã được giao!",
    date: new Date(),
  },
].reverse();

const TrackingProgressScreen = ({ navigation, route }) => {
  const { data } = route.params || {};
  const theme = useTheme();
  const [itemsLayout, setItemsLayout] = useState({});
  const [itemsIconLayout, setItemsIconLayout] = useState({});

  const [currPackage] = useState(() => {
    const packageSuccess = data.details.filter(
      (x) => x.status === BILL_STATUS_ENUM.indexOf("Success")
    );
    if (packageSuccess.length === data.details.length) return packageSuccess;

    const packageList = data.details.filter(
      (x) => x.status !== BILL_STATUS_ENUM.indexOf("Success")
    );
    return [packageList[0]];
  });

  const stepContent = useMemo(() => {
    return data.details.reduce(
      (init, cur, idx, arr) => {
        const prevStatus = arr[idx - 1]?.status;
        // if prev package not success not show current package
        if (prevStatus !== BILL_STATUS_ENUM.indexOf("Success") && idx !== 0)
          return init;

        let passProps = [
          {
            title: "Tiến hành giao hàng",
            desc: "Kiện hàng của bạn sẽ sớm được giao, vui lòng chú ý đến thông tin giao hàng.",
            subDesc: [
              `Dịch vụ: ${data.store.storeName}`,
              "Số điện thoại: +84769745668",
            ],
            date: new Date(),
            isSubStep: true,
            status: BILL_STATUS_ENUM.indexOf("Paid"),
          },
          {
            title: `Kiện hàng của bạn`,
            desc: "Kiện hàng của bạn đã sẵn sàng vận chuyển và đang đợi được giao.",
            date: new Date(cur.endDate),
            isSubStep: true,
            status: BILL_STATUS_ENUM.indexOf("Accepted"),
          },
          {
            title: `Không được xác nhận`,
            desc: "Đơn hàng của bạn đã bị từ chối do phía cung cấp dịch vụ cần sự thay đổi về kiện hàng hiện tại, vui lòng kiểm tra để biết thông tin cập nhật",
            date: new Date(data.bill.lastModifiedAt),
            status: BILL_STATUS_ENUM.indexOf("Decline"),
            icon: { icon: MaterialIcons, name: "error" },
          },
          {
            title: `Đơn hàng đang đợi được xác nhận`,
            desc: `Đơn hàng của bạn sẽ sớm được xác nhận từ đơn vị dịch vụ.`,
            subDesc: [
              `Dịch vụ: ${data.store.storeName}`,
              "Số điện thoại: +84769745668",
            ],
            date: new Date(data.bill.startDate),
            status: BILL_STATUS_ENUM.indexOf("Pending"),
          },
        ];

        switch (cur.status) {
          case BILL_STATUS_ENUM.indexOf("Pending"): {
            passProps = passProps.filter(
              (x) => x.status === BILL_STATUS_ENUM.indexOf("Pending")
            );
            break;
          }

          case BILL_STATUS_ENUM.indexOf("Accepted"): {
            passProps = passProps.filter(
              (x) =>
                x.status === BILL_STATUS_ENUM.indexOf("Pending") ||
                x.status === BILL_STATUS_ENUM.indexOf("Accepted")
            );
            break;
          }

          case BILL_STATUS_ENUM.indexOf("Paid"): {
            passProps = passProps.filter(
              (x) => x.status !== BILL_STATUS_ENUM.indexOf("Decline")
            );
            break;
          }

          case BILL_STATUS_ENUM.indexOf("Decline"):
          case BILL_STATUS_ENUM.indexOf("Cancel"): {
            passProps = passProps.filter(
              (x) =>
                x.status === BILL_STATUS_ENUM.indexOf("Pending") ||
                x.status === BILL_STATUS_ENUM.indexOf("Decline") ||
                x.status === BILL_STATUS_ENUM.indexOf("Cancel")
            );
            break;
          }

          case BILL_STATUS_ENUM.indexOf("Success"): {
            const successProps =
              idx === arr.length - 1
                ? [
                    {
                      title: "Đã hoàn thành đơn hàng",
                      desc: "Tất cả kiện hàng của bạn đã được giao!",
                      date: new Date(),
                    },
                  ]
                : [];

            passProps = [
              ...successProps,
              ...passProps.filter(
                (x) => x.status !== BILL_STATUS_ENUM.indexOf("Decline")
              ),
            ];
            break;
          }
        }

        return [...passProps, ...init];
      },
      [
        {
          title: "Đơn hàng đã được đặt",
          desc: "Đơn hàng của bạn đã được đặt.",
          date: new Date(data.bill.startDate),
        },
      ]
    );
  }, [data]);

  const productsCount = useMemo(
    () =>
      currPackage.reduce((init, cur) => init + cur.productBillDetail.length, 0),
    [currPackage]
  );

  const renderStepBar = useCallback(() => {
    if (itemsLayout.length === 0) return null;
    return _.toPairs(itemsLayout).map(([key, item], idx, arr) => {
      if (idx === arr.length - 1) return null;
      const height =
        item.height +
        theme.sizes.extraLarge * 1.25 -
        (itemsIconLayout[+key + 1]?.height || 0);
      const offset = Math.floor(itemsIconLayout[key]?.height) === 19 ? 3 : 5;

      return (
        <View
          key={idx}
          style={{
            position: "absolute",
            top: item.y + (itemsIconLayout[key]?.height - offset || 0),
            left: theme.sizes.large + 25 / 2 - 2,
            width: 1.5,
            height: height + offset + 3.5,
            backgroundColor: "rgba(22,24,35,0.12)",
          }}
        />
      );
    });
  }, [itemsLayout, itemsIconLayout]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Theo dõi kiện hàng",
      headerLeft: () => {
        return (
          <AntDesign
            name="left"
            size={theme.sizes.large + 2}
            color="white"
            onPress={() => navigation.goBack()}
          />
        );
      },
      headerTitleStyle: {
        fontSize: theme.sizes.medium,
        fontWeight: "600",
        color: "white",
      },
      headerStyle: {
        backgroundColor: theme.colors.primary400,
      },
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? 50 : 0,
      }}
    >
      <ScrollView alwaysBounceVertical={false} bounces={false}>
        {/* header */}
        <View
          style={{
            paddingHorizontal: theme.sizes.large,
            paddingBottom: theme.sizes.extraLarge,
            paddingTop: theme.sizes.font,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.sizes.font,
            }}
          >
            <Text style={{ fontWeight: "bold", color: "rgba(22,24,35,1)" }}>
              {productsCount} mặt hàng
            </Text>
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                if (currPackage.length === data.details.length)
                  return navigation.navigate(ROUTE.billDetail, {
                    id: data.bill.id,
                  });

                const _data = currPackage[currPackage.length - 1];

                navigation.navigate(ROUTE.smallBillDetail, {
                  data: _data,
                  store: data.store,
                  bill: data.bill,
                });
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,0.34)",
                }}
              >
                Chi tiết đơn hàng
              </Text>
              <Entypo
                name="chevron-right"
                size={theme.sizes.medium - 1}
                color="rgba(22,24,35,0.34)"
              />
            </Pressable>
          </View>

          <ScrollView
            nestedScrollEnabled
            horizontal
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
          >
            {currPackage.map(({ productBillDetail }) =>
              productBillDetail.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    padding: theme.sizes.base,
                    borderColor: "rgba(22,24,35,0.12)",
                    borderWidth: 1,
                    backgroundColor: "white",
                    marginRight: theme.sizes.small,
                    borderRadius: 2,
                  }}
                >
                  <Image
                    source={{ uri: item.image || NO_IMAGE_URL }}
                    style={{ width: 50, height: 50 }}
                    resizeMode="cover"
                  />
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* divider */}
        <View
          style={{
            height: theme.sizes.base,
            backgroundColor: "rgba(22,24,35,0.065)",
          }}
        />

        <View
          style={{
            paddingHorizontal: theme.sizes.large,
            paddingTop: theme.sizes.extraLarge,
          }}
        >
          {stepContent.map(
            (
              {
                title,
                desc,
                subDesc = [],
                date,
                isSubStep,
                icon: Icon = { icon: Ionicons, name: "checkmark-circle" },
              },
              idx,
              arr
            ) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  marginBottom:
                    idx === arr.length - 1
                      ? theme.sizes.extraLarge * 2
                      : theme.sizes.extraLarge * 1.25,
                }}
                onLayout={({ nativeEvent: { layout } }) => {
                  setItemsLayout((prev) => ({
                    ...prev,
                    [idx]: { height: layout.height, y: layout.y },
                  }));
                }}
              >
                <View
                  style={{
                    width: 25,
                    alignItems: "center",
                  }}
                >
                  {isSubStep ? (
                    <Octicons
                      onLayout={({ nativeEvent: { layout } }) => {
                        setItemsIconLayout((prev) => ({
                          ...prev,
                          [idx]: { height: layout.height },
                        }));
                      }}
                      name="dot-fill"
                      size={theme.sizes.large}
                      color={idx === 0 ? "black" : "rgba(22,24,34,0.24)"}
                      style={{ transform: [{ translateX: -0.6 }] }}
                    />
                  ) : (
                    <Icon.icon
                      onLayout={({ nativeEvent: { layout } }) => {
                        setItemsIconLayout((prev) => ({
                          ...prev,
                          [idx]: { height: layout.height },
                        }));
                      }}
                      name={Icon.name}
                      size={theme.sizes.large}
                      color={idx === 0 ? "black" : "rgba(22,24,34,0.24)"}
                    />
                  )}
                </View>
                <View style={{ marginLeft: theme.sizes.font, flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: theme.sizes.medium - 1,
                      color:
                        idx === 0 ? "rgba(22,24,34,1)" : "rgba(22,24,34,0.44)",
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.sizes.small + 1.5,
                      marginVertical: theme.sizes.base / 3,
                      color:
                        idx === 0 ? "rgba(22,24,34,1)" : "rgba(22,24,34,0.44)",
                    }}
                  >
                    {desc}
                  </Text>

                  {subDesc.map((_item, _idx, _arr) => (
                    <Text
                      key={_idx}
                      style={{
                        fontSize: theme.sizes.small + 1.5,
                        marginBottom:
                          _idx === _arr.length - 1 ? theme.sizes.base / 3 : 0,
                        color:
                          idx === 0
                            ? "rgba(22,24,34,1)"
                            : "rgba(22,24,34,0.44)",
                      }}
                    >
                      {_item}
                    </Text>
                  ))}

                  <Text
                    style={{
                      fontSize: theme.sizes.small + 1.5,
                      color:
                        idx === 0 ? "rgba(22,24,34,1)" : "rgba(22,24,34,0.44)",
                    }}
                  >
                    {moment(date).format("DD MMM, YYYY LT")}
                  </Text>
                </View>
              </View>
            )
          )}

          {renderStepBar()}
        </View>
      </ScrollView>
    </View>
  );
};

export default TrackingProgressScreen;
