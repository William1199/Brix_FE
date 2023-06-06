import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as Yup from "yup";

import { Feather } from "@expo/vector-icons";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useTheme } from "react-native-paper";
import { ModalView } from "~/components";
import { formatStringToCurrency } from "~/utils/helper";

const validationSchema = Yup.object().shape({
  small: Yup.array().of(
    Yup.object().shape({
      list: Yup.array().min(1, "Mỗi đợt có ít nhất 1 sản phẩm"),
    })
  ),
});

const SmallBillForm = ({
  months,
  listProduct,
  storeId,
  percent,
  onPress = () => {},
  setter = () => {},
}) => {
  const theme = useTheme();
  const defaultData = [];
  listProduct.map((product) => {
    defaultData.push({
      key: product.productID,
      value:
        product.productName +
        " " +
        formatStringToCurrency(
          (product.quantity * product.unitPrice).toString()
        ),
      disabled: false,
    });
  });
  let _defaultValues = [];
  switch (months) {
    case 3:
      _defaultValues.push({ list: [] }, { list: [] }, { list: [] });
      break;
    case 6:
      _defaultValues.push(
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] }
      );
      break;
    case 9:
      _defaultValues.push(
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] }
      );
      break;
    default:
      _defaultValues.push(
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] },
        { list: [] }
      );
  }
  const {
    formState: { errors, isValid },
    control,
    watch,
    handleSubmit,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      small: _defaultValues,
    },
    resolver: yupResolver(validationSchema),
  });
  const watchSmall = watch("small");

  const { fields } = useFieldArray({
    control,
    name: "small",
  });
  const [data, setData] = useState(defaultData);
  const [visible, setVisible] = useState(true);
  const handleSelect = (product) => {
    const res = data.filter((x) => x.key == product.productID);
    if (res.disabled) {
      const newArray = data.map((item) => {
        if (item.key === product.productID) {
          return { ...item, disabled: false };
        } else {
          return item;
        }
      });

      setData(newArray);
    } else {
      const newArray = data.map((item) => {
        if (item.key === product.productID) {
          return { ...item, disabled: true };
        } else {
          return item;
        }
      });
      setData(newArray);
    }
  };

  const handleClear = () => {
    setData(defaultData);
    reset({
      small: _defaultValues,
    });
  };

  const handleCancel = () => {
    setVisible(false);
    setter(null);
  };
  const onSubmit = async (data) => {
    try {
      setVisible(false);
      onPress({ storeId: storeId, small: data.small });
    } catch (e) {
      console.log(`Create small bill error ${e}`);
    }
  };
  const smallOne = listProduct.filter((x) =>
    watchSmall[0]?.list?.includes(x.productID)
  );

  const sumOne = smallOne.reduce((accumulator, object) => {
    return accumulator + object.quantity * object.unitPrice;
  }, 0);
  return (
    <>
      <ModalView visible={visible} title="Chia đơn hàng theo đợt">
        <ScrollView
          alwaysBounceVertical={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {fields.map((field, index) => {
            return (
              <View
                key={field.id}
                style={{
                  paddingHorizontal: 10,
                  marginVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "rgb(22,24,35)",
                      marginVertical: 5,
                    }}
                  >
                    {"Đợt " + (index + 1)}
                  </Text>
                  {index == 0 && (
                    <TouchableOpacity onPress={() => handleClear()}>
                      <Feather
                        name="refresh-ccw"
                        size="24"
                        color={theme.colors.highlight}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <Controller
                  name={`small.${index}.list`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MultipleSelectList
                      notFoundText="Không tìm thấy sản phẩm"
                      placeholder="Chọn sản phẩm"
                      searchPlaceholder="Tìm sản phẩm"
                      setSelected={(callback) => {
                        onChange(callback(value));
                      }}
                      data={data}
                      save="key"
                      onSelect={() =>
                        handleSelect(
                          listProduct.filter(
                            (x) => x.productID == value[value.length - 1]
                          )[0]
                        )
                      }
                    />
                  )}
                />
                {errors?.small && errors?.small[index]?.list && (
                  <Text
                    style={{
                      marginVertical: 10,
                      color: theme.colors.error,
                    }}
                  >
                    {errors?.small[index]?.list?.message}
                  </Text>
                )}
                {watchSmall[index].list.length > 0 &&
                  index == 0 &&
                  sumOne < percent && (
                    <Text
                      style={{
                        marginTop: 10,
                        color: theme.colors.error,
                      }}
                    >
                      {"Giá trị đơn hàng đợt đầu tiên tối thiểu 30% tổng hóa đơn: " +
                        percent +
                        " VNĐ"}
                    </Text>
                  )}
              </View>
            );
          })}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginVertical: 25,
            }}
          >
            <TouchableOpacity
              style={{
                alignSelf: "center",
                borderRadius: 15,

                backgroundColor: "#dddddd",
                padding: 10,
                width: 150,
                marginBottom: 9,
              }}
              onPress={() => handleCancel()}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#000",
                  alignSelf: "center",
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignSelf: "center",
                borderRadius: 15,
                backgroundColor: isValid && sumOne >= percent ? c : "#dddddd",
                padding: 10,
                width: 150,
                marginBottom: 9,
              }}
              disabled={sumOne < percent}
              onPress={handleSubmit(onSubmit)}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#fff",
                  alignSelf: "center",
                }}
              >
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ModalView>
    </>
  );
};

export default SmallBillForm;
