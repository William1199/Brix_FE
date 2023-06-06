import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getDetail = async (id) => {
  try {
    const { code, message, data } = await axios.get(
      API_PATH.bill.getDetail.replace(":id", id)
    );
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getProductsHistory = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.bill.getProductsHistory,
      { params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return {
        data,
        pagination,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateBillStatus = async (id, bodyData) => {
  try {
    const { code, data } = await axios.put(
      API_PATH.bill.updateStatus.replace(":id", id),
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { data, isSuccess: true };
    }
    return { data, isSuccess: false };
  } catch (error) {
    console.log(error);
  }
};
