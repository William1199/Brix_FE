import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// theme 835 href = https://www.instagram.com/p/ChZX9WUDqyd/
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary25: "#FAF5FF",
    primary50: "#EEDEF6",
    primary100: "#C3ACD0",
    primary200: "#C3ACD0",
    primary300: "#7157a9",
    primary400: "#6D45C1",
    secondary: "#D40011",
    textColor50: "#2B4F6E",
    textColor100: "#2B4F6E",
    textColor200: "#E9EDF7",
    textColor300: "#E9EDF7",
    textColor400: "#C8D0DF",
    grey50: "#D9D8D7",
    grey100: "#E5E5E5",
    neon: "#18DD9C",
    error: "rgb(255, 76, 58)",
    borderColor: "rgba(22, 24, 35, 0.06)",
    highlight: "rgb(237,164,74)",
    dark: "#0C0F14",
    darklight: "#2E333E",
  },
  sizes: {
    base: 8,
    small: 10,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    xxLarge: 30,
    xxxLarge: 40,
  },
};

export const FONTS = {
  thin: "BeVietnamPro-Thin",
  light: "BeVietnamPro-Light",
  regular: "BeVietnamPro-Regular",
  medium: "BeVietnamPro-Medium",
  semibold: "BeVietnamPro-SemiBold",
  bold: "BeVietnamPro-Bold",
  extrabold: "BeVietnamPro-ExtraBold",
  black: "BeVietnamPro-Black",
};

export const SHADOWS = {
  light: {
    shadowColor: "#74858C",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  medium: {
    shadowColor: "#74858C",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  dark: {
    shadowColor: "#74858C",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,

    elevation: 14,
  },
};

export default theme;
