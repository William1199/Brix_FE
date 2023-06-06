import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import axiosInstance from "~/app/api";
import { ModalView, StatusBarComp } from "~/components";
import PostItem from "~/features/Uploaded/PostItem";
import { getRandomBetween } from "~/utils/helper";

const height = Dimensions.get("window").height;

const ReportedPostScreen = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [reasons, setReasons] = useState([
    "Lý do mặc định",
    "Lý do mặc định",
    "Lý do mặc định",
  ]);
  const { bottom } = useSafeAreaInsets();
  let bottomBarHeight = 0;

  const handleReason = (reasons) => {
    setVisible(true);
    setReasons(reasons);
  };

  const renderListEmpty = () => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: theme.sizes.large,
        marginTop: 24,
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
        Hiện bạn chưa có bài viết nào bị báo cáo
      </Text>
    </View>
  );

  useEffect(() => {
    // call api
    (async () => {
      const res = await axiosInstance.post("report/getAllPostReport", {});
      setPosts(res.data);
    })();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={{ flex: 1 }}>
      <PostItem
        item={item}
        index={index}
        renderSaved={true}
        isReport={true}
        handleReason={handleReason}
      />
    </View>
  );
  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary400}
        statusConfig={{ style: "light" }}
      />

      <ModalView
        visible={visible}
        title={reasons?.length + " lý do bị báo cáo"}
        onDismiss={() => setVisible(false)}
        cancelable
        style={{ backgroundColor: "#fff" }}
      >
        <View style={{ alignItems: "center" }}>
          {reasons.map((item, i) => (
            <Text
              key={i}
              style={{ marginTop: 10, fontSize: 16, color: theme.colors.black }}
            >
              {item.problem}
            </Text>
          ))}
        </View>
      </ModalView>
      <SafeAreaView style={{ flex: 1 }}>
        {/* header */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary400,
            padding: theme.sizes.font,
          }}
        >
          <Text
            style={{
              fontSize: theme.sizes.large,
              color: "#fff",
              alignSelf: "center",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            Bài viết bị báo cáo
          </Text>
        </View>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={() => getRandomBetween(1000, 10000)}
          ListEmptyComponent={renderListEmpty}
          contentContainerStyle={{
            paddingHorizontal: theme.sizes.small,
            paddingBottom:
              bottom +
              (height >= 844 ? 40 : 20) +
              (height >= 844 ? bottomBarHeight - 20 : bottomBarHeight * 1.5),
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default ReportedPostScreen;
