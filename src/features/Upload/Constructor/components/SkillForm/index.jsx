import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MaskInput, { createNumberMask } from "react-native-mask-input";
import { Badge, useTheme } from "react-native-paper";

import { MultiSelect } from "~/components/Form-field";
import AnotherSkillModals from "../../../components/AnotherSkillModals";

const vndMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
});

const MOCK_DATA = {
  _salary_default_value: {
    minSalary: {
      masked: "",
      unMasked: "",
    },
    maxSalary: {
      masked: "",
      unMasked: "",
    },
  },
  _default_validate: {
    min: { valid: true, message: "" },
    max: { valid: true, message: "" },
  },
};

const SkillsForm = ({ step, onNextStep, onBack, isReset, typeList }) => {
  const { _salary_default_value, _default_validate } = MOCK_DATA;
  const theme = useTheme();

  const [salary, setSalary] = useState(_salary_default_value);
  const [validate, setValidate] = useState(_default_validate);

  const [skillList, setSkillList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [types, setTypes] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [anotherSkills, setAnotherSkills] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isValid = useMemo(
    () =>
      skills.length >= 1 &&
      types.length >= 1 &&
      (salary.maxSalary.unMasked || salary.minSalary.unMasked) &&
      quantity,
    [skills, types, salary, quantity]
  );

  const handleValidate = () => {
    let _validate = _default_validate;
    let _valid = true;
    if (salary.minSalary.unMasked && salary.minSalary.unMasked.length < 6) {
      _validate = {
        min: {
          valid: false,
          message: "lương tối thiểu 100,000",
        },
      };
      _valid = false;
    }

    if (salary.maxSalary.unMasked) {
      if (salary.maxSalary.unMasked.length < 6) {
        _validate = {
          ..._validate,
          max: {
            valid: false,
            message: "lương tối thiểu 100,000",
          },
        };
        _valid = false;
      } else if (+salary.maxSalary.unMasked <= +salary.minSalary.unMasked) {
        _validate = {
          ..._validate,
          max: {
            valid: false,
            message: "Lương tối đa phải lớn hơn lương tối thiểu",
          },
        };
        _valid = false;
      }
    }

    setValidate(_validate);
    return _valid;
  };

  const handleSubmit = () => {
    const _types = types.map((x) => {
      const _types = typeList.find((v) => v.id === x);

      const _skills = skillList.filter(
        (v) => v.typeId === x && skills.includes(v.id)
      );

      return { ..._types, skillArr: _skills };
    });

    // salary
    let _salary = "";
    // min
    if (salary.minSalary.unMasked && !salary.maxSalary.unMasked) {
      _salary = `+${salary.minSalary.unMasked}`;
    }
    // max
    else if (!salary.minSalary.unMasked && salary.maxSalary.unMasked) {
      _salary = `0-${salary.maxSalary.unMasked}`;
    }
    // both
    else {
      _salary = `${salary.minSalary.unMasked}-${salary.maxSalary.unMasked}`;
    }

    onNextStep({
      type: [..._types, { skillArr: anotherSkills }],
      salaries: _salary,
      numberPeople: +quantity,
    });
  };

  useEffect(() => {
    // merge skill list for per type
    const _skillList = types.reduce((init, cur) => {
      const { id, name, skillArr } = typeList.find((x) => x.id === cur);
      return [...init, { id: id, name }, ...skillArr];
    }, []);

    setSkillList(_skillList);
    setSkills((prev) => prev.filter((x) => _skillList.some((v) => v.id === x)));
  }, [types]);

  useEffect(() => {
    if (isReset) {
      setTypes([]);
      setSalary(_salary_default_value);
      setQuantity("");
    }
  }, [isReset]);

  return (
    <>
      <AnotherSkillModals
        visible={isModalVisible}
        isReset={isReset}
        onClose={() => setIsModalVisible(false)}
        value={anotherSkills}
        onSubmit={({ skills }) => {
          setAnotherSkills(skills);
          setIsModalVisible(false);
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled
        keyboardVerticalOffset={175}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              paddingVertical: theme.sizes.large,
              paddingHorizontal: theme.sizes.font,
            }}
          >
            {/* header */}
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary300,
                  fontWeight: "600",
                  fontSize: theme.sizes.medium,
                  letterSpacing: 0.5,
                }}
              >
                Số lượng thành viên
              </Text>
              <Text
                style={{
                  color: "rgba(22,24,35,0.6)",
                  fontSize: theme.sizes.font - 2,
                }}
              >
                Step {step + 1} - 4
              </Text>
            </View>

            {/* quantity */}
            <View style={{ marginTop: theme.sizes.font }}>
              <TextInput
                placeholder="Nhập số lượng"
                keyboardType="number-pad"
                style={{
                  padding: theme.sizes.small,
                  paddingVertical: theme.sizes.font - 2,
                  backgroundColor: "transparent",
                  borderRadius: theme.sizes.base,
                  fontSize: theme.sizes.medium,
                  borderColor: "rgba(22,24,35,0.12)",
                  borderWidth: 1,
                  fontSize: theme.sizes.font,
                }}
                value={quantity}
                onChangeText={(text) => setQuantity(text)}
                cursorColor={theme.colors.primary400}
                clearButtonMode="while-editing"
                maxLength={3}
              />
            </View>

            {/* form skill */}
            <View
              style={{
                marginTop: theme.sizes.font,
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary300,
                  fontWeight: "600",
                  fontSize: theme.sizes.medium,
                  letterSpacing: 0.5,
                  marginBottom: theme.sizes.base,
                }}
              >
                Kĩ năng nhân viên
              </Text>

              <MultiSelect
                value={types}
                setValue={setTypes}
                label="Chọn lĩnh vực cần tuyển dụng"
                placeholder="Chọn các lĩnh vực"
                data={typeList}
                zIndex={3}
                zIndexInverse={1}
                searchable={false}
                multiple={true}
                schema={{
                  label: "name",
                  value: "id",
                }}
                mode="BADGE"
                badgeDotColors={[
                  "#4F312D",
                  "#1A7E56",
                  "#D5E12D",
                  "#FDEFF0",
                  "#F594DC",
                ]}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "rgba(22,24,35,0.12)",
                  borderWidth: 1,
                }}
                placeholderStyle={{
                  color: "rgba(22,24,35,0.34)",
                }}
              />

              <MultiSelect
                value={skills}
                setValue={setSkills}
                label="Những kỹ năng mà người xây dựng phải có"
                placeholder="Chọn các kỹ năng"
                data={skillList}
                zIndex={2}
                zIndexInverse={2}
                searchable={false}
                multiple={true}
                categorySelectable={false}
                schema={{
                  label: "name",
                  value: "id",
                  parent: "typeId",
                }}
                mode="BADGE"
                badgeDotColors={[
                  "#3B1940",
                  "#86184C",
                  "#FAD5D3",
                  "#CE7885",
                  "#AF1119",
                ]}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "rgba(22,24,35,0.12)",
                  borderWidth: 1,
                }}
                placeholderStyle={{
                  color: "rgba(22,24,35,0.34)",
                }}
              />

              <Pressable
                style={({ pressed }) => [
                  pressed && {
                    opacity: 0.25,
                  },
                  { alignSelf: "flex-start" },
                ]}
                onPress={() => setIsModalVisible(true)}
              >
                <Text
                  style={{
                    fontSize: theme.sizes.font - 1,
                    color: "blue",
                    textDecorationLine: "underline",
                  }}
                >
                  Các kĩ năng khác
                </Text>
                {anotherSkills.length > 0 && (
                  <Badge
                    style={{ position: "absolute", right: -15, top: -5 }}
                    size={theme.sizes.font}
                  >
                    {anotherSkills.length}
                  </Badge>
                )}
              </Pressable>
            </View>

            {/* form salary */}
            <View style={{ marginTop: theme.sizes.font, zIndex: -1 }}>
              <Text
                style={{
                  color: theme.colors.primary300,
                  fontWeight: "600",
                  fontSize: theme.sizes.medium,
                  letterSpacing: 0.5,
                }}
              >
                Mức lương dự kiến
              </Text>

              <View
                style={{
                  width: "100%",
                  marginTop: theme.sizes.base,
                }}
              >
                <View
                  style={{
                    borderRadius: theme.sizes.base,
                    borderColor:
                      validate?.min?.valid === false
                        ? theme.colors.error
                        : "rgba(22,24,35,0.12)",
                    borderWidth: 1,
                    padding: theme.sizes.small,
                    paddingVertical: theme.sizes.font,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: validate?.min?.valid ? theme.sizes.font : 0,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: theme.sizes.font - 2 }}>VND</Text>
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
                    onBlur={handleValidate}
                    onChangeText={(masked, unMasked) => {
                      setValidate((prev) => ({
                        ...prev,
                        min: { valid: true, message: "" },
                      }));
                      setSalary(({ index, ...prev }) => ({
                        ...prev,
                        minSalary: { masked, unMasked },
                      }));
                    }}
                  />
                </View>

                {/* handle error message min */}
                {validate?.min?.valid === false && (
                  <Text
                    style={{
                      marginTop: theme.sizes.base / 2,
                      marginBottom: theme.sizes.small,
                      color: theme.colors.error,
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    {validate?.min?.message}
                  </Text>
                )}

                <View
                  style={{
                    borderRadius: theme.sizes.base,
                    borderColor:
                      validate?.max?.valid === false
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
                    <Text style={{ fontSize: theme.sizes.font - 2 }}>VND</Text>
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
                    onBlur={handleValidate}
                    onChangeText={(masked, unMasked) => {
                      setValidate((prev) => ({
                        ...prev,
                        max: { valid: true, message: "" },
                      }));
                      setSalary(({ index, ...prev }) => ({
                        ...prev,
                        maxSalary: { masked, unMasked },
                      }));
                    }}
                  />
                </View>

                {/* handle error message max */}
                {validate?.max?.valid === false && (
                  <Text
                    style={{
                      marginTop: theme.sizes.base / 2,
                      color: theme.colors.error,
                      fontSize: theme.sizes.font - 2,
                    }}
                  >
                    {validate?.max?.message}
                  </Text>
                )}
              </View>
            </View>

            {/* footer */}
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                marginTop: theme.sizes.small,
                zIndex: -1,
              }}
            >
              <Pressable
                style={({ pressed }) =>
                  pressed && {
                    opacity: 0.75,
                  }
                }
                onPress={onBack}
              >
                <View
                  style={{
                    paddingVertical: theme.sizes.base,
                    backgroundColor: theme.colors.primary300,
                    minWidth: 110,
                    minHeight: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 3,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: theme.colors.textColor300,
                      fontWeight: "bold",
                    }}
                  >
                    Trở lại
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) =>
                  pressed &&
                  isValid && {
                    opacity: 0.75,
                  }
                }
                onPress={isValid ? handleSubmit : () => {}}
              >
                <View
                  style={{
                    paddingVertical: theme.sizes.base,
                    backgroundColor: isValid
                      ? theme.colors.primary300
                      : "rgba(212, 212, 212, 1)",
                    minWidth: 110,
                    minHeight: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 3,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: isValid
                        ? theme.colors.textColor300
                        : "rgba(22,24,35,0.34)",
                      fontWeight: "bold",
                    }}
                  >
                    Tiếp
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SkillsForm;
