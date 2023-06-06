import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getPosts = async (bodyData) => {
  try {
    const { code, message, data, pagination } = await axios.post(
      API_PATH.builder.getPosts,
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

export const createPosts = async (bodyData = {}) => {
  try {
    const { code, message } = await axios.post(
      API_PATH.builder.createPost,
      bodyData
    );

    if (+code === API_RESPONSE_CODE.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

export const searchPosts = async (params = {}) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.builder.searchPosts,
      { params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { data, pagination };
    }
  } catch (error) {
    console.log(error);
  }
};

export const getDetail = async (id) => {
  try {
    const { code, message, data } = await axios.get(
      API_PATH.builder.getDetail.replace(":id", id)
    );
    if (+code === API_RESPONSE_CODE.success) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (bodyData) => {
  try {
    const { code, message, data } = await axios.put(
      API_PATH.builder.updateProfile,
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

export const getFavoriteInfoList = async (params) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.builder.favorite,
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
