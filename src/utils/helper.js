import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconButton } from "react-native-paper";
import { CURRENCY_VND_REGEX, MIDDLE_BTN_SIZE, ROUTE } from "~/constants";


export const formatStringToCurrency = (string) =>
  `${string.replace(CURRENCY_VND_REGEX, "$1,")} VND`;

export const setAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
};

export const getAsyncStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return JSON.parse(value);
  } catch (error) {
    console.log(error);
  }
};

export const hideTabBar = ({ navigation }) => {
  navigation.setOptions({
    tabBarStyle: {
      height: 0,
      position: "absolute",
      bottom: 0,
      opacity: 0,
    },
  });
};

export const showTabBar = ({ navigation, theme, height, name }) => {
  let uploadProps = {};
  if (name === ROUTE.upload) {
    uploadProps = {
      tabBarButton: ({
        accessibilityState: { selected },
        activeTintColor,
        ...props
      }) => {
        return (
          <IconButton
            icon="plus"
            iconColor={
              selected ? theme.colors.textColor400 : theme.colors.textColor300
            }
            size={40}
            {...props}
            style={{
              marginTop: -MIDDLE_BTN_SIZE / 2,
              width: MIDDLE_BTN_SIZE,
              height: MIDDLE_BTN_SIZE,
              backgroundColor: selected
                ? theme.colors.primary400
                : theme.colors.primary300,
              borderRadius: MIDDLE_BTN_SIZE / 2,
            }}
          />
        );
      },
    };
  }
  navigation.setOptions({
    tabBarStyle: {
      height: height,
      position: "absolute",
      bottom: 0,
      opacity: 1,
    },
    ...uploadProps,
  });
};

export const isCloseToBottom = ({
  layoutMeasurement,
  contentOffset,
  contentSize,
}) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

export const getRandomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const parseCurrencyText = (salary = "") => {
  if (!salary) return;

  if (salary.includes("+"))
    return `Từ ${formatStringToCurrency(salary?.replace("+", ""))}`;

  const salaries = salary.split("-");

  if (+salaries[0] === 0) {
    return `Lên đến ${formatStringToCurrency(salaries[1])}`;
  }

  return `${formatStringToCurrency(
    salaries[0] || ""
  )} - ${formatStringToCurrency(salaries[1] || "")}`;
};

