import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getList = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.productSystem.getLists,
      { params: params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { data, pagination };
    }
    return [];
  } catch (error) {
    console.log(error);
  }
};
