import { Fragment, useContext, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthContext from "~/context/AuthContext";

import { AntDesign, Feather } from "@expo/vector-icons";

import { useTheme } from "react-native-paper";
import { SHADOWS } from "~/app/theme";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as Yup from "yup";

import { ScrollView } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import axiosInstance from "~/app/api";
import { ConfirmDialog } from "~/components";
import {
  API_RESPONSE_CODE,
  BILL_STATUS_ENUM,
  NO_IMAGE_URL,
  ROUTE,
} from "~/constants";
import { CartServices } from "~/services";
import { formatStringToCurrency } from "~/utils/helper";
import RuleModal from "./RuleModal";
const WIDTH = Dimensions.get("window").width;

const MOCK_DATA = [
  {
    storeId: 1,
    storeName: "Bình Minh",
    listProduct: [
      {
        productId: 1,
        productName: "Gạch ốp tường",
        unitPrice: 20000,
        quantity: 30,
        image: "https://picsum.photos/200",
        unit: "cái",
      },
      {
        productId: 2,
        productName: "Gạch lát sàn",
        unitPrice: 30000,
        quantity: 20,
        image: "https://picsum.photos/200",
        unit: "cái",
      },
      {
        productId: 3,
        productName: "Gạch bông",
        unitPrice: 35000,
        quantity: 20,
        image: "https://picsum.photos/200",
        unit: "bao",
      },
      {
        productId: 7,
        productName: "Gạch thẻ",
        unitPrice: 20000,
        quantity: 30,
        image: "https://picsum.photos/200",
        unit: "bao",
      },
      {
        productId: 20,
        productName: "Gạch ống",
        unitPrice: 30000,
        quantity: 20,
        image: "https://picsum.photos/200",
        unit: "ký",
      },
      {
        productId: 21,
        productName: "Gạch nung đỏ",
        unitPrice: 35000,
        quantity: 20,
        image: "https://picsum.photos/200",
        unit: "lít",
      },
    ],
  },
  {
    storeId: 2,
    storeName: "Hoàng Hôn",
    listProduct: [
      {
        productId: 4,
        productName: "Đá xanh",
        unitPrice: 15000,
        quantity: 10,
        image: "https://picsum.photos/200",
        unit: "tấn",
      },
      {
        productId: 5,
        productName: "Xi măng",
        unitPrice: 10000,
        quantity: 20,
        image: "https://picsum.photos/200",
        unit: "cái",
      },
      {
        productId: 6,
        productName: "Cát xây dựng",
        unitPrice: 20000,
        quantity: 10,
        image: "https://picsum.photos/200",
        unit: "cái",
      },
    ],
  },
];

const validationSchema = Yup.object().shape({
  stores: Yup.array().of(
    Yup.object().shape({
      note: Yup.string(),
    })
  ),
});

const CreateBillScreen = ({ navigation, route }) => {
  const { data, cart } = route.params || {};
  const { userInfo } = useContext(AuthContext);
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const _defaultValues = useMemo(
    () =>
      data?.map(() => ({
        note: "",
      })),
    [data]
  );

  const {
    formState: { errors, isValid },
    control,
    watch,
    handleSubmit,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      stores: _defaultValues,
    },
    resolver: yupResolver(validationSchema),
  });

  const { fields } = useFieldArray({
    control,
    name: "stores",
  });

  const renderProductType = (item) => {
    if (item.color && item.size) {
      return `${item.color}, ${item.size}`;
    } else {
      return item.color || item.size || item.other;
    }
  };

  const onSubmit = async (values) => {
    try {
      let requests = [];
      values.stores.map((store, i) => {
        var _totalPrice = data?.[i]?.listProduct?.reduce(
          (accumulator, object) => {
            return accumulator + object.quantity * object.unitPrice;
          },
          0
        );
        const _productBillDetail = data?.[i]?.listProduct?.map((item) => ({
          productId: item.productID,
          quantity: item.quantity,
          price: item.unitPrice,
          typeID: item.typeID,
        }));

        var request = {
          storeID: data?.[i]?.storeId,
          status: BILL_STATUS_ENUM.indexOf("Pending"),
          notes: store.note,
          totalPrice: _totalPrice,
          productBillDetail: _productBillDetail,
        };

        requests.push(request);
      });
      const res = await axiosInstance.post(
        "billController/createBill",
        requests
      );
      if (+res.code === API_RESPONSE_CODE.success) {
        Toast.show({
          type: "success",
          text1: "Tạo đơn hàng thành công",
          position: "bottom",
          visibilityTime: 2500,
        });
        navigation.navigate(ROUTE.cart);
      } else {
        var deleteItem = cart.filter((x) => x.productID == res.data)[0];
        const res2 = await CartServices.deleteCart([{ id: deleteItem.id }]);
        Toast.show({
          type: "error",
          text1: res.message,
          position: "bottom",
          visibilityTime: 2500,
        });
        navigation.navigate(ROUTE.cart);
      }
    } catch (e) {
      console.log(`Create bill error ${e}`);
    }
  };
  let sumQuantity = 0;
  let sumPrice = 0;
  let total = 0;

  return (
    <>
      <RuleModal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Điều khoản mua hàng"
      />
      <ConfirmDialog
        visible={confirm}
        confirmText="Xác nhận"
        onClose={() => setConfirm(false)}
        onConfirm={handleSubmit(onSubmit)}
      >
        <View style={{ padding: theme.sizes.font }}>
          <Text
            style={{
              color: "rgb(22,24,35)",
              fontWeight: "medium",
              marginVertical: 10,
              fontWeight: "500",
            }}
          >
            Bạn có chắc chắn muốn đặt hàng?
          </Text>
        </View>
      </ConfirmDialog>

      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: "#fff" }}
      >
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: top + theme.sizes.small,
            paddingBottom: theme.sizes.font,
            backgroundColor: "white",
            ...SHADOWS.light,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.25 },
              {
                position: "absolute",
                left: theme.sizes.font,
                top: top + theme.sizes.small,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <AntDesign
              name="arrowleft"
              size={24}
              color={theme.colors.highlight}
            />
          </Pressable>

          <View>
            <Text
              style={{
                fontSize: theme.sizes.extraLarge - 4,
                fontWeight: "500",
                letterSpacing: 0.5,
              }}
            >
              Thanh toán
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={10}
          style={{ flex: 1 }}
        >
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: theme.sizes.font,
                paddingVertical: theme.sizes.small,
                alignItems: "flex-start",
              }}
            >
              <Feather
                name="map-pin"
                size={theme.sizes.medium + 1}
                color={theme.colors.highlight}
              />
              <View style={{ marginLeft: 10, marginTop: 1 }}>
                <Text
                  style={{
                    color: theme.colors.black,
                    marginBottom: 10,
                  }}
                >
                  Địa chỉ nhận hàng
                </Text>

                <Text style={{ color: theme.colors.black }}>
                  {userInfo.firstName +
                    " " +
                    userInfo.lastName +
                    " | " +
                    userInfo.phoneNumber}
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.black }}>
                  {userInfo.address}
                </Text>
              </View>
            </View>

            {/* divider */}
            <View
              style={{
                backgroundColor: "rgba(22,24,35,0.06)",
                height: 8,
              }}
            ></View>

            {fields.map((field, index) => {
              sumQuantity = 0;
              sumPrice = 0;
              sumQuantity = data?.[index]?.listProduct.reduce(
                (accumulator, object) => {
                  return accumulator + object.quantity;
                },
                0
              );
              sumPrice = data?.[index].listProduct.reduce(
                (accumulator, object) => {
                  return accumulator + object.quantity * object.unitPrice;
                },
                0
              );
              total += sumPrice;
              return (
                <Fragment key={field.id}>
                  <View>
                    <View
                      style={{
                        paddingHorizontal: theme.sizes.font,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: theme.sizes.small + 2,
                      }}
                    >
                      <Feather
                        name="archive"
                        size={theme.sizes.medium + 1}
                        color={theme.colors.highlight}
                      />
                      <Text
                        style={{
                          fontSize: 14.5,
                          color: theme.colors.black,
                          fontWeight: "bold",
                          marginLeft: 10,
                        }}
                      >
                        {data?.[index]?.storeName}
                      </Text>
                    </View>

                    {/* view listProduct */}
                    <View
                      style={{
                        backgroundColor: "rgba(22,24,35,0.04)",
                      }}
                    >
                      {data?.[index]?.listProduct?.map((product, idx, arr) => {
                        return (
                          <View key={idx}>
                            <View
                              style={{
                                flexDirection: "row",
                                paddingHorizontal: theme.sizes.font,
                                marginVertical: theme.sizes.small + 2,
                                alignItems: "stretch",
                              }}
                            >
                              <Image
                                style={{
                                  height: 70,
                                  width: 70,
                                  borderRadius: 4,
                                  marginRight: 20,
                                }}
                                source={{
                                  uri: product.image || NO_IMAGE_URL,
                                }}
                              />

                              <View
                                style={{
                                  flex: 1,
                                }}
                              >
                                <Text
                                  style={{
                                    color: theme.colors.black,
                                    fontWeight: "500",
                                  }}
                                  numberOfLines={2}
                                >
                                  {product.productName}
                                </Text>

                                {Array.isArray(product.productType) && (
                                  <View
                                    style={{
                                      paddingVertical: 2,
                                      paddingHorizontal: 4,
                                      borderRadius: 2,
                                      marginBottom: 10,
                                      alignSelf: "flex-start",
                                      marginTop: theme.sizes.base / 2,
                                      borderColor: theme.colors.error,
                                      borderWidth: 1,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: theme.colors.error,
                                        fontSize: theme.sizes.font - 2,
                                      }}
                                    >
                                      {"Phân loại: " +
                                        renderProductType(product)}
                                    </Text>
                                  </View>
                                )}

                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: "auto",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: theme.colors.black,
                                      fontSize: theme.sizes.font - 1,
                                    }}
                                  >
                                    {formatStringToCurrency(
                                      product?.unitPrice?.toString()
                                    )}
                                  </Text>

                                  <Text
                                    style={{
                                      color: theme.colors.black,
                                      fontSize: theme.sizes.small + 2,
                                    }}
                                  >
                                    {"x" +
                                      product.quantity +
                                      " " +
                                      product.unit}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            {idx !== arr.length - 1 && (
                              <View
                                style={{
                                  backgroundColor: "rgba(22,24,35,0.06)",
                                  height: 1,
                                  zIndex: -1,
                                }}
                              ></View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                    <View
                      style={{
                        padding: theme.sizes.font,
                        borderBottomColor: "rgba(22,24,35,0.06)",
                        borderBottomWidth: 1,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.sizes.font + 0.5,
                        }}
                      >
                        Ghi chú:
                      </Text>

                      <Controller
                        name={`stores.${index}.note`}
                        control={control}
                        render={({ field: { onBlur, onChange, value } }) => (
                          <>
                            <TextInput
                              autoCapitalize="sentences"
                              autoCorrect
                              placeholder="Ghi chú cho người bán..."
                              textAlign="right"
                              textAlignVertical="top"
                              style={{
                                flex: 1,
                                marginLeft: theme.sizes.small,
                              }}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              inputAccessoryViewID={field.id}
                              showSoftInputOnFocus
                            />

                            {Platform.OS === "ios" && (
                              <InputAccessoryView nativeID={field.id}>
                                <View
                                  style={{
                                    backgroundColor: "#f1f1f1",
                                    padding: theme.sizes.font,
                                    justifyContent: "flex-end",
                                    borderTopColor: "rgba(22,24,35,0.06)",
                                    borderTopWidth: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <View>
                                    <Text
                                      style={{
                                        fontSize: theme.sizes.font - 1,
                                        color: "rgba(22,24,35,0.3)",
                                      }}
                                    >
                                      Ghi chú cho người bán...
                                    </Text>
                                  </View>

                                  <View
                                    style={{
                                      position: "absolute",
                                      right: 15,
                                      top: 13,
                                    }}
                                  >
                                    <Pressable
                                      style={({ pressed }) =>
                                        pressed && {
                                          opacity: 0.25,
                                        }
                                      }
                                      onPress={Keyboard.dismiss}
                                    >
                                      <Text
                                        style={{
                                          fontSize: theme.sizes.medium,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        Xong
                                      </Text>
                                    </Pressable>
                                  </View>
                                </View>
                              </InputAccessoryView>
                            )}
                          </>
                        )}
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: theme.sizes.font,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.sizes.font + 0.5,
                        }}
                      >
                        {"Tổng số tiền (" + sumQuantity + " sản phẩm): "}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.highlight,
                          fontSize: 16,
                          fontWeight: "bold",
                          marginLeft: theme.sizes.small,
                        }}
                      >
                        {formatStringToCurrency(sumPrice?.toString())}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#F1F1F1",
                      height: 10,
                      zIndex: -1,
                    }}
                  ></View>
                </Fragment>
              );
            })}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                paddingHorizontal: theme.sizes.font,
                paddingVertical: theme.sizes.small,
              }}
            >
              <Feather
                name="file-text"
                size={theme.sizes.large}
                color={theme.colors.highlight}
              />
              <Text
                style={{
                  color: theme.colors.black,
                  marginLeft: 10,
                  lineHeight: 14 * 1.35,
                  flex: 1,
                }}
              >
                Nhấn đặt hàng đồng nghĩa với việc bạn đồng ý tuân theo{" "}
                <TouchableOpacity onPress={() => setVisible(true)}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#2067D6",
                      marginTop: 24,
                    }}
                  >
                    Điều khoản mua hàng
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>

            {/* divider */}
            <View
              style={{
                backgroundColor: "rgba(22,24,35,0.06)",
                height: 10,
                zIndex: -1,
                marginBottom: 70,
              }}
            ></View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* footer actions */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#ffffff",
            paddingBottom: bottom,
            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 2.0,
          }}
        >
          <View
            style={{
              alignSelf: "flex-end",
              flexDirection: "row",
              alignItems: "center",
              height: "100%",
            }}
          >
            <View
              style={{
                marginBottom: theme.sizes.small + 2,
                marginTop: theme.sizes.base - 2,
              }}
            >
              <Text
                style={{
                  color: theme.colors.black,
                }}
              >
                Tổng thanh toán
              </Text>
              <Text
                style={{
                  fontSize: theme.sizes.large,
                  color: theme.colors.highlight,
                  textAlign: "right",
                }}
              >
                {formatStringToCurrency(total?.toString())}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary400,
                marginLeft: 10,
                paddingVertical: theme.sizes.font,
                height: "100%",
                justifyContent: "center",
                minWidth: 130,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={
                userInfo?.status === 2
                  ? () => setConfirm(true)
                  : Toast.show({
                      type: "error",
                      text1: "Bạn phải xác thực tài khoản để đặt hàng",
                      position: "bottom",
                      visibilityTime: 2500,
                    })
              }
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium,
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Đặt hàng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default CreateBillScreen;
