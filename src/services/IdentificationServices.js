import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const verifyData = async (bodyData) => {
  try {
    const { code, message } = await axios.post(
      API_PATH.identification.base,
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }

  return false;
};
