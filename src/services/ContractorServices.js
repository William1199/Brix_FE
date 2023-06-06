import { axios } from "~/app";
import { API_PATH, API_RESPONSE_CODE } from "~/constants";

export const getPosts = async (bodyData = {}) => {
  try {
    const { code, message, data, pagination } = await axios.post(
      API_PATH.contractor.getPosts,
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

export const getPostsHistory = async (bodyData = {}) => {
  try {
    const { code, message, data, pagination } = await axios.post(
      API_PATH.contractor.getPostHistory,
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

export const getListToInvite = async (param = {}) => {
  try {
    const { code, message, data, pagination } = await axios.get(
      API_PATH.contractor.invite,
      null,
      { params: param }
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
      API_PATH.contractor.searchPosts,
      { params }
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { data, pagination };
    }
  } catch (error) {
    console.log(error);
  }
};

export const createPosts = async (bodyData = {}) => {
  try {
    const { code, message } = await axios.post(
      API_PATH.contractor.createPost,
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

export const applyPosts = async (bodyData = {}) => {
  try {
    const { code, message } = await axios.post(
      API_PATH.contractor.applied,
      bodyData
    );
    if (+code === API_RESPONSE_CODE.success) {
      return { isSuccess: true, message };
    }
    return { isSuccess: false, message };
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const getDetail = async (id) => {
  try {
    const { code, message, data } = await axios.get(
      API_PATH.contractor.getDetail.replace(":id", id)
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
      API_PATH.contractor.updateProfile,
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
      API_PATH.contractor.favorite,
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
