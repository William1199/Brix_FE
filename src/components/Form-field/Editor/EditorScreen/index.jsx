import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

const ACTIONS = [
  actions.keyboard,
  actions.setBold,
  actions.setItalic,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.setStrikethrough,
  actions.setUnderline,
  actions.undo,
  actions.redo,
  actions.removeFormat,
];

const EditorScreen = ({
  visible,
  placeholder,
  value = "",
  inputConfig,
  callback = () => {},
  onClose = () => {},
  onBlur = () => {},
}) => {
  const theme = useTheme();
  const [textVal, setTextVal] = useState(value);
  const [editorStyle, setEditorStyle] = useState({
    display: "none",
    paddingBottom: 0,
  });

  const editorRef = useRef();
  const translateY = useRef(new Animated.Value(100)).current;

  // animation  push footer when  open keyboard
  useEffect(() => {
    let timeId;
    const animationFooter = (value) => {
      Animated.spring(translateY, {
        toValue: value,
        tension: 100,
        friction: 30,
        useNativeDriver: true,
      }).start();
    };

    const _keyboardWillShow = (event) => {
      const height = event.endCoordinates.height;
      animationFooter(-height);
      setEditorStyle({
        display: "flex",
        paddingBottom: height,
      });
    };

    const _keyboardWillHide = () => {
      animationFooter(100);
      timeId = setTimeout(() => {
        setEditorStyle({
          display: "none",
          paddingBottom: 0,
        });
      }, 100);
    };

    Keyboard.addListener("keyboardWillShow", _keyboardWillShow);
    Keyboard.addListener("keyboardWillHide", _keyboardWillHide);

    return () => {
      Keyboard.removeAllListeners("keyboardWillShow");
      Keyboard.removeAllListeners("keyboardWillHide");
      clearTimeout(timeId);
    };
  }, []);

  useEffect(() => {
    setTextVal(value);
  }, [value, visible]);

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "white" }}>
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
            size={22}
            color="rgb(22,24,35)"
            onPress={onClose}
            style={{ position: "absolute", left: theme.sizes.large }}
          />
          <Text
            style={{
              textTransform: "capitalize",
              fontWeight: "600",
              fontSize: theme.sizes.font + 1,
            }}
          >
            {placeholder}
          </Text>

          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.25 },
              {
                position: "absolute",
                right: theme.sizes.large,
              },
            ]}
            onPress={() => {
              callback(textVal);
              onClose();
            }}
          >
            <Text
              style={{
                color: theme.colors.highlight,

                fontSize: theme.sizes.medium,
                fontWeight: "500",
              }}
            >
              Xong
            </Text>
          </Pressable>
        </View>

        <Animated.ScrollView
          nestedScrollEnabled
          style={{ flex: 1, backgroundColor: "white" }}
          contentContainerStyle={{ paddingBottom: editorStyle.paddingBottom }}
        >
          <RichEditor
            ref={editorRef}
            initialContentHTML={textVal}
            initialFocus={false}
            placeholder={placeholder}
            onChange={setTextVal}
            onBlur={onBlur}
            style={{
              flex: 1,
            }}
            initialHeight={250}
            editorInitializedCallback={() => {
              editorRef.current.focusContentEditor();
            }}
            {...inputConfig}
          />
        </Animated.ScrollView>

        <Animated.View
          style={{
            justifyContent: "center",
            alignItems: "center",
            borderTopColor: "rgba(22,24,35,0.12)",
            borderTopWidth: 1,
            transform: [{ translateY: translateY }],
            display: editorStyle.display,
            left: 0,
            right: 0,
            backgroundColor: "white",
            width: Dimensions.get("screen").width,
          }}
        >
          <RichToolbar
            editor={editorRef}
            selectedIconTint={theme.colors.highlight}
            iconTint="rgb(22,24,35)"
            actions={ACTIONS}
            iconMap={{
              [actions.keyboard]: ({ tintColor }) => (
                <View>
                  <MaterialCommunityIcons
                    name="keyboard-settings-outline"
                    size={24}
                    color="black"
                  />
                </View>
              ),
            }}
            style={[
              {
                backgroundColor: "rgba(22,24,35,0.06)",
                borderColor: "rgba(22,24,35,0.06)",
                borderWidth: 1,
                borderTopLeftRadius: theme.sizes.base / 2,
                borderTopRightRadius: theme.sizes.base / 2,
                width: "100%",
              },
            ]}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EditorScreen;
