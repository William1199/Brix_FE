import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  MediaTypeOptions,
  PermissionStatus,
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import _ from "lodash";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Avatar, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import firebase from "~/app/firebase";
import {
  ConfirmDialog,
  Dialog,
  Loading,
  MessageUser,
  OpenURL,
} from "~/components";
import {
  ASYNC_STORAGE_KEY,
  FORMAT_DATE_REGEX,
  NO_IMAGE_URL,
  PLACES,
  PROFILE_FORM,
  PROVINCES,
  ROLE,
  ROUTE,
} from "~/constants";
import AuthContext from "~/context/AuthContext";
import {
  BuilderServices,
  ContractorServices,
  StoreServices,
  UsersServices,
} from "~/services";
import { setAsyncStorage } from "~/utils/helper";

const storage = firebase.getStorage();

const MOCK_DATA = {
  progress_step: 4,
  [ROLE.builder]: {
    general_default_value: {
      firstName: "",
      lastName: "",
      experience: "",
      typeID: "",
    },
    personal_default_value: {
      phone: "",
      gender: 0,
      street: "",
      province: "",
      district: "",
      dob: "",
    },
    skill_default_value: {
      skill: "",
    },
    experience_default_value: {
      position: "",
      companyName: "",
      from: "",
      to: "",
      description: "",
      isEnabled: false,
    },
    certificate_default_value: {
      name: "",
      companyName: "",
      from: "",
      path: "",
    },
  },

  [ROLE.contractor]: {
    verified_default_value: {
      faceImage: "",
      frontID: "",
      backID: "",
      businessLicense: "",
    },
    general_default_value: {
      firstName: "",
      lastName: "",
      email: "",
    },
    personal_default_value: {
      phone: "",
      gender: 0,
      street: "",
      province: "",
      district: "",
      dob: "",
    },
    company_default_value: {
      companyName: "",
      description: 0,
      website: "",
    },
  },

  [ROLE.store]: {
    general_default_value: {
      firstName: "",
      lastName: "",
      email: "",
      place: "",
    },
    personal_default_value: {
      phone: "",
      gender: 0,
      street: "",
      province: "",
      district: "",
      dob: "",
    },
    company_default_value: {
      taxCode: "",
      description: 0,
      website: "",
    },
  },
};

const progressList = {
  [ROLE.builder]: [
    {
      form: PROFILE_FORM.general,
      default_value: MOCK_DATA[ROLE.builder].general_default_value,
      data: undefined,
      desc: "Giúp nhà tuyển dụng biết bạn là ai",
    },
    {
      form: PROFILE_FORM.personal,
      default_value: MOCK_DATA[ROLE.builder].personal_default_value,
      data: undefined,
      desc: "Giúp nhà tuyển dụng biết bạn là ai",
    },
    {
      form: PROFILE_FORM.skills,
      default_value: MOCK_DATA[ROLE.builder].skill_default_value,
      data: undefined,
      desc: "Thể hiện những kĩ năng giúp bạn hoàn thành tốt công việc của mình",
    },
    {
      form: PROFILE_FORM.experience,
      default_value: MOCK_DATA[ROLE.builder].experience_default_value,
      data: undefined,
      desc: "Mô tả những vị trí bạn đã đảm nhiệm và kinh nghiệm bạn đạt được",
    },
    {
      form: PROFILE_FORM.certificate,
      default_value: MOCK_DATA[ROLE.builder].certificate_default_value,
      data: undefined,
      desc: "Mô tả những kĩ năng và kiến thức chuyên môn của bạn",
    },
  ],
  [ROLE.contractor]: [
    {
      form: PROFILE_FORM.general,
      default_value: MOCK_DATA[ROLE.contractor].general_default_value,
      data: undefined,
      desc: "Giúp nhân viên và cửa hàng biết bạn là ai",
    },
    {
      form: PROFILE_FORM.personal,
      default_value: MOCK_DATA[ROLE.contractor].personal_default_value,
      data: undefined,
      desc: "Giúp nhân viên và cửa hàng biết bạn là ai",
    },
    {
      form: PROFILE_FORM.company,
      default_value: MOCK_DATA[ROLE.contractor].company_default_value,
      data: undefined,
      desc: "Mô tả về công ty của bạn",
    },
  ],
  [ROLE.store]: [
    {
      form: PROFILE_FORM.general,
      default_value: MOCK_DATA[ROLE.store].general_default_value,
      data: undefined,
      desc: "Giúp nhân viên và nhà thầu biết bạn là ai",
    },
    {
      form: PROFILE_FORM.personal,
      default_value: MOCK_DATA[ROLE.store].personal_default_value,
      data: undefined,
      desc: "Giúp nhân viên và nhà thầu biết bạn là ai",
    },
    {
      form: PROFILE_FORM.company,
      default_value: MOCK_DATA[ROLE.store].company_default_value,
      data: undefined,
      desc: "Mô tả về cửa hàng của bạn",
    },
  ],
};

const BlockItem = ({ idx, desc, onShowDialog, ...props }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data, form } = props;
  const { userInfo } = useContext(AuthContext);

  const renderData = () => {
    switch (form) {
      case PROFILE_FORM.skills: {
        const { builder: { builderSkills = [] } = {} } = data || {};
        const mapList = builderSkills.map((x) => x.id);

        if (builderSkills.length === 0)
          return (
            <>
              <Text
                style={{
                  color: "rgba(22,24,35,0.5)",
                  marginTop: theme.sizes.base / 2,
                  marginBottom: theme.sizes.medium,
                  fontSize: theme.sizes.small + 2.5,
                }}
              >
                {desc}
              </Text>

              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.25,
                  }
                }
                onPress={() =>
                  navigation.navigate(ROUTE.dynamicProfileForm, {
                    ...props,
                    data: undefined,
                    prev: builderSkills,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    name="pluscircleo"
                    size={theme.sizes.large + 2}
                    color="blue"
                  />
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: "#2020ff",
                      marginLeft: theme.sizes.base - 2,
                      fontWeight: "400",
                    }}
                  >{`Thêm ${props.form}`}</Text>
                </View>
              </Pressable>
            </>
          );

        return (
          <>
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  position: "absolute",
                  right: 0,
                  top: 2,
                },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE.dynamicProfileForm, {
                  ...props,
                  data: undefined,
                  prev: mapList,
                })
              }
            >
              <Text style={{ color: "blue" }}>Thêm</Text>
            </Pressable>

            <View
              style={{
                marginTop: theme.sizes.font,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                marginBottom: -theme.sizes.base,
              }}
            >
              {builderSkills.map((item, index) => {
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.55,
                      },
                      {
                        backgroundColor: "rgba(100, 149, 237, 0.18)",
                        paddingVertical: theme.sizes.small,
                        paddingHorizontal: theme.sizes.font,
                        borderRadius: theme.sizes.large,
                        marginRight:
                          index !== builderSkills.length - 1
                            ? theme.sizes.base
                            : 0,
                        marginBottom: theme.sizes.base,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => {
                      navigation.navigate(ROUTE.dynamicProfileForm, {
                        ...props,
                        data: {
                          skill: item.name,
                        },
                        prev: mapList,
                      });
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: theme.sizes.medium - 1,
                          fontWeight: "600",
                          color: "#5252ff",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      }

      case PROFILE_FORM.experience: {
        const { builder: { experienceDetail } = {} } = data || {};
        const experienceList = experienceDetail
          ? experienceDetail?.split("|")
          : [];

        if (experienceList.length === 0)
          return (
            <>
              <Text
                style={{
                  color: "rgba(22,24,35,0.5)",
                  marginTop: theme.sizes.base / 2,
                  marginBottom: theme.sizes.medium,
                  fontSize: theme.sizes.small + 2.5,
                }}
              >
                {desc}
              </Text>

              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.25,
                  }
                }
                onPress={() =>
                  navigation.navigate(ROUTE.dynamicProfileForm, {
                    ...props,
                    data: undefined,
                    prev: experienceList,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    name="pluscircleo"
                    size={theme.sizes.large + 2}
                    color="blue"
                  />
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: "#2020ff",
                      marginLeft: theme.sizes.base - 2,
                      fontWeight: "400",
                    }}
                  >{`Thêm ${props.form}`}</Text>
                </View>
              </Pressable>
            </>
          );

        return (
          <>
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  position: "absolute",
                  right: 0,
                  top: 2,
                },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE.dynamicProfileForm, {
                  ...props,
                  data: undefined,
                  prev: experienceList,
                })
              }
            >
              <Text style={{ color: "blue" }}>Thêm</Text>
            </Pressable>

            <View
              style={{
                marginTop: theme.sizes.font,
              }}
            >
              {experienceList.map((item, index, array) => {
                const [position, companyName, from, to, description] =
                  item.split(";");

                const diff = moment(to, FORMAT_DATE_REGEX["DD/MM/YYYY"]).diff(
                  moment(from, FORMAT_DATE_REGEX["DD/MM/YYYY"]),
                  "months"
                );

                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.55,
                      },
                      {
                        backgroundColor: "rgba(22,24,35,0.06)",
                        padding: theme.sizes.font,
                        paddingBottom: theme.sizes.small,
                        borderRadius: theme.sizes.base,
                        marginBottom:
                          index !== array.length - 1 ? theme.sizes.base : 0,
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate(ROUTE.dynamicProfileForm, {
                        ...props,
                        data: {
                          position,
                          companyName,
                          from,
                          to,
                          isEnabled: to === "undefined" ? true : false,
                          description,
                        },
                        prev: experienceList,
                      })
                    }
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: theme.sizes.medium - 1,
                          fontWeight: "600",
                          marginBottom: theme.sizes.base / 2,
                        }}
                      >
                        {position}
                      </Text>

                      <Text>Tại {companyName}</Text>

                      {from !== "undefined" && (
                        <Text
                          style={{
                            marginTop: theme.sizes.base / 2,
                            fontSize: theme.sizes.small + 2,
                            color: "rgba(22,24,35,0.84)",
                          }}
                        >
                          {`${from} - ${to === "undefined" ? "Hiện Tại" : to}`}

                          {!isNaN(diff) && diff !== 0 && (
                            <Text> ({diff} tháng)</Text>
                          )}
                        </Text>
                      )}
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        pressed && {
                          opacity: 0.25,
                        },
                        {
                          position: "absolute",
                          right: theme.sizes.font,
                          top: theme.sizes.small,
                        },
                      ]}
                      onPress={() =>
                        onShowDialog(item, PROFILE_FORM.experience)
                      }
                    >
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={theme.sizes.extraLarge}
                        color="rgba(22,24,35,0.64)"
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      }

      case PROFILE_FORM.certificate: {
        const { builder: { certificate } = {} } = data || {};
        const certificateList = certificate ? certificate?.split("|") : [];

        if (certificateList.length === 0)
          return (
            <>
              <Text
                style={{
                  color: "rgba(22,24,35,0.5)",
                  marginTop: theme.sizes.base / 2,
                  marginBottom: theme.sizes.medium,
                  fontSize: theme.sizes.small + 2.5,
                }}
              >
                {desc}
              </Text>

              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.25,
                  }
                }
                onPress={() =>
                  navigation.navigate(ROUTE.dynamicProfileForm, {
                    ...props,
                    data: undefined,
                    prev: certificateList,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AntDesign
                    name="pluscircleo"
                    size={theme.sizes.large + 2}
                    color="blue"
                  />
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: "#2020ff",
                      marginLeft: theme.sizes.base - 2,
                      fontWeight: "400",
                    }}
                  >{`Thêm ${props.form}`}</Text>
                </View>
              </Pressable>
            </>
          );

        return (
          <>
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.25,
                },
                {
                  position: "absolute",
                  right: 0,
                  top: 2,
                },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE.dynamicProfileForm, {
                  ...props,
                  data: undefined,
                  prev: certificateList,
                })
              }
            >
              <Text style={{ color: "blue" }}>Thêm</Text>
            </Pressable>

            <View
              style={{
                marginTop: theme.sizes.font,
              }}
            >
              {certificateList.map((item, index, array) => {
                const [name, companyName, from, path] = item.split(";");

                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      pressed && {
                        opacity: 0.55,
                      },
                      {
                        backgroundColor: "rgba(22,24,35,0.06)",
                        padding: theme.sizes.font,
                        paddingBottom: theme.sizes.small,
                        borderRadius: theme.sizes.base,
                        marginBottom:
                          index !== array.length - 1 ? theme.sizes.base : 0,
                        minHeight: 50,
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate(ROUTE.dynamicProfileForm, {
                        ...props,
                        data: {
                          name,
                          companyName,
                          from,
                          path,
                        },
                        prev: certificateList,
                      })
                    }
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: theme.sizes.medium - 1,
                          fontWeight: "600",
                          marginBottom: theme.sizes.base / 2,
                        }}
                      >
                        {name}
                      </Text>

                      {companyName && (
                        <Text>{`${companyName}${
                          from !== "undefined" ? ` - ${from.slice(-4)}` : ""
                        }`}</Text>
                      )}

                      {path && (
                        <OpenURL
                          url={path}
                          style={({ pressed }) => [
                            pressed && {
                              opacity: 0.25,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: "#5050fd",
                              marginTop: theme.sizes.base,
                            }}
                          >
                            Đường dẫn chứng chỉ
                          </Text>
                        </OpenURL>
                      )}
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        pressed && {
                          opacity: 0.25,
                        },
                        {
                          position: "absolute",
                          right: theme.sizes.font,
                          top: theme.sizes.small,
                        },
                      ]}
                      onPress={() =>
                        onShowDialog(item, PROFILE_FORM.certificate)
                      }
                    >
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={theme.sizes.extraLarge}
                        color="rgba(22,24,35,0.64)"
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      }

      default:
        return (
          <>
            <Text
              style={{
                color: "rgba(22,24,35,0.5)",
                marginTop: theme.sizes.base / 2,
                marginBottom: theme.sizes.medium,
                fontSize: theme.sizes.small + 2.5,
              }}
            >
              {desc}
            </Text>

            <Pressable
              style={({ pressed }) =>
                pressed && {
                  opacity: 0.25,
                }
              }
              onPress={() => {
                const _props = { ...props };
                switch (form) {
                  case PROFILE_FORM.general:
                    if (userInfo?.role?.toLowerCase() === ROLE.builder) {
                      {
                        _props.data = {
                          firstName: data.firstName || "",
                          lastName: data.lastName || "",
                          experience: data.builder.experience?.toString() || "",
                          typeID: data.builder.typeID?.toString() || "",
                          idNumber: data.idNumber || "",
                          place: data.builder.place || "",
                        };
                      }
                    } else if (
                      userInfo?.role?.toLowerCase() === ROLE.contractor
                    ) {
                      _props.data = {
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || "",
                      };
                    } else {
                      _props.data = {
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || "",
                        place:
                          data.detailMaterialStore.place ||
                          data.detailMaterialStore.place === 0
                            ? data.detailMaterialStore.place
                            : "",
                      };
                    }
                    break;

                  case PROFILE_FORM.personal:
                    {
                      _props.data = {
                        province:
                          data.province || data.province === 0
                            ? data.province
                            : "",
                        district:
                          data.district || data.district === 0
                            ? data.district
                            : "",
                        street:
                          data.street || data.street === 0 ? data.street : "",
                        gender:
                          data.gender || data.gender === 0 ? data.gender : "",
                        dob: data.dob || "",
                        phone: data.phone || "",
                      };
                    }
                    break;

                  case PROFILE_FORM.company: {
                    if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
                      _props.data = {
                        companyName: data.contractor.companyName || "",
                        website: data.contractor.website || "",
                        description: data.contractor.description || "",
                      };
                    } else {
                      _props.data = {
                        taxCode: data.detailMaterialStore.taxCode || "",
                        website: data.detailMaterialStore.website || "",
                        description: data.detailMaterialStore.description || "",
                      };
                    }
                  }
                }

                navigation.navigate(ROUTE.dynamicProfileForm, { ..._props });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AntDesign
                  name="pluscircleo"
                  size={theme.sizes.large + 2}
                  color="blue"
                />
                <Text
                  style={{
                    textTransform: "capitalize",
                    color: "#2020ff",
                    marginLeft: theme.sizes.base - 2,
                    fontWeight: "400",
                  }}
                >{`Thêm ${props.form}`}</Text>
              </View>
            </Pressable>
          </>
        );
    }
  };

  return (
    <View>
      <Text
        style={{
          fontWeight: "600",
          fontSize: theme.sizes.medium,
          textTransform: "capitalize",
        }}
      >
        {props.form}
      </Text>

      {renderData()}
    </View>
  );
};

const MyProfileScreen = ({ navigation, route }) => {
  const { progress_step } = MOCK_DATA;
  const theme = useTheme();
  const { updatedData, isFetchData = false, form } = route.params || {};
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const [imagePermission, requestPermission] = useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [subLoading, setSubLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [isAvatarOptions, setIsAvatarOptions] = useState(false);
  const [isDialogShow, setIsDialogShow] = useState({
    isShow: false,
    form: "",
  });
  const [isConfirmDialogShow, setIsConfirmDialogShow] = useState({
    isShow: false,
    form: "",
  });

  const [experienceDetailSelected, setExperienceDetailSelected] = useState();

  const handleDeleteExperienceDetail = async () => {
    const _experienceList = profile?.builder?.experienceDetail?.split("|");
    const experienceDetail = _experienceList
      .filter((x) => x !== experienceDetailSelected)
      .join("|");

    const isSuccess = await BuilderServices.updateProfile({
      experienceDetail: experienceDetail,
    });
    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Kinh nghiệm của bạn đã xóa thành công",
        position: "bottom",
        visibilityTime: 2500,
      });
      setIsConfirmDialogShow((prev) => ({
        ...prev,
        isShow: false,
      }));
      setProfile((prev) => {
        if (!_.isEmpty(prev)) {
          _.set(prev, "builder.experienceDetail", experienceDetail);
        }
        return { ...prev };
      });
    }
  };

  const handleDeleteCertificate = async () => {
    const _certificateList = profile?.builder?.certificate?.split("|");
    const certificate = _certificateList
      .filter((x) => x !== experienceDetailSelected)
      .join("|");

    const isSuccess = await BuilderServices.updateProfile({
      certificate: certificate || null,
    });
    if (isSuccess) {
      Toast.show({
        type: "success",
        text1: "Chứng chỉ của bạn đã xóa thành công",
        position: "bottom",
        visibilityTime: 2500,
      });
      setIsConfirmDialogShow((prev) => ({
        ...prev,
        isShow: false,
      }));
      setProfile((prev) => {
        if (!_.isEmpty(prev)) {
          _.set(prev, "builder.certificate", certificate);
        }
        return { ...prev };
      });
    }
  };

  const renderConfirmDialogContent = () => {
    if (isDialogShow.form === PROFILE_FORM.experience) {
      return (
        <>
          <Pressable
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              {
                padding: 14,
                borderBottomColor: "rgba(22,24,35,0.06)",
                borderBottomWidth: 1,
              },
            ]}
            onPress={() => {
              const [position, companyName, from, to, description] =
                experienceDetailSelected.split(";");

              setIsDialogShow({
                isShow: false,
                form: PROFILE_FORM.experience,
              });
              navigation.navigate(ROUTE.dynamicProfileForm, {
                form: PROFILE_FORM.experience,
                default_value: MOCK_DATA[ROLE.builder].experience_default_value,
                data: {
                  position,
                  companyName,
                  from,
                  to,
                  isEnabled: to === "undefined" ? true : false,
                  description,
                },
                prev: profile.builder.experienceDetail
                  ? profile.builder.experienceDetail.split("|")
                  : [],
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
              Chỉnh sửa kinh nghiệm
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              { padding: 14 },
            ]}
            onPress={() => {
              setIsDialogShow((prev) => ({
                ...prev,
                isShow: false,
              }));
              setIsConfirmDialogShow({
                isShow: true,
                form: PROFILE_FORM.experience,
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "red" }}>
              Xóa kinh nghiệm
            </Text>
          </Pressable>
        </>
      );
    } else {
      return (
        <>
          <Pressable
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              {
                padding: 14,
                borderBottomColor: "rgba(22,24,35,0.06)",
                borderBottomWidth: 1,
              },
            ]}
            onPress={() => {
              const [name, companyName, from, path] =
                experienceDetailSelected.split(";");

              setIsDialogShow({
                isShow: false,
                form: PROFILE_FORM.certificate,
              });

              navigation.navigate(ROUTE.dynamicProfileForm, {
                form: PROFILE_FORM.certificate,
                default_value:
                  MOCK_DATA[ROLE.builder].certificate_default_value,
                data: {
                  name,
                  companyName,
                  from,
                  path,
                },
                prev: profile.builder.certificate
                  ? profile.builder.certificate.split("|")
                  : [],
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
              Chỉnh sửa chứng chỉ
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              pressed && {
                backgroundColor: "rgba(22,24,35,0.06)",
              },
              { padding: 14 },
            ]}
            onPress={() => {
              setIsDialogShow((prev) => ({
                ...prev,
                isShow: false,
              }));
              setIsConfirmDialogShow({
                isShow: true,
                form: PROFILE_FORM.certificate,
              });
            }}
          >
            <Text style={{ fontSize: 20, textAlign: "center", color: "red" }}>
              Xóa chứng chỉ
            </Text>
          </Pressable>
        </>
      );
    }
  };

  const renderAvatarOptionsDialogContent = () => {
    const verifyPermissions = async () => {
      if (imagePermission.status === PermissionStatus.UNDETERMINED) {
        const response = await requestPermission();
        return response.granted;
      }

      if (imagePermission.status === PermissionStatus.DENIED) {
        return false;
      }

      return true;
    };

    const verifyCameraPermissions = async () => {
      if (cameraPermission.status === PermissionStatus.UNDETERMINED) {
        const response = await requestCameraPermission();
        return response.granted;
      }

      if (cameraPermission.status === PermissionStatus.DENIED) {
        return false;
      }

      return true;
    };

    const uploadImageAsync = async (uri) => {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `${userInfo?.id}/avatar`);
      const snapshot = await uploadBytes(storageRef, blob);

      return await getDownloadURL(snapshot.ref);
    };

    const handlePickImage = async () => {
      try {
        if (!verifyPermissions()) return;

        const { assets } = await launchImageLibraryAsync({
          allowsMultipleSelection: false,
          mediaTypes: MediaTypeOptions.Images,
          aspect: [4, 3],
          quality: 0.2,
        });

        setIsAvatarOptions(false);
        setSubLoading(true);
        if (Array.isArray(assets)) {
          const url = await uploadImageAsync(assets[0].uri);
          let services = BuilderServices;
          switch (userInfo?.role?.toLowerCase()) {
            case ROLE.store:
              services = StoreServices;
              break;
            case ROLE.contractor:
              services = ContractorServices;
              break;
          }

          const { isSuccess, data } = await services.updateProfile({
            avatar: url,
          });
          if (isSuccess) {
            setUserInfo((prev) => ({
              ...prev,
              avatar: url,
              status: data ? +data : prev.status,
            }));
            await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, {
              ...userInfo,
              avatar: url,
              status: data ? +data : prev.status,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Cập nhật ảnh đại diện không thành công!",
              position: "bottom",
              visibilityTime: 2500,
            });
          }
        }
      } catch (error) {
        console.log({ error });
      } finally {
        setSubLoading(false);
      }
    };

    const handleTakeImage = async () => {
      try {
        if (!verifyCameraPermissions()) return;

        const { assets } = await launchCameraAsync({
          mediaTypes: MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.2,
        });

        setIsAvatarOptions(false);
        setSubLoading(true);
        if (Array.isArray(assets)) {
          const url = await uploadImageAsync(assets[0].uri);
          let services = BuilderServices;
          switch (userInfo?.role?.toLowerCase()) {
            case ROLE.store:
              services = StoreServices;
              break;
            case ROLE.contractor:
              services = ContractorServices;
              break;
          }

          const isSuccess = await services.updateProfile({
            avatar: url,
          });
          if (isSuccess) {
            setUserInfo((prev) => ({ ...prev, avatar: url }));
          } else {
            Toast.show({
              type: "error",
              text1: "Cập nhật ảnh đại diện không thành công!",
              position: "bottom",
              visibilityTime: 2500,
            });
          }
        }
      } catch (error) {
        console.log({ error });
      } finally {
        setSubLoading(false);
      }
    };

    return (
      <>
        <Pressable
          style={({ pressed }) => [
            pressed && {
              backgroundColor: "rgba(22,24,35,0.06)",
            },
            {
              padding: 14,
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
            },
          ]}
          onPress={handleTakeImage}
        >
          <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
            Chụp hình từ camera
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            pressed && {
              backgroundColor: "rgba(22,24,35,0.06)",
            },
            {
              padding: 14,
              borderBottomColor: "rgba(22,24,35,0.06)",
              borderBottomWidth: 1,
            },
          ]}
          onPress={handlePickImage}
        >
          <Text style={{ fontSize: 20, textAlign: "center", color: "blue" }}>
            Chọn ảnh từ thư viện
          </Text>
        </Pressable>
      </>
    );
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { address = "", ...rest } = await UsersServices.getProfileById(
        userInfo?.id
      );

      let [street, district, province] = address?.split(", ") || [];
      if ((district || district === 0) && (province || province === 0)) {
        province = PLACES.indexOf(province);
        district = PROVINCES[province]?.indexOf(district);
      }

      setLoading(false);
      setProfile({
        ...rest,
        street,
        province,
        district,
      });
    })();
  }, []);

  useEffect(() => {
    if (isFetchData) {
      switch (form) {
        case PROFILE_FORM.general: {
          setProfile((prev) => {
            if (userInfo?.role?.toLowerCase() === ROLE.builder) {
              const { typeID, experience, place, ...rest } = updatedData;
              if (!_.isEmpty(prev)) {
                _.set(prev, "builder.typeID", typeID);
                _.set(prev, "builder.experience", experience);
                _.set(prev, "builder.place", place);
              }
              return {
                ...prev,
                ...rest,
              };
            } else if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
              return {
                ...prev,
                ...updatedData,
              };
            } else {
              const { place, ...rest } = updatedData;
              if (!_.isEmpty(prev)) {
                _.set(prev, "detailMaterialStore.place", place);
              }
              return {
                ...prev,
                ...rest,
              };
            }
          });
          return;
        }

        case PROFILE_FORM.personal: {
          setProfile((prev) => {
            return {
              ...prev,
              ...updatedData,
            };
          });
          return;
        }

        case PROFILE_FORM.skills: {
          setProfile((prev) => {
            if (!_.isEmpty(prev)) {
              _.set(prev, "builder.builderSkills", updatedData);
            }
            return {
              ...prev,
            };
          });
          return;
        }

        case PROFILE_FORM.experience: {
          setProfile((prev) => {
            if (!_.isEmpty(prev)) {
              _.set(
                prev,
                "builder.experienceDetail",
                updatedData.experienceDetail
              );
            }
            return { ...prev };
          });
          return;
        }

        case PROFILE_FORM.certificate: {
          setProfile((prev) => {
            if (!_.isEmpty(prev)) {
              _.set(prev, "builder.certificate", updatedData.certificate);
            }
            return { ...prev };
          });
          return;
        }

        case PROFILE_FORM.company: {
          setProfile((prev) => {
            if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
              const { companyName, description, website } = updatedData;
              if (!_.isEmpty(prev)) {
                _.set(prev, "contractor.companyName", companyName);
                _.set(prev, "contractor.description", description);
                _.set(prev, "contractor.website", website);
              }
            } else {
              const { taxCode, description, website } = updatedData;
              if (!_.isEmpty(prev)) {
                _.set(prev, "detailMaterialStore.taxCode", taxCode);
                _.set(prev, "detailMaterialStore.description", description);
                _.set(prev, "detailMaterialStore.website", website);
              }
            }
            return {
              ...prev,
            };
          });
          return;
        }
      }
    }
  }, [isFetchData, updatedData]);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" />

      {subLoading && <Loading isModal />}

      {/* dialog */}
      <Dialog
        visible={isDialogShow.isShow}
        onClose={() =>
          setIsDialogShow((prev) => ({
            ...prev,
            isShow: false,
          }))
        }
      >
        {renderConfirmDialogContent()}
      </Dialog>

      {/* dialog */}
      <Dialog
        visible={isAvatarOptions}
        onClose={() => setIsAvatarOptions(false)}
        cancelLabelStyle={{ color: theme.colors.error }}
      >
        {renderAvatarOptionsDialogContent()}
      </Dialog>

      <ConfirmDialog
        visible={isConfirmDialogShow.isShow}
        title={
          isConfirmDialogShow.form === PROFILE_FORM.experience
            ? "Bạn có muốn xóa kinh nghiệm này"
            : "Bạn có muốn xóa chứng chỉ này"
        }
        confirmText="Xóa"
        onClose={() => {
          setIsConfirmDialogShow((prev) => ({
            ...prev,
            isShow: false,
          }));
        }}
        onConfirm={
          isConfirmDialogShow.form === PROFILE_FORM.experience
            ? handleDeleteExperienceDetail
            : handleDeleteCertificate
        }
      />

      {/* header */}
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor: "rgba(22,24,35,0.06)",
            borderBottomWidth: 1,
            paddingTop: theme.sizes.small,
            backgroundColor: "white",
          },
          styles.container,
        ]}
      >
        <Ionicons
          name="home"
          size={theme.sizes.extraLarge}
          color="rgba(22,24,35,0.64)"
          style={{
            opacity: 0,
          }}
        />

        <Text
          style={{
            fontWeight: "600",
            fontSize: theme.sizes.large,
            textTransform: "capitalize",
          }}
        >
          hồ sơ
        </Text>

        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.25 }}
          onPress={() => {
            navigation.navigate(ROUTE.home);
          }}
        >
          <Ionicons
            name="home"
            size={theme.sizes.extraLarge}
            color="rgba(22,24,35,0.64)"
          />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        {/* profile */}
        <View
          style={[
            styles.container,
            {
              backgroundColor: "white",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: theme.sizes.small + 2,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.55,
                },
              ]}
              onPress={() => setIsAvatarOptions(true)}
            >
              <Avatar.Image
                source={{ uri: userInfo?.avatar || NO_IMAGE_URL }}
                size={80}
              />
              <View
                style={{
                  backgroundColor: "rgba(22,24,35,0.15)",
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  padding: theme.sizes.base / 2,
                  borderRadius: 100,
                }}
              >
                <Entypo
                  name="camera"
                  size={theme.sizes.small + 2}
                  color="rgba(22,24,35,1)"
                />
              </View>
            </Pressable>

            {/* grid number */}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                maxWidth: 65,
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  marginBottom: theme.sizes.small + 2,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? profile?.builder?.experience || 0
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? profile?.contractor?.postCount || 0
                  : profile?.detailMaterialStore?.productCount || 0}
                {}
              </Text>

              <Text
                style={{
                  color: "rgba(22,24,35,0.6)",
                  fontSize: theme.sizes.small + 2,
                  textAlign: "center",
                  lineHeight: 15,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? "Năm kinh nghiệm"
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? "Bài đã đăng"
                  : "Tổng sản phẩm"}
              </Text>
            </View>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                maxWidth: 65,
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  marginBottom: theme.sizes.small + 2,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? profile?.builder?.inviteCount || 0
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? profile?.contractor?.billCount || 0
                  : profile?.detailMaterialStore?.billCount || 0}
              </Text>
              <Text
                style={{
                  color: "rgba(22,24,35,0.6)",
                  fontSize: theme.sizes.small + 2,
                  textAlign: "center",
                  lineHeight: 15,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? "Lời mời việc làm"
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? "Đơn hàng đã mua"
                  : "Đơn hàng đã bán"}
              </Text>
            </View>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                maxWidth: 65,
              }}
            >
              <Text
                style={{
                  fontSize: theme.sizes.small + 2,
                  fontWeight: "500",
                  marginBottom: theme.sizes.small + 2,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? profile?.builder?.appliedCount || 0
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? moment(profile?.lastModifiedAt).fromNow() || 0
                  : moment(profile?.lastModifiedAt).fromNow() || 0}
              </Text>
              <Text
                style={{
                  color: "rgba(22,24,35,0.6)",
                  fontSize: theme.sizes.small + 2,
                  textAlign: "center",
                  lineHeight: 15,
                }}
              >
                {userInfo?.role.toLowerCase() === ROLE.builder
                  ? "Viêc làm ứng tuyển"
                  : userInfo?.role.toLowerCase() === ROLE.contractor
                  ? "Lần cuối chỉnh sửa"
                  : "Lần cuối chỉnh sửa"}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={{
                marginTop: theme.sizes.medium,
                fontSize: theme.sizes.medium,
                fontWeight: "600",
                marginBottom: theme.sizes.base / 4,
              }}
            >
              {userInfo.firstName + " " + userInfo.lastName}
            </Text>

            <View
              style={{
                marginTop: theme.sizes.small,
              }}
            >
              {userInfo?.address && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  <Ionicons name="location" size={theme.sizes.medium} />
                  <Text
                    style={{
                      marginLeft: theme.sizes.base,
                      fontSize: theme.sizes.font - 2,
                      textTransform: "capitalize",
                    }}
                  >
                    {userInfo?.address}
                  </Text>
                </View>
              )}

              {userInfo?.email && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  <Ionicons name="mail" size={theme.sizes.medium} />
                  <Text
                    style={{
                      marginLeft: theme.sizes.base,
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    {userInfo?.email}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="phone" size={theme.sizes.medium} />
                <Text
                  style={{
                    marginLeft: theme.sizes.base,
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  {userInfo?.phone}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              pressed && {
                opacity: 0.55,
              },
              {
                marginTop: theme.sizes.small,
              },
            ]}
            onPress={() => {
              let data = { ...profile };
              if (userInfo?.role?.toLowerCase() === ROLE.builder) {
                {
                  data = {
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    experience: data.builder.experience?.toString() || "",
                    typeID: data.builder.typeID?.toString() || "",
                  };
                }
              } else if (userInfo?.role?.toLowerCase() === ROLE.contractor) {
                data = {
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  email: data.email || "",
                };
              } else {
                data = {
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  email: data.email || "",
                  place:
                    data.detailMaterialStore.place ||
                    data.detailMaterialStore.place === 0
                      ? data.detailMaterialStore.place
                      : "",
                };
              }
              navigation.navigate(ROUTE.dynamicProfileForm, {
                ...progressList[userInfo?.role?.toLowerCase()].find(
                  (x) => x.form === PROFILE_FORM.general
                ),
                data,
              });
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(22,24,35,0.08)",
                padding: theme.sizes.small + 2,
                borderRadius: theme.sizes.base - 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(22,24,35,0.5)",
                  fontSize: theme.sizes.font,
                  textTransform: "capitalize",
                  fontWeight: "600",
                }}
              >
                Chỉnh sửa thông tin cơ bản
              </Text>
            </View>
          </Pressable>
        </View>

        <MessageUser profile={profile} />

        {/* divider */}
        <View
          style={{ padding: 4, backgroundColor: "rgba(22,24,35,0.09)" }}
        ></View>

        <View
          style={[
            styles.container,
            {
              backgroundColor: "white",
              marginVertical: theme.sizes.base,
              paddingTop: theme.sizes.small,
            },
          ]}
        >
          {/* title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: theme.sizes.medium,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              hồ sơ Brix
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(22,24,35,0.08)",
                borderRadius: theme.sizes.medium,
                paddingHorizontal: theme.sizes.small,
                paddingVertical: theme.sizes.base - 3,
              }}
            >
              <AntDesign
                name="checkcircle"
                size={theme.sizes.font}
                color={
                  userInfo?.status != (0 && 2) ? "rgba(22,24,35,0.34)" : "green"
                }
              />
              <Text
                style={{
                  marginLeft: theme.sizes.base - 2,
                  color: "rgba(22,24,35,0.64)",
                  fontWeight: "500",
                  fontSize: theme.sizes.small + 1,
                }}
              >
                {userInfo?.status != (0 && 2) ? "Chưa xác nhận" : "Đã xác nhận"}
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginVertical: theme.sizes.base - 2,
              fontSize: theme.sizes.small + 3,
              color: "rgba(22,24,35,0.64)",
            }}
          >
            Bổ sung thông tin đạt bậc cơ bản để hồ sơ được xác nhận
          </Text>

          {/* progress */}
          <View
            style={{
              marginTop: theme.sizes.base / 2,
              paddingBottom: theme.sizes.medium,
              marginBottom: theme.sizes.font,
              borderBottomColor: "rgba(22,24,35,0.12)",
              borderBottomWidth: 1,
            }}
          >
            {/* <Text style={{ fontSize: theme.sizes.font - 1 }}>
              Đã hoàn thành 6%:{" "}
              <Text
                style={{
                  color: "#d1d136",
                  fontWeight: "600",
                }}
              >
                Cơ bản
              </Text>
            </Text> */}

            {/* progress-bar */}
            {/* <View style={{ flexDirection: "row", marginTop: theme.sizes.base }}>
              {[...Array(progress_step)].map((_, idx, arr) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    padding: 5,
                    marginHorizontal: 1,
                    backgroundColor: "rgba(22,24,35,0.08)",
                    borderTopStartRadius: idx === 0 && theme.sizes.base / 2,
                    borderBottomStartRadius: idx === 0 && theme.sizes.base / 2,
                    borderTopEndRadius:
                      idx === arr.length - 1 && theme.sizes.base / 2,
                    borderBottomEndRadius:
                      idx === arr.length - 1 && theme.sizes.base / 2,
                  }}
                ></View>
              ))}

              <View
                style={{
                  padding: 5,
                  backgroundColor: "#d1d136",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  borderRadius: theme.sizes.base,
                  width: "22%",
                }}
              ></View>
            </View> */}

            <ScrollView
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              horizontal
            >
              {progressList[userInfo?.role?.toLowerCase()].map(
                (item, idx, arr) => (
                  <Pressable
                    key={idx}
                    style={({ pressed }) =>
                      pressed && {
                        opacity: 0.25,
                      }
                    }
                    onPress={() => {
                      let data = { ...profile };
                      let passProps = {};
                      switch (item.form) {
                        case PROFILE_FORM.general:
                          if (userInfo?.role?.toLowerCase() === ROLE.builder) {
                            {
                              data = {
                                firstName: data.firstName || "",
                                lastName: data.lastName || "",
                                experience:
                                  data.builder.experience?.toString() || "",
                                typeID: data.builder.typeID?.toString() || "",
                                place: data.builder.place || "",
                                idNumber: data.idNumber || "",
                              };
                            }
                          } else if (
                            userInfo?.role?.toLowerCase() === ROLE.contractor
                          ) {
                            data = {
                              firstName: data.firstName || "",
                              lastName: data.lastName || "",
                              email: data.email || "",
                            };
                          } else {
                            data = {
                              firstName: data.firstName || "",
                              lastName: data.lastName || "",
                              email: data.email || "",
                              place:
                                data.detailMaterialStore.place ||
                                data.detailMaterialStore.place === 0
                                  ? data.detailMaterialStore.place
                                  : "",
                            };
                          }
                          break;

                        case PROFILE_FORM.personal:
                          {
                            data = {
                              province:
                                data.province || data.province === 0
                                  ? data.province
                                  : "",
                              district:
                                data.district || data.district === 0
                                  ? data.district
                                  : "",
                              street:
                                data.street || data.street === 0
                                  ? data.street
                                  : "",
                              gender:
                                data.gender || data.gender === 0
                                  ? data.gender
                                  : "",
                              dob: data.dob || "",
                              phone: data.phone || "",
                            };
                          }
                          break;

                        case PROFILE_FORM.company: {
                          if (
                            userInfo?.role?.toLowerCase() === ROLE.contractor
                          ) {
                            data = {
                              companyName: data.contractor.companyName || "",
                              website: data.contractor.website || "",
                              description: data.contractor.description || "",
                            };
                          } else {
                            data = {
                              taxCode: data.detailMaterialStore.taxCode || "",
                              website: data.detailMaterialStore.website || "",
                              description:
                                data.detailMaterialStore.description || "",
                            };
                          }
                        }

                        case PROFILE_FORM.skills:
                          {
                            const { builder: { builderSkills = [] } = {} } =
                              data || {};
                            const mapList = builderSkills.map((x) => x.id);

                            passProps = {
                              data: undefined,
                              prev: mapList,
                            };
                          }
                          break;

                        case PROFILE_FORM.experience: {
                          const { builder: { experienceDetail } = {} } =
                            data || {};
                          const experienceList = experienceDetail
                            ? experienceDetail?.split("|")
                            : [];

                          passProps = {
                            data: undefined,
                            prev: experienceList,
                          };
                          break;
                        }

                        case PROFILE_FORM.certificate: {
                          const { builder: { certificate } = {} } = data || {};
                          const certificateList = certificate
                            ? certificate?.split("|")
                            : [];

                          passProps = {
                            data: undefined,
                            prev: certificateList,
                          };
                          break;
                        }
                      }

                      navigation.navigate(ROUTE.dynamicProfileForm, {
                        ...item,
                        data,
                        ...passProps,
                      });
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(22,24,35, 0.06)",
                        paddingHorizontal: theme.sizes.small,
                        paddingVertical: theme.sizes.base,
                        flexDirection: "row",
                        alignItems: "center",
                        borderRadius: theme.sizes.medium,
                        marginRight:
                          idx !== arr.length - 1 ? theme.sizes.base : 0,
                        borderColor: "rgba(22,24,35,0.12)",
                        borderWidth: 0.5,
                      }}
                    >
                      <AntDesign name="pluscircleo" size={theme.sizes.medium} />
                      <Text
                        style={{
                          marginLeft: theme.sizes.base / 2,
                          textTransform: "capitalize",
                        }}
                      >
                        {item.form}
                      </Text>
                    </View>
                  </Pressable>
                )
              )}
            </ScrollView>
          </View>

          <View>
            {progressList[userInfo?.role?.toLowerCase()].map(
              (item, idx, arr) => (
                <View
                  key={idx}
                  style={
                    idx !== arr.length - 1 && {
                      paddingBottom: theme.sizes.medium,
                      marginBottom: theme.sizes.font,
                      borderBottomColor: "rgba(22,24,35,0.12)",
                      borderBottomWidth: 1,
                    }
                  }
                >
                  <BlockItem
                    idx={idx}
                    {...item}
                    data={profile}
                    onShowDialog={(selected, form) => {
                      setIsDialogShow({
                        isShow: true,
                        form,
                      });
                      setExperienceDetailSelected(selected);
                    }}
                  />
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});

export default MyProfileScreen;
