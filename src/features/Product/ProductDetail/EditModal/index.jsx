import { AntDesign, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "~/components/Button";

import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as Yup from "yup";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { ConfirmDialog, Loading, ModalView } from "~/components";
import { DropdownField, InputField } from "~/components/Form-field";
import { API_RESPONSE_CODE, BRAND } from "~/constants";
import { getRandomBetween } from "~/utils/helper";

const MOCK_DATA = {
  listMadeIn: [
    { label: "Mỹ", value: "Mỹ" },
    { label: "Ý", value: "Ý" },
    { label: "Pháp", value: "Pháp" },
    { label: "Đức", value: "Đức" },
    { label: "Anh", value: "Anh" },
    { label: "Trung Quốc", value: "Trung Quốc" },
    { label: "Nhật Bản", value: "Nhật Bản" },
    { label: "Nga", value: "Nga" },
    { label: "Hàn Quốc", value: "Hàn Quốc" },
    { label: "Tây Ban Nha", value: "Tây Ban Nha" },
  ],
  listMaterial: [
    { label: "Nhựa", value: "Nhựa" },
    { label: "Sứ", value: "Sứ" },
    { label: "Kim loại", value: "Kim loại" },
    { label: "Gỗ", value: "Gỗ" },
    { label: "Giấy", value: "Giấy" },
    { label: "Đá", value: "Đá" },
    { label: "Thủy tinh", value: "Thủy tinh" },
  ],
  listStyle: [
    { label: "Cổ điển", value: "Cổ điển" },
    { label: "Tân cổ điển", value: "Tân cổ điển" },
    { label: "Hiện đại", value: "Hiện đại" },
  ],
  listArea: [
    { label: "Phòng khách", value: "Phòng khách" },
    { label: "Phòng ăn", value: "Phòng ăn" },
    { label: "Phòng làm việc", value: "Phòng việc" },
    { label: "Phòng thờ", value: "Phòng thờ" },
    { label: "Phòng sinh hoạt", value: "Phòng sinh hoạt" },
    { label: "Phòng ngủ", value: "Phòng ngủ" },
    { label: "Phòng tắm", value: "Phòng tắm" },
    { label: "Sân vườn", value: "Sân vườn" },
    { label: "Ban công", value: "Ban công" },
    { label: "Âm tường", value: "Âm tường" },
  ],
};

const EditForm = ({
  visible,
  onClose,
  id,
  oldImages,
  data,
  setEdit,
  productTypeList,
  setID,
}) => {
  const { width } = useWindowDimensions();
  const [check, setCheck] = useState(false);
  let initColor;
  let initSize;
  let initOther;
  if (productTypeList.length > 0) {
    if (productTypeList[0].color && productTypeList[0].size) {
      initColor = true;
      initSize = true;
      initOther = false;
    } else if (productTypeList[0].color) {
      initColor = true;
      initSize = false;
      initOther = false;
    } else if (productTypeList[0].size) {
      initColor = false;
      initSize = true;
      initOther = false;
    } else {
      initColor = false;
      initSize = false;
      initOther = true;
    }
  } else {
    initColor = true;
    initSize = false;
    initOther = false;
  }
  const [confirm, setConfirm] = useState(false);
  const [images, setImages] = useState(oldImages);
  const [otherType, setOtherType] = useState(initOther);
  const [typeCheck, setTypeCheck] = useState(false);
  const [colorCheck, setColorCheck] = useState(initColor);
  const [sizeCheck, setSizeCheck] = useState(initSize);
  const [hasPermission, setHasPermission] = useState();
  const [productType, setProductType] = useState(
    productTypeList.length > 0 ? true : false
  );
  let Schema;
  if (!productType) {
    Schema = Yup.object().shape({
      unitPrice: Yup.number("Đơn giá phải là số")
        .min(1, "Hãy nhập đơn giá")
        .required("Hãy nhập đơn giá"),
      style: Yup.string("Phong cách là chữ cái").required(
        "Hãy nhập phong cách thiết kế"
      ),
      unitInStock: Yup.number("Số lượng phải là số")
        .min(1, "Hãy nhập số lượng")
        .required("Hãy nhập số lượng"),
      name: Yup.string("Tên phải là chữ cái")
        .min(2, "Tên sản phẩm quá ngắn!")
        .max(50, "Tên sản phẩm quá dài")
        .required("Hãy nhập nhập tên sản phẩm"),
      description: Yup.string("Mô tả phải là chữ cái")
        .min(2, "Mô tả quá ngắn!")
        .max(500, "Mô tả quá dài")
        .required("Hãy nhập mô tả sản phẩm"),
      brand: Yup.string("Tên hãng phải là chữ cái")
        .min(2, "Tên hãng quá ngắn!")
        .max(50, "Tên hãng quá dài")
        .required("Hãy nhập nhập tên hãng"),
      unit: Yup.string().required("Hãy nhập đơn vị đo lường"),
    });
  } else if (colorCheck && sizeCheck) {
    Schema = Yup.object().shape({
      unitPrice: Yup.number()
        .min(1, "Hãy nhập đơn giá")
        .required("Hãy nhập đơn giá"),
      style: Yup.string("Phong cách là chữ cái").required(
        "Hãy nhập phong cách thiết kế"
      ),
      name: Yup.string("Tên phải là chữ cái")
        .min(2, "Tên sản phẩm quá ngắn!")
        .max(50, "Tên sản phẩm quá dài")
        .required("Hãy nhập nhập tên sản phẩm"),
      description: Yup.string("Mô tả phải là chữ cái")
        .min(2, "Mô tả quá ngắn!")
        .max(500, "Mô tả quá dài")
        .required("Hãy nhập mô tả sản phẩm"),
      brand: Yup.string("Tên hãng phải là chữ cái")
        .min(2, "Tên hãng quá ngắn!")
        .max(50, "Tên hãng quá dài")
        .required("Hãy nhập nhập tên hãng"),
      unit: Yup.string().required("Hãy nhập đơn vị đo lường"),
      productTypes: Yup.array()
        .min(2, "Phải có ít nhất 2 phân loại")
        .of(
          Yup.object().shape({
            other: Yup.string("Tên phân loại phải là chữ cái").max(
              20,
              "Tên phân loại quá dài"
            ),

            color: Yup.string("Màu phải là chữ cái")
              .max(20, "Tên màu quá dài")
              .required("Hãy nhập phân loại màu "),

            size: Yup.string("Kích thước phải là chữ cái")
              .max(20, "Tên kích thước quá dài")
              .required("Hãy nhập phân loại kích thước"),

            quantity: Yup.number("Số lượng phải là số")
              .min(1, "Số lượng ít nhất là 1")
              .required("Hãy nhập số lượng phân loại"),
          })
        ),
    });
  } else if (colorCheck && sizeCheck == false) {
    Schema = Yup.object().shape({
      unitPrice: Yup.number()
        .min(1, "Hãy nhập đơn giá")
        .required("Hãy nhập đơn giá"),
      style: Yup.string("Phong cách là chữ cái").required(
        "Hãy nhập phong cách thiết kế"
      ),
      name: Yup.string("Tên phải là chữ cái")
        .min(2, "Tên sản phẩm quá ngắn!")
        .max(50, "Tên sản phẩm quá dài")
        .required("Hãy nhập nhập tên sản phẩm"),
      description: Yup.string("Mô tả phải là chữ cái")
        .min(2, "Mô tả quá ngắn!")
        .max(500, "Mô tả quá dài")
        .required("Hãy nhập mô tả sản phẩm"),
      brand: Yup.string("Tên hãng phải là chữ cái")
        .min(2, "Tên hãng quá ngắn!")
        .max(50, "Tên hãng quá dài")
        .required("Hãy nhập nhập tên hãng"),
      unit: Yup.string().required("Hãy nhập đơn vị đo lường"),
      productTypes: Yup.array()
        .min(2, "Phải có ít nhất 2 phân loại")
        .of(
          Yup.object().shape({
            other: Yup.string("Tên phân loại phải là chữ cái").max(
              20,
              "Tên phân loại quá dài"
            ),

            color: Yup.string("Màu phải là chữ cái")
              .max(20, "Tên màu quá dài")
              .required("Hãy nhập phân loại màu"),

            size: Yup.string("Kích thước phải là chữ cái").max(
              20,
              "Tên kích thước quá dài"
            ),

            quantity: Yup.number("Số lượng phải là số")
              .min(1, "Số lượng ít nhất là 1")
              .required("Hãy nhập số lượng phân loại"),
          })
        ),
    });
  } else if (sizeCheck) {
    Schema = Yup.object().shape({
      unitPrice: Yup.number()
        .min(1, "Hãy nhập đơn giá")
        .required("Hãy nhập đơn giá"),
      style: Yup.string("Phong cách là chữ cái").required(
        "Hãy nhập phong cách thiết kế"
      ),
      name: Yup.string("Tên phải là chữ cái")
        .min(2, "Tên sản phẩm quá ngắn!")
        .max(50, "Tên sản phẩm quá dài")
        .required("Hãy nhập nhập tên sản phẩm"),
      description: Yup.string("Mô tả phải là chữ cái")
        .min(2, "Mô tả quá ngắn!")
        .max(500, "Mô tả quá dài")
        .required("Hãy nhập mô tả sản phẩm"),
      brand: Yup.string("Tên hãng phải là chữ cái")
        .min(2, "Tên hãng quá ngắn!")
        .max(50, "Tên hãng quá dài")
        .required("Hãy nhập nhập tên hãng"),
      unit: Yup.string().required("Hãy nhập đơn vị đo lường"),
      productTypes: Yup.array()
        .min(2, "Phải có ít nhất 2 phân loại")
        .of(
          Yup.object().shape({
            other: Yup.string("Tên phân loại phải là chữ cái").max(
              20,
              "Tên phân loại quá dài"
            ),

            color: Yup.string("Màu phải là chữ cái").max(20, "Tên màu quá dài"),

            size: Yup.string("Kích thước phải là chữ cái")
              .max(20, "Tên kích thước quá dài")
              .required("Hãy nhập phân loại kích thước"),

            quantity: Yup.number("Số lượng phải là số")
              .min(1, "Số lượng ít nhất là 1")
              .required("Hãy nhập số lượng phân loại"),
          })
        ),
    });
  } else {
    Schema = Yup.object().shape({
      unitPrice: Yup.number()
        .min(1, "Hãy nhập đơn giá")
        .required("Hãy nhập đơn giá"),
      style: Yup.string("Phong cách là chữ cái").required(
        "Hãy nhập phong cách thiết kế"
      ),
      name: Yup.string("Tên phải là chữ cái")
        .min(2, "Tên sản phẩm quá ngắn!")
        .max(50, "Tên sản phẩm quá dài")
        .required("Hãy nhập nhập tên sản phẩm"),
      description: Yup.string("Mô tả phải là chữ cái")
        .min(2, "Mô tả quá ngắn!")
        .max(500, "Mô tả quá dài")
        .required("Hãy nhập mô tả sản phẩm"),
      brand: Yup.string("Tên hãng phải là chữ cái")
        .min(2, "Tên hãng quá ngắn!")
        .max(50, "Tên hãng quá dài")
        .required("Hãy nhập nhập tên hãng"),
      unit: Yup.string().required("Hãy nhập đơn vị đo lường"),
      productTypes: Yup.array()
        .min(2, "Phải có ít nhất 2 phân loại")
        .of(
          Yup.object().shape({
            other: Yup.string("Tên phân loại phải là chữ cái")
              .max(20, "Tên phân loại quá dài")
              .required("Hãy nhập tên phân loại"),

            color: Yup.string("Màu phải là chữ cái").max(20, "Tên màu quá dài"),

            size: Yup.string("Kích thước phải là chữ cái").max(
              20,
              "Tên kích thước quá dài"
            ),

            quantity: Yup.number("Số lượng phải là số")
              .min(1, "Số lượng ít nhất là 1")
              .required("Hãy nhập số lượng phân loại"),
          })
        ),
    });
  }
  let fullData;
  if (productType) {
    var _productTypes = productTypeList.map((item, i) => {
      return {
        color: item.color || "",
        size: item.size || "",
        other: item.other || "",
        quantity: item.quantity.toString(),
      };
    });

    fullData = {
      name: data.name,
      brand: data.brand,
      description: data.description,
      unitPrice: data.unitPrice.toString(),
      unitInStock: data.unitInStock.toString(),
      prpductTypes: data.productType,
      madeIn: data.madeIn,
      material: data.material,
      style: data.style || "",
      area: data.area,
      productTypes: _productTypes,
      unit: data.unit,
    };
  } else {
    fullData = {
      name: data.name,
      brand: data.brand,
      description: data.description,
      unitPrice: data.unitPrice.toString(),
      unitInStock: data.unitInStock.toString(),
      prpductTypes: data.productType,
      madeIn: data.madeIn || "",
      material: data.material || "",
      style: data.style || "",
      area: data.area || "",
      productTypes: [
        { color: "", size: "", other: "", quantity: 0 },
        { color: "", size: "", other: "", quantity: 0 },
      ],
      unit: data.unit,
    };
  }
  const {
    control,
    handleSubmit,
    watch,
    reset,
    resetField,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onBlur",
    defaultValues: fullData,
    resolver: yupResolver(Schema),
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: "productTypes",
  });

  const { listMadeIn, listMaterial, listStyle, listArea } = MOCK_DATA;

  const theme = useTheme();
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickImageLoading, setIsPickImageLoading] = useState(false);
  const [otherClick, setOtherClick] = useState(
    fullData.brand != "VIGLACERA" &&
      fullData.brand != "VICOSTONE" &&
      fullData.brand != "HOLCIM" &&
      fullData.brand != "LAFARGE" &&
      fullData.brand != "SEMEN INDONESIA" &&
      fullData.brand != "PRIME GROUP" &&
      fullData.brand != "SIAM CITY CEMENT"
      ? true
      : false
  );

  const [newImages, setNewImages] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;

  const uploadImages = async () => {
    return new Promise((resolve) => {
      let arr = [];
      images?.map(async (item) => {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", item, true);
          xhr.send(null);
        });
        const ref = firebase.storage().ref().child(item);
        const snapshot = ref.put(blob);
        snapshot.on(
          firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            setIsLoading(true);
          },
          (error) => {
            setIsLoading(false);
            blob.close();
          },
          async () => {
            await snapshot.snapshot.ref.getDownloadURL().then((url) => {
              arr.push(url);

              setIsLoading(false);
              blob.close();
              if (arr.length == images?.length) {
                resolve(arr);
              }
            });
          }
        );
      });
    });
  };

  const beforeSubmit = async (values) => {
    setCheck(true);

    if (images?.length > 0 && typeCheck == false) {
      onSubmit(values);
    }
  };

  const onSubmit = async (values) => {
    try {
      await uploadImages().then(async (response) => {
        let _categories = [];
        if (values.madeIn !== "") {
          _categories.push({ categoryID: 1, name: values.madeIn });
        }
        if (values.material !== "") {
          _categories.push({ categoryID: 2, name: values.material });
        }
        if (values.style !== "") {
          _categories.push({ categoryID: 3, name: values.style });
        }
        if (values.area !== "") {
          _categories.push({ categoryID: 4, name: values.area });
        }

        const request = {
          productId: id,
          name: values.name,
          description: values.description,
          brand: values.brand,
          unitPrice: values.unitPrice,
          unitInStock: productType
            ? values.productTypes.reduce((accumulator, object) => {
                return accumulator + object.quantity;
              }, 0)
            : values.unitInStock,
          categories: _categories,
          unit: values.unit,
          image: response ? response.toString() : null,
          productTypes: productType ? values.productTypes : null,
        };

        const res = await axiosInstance.put("store/updateProduct", request, {
          params: { productId: id },
        });

        if (+res.code === API_RESPONSE_CODE.success) {
          oldImages.map((item) => {
            let pictureRef = firebase.storage().refFromURL(item);
            pictureRef.delete();
          });
          setEdit((prev) => !prev);
          setID(res.data);
          onClose();

          Toast.show({
            type: "success",
            text1: "Sửa sản phẩm thành công",
            position: "bottom",
            visibilityTime: 2500,
          });
        }
      });
    } catch (e) {
      console.log(`Edit product error ${e}`);
    }
  };
  const handleDelete = async () => {
    try {
      const res = await axiosInstance.put("deleteProduct", {
        params: { productId: id },
      });

      if (+res.code === API_RESPONSE_CODE.success) {
        setEdit((prev) => !prev);
        onClose();

        Toast.show({
          type: "success",
          text1: "Sửa trạng thái sản phẩm thành công",
          position: "bottom",
          visibilityTime: 2500,
        });
      }
    } catch (e) {
      console.log(`Delete product error ${e}`);
    }
  };

  const pickImages = async () => {
    setNewImages(true);
    setIsPickImageLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      aspect: [4, 3],
      quality: 0.2,
    });
    if (!result.canceled) {
      if (result.assets) {
        setImages(result.assets.map((item) => item.uri));
      } else {
        setImages(result.assets.selected);
      }
    }
    setIsPickImageLoading(false);
  };

  // animation  push footer when  open keyboard
  useEffect(() => {
    (async () => {
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status.status === "granted");
    })();
    const animationFooter = (value) => {
      Animated.spring(translateY, {
        toValue: value,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }).start();
    };

    const _keyboardWillShow = (event) => {
      const height = event.endCoordinates.height;
      animationFooter(-height);
    };

    const _keyboardWillHide = () => {
      animationFooter(0);
    };

    Keyboard.addListener("keyboardWillShow", _keyboardWillShow);
    Keyboard.addListener("keyboardWillHide", _keyboardWillHide);

    return () => {
      Keyboard.removeAllListeners("keyboardWillShow");
      Keyboard.removeAllListeners("keyboardWillHide");
    };
  }, []);

  const handleOtherType = () => {
    resetField("productTypes");
    if (otherType) {
      setColorCheck(true);
      setSizeCheck(false);
    } else {
      setColorCheck(false);
      setSizeCheck(false);
    }

    setOtherType(!otherType);
  };

  const handleConfirmType = () => {
    watchProductTypes.map((item) => {
      if (item.color == "" && item.size == "" && item.other == "") {
        setTypeCheck(true);
      } else {
        setTypeCheck(false);
      }
    });
    setModal(false);
  };
  const watchProductTypes = watch("productTypes");

  const handleOtherClick = () => {
    resetField("brand");
    setOtherClick(!otherClick);
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      {/* loading */}
      {isLoading && <Loading isModal />}

      {/* header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.sizes.large,
          borderBottomColor: "rgba(22,24,35,0.12)",
          borderBottomWidth: 1,
        }}
      >
        <AntDesign
          name="close"
          size={20}
          color="rgb(22,24,35)"
          onPress={onClose}
          style={{ position: "absolute", left: theme.sizes.large }}
        />
        <Text
          style={{
            textTransform: "capitalize",
            fontWeight: "600",
            fontSize: theme.sizes.medium,
          }}
        >
          Sửa sản phẩm
        </Text>
        {(isDirty || newImages) && (
          <Pressable
            style={({ pressed }) => [
              pressed ? { opacity: 0.25 } : {},
              {
                position: "absolute",
                right: theme.sizes.large,
              },
            ]}
            onPress={() => {
              reset(fullData);
              setImages(oldImages);
              setNewImages(false);
              setProductType(productTypeList.length > 0 ? true : false);
              setModal(false);
            }}
          >
            <Text
              style={{
                textTransform: "capitalize",
                color: "blue",
              }}
            >
              Đặt lại
            </Text>
          </Pressable>
        )}
      </View>

      <KeyboardAwareScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.sizes.large }}
      >
        <InputField
          control={control}
          errors={errors}
          label={"Tên sản phẩm"}
          name="name"
          isOutline
        />
        {otherClick ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: width - 30,
            }}
          >
            <InputField
              name="brand"
              control={control}
              errors={errors}
              label="Tên hãng"
              inputStyle={{
                borderRadius: theme.sizes.base / 2,
                paddingVertical: theme.sizes.small + 2,
                backgroundColor: "transparent",
                borderWidth: 1,

                borderColor: errors.brand
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
              }}
              containerStyle={{
                marginVertical: theme.sizes.base - 2,
                marginRight: 10,
                width: width - 140,
              }}
            />
            <Pressable
              style={({ pressed }) => [
                {
                  justifyContent: "center",
                  alignItems: "center",
                },
                pressed
                  ? {
                      opacity: 0.25,
                    }
                  : {},
              ]}
              onPress={() => handleOtherClick()}
            >
              <Text
                style={{
                  fontSize: theme.sizes.small,
                  color: "blue",
                  textDecorationLine: "underline",
                  marginTop: 15,
                }}
              >
                Chọn hãng có sẵn
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: width - 30,
            }}
          >
            <DropdownField
              name="brand"
              control={control}
              errors={errors}
              label="Tên hãng"
              searchable={false}
              listData={BRAND}
              dropDownDirection="BOTTOM"
              listMode="SCROLLVIEW"
              placeholderStyle={{
                color: "rgba(22,24,35,0.34)",
              }}
              style={{
                backgroundColor: "transparent",
                borderColor: errors.brand
                  ? theme.colors.error
                  : "rgba(22,24,35,0.12)",
                borderWidth: 1,
                borderRadius: theme.sizes.base - 2,
                width: width - 115,
                marginRight: 10,
              }}
              zIndex={2}
            />
            <Pressable
              style={({ pressed }) => [
                {},
                pressed
                  ? {
                      opacity: 0.25,
                    }
                  : {},
              ]}
              onPress={() => handleOtherClick()}
            >
              <Text
                style={{
                  fontSize: theme.sizes.small,
                  color: "blue",
                  textDecorationLine: "underline",
                  marginTop: 15,
                }}
              >
                lựa chọn khác
              </Text>
            </Pressable>
          </View>
        )}
        <View style={{ zIndex: -2 }}>
          <InputField
            control={control}
            errors={errors}
            label={"Mô tả"}
            name="description"
            isOutline
          />
        </View>
        <View style={{ zIndex: -2 }}>
          <InputField
            name="unitPrice"
            control={control}
            errors={errors}
            label="Đơn giá"
            keyboardType="number-pad"
            isOutline
          />
        </View>

        <View style={{ zIndex: -2 }}>
          <InputField
            control={control}
            errors={errors}
            label={"Đơn vị đo lường"}
            name="unit"
            isOutline
          />
        </View>

        {productType ? (
          <>
            <ModalView visible={modal} title="Nhập phân loại">
              <ScrollView>
                {!otherType && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
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
                          if (colorCheck && !sizeCheck) {
                            setSizeCheck(true);
                          }
                          setColorCheck(!colorCheck);
                          resetField("productTypes");
                        }}
                        isChecked={colorCheck}
                      />

                      <Text
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "700",
                          fontSize: theme.sizes.medium - 1,
                        }}
                      >
                        Màu sắc
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
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
                          if (sizeCheck && !colorCheck) {
                            setColorCheck(true);
                          }
                          setSizeCheck(!sizeCheck);
                          resetField("productTypes");
                        }}
                        isChecked={sizeCheck}
                      />

                      <Text
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "700",
                          fontSize: theme.sizes.medium - 1,
                        }}
                      >
                        Kích thước
                      </Text>
                    </View>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    pressed
                      ? {
                          opacity: 0.25,
                        }
                      : {},
                    {
                      position: "absolute",
                      top: 0,
                      right: 0,
                    },
                  ]}
                  onPress={() => handleOtherType()}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "cneter",
                    }}
                  >
                    <Text
                      style={{
                        color: "blue",
                      }}
                    >
                      {otherType ? "Mặc định" : "Tự định nghĩa"}
                    </Text>
                    <Ionicons
                      name="enter-outline"
                      size={theme.sizes.medium}
                      color="blue"
                    />
                  </View>
                </Pressable>
                {fields.map((field, index) => {
                  return (
                    <View
                      key={field.id}
                      style={{
                        marginBottom: 20,
                        marginTop: index == 0 ? 60 : 0,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          Phân loại {index + 1}
                        </Text>
                        <Pressable
                          style={({ pressed }) => [
                            pressed
                              ? {
                                  opacity: 0.25,
                                }
                              : {},
                            {
                              position: "absolute",
                              top: 2,
                              right: 0,
                              marginBottom: 10,
                            },
                          ]}
                          onPress={() => {
                            remove(index);
                          }}
                        >
                          <Ionicons
                            name="ios-remove-circle-outline"
                            size={theme.sizes.large}
                            color={theme.colors.error}
                          />
                        </Pressable>
                      </View>
                      {otherType ? (
                        <>
                          <Text
                            style={{
                              color: "rgb(22,24,35)",
                              fontSize: 12,
                              marginVertical: 10,
                              paddingHorizontal: 10,
                            }}
                          >
                            Tên phân loại
                          </Text>
                          <Controller
                            name={`productTypes.${index}.other`}
                            control={control}
                            render={({
                              field: { onBlur, onChange, value },
                            }) => (
                              <TextInput
                                style={{
                                  borderBottomWidth: 1,
                                  borderColor: "rgba(22,24,35,0.12)",
                                }}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            )}
                          />
                          {errors?.productTypes &&
                            errors?.productTypes[index]?.other && (
                              <Text
                                style={{
                                  color: theme.colors.error,
                                }}
                              >
                                {errors?.productTypes[index]?.other?.message}
                              </Text>
                            )}
                        </>
                      ) : (
                        <>
                          <View
                            style={{
                              backgroundColor: colorCheck ? "#fff" : "#ddd",
                            }}
                          >
                            <Text
                              style={{
                                color: colorCheck ? "rgb(22,24,35)" : "#fff",
                                fontSize: 12,
                                marginVertical: 10,
                                paddingHorizontal: 10,
                              }}
                            >
                              Màu
                            </Text>
                            <Controller
                              name={`productTypes.${index}.color`}
                              control={control}
                              render={({
                                field: { onBlur, onChange, value },
                              }) => (
                                <TextInput
                                  style={{
                                    borderBottomWidth: 1,
                                    borderColor: "rgba(22,24,35,0.12)",
                                  }}
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  editable={colorCheck}
                                  selectTextOnFocus={colorCheck}
                                />
                              )}
                            />
                          </View>

                          {errors?.productTypes &&
                            errors?.productTypes[index]?.color && (
                              <Text
                                style={{
                                  color: theme.colors.error,
                                }}
                              >
                                {errors?.productTypes[index]?.color?.message}
                              </Text>
                            )}
                          <View
                            style={{
                              backgroundColor: sizeCheck ? "#fff" : "#ddd",
                              marginTop: sizeCheck ? 0 : 5,
                            }}
                          >
                            <Text
                              style={{
                                color: sizeCheck ? "rgb(22,24,35)" : "#fff",

                                fontSize: 12,
                                marginVertical: 10,
                                paddingHorizontal: 10,
                              }}
                            >
                              Kích thước
                            </Text>
                            <Controller
                              name={`productTypes.${index}.size`}
                              control={control}
                              render={({
                                field: { onBlur, onChange, value },
                              }) => (
                                <TextInput
                                  style={{
                                    borderBottomWidth: 1,
                                    borderColor: "rgba(22,24,35,0.12)",
                                  }}
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  editable={sizeCheck}
                                  selectTextOnFocus={sizeCheck}
                                />
                              )}
                            />
                          </View>

                          {errors?.productTypes &&
                            errors?.productTypes[index]?.size && (
                              <Text
                                style={{
                                  color: theme.colors.error,
                                }}
                              >
                                {errors?.productTypes[index]?.size?.message}
                              </Text>
                            )}
                        </>
                      )}
                      <Text
                        style={{
                          color: "rgb(22,24,35)",
                          fontSize: 12,
                          marginVertical: 10,
                          paddingHorizontal: 10,
                        }}
                      >
                        Số lượng
                      </Text>
                      <Controller
                        name={`productTypes.${index}.quantity`}
                        control={control}
                        render={({ field: { onBlur, onChange, value } }) => (
                          <TextInput
                            style={{
                              borderBottomWidth: 1,
                              borderColor: "rgba(22,24,35,0.12)",
                              paddingHorizontal: 10,
                            }}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="number-pad"
                          />
                        )}
                      />
                      {errors?.productTypes &&
                        errors?.productTypes[index]?.quantity && (
                          <Text
                            style={{
                              color: theme.colors.error,
                            }}
                          >
                            {errors?.productTypes[index]?.quantity?.message}
                          </Text>
                        )}
                    </View>
                  );
                })}

                <Text
                  style={{
                    color: theme.colors.error,
                    marginBottom: 30,
                    alignSelf: "center",
                  }}
                >
                  {errors?.productTypes?.message}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginBottom: 10,
                  }}
                >
                  <Button
                    variant="primary"
                    onPress={() => {
                      append({ color: "", size: "", other: "", quantity: 0 });
                    }}
                  >
                    Thêm
                  </Button>
                  <Button variant="primary" onPress={() => handleConfirmType()}>
                    Xác nhận
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={() => setProductType(false)}
                  >
                    Hủy
                  </Button>
                </View>
              </ScrollView>
            </ModalView>
            {modal == false && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    {
                      minHeight: 20,
                      minWidth: 50,
                      justifyContent: "center",
                    },
                    pressed
                      ? {
                          opacity: 0.25,
                        }
                      : {},
                  ]}
                  onPress={() => setModal(true)}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.small,
                      color: "blue",
                      textDecorationLine: "underline",
                      marginVertical: 10,
                    }}
                  >
                    chỉnh sửa phân loại
                  </Text>
                </Pressable>
                {(errors?.productTypes || typeCheck) && (
                  <Text
                    style={{
                      color: theme.colors.error,
                    }}
                  >
                    Hãy hoàn tất chia phân loại
                  </Text>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [
                {
                  minHeight: 20,
                  minWidth: 50,
                  justifyContent: "center",
                },
                pressed
                  ? {
                      opacity: 0.25,
                    }
                  : {},
              ]}
              onPress={() => {
                setProductType(true);
                setModal(true);
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.small,
                  color: "blue",
                  textDecorationLine: "underline",
                  marginVertical: 10,
                }}
              >
                chia phân loại sản phẩm
              </Text>
            </Pressable>
            <InputField
              name="unitInStock"
              control={control}
              errors={errors}
              label="Số lượng"
              keyboardType="number-pad"
              isOutline
            />
          </>
        )}

        {fullData.madeIn ? (
          <DropdownField
            name="madeIn"
            control={control}
            errors={errors}
            label={`Xuất xứ cũ: ${fullData.madeIn}`}
            placeholder={"Chọn xuất xứ mới"}
            listData={listMadeIn}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={4}
          />
        ) : (
          <DropdownField
            name="madeIn"
            control={control}
            errors={errors}
            label={"Chọn xuất xứ"}
            listData={listMadeIn}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={4}
          />
        )}
        {fullData.material ? (
          <DropdownField
            name="material"
            control={control}
            errors={errors}
            label={`Chất liệu cũ: ${fullData.material}`}
            placeholder={"Chọn chất liệu mới"}
            listData={listMaterial}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={3}
          />
        ) : (
          <DropdownField
            name="material"
            control={control}
            errors={errors}
            label={"Chọn chất liệu"}
            listData={listMaterial}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={3}
          />
        )}
        {fullData.style ? (
          <DropdownField
            name="style"
            control={control}
            errors={errors}
            label={`Phong cách thiết kế cũ: ${fullData.style}`}
            placeholder={"Chọn phong cách thiết kế mới"}
            listData={listStyle}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={2}
          />
        ) : (
          <DropdownField
            name="style"
            control={control}
            errors={errors}
            label={"Chọn phong cách thiết kế"}
            listData={listStyle}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={2}
          />
        )}
        {fullData.area ? (
          <DropdownField
            name="area"
            control={control}
            errors={errors}
            label={`Vị trí đặt sản phẩm cũ: ${fullData.area}`}
            placeholder={"Chọn vị trí đặt sản phẩm mới"}
            listData={listArea}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={1}
          />
        ) : (
          <DropdownField
            name="area"
            control={control}
            errors={errors}
            label={"Chọn vị trí đặt sản phẩm"}
            listData={listArea}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={1}
          />
        )}
        {isPickImageLoading && <Loading />}
        {images?.length > 0 ? (
          <FlatList
            data={images}
            horizontal
            nestedScrollEnabled
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={pickImages}>
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#dddddd",
                    resizeMode: "cover",
                    marginRight: index !== images?.length - 1 ? 10 : 0,
                  }}
                />
              </TouchableOpacity>
            )}
            keyExtractor={() => getRandomBetween(1000, 10000)}
            contentContainerStyle={{ marginTop: theme.sizes.large }}
          />
        ) : (
          <>
            <Pressable onPress={hasPermission ? pickImages : () => {}}>
              <Text
                style={{
                  fontSize: theme.sizes.font + 1,
                  color: "blue",
                  textDecorationLine: "underline",
                }}
              >
                Thêm ảnh
              </Text>
            </Pressable>
            {check && !images?.length > 0 && (
              <Text
                style={{
                  color: theme.colors.error,
                }}
              >
                Hãy chọn hình ảnh
              </Text>
            )}
          </>
        )}
      </KeyboardAwareScrollView>

      {/* footer */}
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          borderTopColor: "rgba(22,24,35,0.12)",
          borderTopWidth: 1,
          transform: [{ translateY: translateY }],
          left: 0,
          right: 0,
          backgroundColor: "white",
          width: Dimensions.get("screen").width,
          padding: theme.sizes.medium,
          paddingHorizontal: theme.sizes.large,
          flexDirection: "row",
        }}
      >
        <Pressable
          style={({ pressed }) => [
            pressed && isDirty
              ? {
                  opacity: 0.25,
                }
              : {},
            { width: "50%" },
          ]}
          onPress={isDirty || newImages ? handleSubmit(beforeSubmit) : () => {}}
        >
          <View
            style={{
              backgroundColor:
                isDirty || newImages
                  ? theme.colors.primary400
                  : "rgba(22,24,35,0.12)",
              padding: theme.sizes.font,
              justifyContent: "center",
              alignItems: "center",
              borderTopLeftRadius: 15,
              borderBottomLeftRadius: 15,
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.medium,
                color: isDirty || newImages ? "white" : "rgba(22,24,35,0.34)",
                fontWeight: "500",
              }}
            >
              Lưu
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            pressed ? { opacity: 0.25 } : {},
            { width: "50%" },
          ]}
          onPress={() => setConfirm(true)}
        >
          <View
            style={{
              backgroundColor: data.status != 12 ? "red" : "blue",
              padding: theme.sizes.font,
              justifyContent: "center",
              alignItems: "center",
              borderTopRightRadius: 15,
              borderBottomRightRadius: 15,
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.medium,
                color: "white",
                fontWeight: "500",
              }}
            >
              {data.status != 12 ? "Ngừng kinh doanh" : "Tái kinh doanh"}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
      <ConfirmDialog
        visible={confirm}
        confirmText="Xác nhận"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          handleDelete();
        }}
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
            {data.status != 12
              ? "Bạn có chắc chắn muốn ngừng kinh doanh sản phẩm?"
              : "Bạn có chắc chắn muốn tái kinh doanh?"}
          </Text>
        </View>
      </ConfirmDialog>
    </Modal>
  );
};

export default EditForm;
