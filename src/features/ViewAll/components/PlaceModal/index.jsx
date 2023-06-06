import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import { FlatList, Modal, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "react-native-paper";

import _ from "lodash";
import { useEffect, useState } from "react";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { CustomButton, SearchBar } from "~/components";
import { PLACES } from "~/constants";

const MOCK_DATA = {
  _max_choice: 5,
};

const PlaceModal = ({ isShow, onRequestClose, onClose, onSubmit, value }) => {
  const { _max_choice } = MOCK_DATA;
  const theme = useTheme();

  const [searchVal, setSearchVal] = useState("");
  const [places, setPlaces] = useState([...PLACES]);
  const [checkedResult, setCheckedResult] = useState({ ...value });

  useEffect(() => {
    if (searchVal === "") {
      setPlaces([...PLACES]);
      return;
    }
    setPlaces(
      PLACES.filter((x) => x.toLowerCase().includes(searchVal.toLowerCase()))
    );
  }, [searchVal]);

  const handleSubmit = () => {
    const result = _.keys(
      _.flow([
        Object.entries,
        (arr) => arr.filter(([key, value]) => value),
        Object.fromEntries,
      ])(checkedResult)
    );
    onSubmit(result.map((x) => PLACES.indexOf(x)));
    onClose();
  };

  const renderNoData = () => (
    <Text style={{ color: "rgba(22,24,35,0.64)" }}>
      Không có kết quả cho "{searchVal}"
    </Text>
  );

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          paddingVertical: theme.sizes.font,
          borderTopColor: "rgba(22,24,35,.12)",
          borderTopWidth: 1,
        }}
      >
        <BouncyCheckbox
          size={theme.sizes.extraLarge}
          fillColor={theme.colors.primary300}
          disableBuiltInState
          unfillColor="#fff"
          text={item}
          innerIconStyle={{
            borderWidth: 1.5,
            borderRadius: theme.sizes.base / 2,
            borderColor: "rgba(22,24,35,0.12)",
            borderWidth: checkedResult[item] ? 0 : 1.5,
          }}
          textStyle={{
            color: "black",
            fontSize: theme.sizes.medium,
            textDecorationLine: "none",
          }}
          iconStyle={{
            borderRadius: theme.sizes.base / 2,
          }}
          onPress={() => {
            const values = Object.values(checkedResult);
            (values.filter((x) => x).length < _max_choice ||
              checkedResult[item]) &&
              setCheckedResult((prev) => {
                const prevChecked = prev[item];
                return {
                  ...prev,
                  [item]: !prevChecked,
                };
              });
          }}
          isChecked={_.isEmpty(checkedResult) ? false : checkedResult[item]}
        />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      visible={isShow}
      onRequestClose={onRequestClose}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: Constants.statusBarHeight,
          padding: theme.sizes.font,
        }}
      >
        <Pressable
          style={({ pressed }) =>
            pressed && {
              opacity: 0.25,
            }
          }
          onPress={onClose}
        >
          <AntDesign name="close" size={theme.sizes.large + 2} />
        </Pressable>

        <Text
          style={{
            textTransform: "capitalize",
            fontSize: theme.sizes.large,
            fontWeight: "500",
          }}
        >
          Địa điểm
        </Text>

        <Pressable
          style={({ pressed }) =>
            pressed && {
              opacity: 0.25,
            }
          }
          onPress={() => setCheckedResult({})}
        >
          <Text
            style={{
              textTransform: "capitalize",
              fontSize: theme.sizes.medium,
              color: "blue",
            }}
          >
            Đặt lại
          </Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.sizes.font }}>
        <View style={{ marginBottom: theme.sizes.font }}>
          <SearchBar
            style={{
              backgroundColor: theme.colors.borderColor,
              borderRadius: 100,
            }}
            value={searchVal}
            setValue={setSearchVal}
            clearButtonMode="while-editing"
            placeholder="Tìm kiếm"
          />
        </View>

        <FlatList
          data={places}
          key={(item) => item}
          renderItem={renderItem}
          ListEmptyComponent={renderNoData}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            !searchVal ? (
              <Text
                style={{
                  marginBottom: theme.sizes.small,
                  color: "rgba(22,24,35,0.54)",
                  fontSize: theme.sizes.small + 2,
                }}
              >
                Bạn có thể chọn tối đa {_max_choice} địa điểm
              </Text>
            ) : null
          }
        />
      </View>

      <View
        style={{
          padding: theme.sizes.font,
          borderTopColor: theme.colors.borderColor,
          borderTopWidth: 1,
        }}
      >
        <CustomButton variant="primary" onPress={handleSubmit}>
          Áp dụng
        </CustomButton>
      </View>
    </Modal>
  );
};

export default PlaceModal;
