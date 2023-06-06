import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { Badge, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { formatStringToCurrency, getRandomBetween } from "~/utils/helper";

import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { IconButton } from "~/components";
import {
  API_RESPONSE_CODE,
  NO_IMAGE_URL,
  PLACES,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import GuestContext from "~/context/GuestContext";
import ReasonModal from "~/features/BillDetail/ReasonModal";
import { CartServices } from "~/services";
import SPACING from "../config/SPACING";
import colors from "../config/colors";
import AddToCartModal from "./AddToCartModal";
import EditForm from "./EditModal";

const { height, width } = Dimensions.get("window");

const firebaseConfig = {
  apiKey: "AIzaSyAelyrP0GomMDVfXyX-2lBq0yiWL1Z4HLk",
  authDomain: "capstone-project-e5c70.firebaseapp.com",
  projectId: "capstone-project-e5c70",
  storageBucket: "capstone-project-e5c70.appspot.com",
  messagingSenderId: "533432664281",
  appId: "1:533432664281:web:628ae970b9c3ee946a7ec8",
};

firebase.initializeApp(firebaseConfig);

const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const ProductDetail = ({ route, navigation }) => {
  const { verifyAccount } = useContext(GuestContext);
  const { id } = route.params || {};
  const { userInfo } = useContext(AuthContext);
  const { top, bottom } = useSafeAreaInsets();

  const theme = useTheme();
  const [ID, setID] = useState(id);

  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [zoomer, setZoomer] = useState(false);
  const [zoomerData, setZoomerData] = useState([]);
  const [addToCartVisible, setAddToCartVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [edit, setEdit] = useState(false);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState({ length: 0, list: [] });
  const [productTypeList, setProductTypeList] = useState([]);
  const [madeIn, setMadeIn] = useState(null);
  const [material, setMaterial] = useState(null);
  const [style, setStyle] = useState(null);
  const [area, setArea] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const itemRef = useRef({});
  const itemAnimation = useRef({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    scale: new Animated.Value(1),
  }).current;
  const cartRef = useRef({});

  const fetchData = async () => {
    const [res, { data, pagination }] = await Promise.all([
      axiosInstance.get(
        "store/getProductDetail/:productId".replace(":productId", ID)
      ),
      CartServices.getList(),
    ]);

    if (+res.code === API_RESPONSE_CODE.success) {
      setProduct(res.data);
      var tempArr;
      if (res.data.productType) {
        tempArr = res.data.productType.map((item) => {
          return {
            label:
              item.typeName + " còn: " + item.quantity + " " + res.data.unit,
            value: item.id,
          };
        });
      }
      setProductTypeList(tempArr);

      if (res.data.productCategories) {
        res.data.productCategories.map((category) => {
          switch (category.id) {
            case 1:
              setMadeIn(category.name);
            case 2:
              setMaterial(category.name);
            case 3:
              setStyle(category.name);
            default:
              setArea(category.name);
          }
        });
      }

      setImages(res.data?.image || []);
      if (Array.isArray(res.data.image)) {
        const zoomerData = res.data.image.map((item) => {
          return { url: item };
        });
        setZoomerData(zoomerData);
      }
      setCart({ list: data, length: pagination?.totalRecords || 0 });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [edit])
  );

  const handleAnimationAddToCart = (productTypeId) => {
    let y = 0;
    let x = 0;
    cartRef.current.measure((fx, fy, width, height, px, py) => {
      x = px;
      y = py;
    });
    itemRef.current.measure((fx, fy, width, height, px, py) => {
      Animated.parallel([
        Animated.timing(itemAnimation.translateY, {
          toValue: y - py - 8.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnimation.translateX, {
          toValue: x - px - 8.5,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnimation.scale, {
          toValue: 0,
          delay: 700,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        itemAnimation.translateX.setValue(0);
        itemAnimation.translateY.setValue(0);
        itemAnimation.scale.setValue(1);
        setAddToCartVisible(false);

        if (
          !cart.list.some(
            (x) => x.productID === product.id && x.typeID === productTypeId
          )
        ) {
          setCart((prev) => ({ ...prev, length: prev.length + 1 }));
        }
      });
    });
  };
  return (
    <>
      <StatusBar style="dark" />
      <Modal visible={zoomer} transparent animationType="fade">
        <ImageViewer
          imageUrls={zoomerData}
          onSwipeDown={() => setZoomer(false)}
          onCancel={() => setZoomer(false)}
          enableImageZoom
          enableSwipeDown
        />
      </Modal>

      {/* modal add to cart */}
      {product && (
        <>
          <AddToCartModal
            visible={addToCartVisible}
            onClose={() => setAddToCartVisible(false)}
            data={{
              ...product,
              image: Array.isArray(images) ? images[0] : NO_IMAGE_URL,
            }}
            callback={handleAnimationAddToCart}
            setAddToCartVisible={setAddToCartVisible}
          />
          {visible && (
            <EditForm
              visible={visible}
              onClose={() => setVisible(false)}
              id={ID}
              data={{
                name: product.name,
                brand: product.brand,
                description: product.description,
                unitPrice: product.unitPrice.toString(),
                unitInStock: product.unitInStock.toString(),
                madeIn: madeIn,
                material: material,
                style: style,
                area: area,
                unit: product.unit,
              }}
              productTypeList={product.productType}
              oldImages={images}
              setEdit={setEdit}
              setID={setID}
            />
          )}

          <ReasonModal
            type={1}
            visible={visible2}
            onClose={() => setVisible2(false)}
            callback={async ({ reason, data }) => {
              try {
                const res = await axiosInstance.post("report", {
                  productId: ID,
                  reportProblem: reason.toString(),
                });
                if (+res.code === API_RESPONSE_CODE.success) {
                  Toast.show({
                    type: "success",
                    text1: "Đã báo cáo sản phẩm thành công!",
                    position: "bottom",
                    visibilityTime: 2500,
                  });
                } else {
                  Toast.show({
                    type: "error",
                    text1: "Bạn đã báo cáo sản phẩm này rồi!",
                    position: "bottom",
                    visibilityTime: 2500,
                  });
                }
              } catch (error) {
                Toast.show({
                  type: "error",
                  text1: "Báo cáo thất bại!",
                  position: "bottom",
                  visibilityTime: 2500,
                });
              }
            }}
          />
        </>
      )}

      {/* header animation */}
      <View
        style={{
          position: "absolute",
          paddingTop: top + theme.sizes.large,
          left: 0,
          right: 0,
          zIndex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: theme.sizes.small + 2,
          paddingBottom: theme.sizes.font,
        }}
      >
        {/* animation */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: -10,
            backgroundColor: scrollY.interpolate({
              inputRange: [-1, 0, 75, 110],
              outputRange: ["transparent", "transparent", "white", "white"],
              extrapolate: "clamp",
            }),
          }}
        ></Animated.View>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginRight: theme.sizes.extraLarge - 4,
          }}
        >
          {/* prev */}
          <Animated.View
            style={{
              backgroundColor: scrollY.interpolate({
                inputRange: [-1, 0, 75, 110],
                outputRange: [
                  "rgba(0,0,0,0.27)",
                  "rgba(0,0,0,0.27)",
                  "transparent",
                  "transparent",
                ],
                extrapolate: "clamp",
              }),
              borderRadius: 100,
              marginRight: theme.sizes.extraLarge - 4,
              justifyContent: "center",
              alignItems: "center",
              width: 30,
              height: 30,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  backgroundColor: "rgba(22,24,35,0.12)",
                },
                { padding: theme.sizes.base / 4, borderRadius: 100 },
              ]}
              onPress={() => navigation.goBack()}
            >
              <AnimatedAntDesign
                name="left"
                size={22}
                style={{
                  color: scrollY.interpolate({
                    inputRange: [-1, 0, 75, 110],
                    outputRange: ["white", "white", "black", "black"],
                  }),
                }}
              />
            </Pressable>
          </Animated.View>

          {/* search bar */}
          <Animated.View
            style={{
              paddingHorizontal: theme.sizes.base,
              paddingVertical: theme.sizes.base / 2,
              flexDirection: "row",
              borderRadius: theme.sizes.base / 2,
              backgroundColor: "rgba(22,24,35,0.08)",
              flex: 1,
              opacity: scrollY.interpolate({
                inputRange: [-1, 0, 75, 110],
                outputRange: [0, 0, 1, 1],
                extrapolate: "clamp",
              }),
            }}
          >
            <IconButton
              icon="search"
              size={20}
              color="rgb(22,24,35)"
              style={{
                marginRight: theme.sizes.base,
              }}
            />
            <TextInput
              // inputAccessoryViewID={showSoftInputOnFocus && id}
              style={{ flex: 1 }}
              placeholder={"tets"}
              // value={value}
              // onChangeText={() => {}}
              showSoftInputOnFocus={true}
            />
          </Animated.View>
        </View>

        <View
          style={{
            flexDirection: "row",
            zIndex: 10,
          }}
        >
          {/* edit */}
          {userInfo?.storeID == product?.store.id ? (
            <Animated.View
              style={{
                backgroundColor: scrollY.interpolate({
                  inputRange: [-1, 0, 75, 110],
                  outputRange: [
                    "rgba(0,0,0,0.27)",
                    "rgba(0,0,0,0.27)",
                    "transparent",
                    "transparent",
                  ],
                  extrapolate: "clamp",
                }),
                borderRadius: 100,
                marginRight: theme.sizes.extraLarge - 4,
                justifyContent: "center",
                alignItems: "center",
                width: 30,
                height: 30,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.12)",
                  },
                  {
                    padding: theme.sizes.base / 4,
                    borderRadius: 100,
                  },
                ]}
                onPress={() => setVisible(true)}
              >
                <AnimatedFeather
                  name="edit-2"
                  size={16}
                  style={{
                    color: scrollY.interpolate({
                      inputRange: [-1, 0, 75, 110],
                      outputRange: ["white", "white", "black", "black"],
                    }),
                  }}
                />
              </Pressable>
            </Animated.View>
          ) : (
            userInfo &&
            userInfo?.role?.toLowerCase() === ROLE.contractor && (
              <Animated.View
                style={{
                  backgroundColor: scrollY.interpolate({
                    inputRange: [-1, 0, 75, 110],
                    outputRange: [
                      "rgba(0,0,0,0.27)",
                      "rgba(0,0,0,0.27)",
                      "transparent",
                      "transparent",
                    ],
                    extrapolate: "clamp",
                  }),
                  borderRadius: 100,
                  marginRight: theme.sizes.extraLarge - 4,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 30,
                  height: 30,
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    pressed && {
                      backgroundColor: "rgba(22,24,35,0.12)",
                    },
                    {
                      padding: theme.sizes.base / 4,
                      borderRadius: 100,
                    },
                  ]}
                  onPress={() => {
                    if (verifyAccount(ROUTE.productDetail, { ID })) {
                      setVisible2(true);
                    }
                  }}
                >
                  <AnimatedFeather
                    name="alert-octagon"
                    size={16}
                    style={{
                      color: scrollY.interpolate({
                        inputRange: [-1, 0, 75, 110],
                        outputRange: ["white", "white", "black", "black"],
                      }),
                    }}
                  />
                </Pressable>
              </Animated.View>
            )
          )}
          {/* cart */}
          {userInfo?.role?.toLowerCase() !== ROLE.store && (
            <Animated.View
              style={{
                backgroundColor: scrollY.interpolate({
                  inputRange: [-1, 0, 75, 110],
                  outputRange: [
                    "rgba(0,0,0,0.27)",
                    "rgba(0,0,0,0.27)",
                    "transparent",
                    "transparent",
                  ],
                  extrapolate: "clamp",
                }),
                borderRadius: 100,
                marginRight: 5,
                justifyContent: "center",
                alignItems: "center",
                width: 30,
                height: 30,
                zIndex: 10,
              }}
            >
              <Pressable
                ref={cartRef}
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,0.12)",
                  },
                  {
                    padding: theme.sizes.base / 4,
                    borderRadius: 100,
                    zIndex: 10,
                  },
                ]}
                onPress={() => {
                  if (verifyAccount(ROUTE.productDetail, { ID })) {
                    navigation.navigate(ROUTE.cart, {
                      userId: product?.store?.userId,
                    });
                  }
                }}
              >
                <AnimatedIonicons
                  name="ios-cart-outline"
                  size={theme.sizes.extraLarge - 2}
                  style={{
                    color: scrollY.interpolate({
                      inputRange: [-1, 0, 75, 110],
                      outputRange: ["white", "white", "black", "black"],
                    }),
                  }}
                />
                {cart.length > 0 && (
                  <Badge
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      backgroundColor: theme.colors.highlight,
                    }}
                    size={theme.sizes.medium}
                  >
                    {cart.length}
                  </Badge>
                )}
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={64}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={{
            paddingTop: top,
            paddingBottom: bottom !== 0 ? bottom : 55,
          }}
        >
          {images?.length > 0 ? (
            <FlatList
              nestedScrollEnabled
              data={images}
              horizontal
              renderItem={({ item }) => (
                <Pressable onPress={() => setZoomer(true)}>
                  <Image
                    source={{ uri: item || NO_IMAGE_URL }}
                    style={{
                      width: width,
                      height: height / 2 + 30,
                    }}
                    resizeMode="cover"
                  />
                </Pressable>
              )}
              keyExtractor={() => getRandomBetween(1000, 10000)}
            />
          ) : (
            <Image
              source={{ uri: NO_IMAGE_URL }}
              style={{
                width: width,
                height: height / 2 + 30,
              }}
              resizeMode="cover"
            />
          )}

          <View
            style={{
              backgroundColor: "#F1F1F1",
              height: 10,
            }}
          ></View>
          <View
            style={{
              padding: SPACING,
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
                  fontSize: theme.sizes.large,
                  color: "rgba(22,24,35,1)",
                  fontWeight: "bold",
                  width: width / 2,
                }}
              >
                {product?.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: SPACING,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      fontSize: SPACING * 1.5,
                    }}
                  >
                    Đã bán
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                    }}
                  >
                    {product?.soldQuantities + " " + product?.unit}
                  </Text>
                </View>
                <View style={{ alignItems: "center", marginLeft: SPACING }}>
                  <Text
                    style={{
                      color: theme.colors.highlight,
                      fontSize: SPACING * 1.5,
                    }}
                  >
                    Còn
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                    }}
                  >
                    {product?.unitInStock + " " + product?.unit}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#F1F1F1",
              height: 10,
            }}
          ></View>
          <View
            style={{
              padding: SPACING,
            }}
          >
            <Text
              style={{
                color: colors["dark"],
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Thông tin cửa hàng:
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
              }}
            >
              <View>
                <Image
                  style={{
                    height: 50,
                    width: 50,
                    borderRadius: SPACING,
                    marginRight: 20,
                    zIndex: 101,
                  }}
                  source={{
                    uri: product?.avatar || NO_IMAGE_URL,
                  }}
                />

                <Animated.View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "white",
                    zIndex: 100,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: theme.sizes.base / 4,
                    width: 50,
                    height: 50,
                    borderRadius: theme.sizes.base / 2,
                    transform: [
                      {
                        translateY: itemAnimation.translateY,
                      },
                      { translateX: itemAnimation.translateX },
                      { scale: itemAnimation.scale },
                    ],
                  }}
                  pointerEvents="none"
                >
                  <Image
                    ref={itemRef}
                    style={{
                      height: "95%",
                      width: "95%",
                      borderRadius: theme.sizes.base / 2,
                    }}
                    source={{
                      uri:
                        Array.isArray(images) && images.length > 0
                          ? images[0]
                          : NO_IMAGE_URL,
                    }}
                    resizeMode="cover"
                  />
                </Animated.View>
              </View>

              <View style={{ justifyContent: "center", flex: 1 }}>
                <Text
                  style={{
                    color: colors["dark"],
                    marginBottom: SPACING,
                    fontSize: 15,
                  }}
                >
                  {product?.store.firstName + " " + product?.store.lastName}
                </Text>
                <Text
                  style={{
                    color: colors["dark"],
                    marginBottom: SPACING,
                    fontSize: 15,
                  }}
                >
                  {PLACES[product?.store.place]}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#F1F1F1",
              height: 10,
            }}
          ></View>
          <View
            style={{
              padding: SPACING,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors["dark"],
                  fontSize: 15,
                  fontWeight: "semi-bold",
                }}
              >
                Hãng:{"  "}
              </Text>
              <Text
                style={{
                  color: colors["dark"],
                  fontSize: 15,
                  fontWeight: "200",
                }}
              >
                {product?.brand}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                width: width - 20,
              }}
            >
              {madeIn && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "semi-bold",
                    }}
                  >
                    Xuất xứ:{"  "}
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "200",
                    }}
                  >
                    {madeIn}
                  </Text>
                </View>
              )}
              {material && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 20,
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "semi-bold",
                    }}
                  >
                    Chất liệu:{"  "}
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "200",
                    }}
                  >
                    {material}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                width: width - 20,
              }}
            >
              {style && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                    marginRight: 20,
                  }}
                >
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "semi-bold",
                    }}
                  >
                    Phong cách:{"  "}
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "200",
                    }}
                  >
                    {style}
                  </Text>
                </View>
              )}
              {area && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                  }}
                >
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "semi-bold",
                    }}
                  >
                    Vị trí:{"  "}
                  </Text>
                  <Text
                    style={{
                      color: colors["dark"],
                      fontSize: 15,
                      fontWeight: "200",
                    }}
                  >
                    {area}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                marginTop: 15,
              }}
            >
              <Text
                style={{
                  color: colors["dark"],
                  fontSize: 15,
                  fontWeight: "semi-bold",
                }}
              >
                Mô tả:{"  "}
              </Text>
              <Text
                style={{
                  color: colors["dark"],
                  fontSize: 15,
                  fontWeight: "200",
                  lineHeight: 15 * 1.5,
                }}
              >
                {product?.description}
              </Text>
            </View>
          </View>
        </ScrollView>
        {userInfo?.id != product?.createdBy && (
          <SafeAreaView>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                position: "absolute",
                left: 0,
                right: 0,
                bottom: bottom,
                backgroundColor: "#fff",
                height: 70,
                borderTopColor: "rgba(22,24,35,0.12)",
                borderBottomColor: "rgba(22,24,35,0.12)",
                borderTopWidth: 1,
                borderBottomWidth: 1,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: width / 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.dark, fontSize: 18 }}>Giá</Text>
                <Text
                  style={{
                    color: colors.dark,
                    fontSize: 18,
                  }}
                >
                  {product &&
                    formatStringToCurrency(product?.unitPrice.toString())}
                </Text>
              </View>
              <Pressable
                onPress={
                  userInfo?.role.toLowerCase() !== ROLE.store
                    ? () => {
                        if (verifyAccount(ROUTE.productDetail, { ID })) {
                          setAddToCartVisible(true);
                        }
                      }
                    : () => {}
                }
                style={({ pressed }) => [
                  pressed &&
                    userInfo?.role.toLowerCase() !== ROLE.store && {
                      opacity: 0.55,
                    },
                  {
                    backgroundColor:
                      userInfo?.role.toLowerCase() === ROLE.store
                        ? "rgba(22,24,35,0.12)"
                        : theme.colors.primary400,
                    height: "100%",
                    width: width / 2,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      userInfo?.role.toLowerCase() === ROLE.store
                        ? "rgba(22,24,35,0.34)"
                        : colors.white,
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Thêm vào giỏ hàng
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        )}
      </View>
    </>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({});
