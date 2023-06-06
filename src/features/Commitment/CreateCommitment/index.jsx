import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBarComp } from "~/components";
import CommitmentForm from "~/features/Commitment/components/CommitmentForm";

const CreateCommitmentScreen = ({ route, navigation }) => {
  const {
    projectName,
    description,
    benefit,
    required,
    startDate,
    endDate,
    salary,
    partyA,
    partyB,
    group,
    id,
    builderId,
  } = route.params;
  const theme = useTheme();

  const postContent = {
    id: id,
    projectName: projectName,
    description: description,
    benefit: benefit,
    required: required,
    startDate: startDate,
    endDate: endDate,
    builderId: builderId,
  };

  return (
    <>
      <StatusBarComp
        backgroundColor={theme.colors.primary300}
        statusConfig={{ style: "light" }}
      />
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary300,
            zIndex: 1,
            paddingVertical: theme.sizes.font,
          }}
        >
          <Text
            style={{
              fontSize: theme.sizes.extraLarge,
              color: "#fff",
              alignSelf: "center",
              fontWeight: "bold",
            }}
          >
            Tạo cam kết
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            <CommitmentForm
              postContent={postContent}
              partyA={partyA}
              partyB={partyB}
              salaryRange={salary}
              group={group}
              navigation={navigation}
            />
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CreateCommitmentScreen;
