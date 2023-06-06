import { Feather, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { DropdownField, InputField } from "~/components/Form-field";
import { hideTabBar, isCloseToBottom, showTabBar } from "~/utils/helper";

const MOCK_DATA = {
  default_value: [{ productId: "", quantity: "" }],
};

const ProductForm = ({
  step,
  onBack,
  onNextStep,
  isReset,
  productList = [],
  currentPosition,
}) => {
  const { default_value } = MOCK_DATA;
  const theme = useTheme();
  const {
    formState: { errors },
    watch,
    control,
    reset,
    handleSubmit,
  } = useForm({
    defaultValues: {
      products: default_value,
    },
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: "products",
  });
  const products = watch("products");
  const height = useBottomTabBarHeight();
  const navigation = useNavigation();

  const [isEdit, setIsEdit] = useState(false);
  const [offset, setOffset] = useState(0);
  const [bottomTabBarHeight] = useState(height);

  const scrollRef = useRef();

  const onSubmit = (data) => {
    const _products = data?.products?.filter((x) => x.productId && x.quantity);
    onNextStep({ productPost: _products });
  };

  useEffect(() => {
    if (isReset) {
      reset({ products: default_value });
    }
  }, [isReset]);

  useLayoutEffect(() => {
    if (currentPosition === 2) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      setOffset(0);
    }
  }, [currentPosition]);

  const renderField = () =>
    fields.map((field, index) => {
      return (
        <View
          key={field.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.sizes.base / 2,
            zIndex: fields.length - index + 1,
          }}
        >
          <View style={{ flex: 2, zIndex: index + 1 }}>
            <DropdownField
              name={`products.${index}.productId`}
              control={control}
              errors={errors}
              label="Chọn các vật liệu của dự án"
              placeholder="Chọn các sản phẩm"
              listData={productList}
              showError={false}
              schema={{
                label: "name",
                value: "id",
              }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              searchable={false}
              style={{
                backgroundColor: "transparent",
                borderColor: "rgba(22,24,35,0.12)",
                borderWidth: 1,
              }}
              placeholderStyle={{
                color: "rgba(22,24,35,0.34)",
              }}
            />

            {errors?.products && errors?.products[index]?.productId && (
              <Text
                style={{
                  color: theme.colors.error,
                  zIndex: -1,
                  fontSize: theme.sizes.font - 2,
                  marginTop: -theme.sizes.base / 2,
                }}
              >
                {errors?.products[index]?.productId?.message}
              </Text>
            )}
          </View>

          <View style={{ flex: 1, marginLeft: theme.sizes.small }}>
            <InputField
              name={`products.${index}.quantity`}
              control={control}
              errors={errors}
              label="Số lượng"
              keyboardType="number-pad"
              showError={false}
              inputStyle={{
                borderRadius: theme.sizes.base / 2,
                paddingVertical: theme.sizes.small + 2,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: errors.title
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
              }}
            />

            {errors?.products && errors?.products[index]?.quantity && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: theme.sizes.font - 2,
                  marginTop: -theme.sizes.base / 2,
                }}
              >
                {errors?.products[index]?.quantity?.message}
              </Text>
            )}
          </View>

          {isEdit && (
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  paddingHorizontal: theme.sizes.base / 2,
                  position: "absolute",
                  right: -(theme.sizes.base / 2),
                  top: 0,
                },
              ]}
              onPress={() => {
                if (products?.length === 2) setIsEdit(false);
                remove(index);
              }}
            >
              <Ionicons
                name="ios-remove-circle-outline"
                size={theme.sizes.large + 2}
                color={theme.colors.error}
              />
            </Pressable>
          )}
        </View>
      );
    });

  return (
    <View
      style={{
        flex: 1,
        paddingTop: theme.sizes.large,
        paddingHorizontal: theme.sizes.font,
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={fields.length > 3 ? "position" : "padding"}
        enabled
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          scrollEventThrottle={16}
          onScroll={({ nativeEvent }) => {
            const currentOffset = nativeEvent.contentOffset.y;
            let direction = currentOffset >= offset ? "down" : "up";

            if (isCloseToBottom(nativeEvent) && currentOffset <= 0) return;

            // change when beside top or bottom
            if (isCloseToBottom(nativeEvent) && offset > 0) {
              hideTabBar({ navigation });
              return;
            } else if (currentOffset <= 0) {
              showTabBar({
                navigation,
                theme,
                height: bottomTabBarHeight,
              });
              return;
            }

            // change when scroll
            if (direction === "down" && offset > 0) {
              hideTabBar({ navigation });
            } else {
              showTabBar({
                navigation,
                theme,
                height: bottomTabBarHeight,
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
              Vật liệu cần thiết
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

          <View style={{ marginTop: theme.sizes.font }}>
            {renderField()}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                zIndex: -1,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                  {
                    paddingRight: theme.sizes.base / 2,
                  },
                ]}
                onPress={() => append(default_value)}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={theme.sizes.large + 2}
                />
              </Pressable>

              {products?.length > 1 && (
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      opacity: 0.25,
                    },
                    {
                      paddingHorizontal: theme.sizes.base / 2,
                    },
                  ]}
                  onPress={() => setIsEdit(!isEdit)}
                >
                  <Feather
                    name={isEdit ? "check" : "edit-3"}
                    style={{ alignSelf: "flex-end" }}
                    size={isEdit ? theme.sizes.large + 2 : theme.sizes.large}
                    color="rgba(22,24,35,0.64)"
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* footer */}
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              marginTop: theme.sizes.large,
              zIndex: -1,
            }}
          >
            <Pressable
              style={({ pressed }) =>
                pressed && {
                  opacity: 0.75,
                }
              }
              onPress={onBack}
            >
              <View
                style={{
                  paddingVertical: theme.sizes.base,
                  backgroundColor: theme.colors.primary300,
                  minWidth: 110,
                  minHeight: 28,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: theme.colors.textColor300,
                    fontWeight: "bold",
                  }}
                >
                  Trở lại
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) =>
                pressed && {
                  opacity: 0.75,
                }
              }
              onPress={handleSubmit(onSubmit)}
            >
              <View
                style={{
                  paddingVertical: theme.sizes.base,
                  backgroundColor: theme.colors.primary300,
                  minWidth: 110,
                  minHeight: 28,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: theme.colors.textColor300,
                    fontWeight: "bold",
                  }}
                >
                  Tiếp
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProductForm;
