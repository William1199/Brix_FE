import { Feather, Ionicons } from "@expo/vector-icons";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { NO_IMAGE_URL, PRODUCT_TYPE_ENUM } from "~/constants";
import { CartServices } from "~/services";
import { formatStringToCurrency } from "~/utils/helper";

const ProductTypeBlock = ({
  data,
  title,
  isEnabledList,
  selectedItem,
  onPress,
}) => {
  const theme = useTheme();
  if (data.length === 0) return;

  const handleCheckEnabled = (value) =>
    isEnabledList.some((x) => x.value === value);

  return (
    <View
      style={{
        padding: theme.sizes.small,
        paddingVertical: theme.sizes.font,
        borderBottomColor: "rgba(22,24,35,0.06)",
        borderBottomWidth: 1,
      }}
    >
      <Text
        style={{
          color: "rgba(22,24,35,0.54)",
          fontWeight: "500",
          fontSize: theme.sizes.font - 2,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {data.map((item, idx) => (
          <Pressable
            key={idx}
            style={[
              {
                paddingVertical: theme.sizes.base,
                paddingHorizontal: theme.sizes.medium,
                borderColor:
                  handleCheckEnabled(item.value) && selectedItem === item.value
                    ? "rgba(254, 44, 85, 1)"
                    : "transparent",
                borderWidth: 1,
                borderRadius: theme.sizes.base / 2,
                marginRight: theme.sizes.base - 2,
                marginTop: theme.sizes.base - 2,
                backgroundColor:
                  selectedItem === item.value ? "white" : "rgba(22,24,35,0.06)",
                overflow: "hidden",
              },
            ]}
            onPress={() => onPress(item.value)}
          >
            {handleCheckEnabled(item.value) && selectedItem === item.value && (
              <>
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderRightWidth: 18,
                    borderTopWidth: 18,
                    borderRightColor: "transparent",
                    borderTopColor: "rgba(254, 44, 85, 1)",
                    position: "absolute",
                    top: -1,
                    left: 0,
                    borderTopStartRadius: theme.sizes.base / 2,
                  }}
                ></View>

                <Feather
                  name="check"
                  size={10}
                  color="white"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0.5,
                  }}
                />
              </>
            )}

            <Text
              style={{
                textAlign: "center",
                color: handleCheckEnabled(item.value)
                  ? selectedItem === item.value
                    ? "rgba(254, 44, 85, 1)"
                    : "rgb(22,24,35)"
                  : "rgba(22,24,35,0.22)",
                fontSize: theme.sizes.font - 2,
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const AddToCartModal = ({ visible, onClose, data = {} }) => {
  const theme = useTheme();
  const [quantity, setQuantity] = useState({ value: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState({
    color: undefined,
    size: undefined,
    other: undefined,
  });

  const { bottom } = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const typeLabel = useMemo(
    () => ({
      colors:
        _.toPairs(_.keyBy(data.productType, (o) => o.color))
          .map(([key, value]) => ({ label: key, value: value.colorID }))
          .filter((x) => x.label !== "null" && x.value !== "null") || [],
      sizes:
        _.toPairs(_.keyBy(data.productType, (o) => o.size))
          .map(([key, value]) => ({ label: key, value: value.sizeID }))
          .filter((x) => x.label !== "null" && x.value !== "null") || [],
      others:
        _.toPairs(_.keyBy(data.productType, (o) => o.other) || {})
          .map(([key, value]) => ({ label: key, value: value.otherID }))
          .filter((x) => x.label !== "null" && x.value !== "null") || [],
    }),
    [data.productType]
  );

  const handleDynamicCase = useCallback(() => {
    if (typeLabel.colors.length > 0 && typeLabel.sizes.length > 0)
      return PRODUCT_TYPE_ENUM["color-size"];
    else if (
      typeLabel.colors.length === 0 &&
      typeLabel.sizes.length === 0 &&
      typeLabel.others.length === 0
    )
      return PRODUCT_TYPE_ENUM.none;
    else return PRODUCT_TYPE_ENUM.others;
  }, [typeLabel]);

  const isEnabledList = useMemo(() => {
    const _case = handleDynamicCase();

    let initialValue = {
      ...typeLabel,
    };
    switch (_case) {
      case PRODUCT_TYPE_ENUM["color-size"]: {
        if (selectedType.color) {
          const _list = data.productType.filter(
            (x) =>
              x.colorID === selectedType.color && quantity.value <= x.quantity
          );
          initialValue = {
            ...initialValue,
            sizes: _.toPairs(_.keyBy(_list, (o) => o.size))
              .map(([key, value]) => ({ label: key, value: value.sizeID }))
              .filter((x) => x.label !== "null" && x.value !== "null"),
          };
        }

        if (selectedType.size) {
          const _list = data.productType.filter(
            (x) =>
              x.sizeID === selectedType.size && quantity.value <= x.quantity
          );

          initialValue = {
            ...initialValue,
            colors: _.toPairs(_.keyBy(_list, (o) => o.color))
              .map(([key, value]) => ({ label: key, value: value.colorID }))
              .filter((x) => x.label !== "null" && x.value !== "null"),
          };
        }
        break;
      }

      case PRODUCT_TYPE_ENUM.others: {
        if (selectedType.size) {
          initialValue = {
            ...initialValue,
            sizes: data.productType
              .filter((x) => quantity.value <= x.quantity)
              .map((x) => ({ label: x.size, value: x.sizeID })),
          };
        } else if (selectedType.other) {
          initialValue = {
            ...initialValue,
            others: data.productType
              .filter((x) => quantity.value <= x.quantity)
              .map((x) => ({ label: x.other, value: x.otherID })),
          };
        } else {
          initialValue = {
            ...initialValue,
            colors: data.productType
              .filter((x) => quantity.value <= x.quantity)
              .map((x) => ({ label: x.color, value: x.colorID })),
          };
        }
        break;
      }
    }

    return initialValue;
  }, [quantity, data.productType, selectedType, typeLabel]);

  const selectedUnitInStock = useMemo(() => {
    const _case = handleDynamicCase();
    switch (_case) {
      case PRODUCT_TYPE_ENUM["color-size"]: {
        if (selectedType.color && selectedType.size) {
          return (
            data.productType.find(
              (x) =>
                x.sizeID === selectedType.size &&
                x.colorID === selectedType.color
            )?.quantity || "0"
          );
        }
        return data.unitInStock;
      }
      case PRODUCT_TYPE_ENUM.none: {
        return data.unitInStock;
      }

      default: {
        if (selectedType.size)
          return (
            data.productType.find((x) => x.sizeID === selectedType.size)
              ?.quantity || "0"
          );
        else if (selectedType.other)
          return (
            data.productType.find((x) => x.otherID === selectedType.other)
              ?.quantity || "0"
          );
        else if (selectedType.color)
          return (
            data.productType.find((x) => x.colorID === selectedType.color)
              ?.quantity || "0"
          );

        return data.unitInStock;
      }
    }
  }, [data.productType, selectedType, typeLabel]);

  const actionsEnabled = useMemo(() => {
    const _case = handleDynamicCase();
    switch (_case) {
      case PRODUCT_TYPE_ENUM["color-size"]: {
        return selectedType.color && selectedType.size ? true : false;
      }
      case PRODUCT_TYPE_ENUM.none: {
        return true;
      }
      default: {
        return (
          !!selectedType.color || !!selectedType.other || !!selectedType.size
        );
      }
    }
  }, [selectedType]);

  const handleAddToCart = async () => {
    setLoading(true);

    const _case = handleDynamicCase();
    let typeID;
    switch (_case) {
      case PRODUCT_TYPE_ENUM["color-size"]: {
        typeID = data.productType.find(
          (x) =>
            x.sizeID === selectedType.size && x.colorID === selectedType.color
        ).id;
        break;
      }

      case PRODUCT_TYPE_ENUM.others: {
        if (selectedType.size) {
          typeID = data.productType.find(
            (x) => x.sizeID === selectedType.size
          ).id;
        } else if (selectedType.other) {
          typeID = data.productType.find(
            (x) => x.otherID === selectedType.other
          ).id;
        } else {
          typeID = data.productType.find(
            (x) => x.colorID === selectedType.color
          ).id;
        }
        break;
      }
    }

    const { isSuccess, message } = await CartServices.addCart({
      productID: data.id,
      quantity: quantity.value,
      typeID,
    });

    if (isSuccess) {
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Thêm sản phẩm thành công !",
          position: "bottom",
          visibilityTime: 2500,
        });
      }, 500);
    } else {
      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: message,
          position: "bottom",
          visibilityTime: 2500,
        });
      }, 500);
    }
    onClose();
    setLoading(false);
  };

  useEffect(() => {
    setQuantity({ value: 1 });
  }, [selectedType]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 1,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 200,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
      Animated.spring(opacity, {
        toValue: 0,
        tension: 100,
        friction: 30,
        delay: 50,
        useNativeDriver: true,
      }).start();
      setSelectedType({
        color: undefined,
        size: undefined,
        other: undefined,
      });
      setQuantity({ value: 1 });
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.27)",
            zIndex: -1,
          }}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior="position">
          <ScrollView>
            <Animated.View
              style={{
                backgroundColor: "white",
                transform: [{ translateY: translateY }],
                opacity: opacity,
                borderTopLeftRadius: theme.sizes.base / 2,
                borderTopRightRadius: theme.sizes.base / 2,
              }}
            >
              {loading && (
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.67)",
                    padding: theme.sizes.small,
                    position: "absolute",
                    top: theme.sizes.extraLarge,
                    left: "50%",
                    transform: [{ translateX: -18 }],
                  }}
                >
                  <ActivityIndicator size={24} color="white" />
                </View>
              )}

              <View
                style={{
                  width: 25,
                  height: 25,
                  position: "absolute",
                  right: theme.sizes.font,
                  top: theme.sizes.small,
                  zIndex: 1,
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      backgroundColor: "rgba(22,24,35,0.06)",
                    },
                    { flex: 1 },
                  ]}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color="black" />
                </Pressable>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: theme.sizes.font,
                  borderBottomColor: "rgba(22,24,35,0.12)",
                  borderBottomWidth: 1,
                  marginHorizontal: theme.sizes.small,
                }}
              >
                <Image
                  source={{ uri: data.image || NO_IMAGE_URL }}
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: theme.sizes.base / 2,
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    marginLeft: theme.sizes.font,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      fontSize: theme.sizes.medium,
                      fontWeight: "500",
                    }}
                  >
                    đ
                    {formatStringToCurrency(data.unitPrice.toString()).replace(
                      "VND",
                      ""
                    )}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(22,24,35,0.44)",
                      fontWeight: "500",
                      marginTop: theme.sizes.base / 2,
                    }}
                  >
                    Kho: {selectedUnitInStock}
                  </Text>
                </View>
              </View>

              {/* product type */}
              <View>
                <ProductTypeBlock
                  data={typeLabel.colors}
                  title="Màu sắc"
                  isEnabledList={isEnabledList.colors}
                  selectedItem={selectedType.color}
                  onPress={(value) => {
                    if (isEnabledList.colors.some((x) => x.value === value)) {
                      setSelectedType((prev) => {
                        if (prev.color === value)
                          return {
                            ...prev,
                            color: undefined,
                          };

                        return {
                          ...prev,
                          color: value,
                        };
                      });
                    }
                  }}
                />

                <ProductTypeBlock
                  data={typeLabel.sizes}
                  title="Size"
                  isEnabledList={isEnabledList.sizes}
                  selectedItem={selectedType.size}
                  onPress={(value) => {
                    if (isEnabledList.sizes.some((x) => x.value === value)) {
                      setSelectedType((prev) => {
                        if (prev.size === value)
                          return {
                            ...prev,
                            size: undefined,
                          };

                        return {
                          ...prev,
                          size: value,
                        };
                      });
                    }
                  }}
                />

                <ProductTypeBlock
                  data={typeLabel.others}
                  title="Khác"
                  isEnabledList={isEnabledList.others}
                  selectedItem={selectedType.other}
                  onPress={(value) => {
                    if (isEnabledList.others.some((x) => x.value === value)) {
                      setSelectedType((prev) => {
                        if (prev.other === value)
                          return {
                            ...prev,
                            other: undefined,
                          };

                        return {
                          ...prev,
                          other: value,
                        };
                      });
                    }
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: theme.sizes.small,
                  paddingHorizontal: theme.sizes.small,
                  paddingBottom: theme.sizes.extraLarge * 1.25,
                }}
              >
                <Text
                  style={{
                    color: "rgba(22,24,35,0.54)",
                    fontWeight: "500",
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  Số lượng
                </Text>

                {/* action */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    minHeight: 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      borderWidth: 0.5,
                      borderColor: "rgba(22,24,35,0.12)",
                    }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        pressed &&
                          quantity.value > 1 && {
                            opacity: 0.25,
                          },
                        {
                          padding: theme.sizes.base / 2,
                          paddingHorizontal: theme.sizes.base - 2,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                      onPress={
                        quantity.value > 1
                          ? () =>
                              setQuantity(({ value }) => ({ value: value - 1 }))
                          : () => {}
                      }
                    >
                      <Feather
                        name="minus"
                        size={theme.sizes.medium}
                        color={
                          quantity.value > 1
                            ? "rgba(22,24,35,0.64)"
                            : "rgba(22,24,35,0.12)"
                        }
                      />
                    </Pressable>

                    <View
                      style={{
                        minWidth: theme.sizes.extraLarge * 2,
                        borderRightWidth: 0.5,
                        borderLeftWidth: 0.5,
                        borderColor: "rgba(22,24,35,0.12)",
                      }}
                    >
                      <TextInput
                        style={{
                          paddingVertical: theme.sizes.base / 2,
                          paddingHorizontal: theme.sizes.small,
                          flex: 1,
                          color: "rgba(254, 44, 85, 1)",
                          opacity: actionsEnabled ? 1 : 0.25,
                        }}
                        editable={actionsEnabled}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        allowFontScaling={false}
                        textAlign="center"
                        onEndEditing={({ nativeEvent: { text } }) => {
                          if (!actionsEnabled) return;
                          const canIncrease =
                            data.productType.length > 0
                              ? +text <= selectedUnitInStock && +text > 1
                              : +text <= data.unitInStock && +text > 1;

                          if (canIncrease) {
                            setQuantity({ value: +text });
                          } else if (+text < 1) {
                            Toast.show({
                              type: "error",
                              text1: `Số lượng không thể nhỏ hơn 1`,
                              position: "top",
                              visibilityTime: 2500,
                            });
                            setQuantity({ value: 1 });
                          } else if (
                            data.productType.length > 0
                              ? +text > selectedUnitInStock
                              : +text > data.unitInStock
                          ) {
                            Toast.show({
                              type: "error",
                              text1: `Số lượng sản phẩm đã đạt mức tối đa`,
                              position: "top",
                              visibilityTime: 2500,
                            });
                            setQuantity({
                              value:
                                data.productType.length > 0
                                  ? selectedUnitInStock
                                  : data.unitInStock,
                            });
                          }
                        }}
                        defaultValue={`${quantity.value}`}
                        keyboardType="number-pad"
                        caretHidden={true}
                        selectTextOnFocus={true}
                      />
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        pressed &&
                          actionsEnabled &&
                          (data.productType.length > 0
                            ? quantity.value < selectedUnitInStock && {
                                opacity: 0.25,
                              }
                            : quantity.value < data.unitInStock && {
                                opacity: 0.25,
                              }),
                        {
                          padding: theme.sizes.base / 2,
                          paddingHorizontal: theme.sizes.base - 2,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => {
                        if (!actionsEnabled) return;
                        const canIncrease =
                          data.productType.length > 0
                            ? quantity.value < selectedUnitInStock
                            : quantity.value < data.unitInStock;

                        if (canIncrease) {
                          setQuantity(({ value }) => ({ value: value + 1 }));
                        }
                      }}
                    >
                      <Feather
                        name="plus"
                        size={theme.sizes.medium}
                        color={
                          actionsEnabled
                            ? data.productType.length > 0
                              ? quantity.value < selectedUnitInStock
                                ? "rgba(22,24,35,0.64)"
                                : "rgba(22,24,35,0.12)"
                              : quantity.value < data.unitInStock
                              ? "rgba(22,24,35,0.64)"
                              : "rgba(22,24,35,0.12)"
                            : "rgba(22,24,35,0.12)"
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: "white",
                  paddingVertical: theme.sizes.small,
                  paddingHorizontal: theme.sizes.medium,
                  borderTopColor: "rgba(22,24,35,0.06)",
                  borderTopWidth: 1,
                  paddingBottom: bottom === 0 ? theme.sizes.small : bottom,
                }}
              >
                <View
                  style={{
                    backgroundColor: !actionsEnabled
                      ? "rgba(22,24,35,0.12)"
                      : theme.colors.primary400,
                    borderRadius: theme.sizes.base / 2,
                    overflow: "hidden",
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      pressed &&
                        actionsEnabled && {
                          backgroundColor: "rgba(22,24,35,0.12)",
                        },
                      {
                        padding: theme.sizes.font - 1,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                    onPress={!actionsEnabled ? () => {} : handleAddToCart}
                  >
                    <Text
                      style={{
                        color: !actionsEnabled
                          ? "rgba(22,24,35,0.34)"
                          : "white",
                        fontWeight: "500",
                        fontSize: theme.sizes.medium,
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddToCartModal;
