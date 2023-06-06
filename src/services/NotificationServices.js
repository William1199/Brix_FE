import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getList = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.notification.base,
      { params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return {
        data,
        pagination: pagination || {
          totalRecords: 0,
        },
      };
    }
    return [];
  } catch (error) {
    console.log(error);
  }
};

export const updateIsRead = async (id) => {
  try {
    const { code, message } = await axios.put(
      `${API_PATH.notification.base}/${id}`
    );
    if (+code === API_RESPONSE_CODE.success) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};
