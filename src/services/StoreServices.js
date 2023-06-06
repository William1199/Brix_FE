import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getPosts = async (bodyData) => {
  try {
    const { code, message, data, pagination } = await axios.post(
      API_PATH.store.getPosts,
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return {
        data,
        pagination: pagination || {
          totalRecords: 0,
        },
      };
    }
  } catch (error) {
    console.log(error);
  }
};
export const searchPosts = async (params = {}) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.store.searchPosts,
      { params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { data, pagination };
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (bodyData) => {
  try {
    const { code, message, data } = await axios.put(
      API_PATH.store.updateProfile,
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { isSuccess: true, data };
    }

    return { isSuccess: false, data };
  } catch (error) {
    console.log(error);
  }
  return { isSuccess: false };
};

export const getProducts = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.store.getProducts,
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
  } catch (error) {
    console.log(error);
  }
};

export const getFavoriteInfoList = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.store.favorite,
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
