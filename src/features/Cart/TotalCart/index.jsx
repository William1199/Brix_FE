import { Feather, Ionicons } from "@expo/vector-icons";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import { Loading } from "~/components";
import { NO_IMAGE_URL, ROUTE } from "~/constants";
import { useDebounce } from "~/hooks";
import { CartServices } from "~/services";
import { formatStringToCurrency, getRandomBetween } from "~/utils/helper";
import EditModal from "../EditModal";
import { Platform } from "react-native";

const TotalCart = ({ setCartLength }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const isFocus = useIsFocused();
  const { defaultItemsChecked } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [itemsActions, setItemsActions] = useState({});
  const [itemsDisableActions, setItemsDisableActions] = useState(false);
  const [itemsChecked, setItemsChecked] = useState({ ...defaultItemsChecked });
  const [itemsQuantity, setItemsQuantity] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState([]);
  const [disabledList, setDisabledList] = useState([]);
  const [pagination, setPagination] = useState();
  const [page, setPage] = useState({ value: 1 });
  const [selectedProduct, setSelectedProduct] = useState({
    show: false,
    data: {},
  });

  const itemsQuantityDebounce = useDebounce(itemsQuantity, 300);

  const itemsRef = useRef({});
  const itemsDisabledRef = useRef({});
  const isUpdatedFirstTime = useRef(true);
  const isAutoSetValue = useRef(false);

  const totalPrice = useMemo(() => {
    if (list.length === 0) return 0;

    return _.toPairs(itemsChecked).reduce((init, [key, value]) => {
      if (!_.isEmpty(value)) {
        return (
          init +
          _.toPairs(value).reduce((init, [key, value]) => {
            if (value) {
              const unitPrice = list.find((x) => x.id === +key)?.unitPrice;
              return init + unitPrice * itemsQuantity[key];
            }

            return init;
          }, 0)
        );
      }

      return init;
    }, 0);
  }, [itemsChecked, itemsQuantity, list]);

  const _groupMap = useMemo(
    () =>
      _.toPairs(_.groupBy(list, "materialStoreID")).map(([key, value]) => {
        const storeProfile = list.find((x) => x.materialStoreID === +key);
        return {
          store: {
            id: storeProfile.materialStoreID,
            name: storeProfile.materialStoreName,
          },
          products: [...value],
        };
      }),
    [list]
  );

  const cartLength = useMemo(
    () =>
      _.toPairs(itemsChecked).reduce((init, [key, value]) => {
        const childEntry = _.toPairs(value).filter(([_, value]) => value);

        return init + childEntry.length;
      }, 0),
    [itemsChecked]
  );

  const fetchData = async () => {
    if (page.value !== 1) setActionsLoading(true);

    const { data, pagination: _pagination } = await CartServices.getList({
      PageNumber: page.value,
    });

    setPagination(_pagination);
    setLoading(false);
    setActionsLoading(false);
    setRefreshing(false);
    isUpdatedFirstTime.current = true;
    isAutoSetValue.current = false;

    const _list = data.filter((x) => !x.isDisable);
    const _disabledList = data.filter((x) => x.isDisable);
    if (refreshing || isFocus) {
      setCartLength(_list.length);
      setList(_list);
      setDisabledList(_disabledList);
      setItemsQuantity(
        _list.reduce((init, cur) => ({ ...init, [cur.id]: cur.quantity }), {})
      );
    } else if (page.value !== 1) {
      setCartLength((prev) => prev + _list.length);
      setList((prev) => [...prev, ..._list]);
      setDisabledList(_disabledList);
      setItemsQuantity((prev) => ({
        ...prev,
        ..._list.reduce(
          (init, cur) => ({ ...init, [cur.id]: cur.quantity }),
          {}
        ),
      }));
    }
  };

  const handleDeleteItem = async (item) => {
    setActionsLoading(true);
    const isSuccess = await CartServices.deleteCart([{ id: item.id }]);
    if (isSuccess) {
      itemsRef.current[item.materialStoreID][item.id].close();
      setCartLength(list.length - 1);
      setList((prev) => prev.filter((x) => x.id !== item.id));
      setActionsLoading(false);
      if (itemsChecked?.[item.materialStoreID]?.[item.id]) {
        setItemsChecked((prev) => {
          const storeChecked = prev[item.materialStoreID];
          return {
            ...prev,
            [item.materialStoreID]: {
              ...storeChecked,
              [item.id]: false,
            },
          };
        });
      }
    }
  };

  const handleDeleteDisableItem = async (item) => {
    setActionsLoading(true);
    const isSuccess = await CartServices.deleteCart([{ id: item.id }]);
    if (isSuccess) {
      itemsDisabledRef.current[item.id].close();
      setCartLength(list.length - 1);
      setDisabledList((prev) => prev.filter((x) => x.id !== item.id));
      setActionsLoading(false);
    }
  };

  const renderRightActions = (item) => {
    return (
      <View style={{ width: 160, flexDirection: "row" }}>
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.55 },
            {
              flex: 1,
              backgroundColor: theme.colors.primary400,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ textAlign: "center", color: "white" }}>
            Sản phẩm tương tự
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.55 },
            {
              flex: 1,
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={() => handleDeleteItem(item)}
        >
          <Text style={{ textAlign: "center", color: "white" }}>Xóa</Text>
        </Pressable>
      </View>
    );
  };

  const renderRightDisableActions = (item) => {
    return (
      <View style={{ width: 160, flexDirection: "row" }}>
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.55 },
            {
              flex: 1,
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={() => handleDeleteDisableItem(item)}
        >
          <Text style={{ textAlign: "center", color: "white" }}>Xóa</Text>
        </Pressable>
      </View>
    );
  };

  const renderProductType = (item) => {
    if (item.colorID && item.sizeID) {
      return `${item.color}, ${item.size}`;
    } else {
      return item.color || item.size || item.other;
    }
  };

  const renderItem = ({ item: { store, products }, index }) => (
    <View
      style={{
        backgroundColor: "white",
        marginBottom:
          index !== _groupMap.length - 1 ? theme.sizes.small + 2 : 0,
      }}
    >
      {/* store */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: theme.sizes.small,
          paddingHorizontal: theme.sizes.font,
          borderBottomColor: "rgba(22,24,35,0.12)",
          borderBottomWidth: 0.5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <BouncyCheckbox
            size={theme.sizes.extraLarge}
            fillColor={theme.colors.highlight}
            disableBuiltInState
            unfillColor="#fff"
            innerIconStyle={{
              borderWidth: 1.5,
              borderRadius: theme.sizes.base / 2,
              borderColor: "rgba(22,24,35,0.34)",
              borderWidth:
                _.toPairs(itemsChecked?.[store.id]).every(
                  ([_, value]) => value
                ) &&
                _.toPairs(itemsChecked?.[store.id]).length === products.length
                  ? 0
                  : 1.5,
            }}
            textStyle={{
              color: "black",
              fontSize: theme.sizes.medium,
              textDecorationLine: "none",
            }}
            iconStyle={{
              borderRadius: theme.sizes.base / 2,
            }}
            onPress={() => {
              setItemsChecked((prev) => {
                const storeChecked = prev?.[store.id];
                const _entry = _.toPairs(storeChecked);
                const isChecked =
                  _entry.every(([_, value]) => value) &&
                  _entry.length === products.length;
                if (isChecked) {
                  return { ...prev, [store.id]: {} };
                } else {
                  return {
                    ...prev,
                    [store.id]: products.reduce(
                      (init, item) => ({
                        ...init,
                        [item.id]: true,
                      }),
                      {}
                    ),
                  };
                }
              });
            }}
            isChecked={
              _.toPairs(itemsChecked?.[store.id]).every(
                ([_, value]) => value
              ) &&
              _.toPairs(itemsChecked?.[store.id]).length === products.length
            }
          />
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.55 },
              {
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            onPress={() => {}}
          >
            <Text
              style={{
                textTransform: "capitalize",
                fontWeight: "700",
                fontSize: theme.sizes.medium - 1,
              }}
            >
              {store.name}
            </Text>
            <Feather
              name="chevron-right"
              size={theme.sizes.large + 2}
              color="rgba(22,24,35,0.65)"
              style={{ marginLeft: theme.sizes.small }}
            />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            pressed && {
              opacity: 0.25,
            },
          ]}
          onPress={() => {
            if (itemsActions[store.id]) {
              if (itemsRef.current[store.id]) {
                const listSwipe = itemsRef.current[store.id];
                _.toPairs(listSwipe).map(([key, value]) => value.close());
              }
              setItemsActions((prev) => ({
                ...prev,
                [store.id]: false,
              }));
            } else {
              if (itemsRef.current[store.id]) {
                const listSwipe = itemsRef.current[store.id] || [];
                _.toPairs(listSwipe).map(([key, value]) => value.openRight());
              }
              setItemsActions((prev) => ({
                ...prev,
                [store.id]: true,
              }));
            }
          }}
        >
          <Text
            style={{
              textTransform: "capitalize",
              color: "rgba(22,24,35,0.64)",
            }}
          >
            {itemsActions[store.id] ? "Xong" : "sửa"}
          </Text>
        </Pressable>
      </View>

      {/* product profile */}
      {products.map((_item, _idx, array) => (
        <Swipeable
          key={_idx}
          ref={(el) => {
            const prev = itemsRef.current[store.id] || [];
            if (prev.length !== array.length)
              itemsRef.current[store.id] = {
                ...prev,
                [_item.id]: el,
              };
          }}
          friction={2}
          rightThreshold={40}
          renderRightActions={() => renderRightActions(_item)}
          containerStyle={{
            marginBottom: _idx !== array.length - 1 ? theme.sizes.small + 2 : 0,
          }}
          onSwipeableWillClose={() => {
            setItemsActions((prev) => ({
              ...prev,
              [store.id]: false,
            }));
          }}
        >
          <View
            style={{
              backgroundColor: "white",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: theme.sizes.medium,
                paddingHorizontal: theme.sizes.font,
              }}
            >
              <BouncyCheckbox
                size={theme.sizes.extraLarge}
                fillColor={theme.colors.highlight}
                disableBuiltInState
                unfillColor="#fff"
                innerIconStyle={{
                  borderWidth: 1.5,
                  borderRadius: theme.sizes.base / 2,
                  borderColor: "rgba(22,24,35,0.34)",
                  borderWidth: itemsChecked?.[store.id]?.[_item.id] ? 0 : 1.5,
                }}
                textStyle={{
                  color: "black",
                  fontSize: theme.sizes.medium,
                  textDecorationLine: "none",
                }}
                iconStyle={{
                  borderRadius: theme.sizes.base / 2,
                }}
                onPress={() => {
                  setItemsChecked((prev) => {
                    const storeChecked = prev?.[store.id];
                    const prevItemChecked = prev?.[store.id]?.[_item.id];
                    return {
                      ...prev,
                      [store.id]: {
                        ...storeChecked,
                        [_item.id]: !prevItemChecked,
                      },
                    };
                  });
                }}
                isChecked={itemsChecked?.[store.id]?.[_item.id]}
              />

              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                }}
              >
                <Image
                  source={{
                    uri: _item.image || NO_IMAGE_URL,
                  }}
                  resizeMode="cover"
                  style={{ width: 80, height: 80 }}
                />

                <View style={{ marginLeft: theme.sizes.font, flex: 1 }}>
                  <Text
                    style={{ fontSize: theme.sizes.medium - 1 }}
                    numberOfLines={1}
                  >
                    {_item.productName}
                  </Text>

                  {Array.isArray(_item.productType) && (
                    <Pressable
                      style={({ pressed }) => [
                        pressed && {
                          opacity: 0.25,
                        },
                        {
                          flexDirection: "row",
                          backgroundColor: "rgba(22,24,35,0.05)",
                          alignSelf: "flex-start",
                          padding: theme.sizes.base / 2,
                          borderRadius: 2,
                          marginVertical: theme.sizes.base,
                        },
                      ]}
                      onPress={() =>
                        setSelectedProduct({ show: true, data: _item })
                      }
                    >
                      <Text
                        style={{
                          color: "rgba(22,24,35,0.54)",
                          fontSize: theme.sizes.font - 2,
                        }}
                      >
                        Phân loại:{" "}
                        {renderProductType(
                          _item.productType.find((x) => x.id === _item.typeID)
                        )}
                      </Text>
                      <Feather
                        name="chevron-down"
                        size={theme.sizes.medium}
                        color="rgba(22,24,35,0.54)"
                        style={{ marginLeft: theme.sizes.base / 4 }}
                      />
                    </Pressable>
                  )}

                  <Text
                    style={{
                      fontSize: theme.sizes.medium,
                      color: theme.colors.highlight,
                      fontWeight: "600",
                    }}
                  >
                    đ
                    {formatStringToCurrency(_item.unitPrice.toString()).replace(
                      "VND",
                      ""
                    )}
                  </Text>

                  {/* action */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        borderWidth: 0.5,
                        borderColor: "rgba(22,24,35,0.12)",
                        marginTop: theme.sizes.small,
                      }}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          pressed && {
                            opacity: 0.25,
                          },
                          {
                            padding: theme.sizes.base / 2,
                            paddingHorizontal: theme.sizes.base - 2,
                          },
                        ]}
                        onPress={() =>
                          setItemsQuantity((prev) => {
                            const prevQuantity = prev[_item.id];
                            if (prevQuantity === 1) {
                              Toast.show({
                                type: "error",
                                text1: `Số lượng sản phẩm ${_item.productName} không thể nhỏ hơn 1`,
                                position: "bottom",
                                visibilityTime: 2500,
                              });
                              return prev;
                            }
                            isUpdatedFirstTime.current = false;
                            isAutoSetValue.current = false;
                            return {
                              ...prev,
                              [_item.id]: prevQuantity - 1,
                            };
                          })
                        }
                      >
                        <Feather
                          name="minus"
                          size={theme.sizes.medium}
                          color="rgba(22,24,35,0.64)"
                        />
                      </Pressable>

                      <View
                        style={{
                          borderRightWidth: 0.5,
                          borderLeftWidth: 0.5,
                          borderColor: "rgba(22,24,35,0.12)",
                          minWidth: theme.sizes.extraLarge * 2,
                        }}
                      >
                        <TextInput
                          style={{
                            paddingVertical: theme.sizes.base / 2,
                            paddingHorizontal: theme.sizes.small,
                            flex: 1,
                          }}
                          contextMenuHidden={true}
                          autoCorrect={false}
                          allowFontScaling={false}
                          textAlign="center"
                          onEndEditing={({ nativeEvent: { text } }) => {
                            setItemsQuantity((prev) => {
                              if (+text >= _item.unitInStock) {
                                Toast.show({
                                  type: "error",
                                  text1: `Số lượng sản phẩm đã đạt mức tối đa`,
                                  position: "bottom",
                                  visibilityTime: 2500,
                                });
                                return {
                                  ...prev,
                                  [_item.id]: _item.unitInStock,
                                };
                              } else if (+text < 1) {
                                Toast.show({
                                  type: "error",
                                  text1: `Số lượng không thể nhỏ hơn 1`,
                                  position: "bottom",
                                  visibilityTime: 2500,
                                });
                                return {
                                  ...prev,
                                  [_item.id]: 1,
                                };
                              }
                              isUpdatedFirstTime.current = false;
                              isAutoSetValue.current = false;
                              return {
                                ...prev,
                                [_item.id]: +text,
                              };
                            });
                          }}
                          defaultValue={`${itemsQuantity[_item.id]}`}
                          keyboardType="number-pad"
                          caretHidden={true}
                          selectTextOnFocus={true}
                        />
                      </View>

                      <Pressable
                        style={({ pressed }) => [
                          pressed && {
                            opacity: 0.25,
                          },
                          {
                            padding: theme.sizes.base / 2,
                            paddingHorizontal: theme.sizes.base - 2,
                          },
                        ]}
                        onPress={() =>
                          setItemsQuantity((prev) => {
                            const prevQuantity = prev[_item.id];
                            if (prevQuantity === _item.unitInStock) {
                              Toast.show({
                                type: "error",
                                text1: `Số lượng sản phẩm ${_item.productName} đã đạt mức tối đa`,
                                position: "bottom",
                                visibilityTime: 2500,
                              });
                              return prev;
                            }
                            isUpdatedFirstTime.current = false;
                            isAutoSetValue.current = false;
                            return {
                              ...prev,
                              [_item.id]: prevQuantity + 1,
                            };
                          })
                        }
                      >
                        <Feather
                          name="plus"
                          size={theme.sizes.medium}
                          color="rgba(22,24,35,0.64)"
                        />
                      </Pressable>
                    </View>

                    {_item.unitInStock <= 20 && (
                      <Text
                        style={{
                          alignSelf: "flex-end",
                          fontSize: theme.sizes.small + 3,
                          color: theme.colors.primary400,
                        }}
                      >
                        Còn {_item.unitInStock} sản phẩm
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Swipeable>
      ))}
    </View>
  );

  useEffect(() => {
    fetchData();

    return () => {
      setItemsChecked({ ...defaultItemsChecked });
    };
  }, [page, isFocus]);

  useEffect(() => {
    if (isAutoSetValue.current) return;
    (async () => {
      if (!_.isEmpty(itemsQuantityDebounce) && !isUpdatedFirstTime.current) {
        const _entry = _.toPairs(itemsQuantityDebounce).map(([key, value]) => {
          const { typeID, productID } = list.find((x) => x.id === +key) || {};
          return {
            productID,
            quantity: value,
            typeID,
          };
        });
        const data = await CartServices.updateCart(_entry);
        if (!!data) {
          setList(data);
          setItemsQuantity(
            data.reduce(
              (init, cur) => ({ ...init, [cur.id]: cur.quantity }),
              {}
            )
          );
          setItemsChecked({});
          isAutoSetValue.current = true;
        }
      }
    })();
  }, [itemsQuantityDebounce]);

  if (loading) return <Loading isModal />;

  return (
    <>
      {actionsLoading && <Loading isModal />}

      {!_.isEmpty(selectedProduct.data) && (
        <EditModal
          visible={selectedProduct.show}
          onClose={() => setSelectedProduct({ show: false, data: {} })}
          data={{
            ...selectedProduct.data,
            quantity: itemsQuantity[selectedProduct.data.id],
          }}
          listData={list
            .filter((x) => x.id !== selectedProduct.data.id)
            .map((x) => ({
              productID: x.productID,
              quantity: x.quantity,
              typeID: x.typeID,
            }))}
          callback={(data) => {
            setSelectedProduct({ show: false, data: {} });
            setList(data);
            setItemsQuantity(
              data.reduce(
                (init, cur) => ({ ...init, [cur.id]: cur.quantity }),
                {}
              )
            );
            isAutoSetValue.current = true;
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" && 130}
        style={{ flex: 1 }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          data={_groupMap}
          renderItem={renderItem}
          keyExtractor={() => getRandomBetween(1000, 10000)}
          ListEmptyComponent={() => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 40,
              }}
            >
              <Image
                source={{
                  uri: "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9bdd8040b334d31946f49e36beaf32db.png",
                }}
                style={{
                  width: 90,
                  height: 90,
                }}
              />

              <Text
                style={{
                  fontWeight: "500",
                  fontSize: theme.sizes.medium,
                  color: "rgba(22,24,35,0.84)",
                  marginTop: theme.sizes.small,
                  marginBottom: theme.sizes.base / 2,
                }}
              >
                "Hông" có gì trong giỏ hết
              </Text>

              <Text style={{ color: "rgba(22,24,35,0.54)" }}>
                Lựa hàng ngay đi
              </Text>

              <Pressable
                style={({ pressed }) => [
                  {
                    borderColor: theme.colors.highlight,
                    borderWidth: 1,
                    borderRadius: 2,
                    paddingHorizontal: theme.sizes.font,
                    paddingVertical: theme.sizes.base,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: theme.sizes.small,
                  },
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.06)",
                  },
                ]}
                onPress={() => navigation.navigate(ROUTE.home)}
              >
                <Text style={{ color: theme.colors.highlight }}>
                  Mua sắm ngay!
                </Text>
              </Pressable>
            </View>
          )}
          ListFooterComponent={() =>
            disabledList.length !== 0 ? (
              <>
                {/* divider */}
                <View
                  style={{ padding: 6, backgroundColor: "rgba(22,24,35,0.06)" }}
                ></View>

                <View
                  style={{
                    backgroundColor: "white",
                    marginBottom: theme.sizes.small + 2,
                  }}
                >
                  {/* store */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: theme.sizes.small,
                      paddingHorizontal: theme.sizes.font,
                      borderBottomColor: "rgba(22,24,35,0.12)",
                      borderBottomWidth: 0.5,
                    }}
                  >
                    {/* title */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="md-document-text-outline"
                        size={22}
                        color="black"
                      />
                      <Text
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "700",
                          fontSize: theme.sizes.medium - 1,
                          marginLeft: theme.sizes.base - 2,
                        }}
                      >
                        sản phẩm không tồn tại
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        pressed && {
                          opacity: 0.25,
                        },
                      ]}
                      onPress={() => {
                        if (itemsDisableActions) {
                          if (!_.isEmpty(itemsDisabledRef.current)) {
                            setItemsDisableActions(false);
                            _.toPairs(itemsDisabledRef.current).map(
                              ([key, _value]) => _value.close()
                            );
                          }
                        } else {
                          if (!_.isEmpty(itemsDisabledRef.current)) {
                            setItemsDisableActions(true);
                            _.toPairs(itemsDisabledRef.current).map(
                              ([key, _value]) => {
                                _value.openRight();
                              }
                            );
                          }
                        }
                      }}
                    >
                      <Text
                        style={{
                          textTransform: "capitalize",
                          color: "rgba(22,24,35,0.64)",
                        }}
                      >
                        {itemsDisableActions ? "Xong" : "sửa"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* product profile */}
                  {disabledList.map((_item, _idx, array) => (
                    <Swipeable
                      key={`disabled item ${_idx}`}
                      ref={(_el) => {
                        const prev = itemsDisabledRef.current || [];
                        if (prev.length !== array.length)
                          itemsDisabledRef.current = {
                            ...prev,
                            [_item.id]: {
                              close: _el.close,
                              openRight: _el.openRight,
                            },
                          };
                      }}
                      friction={2}
                      rightThreshold={40}
                      renderRightActions={() =>
                        renderRightDisableActions(_item)
                      }
                      containerStyle={{
                        marginBottom:
                          _idx !== array.length - 1 ? theme.sizes.small + 2 : 0,
                      }}
                      onSwipeableWillClose={() => {
                        setItemsDisableActions(false);
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "white",
                        }}
                      >
                        <View
                          style={{
                            opacity: 0.25,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: theme.sizes.medium,
                              paddingHorizontal: theme.sizes.font,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                flex: 1,
                              }}
                            >
                              <Image
                                source={{
                                  uri: _item.image || NO_IMAGE_URL,
                                }}
                                resizeMode="cover"
                                style={{ width: 80, height: 80 }}
                              />

                              <View
                                style={{
                                  marginLeft: theme.sizes.font,
                                  flex: 1,
                                }}
                              >
                                <Text
                                  style={{ fontSize: theme.sizes.medium - 1 }}
                                  numberOfLines={1}
                                >
                                  {_item.productName}
                                </Text>
                                {Array.isArray(_item.productType) && (
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      backgroundColor: "rgba(22,24,35,0.05)",
                                      alignSelf: "flex-start",
                                      padding: theme.sizes.base / 2,
                                      borderRadius: 2,
                                      marginVertical: theme.sizes.base,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "rgba(22,24,35,0.54)",
                                        fontSize: theme.sizes.font - 2,
                                      }}
                                    >
                                      Phân loại:{" "}
                                      {renderProductType(
                                        _item.productType.find(
                                          (x) => x.id === _item.typeID
                                        )
                                      )}
                                    </Text>
                                  </View>
                                )}

                                <Text
                                  style={{
                                    fontSize: theme.sizes.medium,
                                    color: theme.colors.highlight,
                                    fontWeight: "600",
                                  }}
                                >
                                  đ
                                  {formatStringToCurrency(
                                    _item.unitPrice.toString()
                                  ).replace("VND", "")}
                                </Text>

                                {/* action */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      borderWidth: 0.5,
                                      borderColor: "rgba(22,24,35,0.12)",
                                      marginTop: theme.sizes.small,
                                    }}
                                  >
                                    <Pressable
                                      style={({ pressed }) => [
                                        pressed && {
                                          opacity: 0.25,
                                        },
                                        {
                                          padding: theme.sizes.base / 2,
                                          paddingHorizontal:
                                            theme.sizes.base - 2,
                                        },
                                      ]}
                                    >
                                      <Feather
                                        name="minus"
                                        size={theme.sizes.medium}
                                        color="rgba(22,24,35,0.64)"
                                      />
                                    </Pressable>

                                    <View
                                      style={{
                                        padding: theme.sizes.base / 2,
                                        paddingHorizontal: theme.sizes.large,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRightWidth: 0.5,
                                        borderLeftWidth: 0.5,
                                        borderColor: "rgba(22,24,35,0.12)",
                                      }}
                                    >
                                      <Text>{_item.quantity}</Text>
                                    </View>

                                    <Pressable
                                      style={({ pressed }) => [
                                        pressed && {
                                          opacity: 0.25,
                                        },
                                        {
                                          padding: theme.sizes.base / 2,
                                          paddingHorizontal:
                                            theme.sizes.base - 2,
                                        },
                                      ]}
                                    >
                                      <Feather
                                        name="plus"
                                        size={theme.sizes.medium}
                                        color="rgba(22,24,35,0.64)"
                                      />
                                    </Pressable>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Swipeable>
                  ))}
                </View>
              </>
            ) : null
          }
          refreshControl={
            <RefreshControl
              tintColor={theme.colors.primary200}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPage({ value: 1 });
              }}
            />
          }
          onEndReachedThreshold={0}
          onEndReached={() =>
            pagination?.hasNext &&
            setPage((prev) => ({ value: prev.value + 1 }))
          }
        />
      </KeyboardAvoidingView>

      {/* footer */}
      {_groupMap.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            borderTopColor: "rgba(22,24,35,0.12)",
            borderTopWidth: 0.5,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.sizes.font,
            }}
          >
            <BouncyCheckbox
              size={theme.sizes.extraLarge}
              fillColor={theme.colors.highlight}
              disableBuiltInState
              unfillColor="#fff"
              innerIconStyle={{
                borderWidth: 1.5,
                borderRadius: theme.sizes.base / 2,
                borderColor: "rgba(22,24,35,0.34)",
                borderWidth: cartLength === list.length ? 0 : 1.5,
              }}
              textStyle={{
                color: "black",
                fontSize: theme.sizes.medium,
                textDecorationLine: "none",
              }}
              iconStyle={{
                borderRadius: theme.sizes.base / 2,
              }}
              onPress={() => {
                if (cartLength !== list.length) {
                  setItemsChecked(
                    _groupMap.reduce(
                      (init, { store, products }) => ({
                        ...init,
                        [store.id]: products.reduce(
                          (init, cur) => ({
                            ...init,
                            [cur.id]: true,
                          }),
                          {}
                        ),
                      }),
                      {}
                    )
                  );
                } else {
                  setItemsChecked({});
                }
              }}
              isChecked={cartLength === list.length}
            />
            <Text style={{ marginLeft: -4, fontWeight: "500" }}>Tất cả</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <View
              style={{
                flexWrap: "wrap",
                flexDirection: "row",
                maxWidth: "52%",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: theme.sizes.font - 1 }}>
                Tổng thanh toán
              </Text>
              <Text
                style={{
                  color: theme.colors.highlight,
                  fontWeight: "bold",
                  fontSize: theme.sizes.medium,
                  marginLeft: theme.sizes.base / 2,
                }}
              >
                đ
                {formatStringToCurrency(totalPrice.toString()).replace(
                  "VND",
                  ""
                )}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
                {
                  paddingHorizontal: theme.sizes.font,
                  minHeight: 60,
                  backgroundColor: theme.colors.primary400,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: theme.sizes.font,
                },
              ]}
              onPress={() => {
                const data = _.toPairs(itemsChecked).reduce(
                  (init, [storeID, value]) => {
                    const { store, products = [] } =
                      _groupMap.find((x) => x.store.id === +storeID) || {};
                    const listProduct = _.toPairs(value).reduce(
                      (init, [id, isChecked]) => {
                        if (isChecked) {
                          const defaultProducts = products.find(
                            (x) => x.id === +id
                          );

                          return [
                            ...init,
                            {
                              ...defaultProducts,
                              quantity: itemsQuantityDebounce[id],
                            },
                          ];
                        }
                        return init;
                      },
                      []
                    );

                    return [
                      ...init,
                      { storeId: store.id, storeName: store.name, listProduct },
                    ];
                  },
                  []
                );
                navigation.navigate(ROUTE.createBill, {
                  data,
                  cart: list,
                });
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.medium - 1,
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Mua hàng ({cartLength})
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

export default TotalCart;
