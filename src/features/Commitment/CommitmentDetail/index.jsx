import { useCallback, useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import Button from "~/components/Button";

import moment from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import axiosInstance from "~/app/api";
import { ConfirmDialog, Loading, StatusBarComp } from "~/components";
import { API_RESPONSE_CODE, ROLE } from "~/constants";
import AuthContext from "~/context/AuthContext";
import CommitmentInfo from "~/features/Commitment/components/CommitmentInfo";
import { formatStringToCurrency } from "~/utils/helper";

const MOCK_DATA = {
  id: 10,
  projectName: "Vinhomes Grand Park",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  startDate: "01/02/2023",
  endDate: "01/06/2023",
  salary: "15",
  partyA: {
    firstName: "Huỳnh",
    lastName: "Anh Khoa",
    phoneNumber: "0868644651",
    verifyId: "083201000037",
    companyName: "Vinhomes",
  },
  partyB: {
    firstName: "Phạm",
    lastName: "Thanh Trúc",
    phoneNumber: "0854770807",
    verifyId: "094382888857",
    builderType: "Thợ sơn nước",
  },
  group: [
    {
      name: "Nguyễn Văn A",
      dob: "01/01/2002",
      type: "Thợ phụ",
      verifyId: "047382986512",
    },
    {
      name: "Nguyễn Thị B",
      dob: "02/02/2003",
      type: "Thợ phụ",
      verifyId: "057648367294",
    },
  ],
  optionalTerm: "",
  isAccepted: false,
};

const CommitmentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);

  const [accepted, setAccepted] = useState(false);
  const [commitmentDetail, setCommitmentDetail] = useState();
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const fetchData = async () => {
    const { code, data } = await axiosInstance.get(
      "commitment/:id".replace(":id", id)
    );
    if (+code === API_RESPONSE_CODE.success) {
      setCommitmentDetail({ ...data, salary: data.salaries });
      setLoading(false);
      setAccepted(data.isAccepted);
    }
  };

  const generateHtml = useCallback(() => {
    if (!commitmentDetail) return "";

    let table = "";
    if (commitmentDetail.group) {
      table += ` <h3>
      <h3>
      Đội nhóm của bên B
      </h3>
      <h3>
      <table>
         <tr>
            <th>Tên</th>
            <th>Vai trò</th>
            <th>CCCD</th>
         </tr>`;

      for (let i in commitmentDetail.group) {
        const member = commitmentDetail.group[i];
        table += `
          <tr>
            <td>${member.name}</td>
            <td>${member.typeName}</td>
            <td>${member.verifyId}</td>
          </tr>
          `;
      }

      table += `
      </table>
      `;
    }

    const html = `
    <html>
    <head>
        <style>
            body {
                background-color: #FFFCDF;
            }
    
            table {
                font-family: sans-serif;
                width: 100%;
                border-collapse: collapse;
    
            }
    
            td {
                border: 1.5px solid #000;
                text-align: center;
                padding: 8px;
                font-family: sans-serif;
    
                background-color: #dddddd;
    
            }
    
            th {
                font-weight: bold;
                font-size: 18.72px;
                border: 1.5px solid #000;
    
            }
    
    
    
            h1 {
                text-align: center;
                font-family: sans-serif;
            }
    
            h2 {
                background-color: #F7941D;
                padding: 10px;
                color: #fff;
                font-family: sans-serif;
            }
    
            h3 {
                padding-left: 5px;
                font-family: sans-serif;
            }
    
            p {
                border-bottom: 1.5px solid #000;
                font-family: sans-serif;
                padding-left: 10px;
                padding-bottom: 10px;
    
            }
    
            .horizonal-line {
                font-family: sans-serif;
                padding-left: 10px;
                padding-bottom: 10px;
            }
    
            .vertical-line {
                border-left: 1.5px solid black;
                height: 80px;
            }

            hr {
              border-top: 1.5px solid #000;
            }
        </style>
    </head>
    
    <body>
        <div>
            <h1>
                Bản cam kết
            </h1>

            <h2>DỰ ÁN</h2>

            <div style="display: flex; justify-content: space-between;border-bottom: 1.5px solid #000;">
                <div style="display: flex; align-items: center; flex-direction:column">
                  <h3>
                    Có hiệu lực từ ngày
                  </h3>
                  <div class="horizonal-line">
                  
                    ${moment(commitmentDetail.startDate).format("DD/MM/yy")}
                  </div>
                </div>
                <div class="vertical-line"></div>
                <div style="display: flex; align-items: center; flex-direction:column">
                  <h3>
                      Tên dự án</h3>
                  <div class="horizonal-line">
                      ${commitmentDetail.projectName}
                  </div> 
                </div>
                <div class="vertical-line"></div>
                <div style="display: flex; align-items: center; flex-direction:column">
                    <h3>
                        Hết hiệu lực vào ngày
                    </h3>
                    <div class="horizonal-line">
                        ${moment(commitmentDetail.endDate).format("DD/MM/yy")}
                    </div>
                </div>
            </div>
    
            <h3>
                Vì sao cần ứng tuyển
            </h3>
            ${
              commitmentDetail.benefit !== undefined
                ? commitmentDetail.benefit
                : "Không có"
            }
            <hr>
            <h3>
                Mô tả công việc
            </h3>
            ${
              commitmentDetail.description !== undefined
                ? commitmentDetail.description
                : "Không có"
            }
            <hr>
            <h3>
                Yêu cầu công việc
            </h3>
            ${
              commitmentDetail.required !== undefined
                ? commitmentDetail.required
                : "Không có"
            }
            <hr>
    
            <h2>BÊN A</h2>
            <table>
                <tr>
                    <th>Tên</th>
                    <th>Tên công ty</th>
                    <th>SĐT</th>
                    <th>CCCD</th>
                </tr>
                <tr>
                    <td> ${`${commitmentDetail.partyA.firstName} ${commitmentDetail.partyA.lastName}`}</td>
                    <td> ${commitmentDetail.partyA.companyName}</td>
                    <td> ${commitmentDetail.partyA.phoneNumber}</td>
                    <td> ${commitmentDetail.partyA.verifyId}</td>
                </tr>
            </table>
            <h2>BÊN B</h2>
            <table>
                <tr>
                    <th>Tên</th>
                    <th>Vai trò</th>
                    <th>SĐT</th>
                    <th>CCCD</th>
                </tr>
                <tr>
                    <td> ${`${commitmentDetail.partyB.firstName} ${commitmentDetail.partyB.lastName}`}</td>
                    <td> ${commitmentDetail.partyB.typeName}</td>
                    <td> ${commitmentDetail.partyB.phoneNumber}</td>
                    <td> ${commitmentDetail.partyB.verifyId}</td>
                </tr>
            </table>
    
            ${table}
    
            <h2>ĐIỀU KHOẢN</h2>
            <h3>
                Điều khoản cơ bản
            </h3>
            <p>
            – Bên sử dụng lao động được phép chấm dứt hợp đồng lao động 1 trong các trường hợp sau đây:\nNgười lao động vi phạm nghĩa vụ hợp đồng; thường xuyên không hoàn thành công việc theo hợp đồng; bị xử lý kỉ luật sa thải; có hành vi gây thiệt hại nghiêm trọng về tài sản và lợi ích của Công ty; tự ý bỏ việc; bị ốm, đau phải điều trị liên tục; do thiên tai, hỏa hoạn hoặc những lý do bất khả kháng… \n\n– Người lao động được đơn phương chấm dứt hợp đồng:\nKhông được bố trí theo đúng công việc đã thỏa thuận; không được trả lương, công đầy đủ; bị ngược đãi bạo hành, cưỡng bức; ốm đau, bệnh tật, gia đình có hoàn cảnh không thể tiếp tục công việc; lao động nữ có thai phải nghỉ việc.
            </p>
            <h3>
                Điều khoản thêm
            </h3>
            <p>
                ${
                  commitmentDetail.optionalTerm !== ""
                    ? commitmentDetail.optionalTerm
                    : "Không có"
                }
            </p>
            <h3>
                Mức lương
            </h3>
            <p>
                ${formatStringToCurrency(commitmentDetail.salary)}
            </p>
            <img src="https://i.ibb.co/k3yHgvf/BRIX.png" style="width: 100vw;" />
        </div>
    </body>
    
    </html>
  `;
    return html;
  }, [commitmentDetail]);

  const generatePdf = async () => {
    const file = await printToFileAsync({
      html: generateHtml(),
      base64: false,
    });

    await shareAsync(file.uri);
  };

  const handleAccept = async () => {
    try {
      await axiosInstance.put(`commitment/${id}`);
    } catch (e) {
      console.log(` error ${e}`);
    } finally {
      setAccepted(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <Loading />;

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
            paddingVertical: theme.sizes.font,
            zIndex: 1,
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
            Xem cam kết
          </Text>
        </View>
        <View style={{ paddingHorizontal: 25, flex: 1 }}>
          <KeyboardAwareScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            <CommitmentInfo
              postContent={{
                id: commitmentDetail.id,
                projectName: commitmentDetail.projectName,
                description: commitmentDetail.description,
                benefit: commitmentDetail.benefit,
                required: commitmentDetail.required,
                startDate: commitmentDetail.startDate,
                endDate: commitmentDetail.endDate,
              }}
              partyA={commitmentDetail.partyA}
              partyB={commitmentDetail.partyB}
              group={commitmentDetail.group}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "center",
              }}
            >
              <View style={{ width: "50%" }}>
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    marginBottom: theme.sizes.small,
                    fontSize: theme.sizes.medium,
                    fontWeight: "bold",
                  }}
                >
                  Điều khoản thêm
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
                        paddingBottom: theme.sizes.base,
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {commitmentDetail.optionalTerm !== null
                      ? commitmentDetail.optionalTerm
                      : "Không có"}
                  </Text>
                </View>
                <Text
                  style={{
                    color: "rgb(22,24,35)",
                    fontWeight: "medium",
                    marginVertical: 10,
                    marginBottom: 5,
                    fontSize: theme.sizes.medium,
                    fontWeight: "bold",
                  }}
                >
                  Lương cứng
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
                        paddingBottom: theme.sizes.base,
                        borderRadius: theme.sizes.base,
                        fontSize: theme.sizes.medium,
                      },
                    ]}
                  >
                    {formatStringToCurrency(commitmentDetail.salary)}
                  </Text>
                </View>
              </View>
              <View>
                {accepted == true && (
                  <Button
                    variant="secondary"
                    onPress={generatePdf}
                    style={{ marginTop: theme.sizes.base }}
                  >
                    Tải cam kết PDF
                  </Button>
                )}
              </View>
            </View>
            {!accepted && userInfo.role.toLowerCase() === ROLE.builder && (
              <Button
                variant="primary"
                onPress={() => setConfirm(true)}
                style={{ marginTop: theme.sizes.base }}
              >
                Đồng ý
              </Button>
            )}
          </KeyboardAwareScrollView>
        </View>
        <ConfirmDialog
          visible={confirm}
          confirmText="Xác nhận"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            handleAccept();
          }}
        >
          <View style={{ padding: theme.sizes.font }}>
            <Text
              style={{
                color: "rgb(22,24,35)",
                fontWeight: "medium",
                marginVertical: 10,
                fontWeight: "500",
              }}
            >
              Bạn có chắc chắn muốn đồng ý cam kết?
            </Text>
          </View>
        </ConfirmDialog>
      </SafeAreaView>
    </>
  );
};

export default CommitmentDetailScreen;
