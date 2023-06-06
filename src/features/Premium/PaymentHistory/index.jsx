import moment from "moment";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlatList, Image, RefreshControl, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import axiosInstance from "~/app/api";
import { SHADOWS } from "~/app/theme";
import { Loading, StatusBarComp } from "~/components";
import { ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { getRandomBetween } from "~/utils/helper";

const PaymentHistory = () => {
  const { userInfo } = useContext(AuthContext);
  const { top } = useSafeAreaInsets();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const renderPaymentItem = ({ item }) => {
    return (
      <View
        style={{
          marginBottom: theme.sizes.large,
          marginHorizontal: theme.sizes.font,
          backgroundColor: "white",
          padding: theme.sizes.small + 2,
          borderRadius: theme.sizes.base,
          ...SHADOWS.light,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: theme.sizes.font + 5,
              color: theme.colors.highlight,
            }}
          >
            {userInfo?.role.toLowerCase() === ROLE.contractor
              ? "200.000đ"
              : "300.000đ"}
          </Text>
          <View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: theme.sizes.font + 5,
              }}
            >
              {"Ngày đăng ký: " + moment(item.paymentDate).format("DD/MM/YYYY")}
            </Text>

            <Text
              style={{
                marginVertical: theme.sizes.base - 2,
                color: "rgba(22,24,35,0.64)",
                fontSize: theme.sizes.medium,
              }}
            >
              {"Ngày hết hạn: " +
                moment(item.expireationDate).format("DD/MM/YYYY")}
            </Text>
            {item.isRefund && (
              <Text
                style={{
                  color: "red",
                  fontSize: theme.sizes.small + 7,
                }}
              >
                Được hoàn tiền
              </Text>
            )}
            {item.extendDate && (
              <Text
                style={{
                  marginVertical: theme.sizes.base / 2,
                  color: theme.colors.highlight,
                  fontSize: theme.sizes.small + 7,
                }}
              >
                {"Được gia hạn đến " +
                  moment(item.extendDate).format("DD/MM/YYYY")}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderListEmpty = () => (
    <View
      style={{
        backgroundColor: "rgba(22,24,35,0.06)",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.sizes.font - 2,
          backgroundColor: "white",
          paddingBottom: theme.sizes.large,
        }}
      >
        <Image
          source={{
            uri: "https://cdni.iconscout.com/illustration/premium/thumb/find-a-doctor-online-1946841-1648368.png",
          }}
          style={{ width: 150, height: 150 }}
          resizeMode="cover"
        />
        <Text
          style={{
            maxWidth: "70%",
            textAlign: "center",
            fontSize: theme.sizes.medium,
            fontWeight: "bold",
          }}
        >
          Bạn chưa kích hoạt tài khoản lần nào
        </Text>
      </View>
    </View>
  );

  const memoizedRenderPaymentItem = useMemo(
    () => renderPaymentItem,
    [payments]
  );

  // call api to filter
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await axiosInstance.get("payment/user");
      setPayments(res.data);

      setLoading(false);
      setRefreshing(false);
    })();
  }, [refreshing]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
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
            Lịch sử kích hoạt
          </Text>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          {loading ? (
            <Loading />
          ) : (
            <FlatList
              data={payments}
              keyExtractor={() => getRandomBetween(1000, 10000)}
              renderItem={memoizedRenderPaymentItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderListEmpty}
              ListFooterComponent={loading ? <Loading /> : null}
              contentContainerStyle={{ paddingTop: theme.sizes.large }}
              refreshControl={
                <RefreshControl
                  tintColor={theme.colors.primary200}
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                  }}
                />
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default PaymentHistory;
