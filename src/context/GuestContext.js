import { createContext } from "react";

import { ROUTE } from "~/constants";

import { StackActions, useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import AuthContext from "./AuthContext";
import { useEffect } from "react";
export default GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  const verifyAccount = (to, rest = {}) => {
    if (!userInfo) {
      return navigation.dispatch(
        StackActions.replace(ROUTE.login, { to, ...rest })
      );
    } else {
      return true;
    }
  };


  return (
    <GuestContext.Provider
      value={{
        verifyAccount,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};
