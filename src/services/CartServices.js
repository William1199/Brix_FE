import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getList = async (params) => {
  try {
    const {
      code,
      message,
      data,
      pagination = { totalRecords: 0 },
    } = await axios.get(API_PATH.cart.base, {
      params,
    });
    if (+code === API_RESPONSE_CODE.success) {
      return { data, pagination };
    }
    return { data: [] };
  } catch (error) {
    console.log(error);
  }
};

export const addCart = async (bodyData) => {
  try {
    const { code, message } = await axios.post(API_PATH.cart.base, bodyData);
    if (+code === API_RESPONSE_CODE.success) {
      return { isSuccess: true, message };
    }
    return { isSuccess: false, message };
  } catch (error) {
    console.log(error);
  }
};

export const updateCart = async (bodyData) => {
  try {
    const { code, message, data } = await axios.put(
      API_PATH.cart.base,
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const deleteCart = async (bodyData) => {
  try {
    const { code, message } = await axios.put(API_PATH.cart.delete, bodyData);
    if (+code === API_RESPONSE_CODE.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};
