import { useNavigation } from "@react-navigation/native";
import { Fragment } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SHADOWS } from "~/app/theme";
import { NO_IMAGE_URL, ROUTE } from "~/constants";
import { formatStringToCurrency } from "~/utils/helper";
const ContractorView = ({ item: { projectName, data } }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: theme.sizes.font,
        marginBottom: theme.sizes.large,
        borderRadius: theme.sizes.small,
        ...SHADOWS.light,
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            color: theme.colors.darklight,
          }}
          numberOfLines={1}
        >
          {projectName}
        </Text>

        <View
          style={{
            backgroundColor: "rgba(22,24,35,0.12)",
            height: 1,
            marginTop: 10,
            marginBottom: theme.sizes.large,
          }}
        ></View>

        {data.map((item, idx) => {
          return (
            <>
              <Pressable
                key={idx}
                style={({ pressed }) => [
                  pressed && {
                    backgroundColor: "rgba(22,24,35,.06)",
                  },
                  {
                    marginBottom: theme.sizes.large,
                    flexDirection: "row",
                  },
                ]}
                onPress={() =>
                  navigation.navigate(ROUTE.commitmentDetail, {
                    id: item.id,
                  })
                }
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderColor: "#ddd",
                    borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: theme.sizes.base / 2,
                    padding: 6,
                  }}
                >
                  <Image
                    style={{ width: "95%", height: "95%" }}
                    source={{
                      uri: item.builderAvatar || NO_IMAGE_URL,
                    }}
                    resizeMode="cover"
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ marginBottom: theme.sizes.base / 2 }}>
                    Tên công nhân:
                    <Text
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      {" " + item.builderName}
                    </Text>
                  </Text>

                  <Text style={{ marginBottom: theme.sizes.base / 2 }}>
                    Loại thợ:
                    <Text style={{ color: theme.colors.darklight }}>
                      {" " + item.builderTypeName}
                    </Text>
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        color: theme.colors.highlight,
                        fontWeight: "bold",
                      }}
                    >
                      Mức lương:
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: theme.colors.highlight,
                      }}
                    >
                      {" " + formatStringToCurrency(item.salary.toString())}
                    </Text>
                  </View>

                  {item.groups &&
                    item.groups?.map((member, index) => {
                      return (
                        <Fragment key={index}>
                          {index == 0 && (
                            <Text
                              style={{
                                fontWeight: "bold",
                                color: theme.colors.darklight,
                                marginTop: 10,
                              }}
                            >
                              Đội nhóm
                            </Text>
                          )}

                          <Text
                            style={[
                              {
                                marginTop: index == 0 ? 10 : 5,
                                color: theme.colors.darklight,
                              },
                            ]}
                          >
                            {member.name}
                          </Text>
                          <Text
                            style={[
                              {
                                color: theme.colors.darklight,
                              },
                            ]}
                          >
                            {member.typeName}
                          </Text>
                        </Fragment>
                      );
                    })}
                </View>
              </Pressable>
            </>
          );
        })}
      </View>
    </View>
  );
};

export default ContractorView;
