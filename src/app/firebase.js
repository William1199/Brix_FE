import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAelyrP0GomMDVfXyX-2lBq0yiWL1Z4HLk",
  authDomain: "capstone-project-e5c70.firebaseapp.com",
  projectId: "capstone-project-e5c70",
  storageBucket: "capstone-project-e5c70.appspot.com",
  messagingSenderId: "533432664281",
  appId: "1:533432664281:web:628ae970b9c3ee946a7ec8",
};

class Firebase {
  constructor() {
    this.app = initializeApp(firebaseConfig);
  }

  getAuth() {
    const auth = getAuth(this.app);
    return auth;
  }

  getStorage() {
    const storage = getStorage();
    return storage;
  }
}

export default new Firebase();
