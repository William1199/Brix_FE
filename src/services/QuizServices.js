import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const createQuiz = async (bodyData = {}) => {
  try {
    const { code, message } = await axios.post(API_PATH.quiz.base, bodyData);
    return { isSuccess: +code === API_RESPONSE_CODE.success, message };
  } catch (error) {
    console.log(error);
  }

  return { isSuccess: false, message: "Tạo bài kiểm tra thất bại" };
};

export const getDetail = async (id) => {
  try {
    const { code, data } = await axios.get(`${API_PATH.quiz.base}/${id}`);
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getUserAnswers = async ({ quizId, builderId }) => {
  try {
    const { code, data } = await axios.get(
      API_PATH.quiz.getUserAnswer.replace(":id", quizId),
      {
        params: {
          quizId,
          builderId,
        },
      }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};
