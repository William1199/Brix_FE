import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import axiosInstance from "~/app/api";
import { Loading } from "~/components";
import { API_RESPONSE_CODE, NO_IMAGE_URL, PLACES } from "~/constants";
import AuthContext from "~/context/AuthContext";
import { getRandomBetween, parseCurrencyText } from "~/utils/helper";

const InviteModal = ({
  title,
  visible,
  onClose,
  data: { profile = {}, invites = { list: [], pagination: [] } },
}) => {
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();

  const [posts, setPosts] = useState({ list: [], pagination: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const [page, setPage] = useState({ value: 1 });

  const isFirstTime = useRef(true);

  const handleInvite = async (_postId) => {
    try {
      const { data } = await axiosInstance.get("invite/isInvite", {
        params: {
          postID: _postId,
          builderID: profile?.builder?.id,
        },
      });
      if (data) {
        setTimeout(() => {
          Toast.show({
            type: "error",
            text1: "Bài viết này đã được mời trước đó",
            position: "bottom",
            visibilityTime: 2500,
          });
        }, 200);
      } else {
        let request = {
          contractorId: userInfo.contractorID,
          builderId: profile?.builder?.id,
          contractorPostId: _postId,
        };
        const res = await axiosInstance.post("invite", request);
        if (+res.code === API_RESPONSE_CODE.success) {
          setTimeout(() => {
            Toast.show({
              type: "error",
              text1: "Mời thành công",
              position: "bottom",
              visibilityTime: 2500,
            });
          }, 200);
        }
      }
    } catch (error) {
    } finally {
      onClose();
    }
  };
  const renderPostItem = ({ item, index }) => {
    return (
      <Pressable
        style={({ pressed }) =>
          pressed && {
            opacity: 0.55,
          }
        }
        onPress={() => handleInvite(item.builderId)}
      >
        <View
          style={{
            flexDirection: "row",
            paddingVertical: theme.sizes.medium,
            marginHorizontal: theme.sizes.font,
            borderBottomColor: "#ddd",
            borderBottomWidth: index !== posts.list.length - 1 ? 1 : 0,
          }}
        >
          <View
            style={{
              width: 65,
              height: 65,
              borderColor: "#ddd",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: theme.sizes.base / 2,
              padding: theme.sizes.base / 2,
              backgroundColor: "white",
            }}
          >
            <Image
              source={{ uri: item.avatar || NO_IMAGE_URL }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: theme.sizes.font,
            }}
          >
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            ></View>

            <View>
              <Text
                style={{ fontWeight: "bold", fontSize: theme.sizes.font + 1 }}
                numberOfLines={2}
              >
                {item.contractorPostName}
              </Text>
              <Text
                style={{ marginVertical: theme.sizes.base - 2 }}
                numberOfLines={1}
              >
                {moment(item.lastModifiedAt).format("DD/MM/YYYY")}
              </Text>

              <Text style={{ marginBottom: theme.sizes.base - 2 }}>
                {PLACES[item.places]}
              </Text>
              <Text style={{ color: theme.colors.highlight }}>
                {parseCurrencyText(item.salaries)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderListEmpty = () => (
    <View
      style={{
        backgroundColor: "rgba(22,24,35,0.06)",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.sizes.font - 2,
          backgroundColor: "white",
          paddingBottom: theme.sizes.large,
        }}
      >
        <Image
          source={{
            uri: "https://cdni.iconscout.com/illustration/premium/thumb/find-a-doctor-online-1946841-1648368.png",
          }}
          style={{ width: 150, height: 150 }}
          resizeMode="cover"
        />
        <Text
          style={{
            maxWidth: "70%",
            textAlign: "center",
            fontSize: theme.sizes.medium,
            fontWeight: "bold",
          }}
        >
          Bạn không có bài viết nào có thể mời
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false;
      return;
    }
    (async () => {
      const res = await axiosInstance.get("invite/checkInvite", {
        params: {
          builderID: profile.builder.id,
        },
      });

      setPosts((prev) => ({
        list: page.value === 1 ? res.data : [...prev.list, ...res.data],
        pagination: {},
      }));
      setRefreshing(false);
      setFetchMoreLoading(false);
    })();
  }, [page]);

  useEffect(() => {
    setPosts({ ...invites });
  }, [invites]);

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
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
            {title}
          </Text>
        </View>

        <FlatList
          data={posts.list}
          renderItem={renderPostItem}
          keyExtractor={() => getRandomBetween(1000, 10000)}
          ListEmptyComponent={renderListEmpty}
          ListFooterComponent={() =>
            posts.list.length !== 0 ? (
              fetchMoreLoading || posts.pagination?.hasNext ? (
                <Loading />
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: theme.sizes.small,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.sizes.small + 2,
                      color: "rgba(22,24,35,.44)",
                    }}
                  >
                    Không còn bài đăng nào khác
                  </Text>
                </View>
              )
            ) : null
          }
          refreshControl={
            <RefreshControl
              tintColor={theme.colors.primary200}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPage({ value: 1 });
              }}
            />
          }
          onEndReachedThreshold={0}
          onEndReached={() => {
            if (posts.pagination?.hasNext) {
              setFetchMoreLoading(true);
              setPage(({ value }) => ({ value: value + 1 }));
            }
          }}
        />
      </View>
    </Modal>
  );
};

export default InviteModal;
