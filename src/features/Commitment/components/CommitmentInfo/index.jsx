import moment from "moment";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import RenderHTML from "react-native-render-html";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Accordion from "react-native-collapsible/Accordion";
import { useTheme } from "react-native-paper";
const width = Dimensions.get("window").width;

const SECTIONS = [
  {
    temp: "temp",
  },
];

moment.locale("vi");

const CommitmentInfo = ({ postContent, partyA, partyB, group }) => {
  const theme = useTheme();

  const [isReadMore, setIsReadMore] = useState({ hasShow: false, bool: false });
  const [isReadMore2, setIsReadMore2] = useState({
    hasShow: true,
    bool: false,
  });

  const [postActiveSections, setPostActiveSections] = useState([]);
  const [partyaActiveSections, setPartaActiveSections] = useState([]);
  const [partybActiveSections, setPartybActiveSections] = useState([]);

  const [postIsExpand, setPostIsExpand] = useState(false);
  const [partyAIsExpand, setPartyAIsExpand] = useState(false);
  const [partyBIsExpand, setPartyBIsExpand] = useState(false);

  useEffect(() => {
    if (postContent?.description?.length > 100) {
      setIsReadMore({ hasShow: true, bool: false });
    } else {
      setIsReadMore({ hasShow: false, bool: true });
    }
  }, [postContent?.description]);

  const _updatePostSections = (postActiveSections) => {
    setPostActiveSections(postActiveSections);
    setPostIsExpand(!postIsExpand);
  };
  const _updatePartyASections = (partyaActiveSections) => {
    setPartaActiveSections(partyaActiveSections);
    setPartyAIsExpand(!partyAIsExpand);
  };
  const _updatePartyBSections = (partybActiveSections) => {
    setPartybActiveSections(partybActiveSections);
    setPartyBIsExpand(!partyBIsExpand);
  };

  const _renderSectionTitle = (section) => {
    return <></>;
  };

  const _renderPartyAHeader = (section, index, isActive, sections) => {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          backgroundColor: theme.colors.primary25,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            marginBottom: 10,
            backgroundColor: theme.colors.primary400,
            borderRadius: 30,
            width: 80,
            alignItems: "center",
            padding: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#fff",
            }}
          >
            BÊN A
          </Text>
        </View>

        <View>
          {partyAIsExpand ? (
            <MaterialCommunityIcons
              name="arrow-up-drop-circle-outline"
              size={24}
            />
          ) : (
            <MaterialCommunityIcons
              name="arrow-down-drop-circle-outline"
              size={24}
            />
          )}
        </View>
      </Animatable.View>
    );
  };
  const _renderPartyBHeader = (section, index, isActive, sections) => {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.colors.primary25,
        }}
      >
        <View
          style={{
            marginBottom: 10,
            backgroundColor: theme.colors.primary400,
            borderRadius: 30,
            width: 80,
            alignItems: "center",
            padding: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#fff",
            }}
          >
            BÊN B
          </Text>
        </View>
        <View>
          {partyBIsExpand ? (
            <MaterialCommunityIcons
              name="arrow-up-drop-circle-outline"
              size={24}
            />
          ) : (
            <MaterialCommunityIcons
              name="arrow-down-drop-circle-outline"
              size={24}
            />
          )}
        </View>
      </Animatable.View>
    );
  };

  const _renderPartyAContent = (section, i, isActive, sections) => {
    // setPostIsExpand(!postIsExpand)
    return (
      <Animatable.View duration={300} transition="backgroundColor">
        <Animatable.View
          duration={300}
          easing="ease-out"
          // animation={isActive ? "zoomIn" : false}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <View
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  padding: 10,
                  alignSelf: "flex-start",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  Tên
                </Text>

                <Text
                  style={[
                    {
                      borderRadius: theme.sizes.base,
                      fontSize: theme.sizes.medium,
                      maxWidth: 190,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {partyA.firstName + " " + partyA.lastName}
                </Text>
              </View>
              <View
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  padding: 10,
                  alignSelf: "flex-start",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  Tên công ty
                </Text>

                <Text
                  style={[
                    {
                      borderRadius: theme.sizes.base,
                      fontSize: theme.sizes.medium,
                    },
                  ]}
                >
                  {partyA.companyName}
                </Text>
              </View>
            </View>
            <View>
              <View
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  padding: 10,
                  alignSelf: "flex-start",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  Số điện thoại
                </Text>

                <Text
                  style={[
                    {
                      borderRadius: theme.sizes.base,
                      fontSize: theme.sizes.medium,
                    },
                  ]}
                >
                  {partyA.phoneNumber}
                </Text>
              </View>
              <View
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  padding: 10,
                  alignSelf: "flex-start",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    fontSize: theme.sizes.font - 2,
                  }}
                >
                  CCCD
                </Text>
                <Text
                  style={[
                    {
                      borderRadius: theme.sizes.base,
                      fontSize: theme.sizes.medium,
                    },
                  ]}
                >
                  {partyA.verifyId}
                </Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </Animatable.View>
    );
  };

  const _renderPartyBContent = (section, i, isActive, sections) => {
    // setPostIsExpand(!postIsExpand)
    return (
      <Animatable.View duration={300} transition="backgroundColor">
        <Animatable.View
          duration={300}
          easing="ease-out"
          // animation={isActive ? "zoomIn" : false}
        >
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 10,
                    padding: 10,
                    alignSelf: "flex-start",
                    alignContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: theme.sizes.font - 2,
                    }}
                    numberOfLines={2}
                  >
                    Tên
                  </Text>

                  <Text
                    style={[
                      {
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {partyB.firstName + " " + partyB.lastName}
                  </Text>
                </View>
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 10,
                    padding: 10,
                    alignSelf: "flex-start",
                    alignContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    Vai trò
                  </Text>

                  <Text
                    style={[
                      {
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {partyB.typeName}
                  </Text>
                </View>
              </View>
              <View>
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 10,
                    padding: 10,
                    alignSelf: "flex-start",
                    alignContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    Số điện thoại
                  </Text>

                  <Text
                    style={[
                      {
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {partyB.phoneNumber}
                  </Text>
                </View>
                <View
                  style={{
                    marginBottom: 10,
                    borderRadius: 10,
                    padding: 10,
                    alignSelf: "flex-start",
                    alignContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgb(22,24,35)",
                      fontWeight: "medium",
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    CCCD
                  </Text>
                  <Text
                    style={[
                      {
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {partyB.verifyId}
                  </Text>
                </View>
              </View>
            </View>
            {group && (
              <>
                <View
                  style={{
                    marginBottom: 10,
                    backgroundColor: theme.colors.primary400,
                    borderRadius: 30,
                    width: 200,
                    alignItems: "center",
                    padding: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: theme.colors.primary25,
                    }}
                  >
                    Đội nhóm của bên B
                  </Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    marginBottom: theme.sizes.base / 2,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={[
                        {
                          paddingBottom: theme.sizes.base,
                          borderRadius: theme.sizes.base,
                          fontSize: theme.sizes.medium,
                        },
                      ]}
                    >
                      Tên
                    </Text>
                    <Text
                      style={[
                        {
                          paddingBottom: theme.sizes.base,
                          borderRadius: theme.sizes.base,
                          fontSize: theme.sizes.medium,
                        },
                      ]}
                    >
                      Vai trò
                    </Text>
                    <Text
                      style={[
                        {
                          paddingBottom: theme.sizes.base,
                          borderRadius: theme.sizes.base,
                          fontSize: theme.sizes.medium,
                        },
                      ]}
                    >
                      CCCD
                    </Text>
                  </View>
                </View>
                {group.map((member, idx) => {
                  return (
                    <View
                      key={idx}
                      style={{
                        width: "100%",
                        marginBottom: theme.sizes.base / 2,
                      }}
                    >
                      <View
                        style={{
                          justifyContent: "space-between",
                          flexDirection: "row",
                          borderTopColor: "black",
                          borderTopWidth: 1,
                        }}
                      >
                        <Text
                          style={[
                            {
                              paddingBottom: theme.sizes.base,
                              borderRadius: theme.sizes.base,
                              fontSize: theme.sizes.medium,
                            },
                          ]}
                        >
                          {member.name}
                        </Text>
                        <Text
                          style={[
                            {
                              paddingBottom: theme.sizes.base,
                              borderRadius: theme.sizes.base,
                              fontSize: theme.sizes.medium,
                            },
                          ]}
                        >
                          {member.typeName}
                        </Text>
                        <Text
                          style={[
                            {
                              paddingBottom: theme.sizes.base,
                              borderRadius: theme.sizes.base,
                              fontSize: theme.sizes.medium,
                            },
                          ]}
                        >
                          {member.verifyId}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </Animatable.View>
      </Animatable.View>
    );
  };

  return (
    <View style={{ marginTop: 30 }}>
      <View
        style={{
          borderWidth: 1.5,
          borderRadius: 15,
          padding: 10,
          marginBottom: 20,
          backgroundColor: theme.colors.primary25,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginBottom: 10,
              backgroundColor: theme.colors.primary400,
              borderRadius: 30,
              width: 80,
              alignItems: "center",
              padding: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: theme.colors.textColor200,
              }}
            >
              DỰ ÁN
            </Text>
          </View>
        </View>
        <View
          style={{
            marginBottom: 10,
            borderRadius: 10,
            padding: 10,
            alignSelf: "flex-start",
            alignContent: "center",
          }}
        >
          <Text
            style={{
              color: "rgb(22,24,35)",
              fontWeight: "medium",
              fontSize: theme.sizes.font - 2,
            }}
          >
            Tên dự án
          </Text>

          <Text
            style={[
              {
                borderRadius: theme.sizes.base,
                fontSize: theme.sizes.medium,
              },
            ]}
          >
            {postContent.projectName}
          </Text>
        </View>
        {postContent?.benefit && (
          <View
            style={{
              marginBottom: 10,
              borderRadius: 10,
              padding: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Vì sao cần ứng tuyển
            </Text>
            <RenderHTML
              contentWidth={width}
              source={{
                html: postContent?.benefit,
              }}
            />
          </View>
        )}
        {postContent?.description && (
          <View
            style={{
              marginBottom: 10,
              borderRadius: 10,
              padding: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Mô tả công việc
            </Text>
            <View
              style={{
                maxHeight: isReadMore.bool ? undefined : 150,
                overflow: "hidden",
              }}
            >
              <RenderHTML
                contentWidth={width}
                source={{
                  html: postContent?.description,
                }}
              />
            </View>
          </View>
        )}

        {isReadMore.bool && postContent?.required && (
          <View
            style={{
              marginBottom: 10,
              borderRadius: 10,
              padding: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Yêu cầu công việc
            </Text>
            <RenderHTML
              contentWidth={width}
              source={{
                html: postContent?.required,
              }}
            />
          </View>
        )}
        {isReadMore.hasShow && (
          <Pressable
            style={({ pressed }) =>
              pressed && {
                opacity: 0.45,
              }
            }
            onPress={() =>
              setIsReadMore((prev) => ({ ...prev, bool: !prev.bool }))
            }
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: theme.sizes.font + 1,
                fontWeight: "500",
                color: "rgba(0, 25, 247, 0.726)",
              }}
            >
              {isReadMore.bool ? "Thu nhỏ" : "Đọc thêm"}
            </Text>
          </Pressable>
        )}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              borderRadius: 10,
              padding: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Có hiệu lực từ
            </Text>

            <Text
              style={[
                {
                  borderRadius: theme.sizes.base,
                  fontSize: theme.sizes.medium,
                },
              ]}
            >
              {moment(postContent.startDate).format("DD/MM/yy")}
            </Text>
          </View>

          <View
            style={{
              borderRadius: 10,
              padding: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                fontSize: theme.sizes.font - 2,
              }}
            >
              Hết hiệu lực vào
            </Text>

            <Text
              style={[
                {
                  borderRadius: theme.sizes.base,
                  fontSize: theme.sizes.medium,
                },
              ]}
            >
              {moment(postContent.endDate).format("DD/MM/yy")}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          borderWidth: 1.5,
          borderRadius: 15,
          padding: 10,
          marginBottom: 20,
          backgroundColor: theme.colors.primary25,
        }}
      >
        <Accordion
          activeSections={partyaActiveSections}
          sections={SECTIONS}
          renderSectionTitle={_renderSectionTitle}
          renderHeader={_renderPartyAHeader}
          renderContent={_renderPartyAContent}
          onChange={_updatePartyASections}
        />
      </View>
      <View
        style={{
          borderWidth: 1.5,
          borderRadius: 15,
          padding: 10,
          marginBottom: 10,
          backgroundColor: theme.colors.primary25,
        }}
      >
        <Accordion
          activeSections={partybActiveSections}
          sections={SECTIONS}
          renderSectionTitle={_renderSectionTitle}
          renderHeader={_renderPartyBHeader}
          renderContent={_renderPartyBContent}
          onChange={_updatePartyBSections}
        />
      </View>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: theme.colors.primary400,
          marginBottom: 10,
          marginTop: 20,
        }}
      >
        ĐIỀU KHOẢN
      </Text>
      <Text
        style={{
          color: "rgb(22,24,35)",
          fontWeight: "medium",
          marginBottom: theme.sizes.small,
          fontSize: theme.sizes.medium,
          fontWeight: "bold",
        }}
      >
        Điều khoản cơ bản
      </Text>
      <View
        style={{
          width: "100%",
          marginBottom: theme.sizes.base / 2,
        }}
      >
        <Text
          style={[
            {
              borderRadius: theme.sizes.base,
              fontSize: theme.sizes.medium,
              marginBottom: theme.sizes.base / 2,
            },
          ]}
        >
          {
            "Nhà thầu được phép chấm dứt cam kết do 1 trong các trường hợp:\n- Vi phạm nghĩa vụ hợp đồng"
          }
        </Text>
        {isReadMore2.bool && (
          <Text
            style={[
              {
                borderRadius: theme.sizes.base,
                fontSize: theme.sizes.medium,
                lineHeight: 24,
              },
            ]}
          >
            {
              "- Thường xuyên không hoàn thành công việc theo hợp đồng\n- Bị xử lý kỉ luật sa thải\n- Có hành vi gây thiệt hại nghiêm trọng về tài sản và lợi ích của Công ty\n- Tự ý bỏ việc; bị ốm, đau phải điều trị liên tục\n- Do thiên tai, hỏa hoạn hoặc những lý do bất khả kháng… \n\nThợ xây được đơn phương chấm dứt cam kết:\n- Không được bố trí theo đúng công việc đã thỏa thuận\n - Không được trả lương, công đầy đủ\n- Bị ngược đãi bạo hành, cưỡng bức\n- Ốm đau, bệnh tật, gia đình có hoàn cảnh không thể tiếp tục công việc\n- Lao động nữ có thai phải nghỉ việc."
            }
          </Text>
        )}
        {isReadMore2.hasShow && (
          <Pressable
            style={({ pressed }) =>
              pressed && {
                opacity: 0.45,
              }
            }
            onPress={() =>
              setIsReadMore2((prev) => ({ ...prev, bool: !prev.bool }))
            }
          >
            <Text
              style={{
                textAlign: "center",
                paddingVertical: theme.sizes.base,
                fontSize: theme.sizes.font + 1,
                fontWeight: "500",
                color: "rgba(0, 25, 247, 0.726)",
              }}
            >
              {isReadMore2.bool ? "Thu nhỏ" : "Đọc thêm"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default CommitmentInfo;
