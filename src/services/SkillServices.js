import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getList = async () => {
  try {
    const { code, message, data } = await axios.get(API_PATH.skill.getLists);
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
    return [];
  } catch (error) {
    console.log(error);
  }
};
