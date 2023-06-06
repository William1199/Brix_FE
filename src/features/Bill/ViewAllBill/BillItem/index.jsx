import { Image, Pressable, Text, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";

import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import moment from "moment";
import {
  BILL_STATUS_ENUM,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  ROUTE,
} from "~/constants";
import { formatStringToCurrency } from "~/utils/helper";
import { useNavigation } from "@react-navigation/native";

const MOCK_DATA = {
  PROGRESS_LABEL: {
    [BILL_STATUS_ENUM.indexOf("Pending")]: {
      title: "Đợi xác nhận",
      desc: "Đơn hàng của bạn sẽ sớm được xác nhận từ đơn vị dịch vụ.",
    },
    [BILL_STATUS_ENUM.indexOf("Accepted")]: {
      title: "Đang giao hàng",
      desc: "Đơn hàng của bạn đang được giao.",
    },
    [BILL_STATUS_ENUM.indexOf("Decline")]: {
      title: "Bị từ chối",
      desc: "Đơn hàng đã bị từ chối",
    },
    [BILL_STATUS_ENUM.indexOf("Cancel")]: {
      title: "Bị hủy",
      desc: "Đơn hàng đã bị hủy",
    },
    [BILL_STATUS_ENUM.indexOf("Paid")]: {
      title: "Đang được giao",
      desc: "Đơn hàng sẽ được giao hàng vào thời gian sớm nhất.",
    },
    [BILL_STATUS_ENUM.indexOf("Success")]: {
      title: "Đã giao",
      desc: "Kiện hàng của bạn đã được giao",
    },
  },
};

const BillItem = ({ item }) => {
  const { PROGRESS_LABEL } = MOCK_DATA;
  const theme = useTheme();
  const navigation = useNavigation();

  const renderStatus = (status) => {
    switch (status) {
      case BILL_STATUS_ENUM.indexOf("Pending"):
        return "Đang chờ";
      case BILL_STATUS_ENUM.indexOf("Accepted"):
        return "Đồng ý";
      case BILL_STATUS_ENUM.indexOf("Decline"):
        return "Từ chối";
      case BILL_STATUS_ENUM.indexOf("Cancel"):
        return "Đã hủy";
      case BILL_STATUS_ENUM.indexOf("Paid"):
        return "Đang giao";
      case BILL_STATUS_ENUM.indexOf("Success"):
        return "Đã nhận";
      default:
        return "Lỗi status";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Pressable
        style={({ pressed }) => [
          pressed && {
            backgroundColor: "rgba(22,24,35,0.06)",
          },
          {
            paddingTop: theme.sizes.large,
            paddingHorizontal: theme.sizes.small + 2,
            paddingBottom: theme.sizes.font,
          },
        ]}
        onPress={() =>
          navigation.navigate(ROUTE.billDetail, { id: item.billId })
        }
      >
        <View>
          {/* store */}
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.55 },
              {
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            onPress={() => {
              const [firstName, ...lastName] = item.storeName.split(" ");
              navigation.navigate(ROUTE.storeDetail, {
                id: item.storeID,
                storeInfo: {
                  firstName,
                  lastName: lastName.join(" "),
                  avatar: item.avatar,
                },
                userId: item.userID,
              });
            }}
          >
            <Avatar.Image
              source={{ uri: item.avatar || NO_IMAGE_URL }}
              size={30}
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: theme.colors.darklight,
                marginLeft: theme.sizes.base,
              }}
              numberOfLines={1}
            >
              {item.storeName}
            </Text>

            <Feather
              name="chevron-right"
              size={theme.sizes.font}
              color="rgba(22,24,35,0.34)"
              style={{ marginLeft: theme.sizes.base / 2 }}
            />
          </Pressable>

          {/* step progress */}
          <View
            style={{
              marginTop: theme.sizes.font,
            }}
          >
            <Pressable
              style={{
                backgroundColor: "rgba(22,24,35,0.04)",
                paddingHorizontal: theme.sizes.font,
                paddingVertical: theme.sizes.small + 2,
                borderRadius: theme.sizes.base / 2,
                flexDirection: "row",
              }}
              onPress={() => {
                const passProps = {
                  details: [
                    {
                      status: item.status,
                      endDate: item.endDate,
                      productBillDetail: item.productBillDetailGet,
                    },
                  ],
                  store: {
                    storeName: item.storeName,
                  },
                  bill: {
                    id: item.billId,
                    lastModifiedAt: "",
                    startDate: item.startDate,
                  },
                };

                navigation.navigate(ROUTE.billProgress, {
                  data: passProps,
                });
              }}
            >
              <View
                style={{
                  marginLeft: theme.sizes.base / 2,
                  marginRight: theme.sizes.small + 2,
                  marginTop: 2,
                }}
              >
                <FontAwesome5
                  name="shipping-fast"
                  size={13.5}
                  color="rgba(22,24,35,0.64)"
                />
              </View>

              <View style={{ flex: 1, maxWidth: "85%" }}>
                <Text style={{ fontWeight: "600" }}>
                  {PROGRESS_LABEL[item.status].title}
                </Text>

                <Text
                  style={{
                    fontSize: theme.sizes.small + 2,
                    color: "rgba(22,24,35,0.54)",
                    marginTop: theme.sizes.base / 2,
                  }}
                >
                  {PROGRESS_LABEL[item.status].desc}
                </Text>
              </View>

              <View
                style={{
                  position: "absolute",
                  right: theme.sizes.small,
                  top: theme.sizes.font,
                }}
              >
                <Entypo
                  name="chevron-right"
                  size={theme.sizes.font + 1}
                  color="rgba(22,24,35,0.34)"
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* product */}
        <View>
          {item.productBillDetailGet.map((product, idx) => {
            return (
              <Pressable
                key={idx}
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.04)",
                  },
                  {
                    paddingVertical: theme.sizes.small,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(ROUTE.productDetail, {
                    id: product.productId,
                  })
                }
              >
                {/* product-info */}
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      borderColor: "#ddd",
                      borderWidth: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: theme.sizes.base / 2,
                      padding: 6,
                    }}
                  >
                    <Image
                      style={{ width: 80, height: 80 }}
                      source={{
                        uri: product.image || NO_IMAGE_URL,
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      paddingVertical: theme.sizes.base / 2,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          color: theme.colors.darklight,
                          fontWeight: "500",
                          fontSize: theme.sizes.font - 1,
                        }}
                        numberOfLines={2}
                      >
                        {product.productName}
                      </Text>

                      {product.typeName && (
                        <View
                          style={{
                            marginVertical: theme.sizes.base - 2,
                          }}
                        >
                          <Text
                            style={{
                              color: "rgba(22,24,35,0.44)",
                              textTransform: "capitalize",
                              fontWeight: "500",
                            }}
                          >
                            {product.typeName}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "auto",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.darklight,
                          fontWeight: "500",
                        }}
                      >
                        {formatStringToCurrency(product.unitPrice.toString())}
                      </Text>

                      <Text
                        style={{
                          color: theme.colors.darklight,
                          fontWeight: "500",
                          fontSize: 13,
                        }}
                      >
                        {"x" + product.billDetailQuantity + " " + product.unit}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* total */}
        <View style={{ marginTop: theme.sizes.base, alignItems: "flex-end" }}>
          <Text
            style={{
              fontWeight: "500",
              fontSize: theme.sizes.font - 1,
            }}
          >
            {`${
              item.productBillDetailGet.length
            } mặt hàng: ${formatStringToCurrency(item.totalPrice.toString())}`}
          </Text>
          <Text
            style={{
              color: "rgba(22,24,35,0.64)",
              fontSize: theme.sizes.font - 1,
              fontStyle: "italic",
              marginTop: 2,
            }}
          >
            {"Ngày: " +
              moment(item.startDate).format(FORMAT_DATE_REGEX["DD/MM/YYYY"])}
          </Text>
        </View>

        {/* actions */}
        {(item.status === BILL_STATUS_ENUM.indexOf("Success") ||
          item.status === BILL_STATUS_ENUM.indexOf("Cancel")) && (
          <View
            style={{ alignItems: "flex-end", marginTop: theme.sizes.medium }}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  borderRadius: theme.sizes.base / 2,
                  borderColor: "rgba(22,24,35,0.06)",
                  borderWidth: 1.25,
                  paddingHorizontal: theme.sizes.small,
                  minWidth: 115,
                  paddingVertical: theme.sizes.base / 2,
                  justifyContent: "center",
                  alignItems: "center",
                },
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.02)",
                },
              ]}
            >
              <Text>Mua lại</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default BillItem;
