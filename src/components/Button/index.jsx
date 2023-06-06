import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import theme from "~/app/theme";

const COLORS = {
  primary: theme.colors.primary400,
  secondary: "#D40011",
  diabled: "rgba(212, 212, 212, 1)",
};

const CustomButton = ({
  icon,
  onPress = () => {},
  children,
  variant = "default",
  size = "sm",
  style,
  textStyle,
  contentStyle,
  rounded,
  ...props
}) => {
  const textColor = useMemo(() => {
    switch (variant) {
      case "primary":
        return "#fff";
      case "secondary":
        return "#fff";
      case "disabled":
        return "#fff";
      default:
        return "rgba(22,24,35)";
    }
  }, [variant]);

  return (
    <Button
      icon={icon}
      textColor={textColor}
      style={[
        styles.button,
        styles[variant],
        rounded && {
          borderRadius: 100,
        },
        style,
      ]}
      labelStyle={[styles.text, textStyle]}
      contentStyle={[styles.innerContent, styles[size], contentStyle]}
      onPress={onPress}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  // default style
  button: {
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  innerContent: {
    paddingVertical: 4,
  },
  // variants
  default: {
    backgroundColor: "transparent",
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
  },
  outlined: {
    backgroundColor: "transparent",
    borderColor: "rgba(22,24,35,0.12)",
    borderWidth: 1,
  },
  // sizes
  md: {
    minWidth: 110,
    minHeight: 36,
  },
  sm: {
    minWidth: 88,
    minHeight: 28,
  },
});

export default CustomButton;
