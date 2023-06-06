import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MaskInput, { createNumberMask } from "react-native-mask-input";
import { useTheme } from "react-native-paper";

import { CustomButton } from "~/components";
import { CATEGORIES, SALARIES, SORT_BY } from "~/constants";
import { TypeServices } from "~/services";
import { formatStringToCurrency } from "~/utils/helper";

const MOCK_DATA = {
  _salary_default_value: {
    index: [],
    minSalary: {
      masked: "",
      unMasked: "",
    },
    maxSalary: {
      masked: "",
      unMasked: "",
    },
  },
};

const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});

const BlockItem = ({ title, children, hasBorder = true }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: "flex-start",
        paddingVertical: theme.sizes.medium,
        borderBottomColor: hasBorder && "rgba(22,24,35,0.12)",
        borderBottomWidth: hasBorder ? 1 : 0,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: theme.sizes.font + 1,
          textTransform: "capitalize",
        }}
      >
        {title}
      </Text>

      {children}
    </View>
  );
};

const FilterModal = ({ isShow, onRequestClose, onClose, onSubmit, value }) => {
  const { _salary_default_value } = MOCK_DATA;

  const theme = useTheme();

  const [salary, setSalary] = useState(() => {
    if (!Array.isArray(value.salary)) {
      const idx = value.salary;
      const current = SALARIES[idx];
      if (typeof current === "string") {
        if (idx === 0) {
          return {
            ..._salary_default_value,
            maxSalary: { unMasked: current, masked: current },
            index: idx,
          };
        } else if (idx === SALARIES.length - 1) {
          return {
            ..._salary_default_value,
            minSalary: { unMasked: current, masked: current },
            index: idx,
          };
        }
      } else {
        return {
          minSalary: { unMasked: current[0], masked: current[0] },
          maxSalary: { unMasked: current[1], masked: current[1] },
          index: idx,
        };
      }
    } else {
      const current = value.salary.join("");

      if (current.includes("+")) {
        return {
          ..._salary_default_value,
          minSalary: {
            unMasked: current.replace("+", ""),
            masked: current.replace("+", ""),
          },
        };
      } else {
        const _cur = current.split("-");
        if (_cur.length === 2) {
          return {
            minSalary: {
              unMasked: +_cur[0] === 0 ? "" : _cur[0],
              masked: +_cur[0] === 0 ? "" : _cur[0],
            },
            maxSalary: { unMasked: _cur[1], masked: _cur[1] },
          };
        }
      }
    }
    return _salary_default_value;
  });
  const [categories, setCategories] = useState(value.categories || []);
  const [participant, setParticipant] = useState(value.participant);
  const [_sortBy, setSortBy] = useState(value.sortBy);
  const [type, setType] = useState(value.types || []);
  const [typeList, setTypeList] = useState([]);

  const isSalaryValid = useMemo(
    () =>
      !salary.maxSalary.unMasked ||
      !salary.minSalary.unMasked ||
      +salary.maxSalary.unMasked > +salary.minSalary.unMasked,
    [salary]
  );

  const handleSubmit = () => {
    let _salary = salary.index;
    if (typeof _salary !== "number") {
      // min
      if (salary.minSalary.unMasked && !salary.maxSalary.unMasked) {
        _salary = [`+${salary.minSalary.unMasked}`];
      }
      // max
      else if (!salary.minSalary.unMasked && salary.maxSalary.unMasked) {
        _salary = [`0-${salary.maxSalary.unMasked}`];
      }
      // both
      else {
        _salary = [`${salary.minSalary.unMasked}-${salary.maxSalary.unMasked}`];
      }
    }

    onSubmit({
      salary: _salary,
      categories,
      _sortBy,
      participant,
      types: type,
    });
    onClose();
  };

  const handleSalaryPress = (item, idx) => {
    if (salary.index === idx) {
      return setSalary(_salary_default_value);
    }
    if (typeof item === "string") {
      if (idx === 0) {
        setSalary({
          ..._salary_default_value,
          maxSalary: { unMasked: item, masked: item },
          index: idx,
        });
      } else if (idx === SALARIES.length - 1) {
        setSalary({
          ..._salary_default_value,
          minSalary: { unMasked: item, masked: item },
          index: idx,
        });
      }
    } else {
      setSalary({
        minSalary: { unMasked: item[0], masked: item[0] },
        maxSalary: { unMasked: item[1], masked: item[1] },
        index: idx,
      });
    }
  };

  useEffect(() => {
    (async () => {
      const data = await TypeServices.getList();
      setTypeList(data);
    })();
  }, []);

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
          paddingHorizontal: theme.sizes.font,
          paddingVertical: theme.sizes.small,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(22,24,35,0.12)",
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
            fontSize: theme.sizes.font + 1,
            fontWeight: "500",
          }}
        >
          Bộ lọc
        </Text>

        <Pressable
          style={({ pressed }) =>
            pressed && {
              opacity: 0.25,
            }
          }
          onPress={() => {
            setCategories([]);
            setParticipant(null);
            setSalary(_salary_default_value);
            setSortBy(SORT_BY.time);
          }}
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

      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            marginHorizontal: theme.sizes.font,
          }}
        >
          <BlockItem title="sắp xếp theo">
            <Pressable onPress={() => setSortBy(SORT_BY.time)}>
              <View
                style={{
                  backgroundColor:
                    _sortBy === SORT_BY.time
                      ? theme.colors.primary300
                      : "rgba(22,24,35,0.12)",
                  padding: theme.sizes.small,
                  paddingHorizontal: theme.sizes.medium,
                  borderRadius: theme.sizes.large,
                  marginTop: theme.sizes.small,
                }}
              >
                <Text
                  style={{
                    color:
                      _sortBy === SORT_BY.time
                        ? theme.colors.textColor300
                        : "rgb(22,24,35)",
                  }}
                >
                  Mới nhất
                </Text>
              </View>
            </Pressable>
          </BlockItem>

          <BlockItem title="lương">
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {SALARIES.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleSalaryPress(item, idx)}
                >
                  <View
                    style={{
                      backgroundColor:
                        salary.index === idx
                          ? theme.colors.primary300
                          : "rgba(22,24,35,0.12)",
                      padding: theme.sizes.small,
                      paddingHorizontal: theme.sizes.medium,
                      borderRadius: theme.sizes.large,
                      marginTop: theme.sizes.small,
                      marginRight: theme.sizes.font,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          salary.index === idx
                            ? theme.colors.textColor300
                            : "rgb(22,24,35)",
                      }}
                    >
                      {idx === 0
                        ? "Dưới"
                        : idx === SALARIES.length - 1 && "Trên"}{" "}
                      {typeof item === "string"
                        ? formatStringToCurrency(item)
                        : `${formatStringToCurrency(
                            item[0]
                          )} đến ${formatStringToCurrency(item[1])}`}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* dynamic salary */}
            <View
              style={{
                marginTop: theme.sizes.medium,
                width: "100%",
              }}
            >
              <Text
                style={{
                  textTransform: "capitalize",
                  color: "rgba(22,24,35,0.55)",
                  fontWeight: "bold",
                }}
              >
                mức lương
              </Text>

              <View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    marginTop: theme.sizes.base,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: theme.sizes.base,
                      borderColor: !isSalaryValid
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      padding: theme.sizes.small,
                      paddingVertical: theme.sizes.font,
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: theme.sizes.font - 2 }}>
                        VND
                      </Text>
                    </View>
                    <MaskInput
                      mask={vndMask}
                      placeholder="Tối thiểu"
                      style={{
                        flex: 1,
                        marginLeft: theme.sizes.base / 2,
                        color: "blue",
                      }}
                      clearButtonMode="while-editing"
                      keyboardType="numeric"
                      maxLength={7}
                      value={salary.minSalary.masked}
                      onChangeText={(masked, unMasked) => {
                        setSalary(({ index, ...prev }) => ({
                          ...prev,
                          minSalary: { masked, unMasked },
                        }));
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      borderRadius: theme.sizes.base,
                      borderColor: !isSalaryValid
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                      borderWidth: 1,
                      padding: theme.sizes.small,
                      paddingVertical: theme.sizes.font,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: theme.sizes.font - 2 }}>
                        VND
                      </Text>
                    </View>
                    <MaskInput
                      placeholder="Tối đa"
                      mask={vndMask}
                      style={{
                        flex: 1,
                        marginLeft: theme.sizes.base / 2,
                        color: "blue",
                      }}
                      clearButtonMode="while-editing"
                      keyboardType="numeric"
                      maxLength={11}
                      value={salary.maxSalary.masked}
                      onChangeText={(masked, unMasked) => {
                        setSalary(({ index, ...prev }) => ({
                          ...prev,
                          maxSalary: { masked, unMasked },
                        }));
                      }}
                    />
                  </View>
                </View>

                {/* handle error message */}
                {!isSalaryValid && (
                  <Text
                    style={{
                      marginTop: theme.sizes.base,
                      color: theme.colors.error,
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    Lương tối đa phải lớn hơn lương tối thiểu
                  </Text>
                )}
              </View>
            </View>
          </BlockItem>

          <BlockItem title="Loại hình công việc">
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginLeft: -theme.sizes.small,
              }}
            >
              {CATEGORIES.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    setCategories((prev) => {
                      if (prev.includes(item.value)) {
                        return prev.filter((x) => x !== item.value);
                      }

                      return [...prev, item.value];
                    })
                  }
                >
                  <View
                    style={{
                      backgroundColor: categories.includes(item.value)
                        ? theme.colors.primary300
                        : "rgba(22,24,35,0.12)",
                      padding: theme.sizes.small,
                      paddingHorizontal: theme.sizes.medium,
                      borderRadius: theme.sizes.large,
                      marginTop: theme.sizes.small,
                      marginLeft: theme.sizes.small,
                    }}
                  >
                    <Text
                      style={{
                        color: categories.includes(item.value)
                          ? theme.colors.textColor300
                          : "rgb(22,24,35)",
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </BlockItem>

          <BlockItem title="Số lượng thành viên">
            <TextInput
              style={{
                borderColor: "rgba(22,24,35,0.12)",
                borderWidth: 1,
                borderRadius: theme.sizes.base / 2,
                width: "100%",
                padding: theme.sizes.small,
                paddingVertical: theme.sizes.font,
                marginTop: theme.sizes.small,
              }}
              placeholder="Nhập số lượng người tham gia"
              keyboardType="number-pad"
              value={participant}
              maxLength={3}
              onChangeText={(text) => setParticipant(text)}
            />
          </BlockItem>

          <BlockItem title="Loại thợ" hasBorder={false}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginLeft: -theme.sizes.small,
              }}
            >
              {typeList.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    setType((prev) => {
                      if (prev.includes(item.id)) {
                        return prev.filter((x) => x !== item.id);
                      }

                      return [...prev, item.id];
                    })
                  }
                >
                  <View
                    style={{
                      backgroundColor: type.includes(item.id)
                        ? theme.colors.primary300
                        : "rgba(22,24,35,0.12)",
                      padding: theme.sizes.small,
                      paddingHorizontal: theme.sizes.medium,
                      borderRadius: theme.sizes.large,
                      marginTop: theme.sizes.small,
                      marginLeft: theme.sizes.small,
                    }}
                  >
                    <Text
                      style={{
                        color: type.includes(item.id)
                          ? theme.colors.textColor300
                          : "rgb(22,24,35)",
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </BlockItem>
        </ScrollView>
      </KeyboardAvoidingView>

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

export default FilterModal;
