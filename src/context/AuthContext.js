import { createContext, useEffect, useState } from "react";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "react-native-axios-jwt";
import { StreamChat } from "stream-chat";

import { API_RESPONSE_CODE, ASYNC_STORAGE_KEY } from "~/constants";

import axiosInstance from "~/app/api";
import { getAsyncStorage, setAsyncStorage } from "~/utils/helper";
import { chatClient } from "~/app/chatConfig";
import { useNavigation } from "@react-navigation/native";
export default AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [googleMail, setGoogleMail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChooseRole, setIsChooseRole] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [errMessage, setErrMessage] = useState({ msg: "", name: undefined });
  const login = async (_phoneNumber, _password, from) => {
    setIsLoading(true);
    try {
      const _userName = " ";
      const _rememberMe = true;
      const request = {
        userName: _userName,
        phoneNumber: _phoneNumber,
        password: _password,
        rememberMe: _rememberMe,
      };
      const res = await axiosInstance.post("users/login", request);
      if (+res.code === API_RESPONSE_CODE.success) {
        const { accessToken, refreshToken, refreshTokenExpiryTime, ...rest } =
          res.data;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const user = {
          ...rest,
          phoneNumber: res.data.phone,
        };
        setUserInfo(user);
        await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);
        await setAuthTokens({
          accessToken,
          refreshToken,
        });

        setErrMessage({ msg: "", from: null });
      } else {
        setErrMessage({ msg: "SĐT hoặc mật khẩu không đúng", from });
      }
    } catch (e) {
      console.log(`Login error ${e}`);
    }
    setIsLoading(false);
  };

  const setRole = async (_email, _roleId) => {
    setIsLoading(true);
    try {
      const request = {
        email: _email,
        roleId: _roleId,
      };
      const res = await axiosInstance.post("users/SetRole", request);
      if (+res.code === API_RESPONSE_CODE.success) {
        const { accessToken, refreshToken, refreshTokenExpiryTime, ...rest } =
          res.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const user = {
          ...rest,
        };
        setUserInfo(user);
        await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);

        await setAuthTokens({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      } else {
        setErrMessage({ msg: res?.message, from });
      }
    } catch (e) {
      console.log(`Login error ${e}`);
    }
    setIsChooseRole(false);
    setIsLoading(false);
  };

  const loginGoogle = async (_email, _firstName, _lastName, _avatar) => {
    setIsLoading(true);
    try {
      const request = {
        email: _email,
        firstName: _firstName,
        lastName: _lastName,
        avatar: _avatar,
      };
      const res = await axiosInstance.post("users/loginOthers", request);
      if (+res.code === API_RESPONSE_CODE.success) {
        const { accessToken, refreshToken, refreshTokenExpiryTime, ...rest } =
          res.data;

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const user = { rest };
        setUserInfo(user);
        await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, user);
        await setAuthTokens({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
        setIsChooseRole(false);
        setIsLoading(false);
      } else {
        setGoogleMail(_email);
        setIsChooseRole(true);

        setIsLoading(false);
      }
    } catch (e) {
      console.log(`Login GG error ${e}`);
    }
  };
  const logout = async () => {
    chatClient.disconnectUser();
    setAccessToken(null);
    setRefreshToken(null);
    setUserInfo(null);
    setIsChooseRole(false);
    setIsLoading(false);
    clearAuthTokens();
    await setAsyncStorage(ASYNC_STORAGE_KEY.userInfo, null);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        getAccessToken().then((access) => {
          if (typeof access === "string") {
            setAccessToken(access);
          }
        });
        getRefreshToken().then((refresh) => {
          if (typeof refresh === "string") {
            setRefreshToken(refresh);
          }
        });
        const userInfo = await getAsyncStorage(ASYNC_STORAGE_KEY.userInfo);
        if (userInfo) {
          setUserInfo(userInfo);
        }
      } catch (e) {
        console.log(`isLoggedIn error ${e}`);
      }

      setIsLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        loginGoogle,
        setRole,
        googleMail,
        isChooseRole,
        isLoading,
        accessToken,
        refreshToken,
        userInfo,
        errMessage,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
