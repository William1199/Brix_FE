import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getProfileById = async (id) => {
  try {
    const { code, message, data } = await axios.get(API_PATH.user.getDetail, {
      params: {
        userID: id,
      },
    });
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};
