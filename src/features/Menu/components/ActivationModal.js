import { Ionicons } from "@expo/vector-icons";
import Icon from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useContext } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { FORMAT_DATE_REGEX, NOW, ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { getRandomBetween } from "~/utils/helper";

const { height, width } = Dimensions.get("window");

const ActivationModal = ({
  type,
  setConfirm,
  setVisible,
  endDate,
  setVisible2,
  setConfirm2,
}) => {
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();

  const styles = StyleSheet.create({
    cardContainer: {
      minHeight: type == 1 ? 100 : 150,
      width: "80%",
      backgroundColor: theme.colors.primary100,
      borderRadius: 30,
    },
    card: {
      minHeight: type == 1 ? 100 : 150,
      width: "90%",
      paddingHorizontal: type == 1 ? 20 : 25,
      paddingVertical: 14,
      backgroundColor: theme.colors.primary50,
      borderRadius: 30,

      justifyContent: "space-around",
    },
    title: {
      color: "rgba(22,24,35,1)",
      fontSize: 14,
      fontWeight: "bold",
      lineHeight: 20
    },
    number: {
      color: "#FFF",
      fontSize: 22,
      fontWeight: "bold",
      textAlign: 'center'
    },
    textCovid: {
      transform: [{ rotate: "-90deg" }, { translateY: 20 }, { translateX: 10 }],
      color: "white",
      fontSize: 14,
      fontWeight: "bold",
    },
  });

  const renderTitle = () => {
    switch (type) {
      case 0:
        return (
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Text style={styles.title}>
              Tại sao bạn cần kích hoạt tài khoản?
            </Text>
            <Pressable
              style={({ pressed }) =>
                pressed && {
                  opacity: 0.55,
                }
              }
              onPress={() => setVisible(true)}
            >
              <Ionicons
                style={{ marginLeft: 2 }}
                name="information-circle-outline"
                size={24}
                color={"rgba(22,24,35,1)"}
              />
            </Pressable>
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.title}>Tài khoản đã được kích hoạt đến</Text>
          </View>
        );
      case 2:
        return (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <Text style={[styles.title, {}]}>
                {"Tài khoản của bạn được kích hoạt đến " +
                  moment(endDate, "MM/DD/YYYY HH:mm:ss")
                    .add(1, "months")
                    .format("DD/MM/YYYY")}
              </Text>
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.55,
                  }
                }
                onPress={() => setVisible2(true)}
              >
                <Ionicons
                  style={{ marginLeft: 2 }}
                  name="information-circle-outline"
                  size={24}
                  color={"rgba(22,24,35,1)"}
                />
              </Pressable>
            </View>
          </>
        );
    }
  };

  const renderContent = () => {
    switch (type) {
      case 0:
        return (
          <>
            <TouchableOpacity
              style={{
                width: "100%",
                height: 45,
                marginTop: -10,
              }}
              onPress={() => {
                setConfirm(true);
              }}
            >
              <LinearGradient
                colors={[theme.colors.primary300, theme.colors.highlight]}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                  borderColor: theme.colors.borderColor,
                  borderWidth: 2,
                }}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",

                    fontSize: 16,
                  }}
                >
                  Kích hoạt tài khoản
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        );
      case 1:
        return (
          <Text
            style={[
              styles.number,
              {
                color:
                  moment(endDate, "MM/DD/YYYY HH:mm:ss").diff(NOW, "days") < 4
                    ? "red"
                    : theme.colors.highlight,
              },
            ]}
          >
            {moment(endDate, "MM/DD/YYYY HH:mm:ss").format(
              FORMAT_DATE_REGEX["DD-MM-YYYY"]
            )}
          </Text>
        );
      case 2:
        return (
          <>
            {moment(endDate, "MM/DD/YYYY HH:mm:ss")
              .add(7, "days")
              .diff(NOW, "days") > 0 && (
              <>
                <Text
                  style={[
                    styles.title,
                    { paddingBottom: 20, paddingTop: 10, color: "red" },
                  ]}
                >
                  {"Bạn có " +
                    moment(endDate, "MM/DD/YYYY HH:mm:ss")
                      .add(7, "days")
                      .diff(NOW, "days") +
                    " ngày để hoàn tiền"}
                </Text>
                <TouchableOpacity
                  style={{
                    width: "100%",
                    height: 45,
                  }}
                  onPress={() => {
                    setConfirm2(true);
                  }}
                >
                  <LinearGradient
                    colors={[theme.colors.primary300, theme.colors.highlight]}
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 5,
                      borderColor: theme.colors.borderColor,
                      borderWidth: 2,
                    }}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",

                        fontSize: 16,
                      }}
                    >
                      Hoàn tiền
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </>
        );
    }
  };
  return (
    <View
      key={() => getRandomBetween(1000, 10000)}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        {renderTitle()}

        {renderContent()}
      </View>

      {/* price */}
      <View
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
        }}
      >
        <Text style={styles.textCovid}>
          {userInfo?.role.toLowerCase() === ROLE.contractor
            ? "200.000đ"
            : "300.000đ"}
        </Text>
      </View>
    </View>
  );
};

export default ActivationModal;
