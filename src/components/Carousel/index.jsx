import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

const WIDTH = Dimensions.get("window").width;
const ELEMENT_WIDTH = WIDTH - 16 * 2;

const Carousel = ({ data, style, onPress = () => {} }) => {
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const theme = useTheme();

  const renderCarouselItem = ({ item, index }) => {
    return (
      <Pressable
        onPress={() => onPress(item.imageUri)}
        style={({ pressed }) => [
          pressed && {
            opacity: 0.75,
          },
        ]}
      >
        <View
          style={{
            width: ELEMENT_WIDTH,
            height: 250,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.imageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              justifyContent: "flex-end",
              paddingBottom: 20,
              paddingHorizontal: 20,
              backgroundColor: "rgba(0,0,0,0.27)",
            }}
          >
            <View>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.title}
              </Text>
              <Text
                style={{
                  color: "white",
                }}
                numberOfLines={1}
              >
                {item.desc}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={style}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderCarouselItem}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          onScroll={({ nativeEvent }) => {
            const slide = Math.floor(
              nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
            );

            if (
              slide !== carouselActiveIndex &&
              slide > -1 &&
              slide <= data.length - 1
            ) {
              setCarouselActiveIndex(slide);
            }
          }}
          style={{ borderRadius: theme.sizes.base }}
        />
      </View>

      {/* dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={{
              marginHorizontal: 3,
              width: carouselActiveIndex === index ? 7 : 15,
              height: carouselActiveIndex === index ? 7 : 3,
              borderRadius: 100,
              backgroundColor:
                carouselActiveIndex === index
                  ? theme.colors.primary200
                  : "#ddd",
            }}
          ></View>
        ))}
      </View>
    </View>
  );
};

export default Carousel;
