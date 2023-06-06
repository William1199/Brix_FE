import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import StepIndicator from "react-native-step-indicator";
import Swiper from "react-native-swiper";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ROUTE } from "~/constants";
import { TypeServices } from "~/services";
import { showTabBar } from "~/utils/helper";
import ConfirmForm from "./components/ConfirmForm";
import InformationForm from "./components/InformationForm";
import SkillForm from "./components/SkillForm";

const MOCK_DATA = {
  forms: [InformationForm, SkillForm, ConfirmForm],
  labels: ["Thông tin", "Nhân viên", "Xác nhận"],
  customStyles: (theme) => ({
    stepIndicatorSize: 35,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 0,
    stepStrokeCurrentColor: theme.colors.primary300,
    stepStrokeWidth: 0,
    stepStrokeFinishedColor: theme.colors.primary300,
    separatorFinishedColor: theme.colors.primary300,
    separatorUnFinishedColor: "rgba(22,24,35,0.1)",
    stepIndicatorFinishedColor: theme.colors.primary300,
    stepIndicatorUnFinishedColor: "#DDDDDD",
    stepIndicatorCurrentColor: theme.colors.primary300,
    labelSize: 13,
    currentStepLabelColor: theme.colors.primary300,
  }),
};

const ConstructorUploadForm = () => {
  const { customStyles, labels, forms } = MOCK_DATA;
  const theme = useTheme();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  const height = useBottomTabBarHeight();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [data, setData] = useState({});
  const [historyStep, setHistoryStep] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [productList, setProductList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [bottomTabBarHeight] = useState(height);

  const getStepIndicatorIconConfig = ({ position, stepStatus }) => {
    const iconConfig = {
      name: "feed",
      color:
        stepStatus === "current" || stepStatus === "finished"
          ? theme.colors.textColor300
          : "black",
      size: stepStatus === "current" ? theme.sizes.large : theme.sizes.medium,
    };
    switch (position) {
      case 0: {
        iconConfig.name = "ios-document-outline";
        break;
      }
      case 1: {
        iconConfig.name = "people";
        break;
      }
      default: {
        iconConfig.name = "md-lock-open";
        break;
      }
    }
    return iconConfig;
  };

  const renderStepIndicator = (params) => (
    <Ionicons {...getStepIndicatorIconConfig(params)} />
  );

  const renderLabel = ({ label, stepStatus }) => {
    return (
      <Text
        style={
          stepStatus === "current" || stepStatus === "finished"
            ? {
                fontSize: 12,
                textAlign: "center",
                fontWeight: "600",
                color: theme.colors.primary300,
              }
            : {
                fontSize: 12,
                textAlign: "center",
                fontWeight: "500",
                color: "#999999",
              }
        }
      >
        {label}
      </Text>
    );
  };

  const fetchData = async () => {
    const data = await TypeServices.getList();
    setTypeList(data);
  };

  const handleSwapForm = (index) => {
    if (historyStep.includes(index)) {
      setCurrentPosition(index);
    }
  };

  useEffect(() => {
    // call api get type list & product list
    fetchData();
  }, []);

  useEffect(() => {
    if (!historyStep.includes(currentPosition))
      setHistoryStep((prev) => [...prev, currentPosition]);
  }, [currentPosition]);

  // alway show bottom bar when change step
  useLayoutEffect(() => {
    showTabBar({
      navigation,
      theme,
      height: bottomTabBarHeight,
    });
  }, [currentPosition]);

  return (
    <View
      style={{
        marginTop: theme.sizes.medium,
        flex: 1,
      }}
    >
      <StepIndicator
        stepCount={3}
        customStyles={customStyles(theme)}
        currentPosition={currentPosition}
        renderStepIndicator={renderStepIndicator}
        renderLabel={renderLabel}
        labels={labels}
        onPress={handleSwapForm}
      />

      <Swiper
        loop={false}
        index={currentPosition}
        autoplay={false}
        showsButtons={false}
        showsPagination={false}
        scrollEnabled={false}
        onIndexChanged={handleSwapForm}
      >
        {forms.map((page, idx) => {
          const Comp = page;
          return (
            <Comp
              key={idx}
              step={idx}
              data={data}
              isReset={isReset}
              productList={productList}
              typeList={typeList}
              currentPosition={currentPosition}
              onNextStep={(data) => {
                setData((prev) => ({ ...prev, ...data }));
                setCurrentPosition(idx + 1);
                setIsReset(false);
              }}
              onBack={() => setCurrentPosition(idx - 1)}
              onResetForm={() => {
                setCurrentPosition(0);
                setHistoryStep([]);
                setData({});
                setIsReset(true);
                Toast.show({
                  type: "success",
                  text1: "Đăng bài tuyển dụng thành công",
                  position: "top",
                  topOffset: top + 40,
                  visibilityTime: 2500,
                });
                navigation.navigate(ROUTE.home);
              }}
            />
          );
        })}
      </Swiper>
    </View>
  );
};

export default ConstructorUploadForm;
