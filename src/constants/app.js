import moment from "moment";

export const ROUTE = {
  tabNavigator: "TabNavigator",
  landing: "Landing",
  home: "Home",
  login: "Login",
  register: "Register",
  chat: "Chat",
  uploaded: "Uploaded",
  notification: "Notification",
  upload: "Upload",
  viewAll: "ViewAll",
  search: "Search",
  postDetail: "PostDetail",
  storeDetail: "StoreDetail",
  createCommitment: "CreateCommitment",
  commitmentDetail: "CommitmentDetail",
  viewAllCommitment: "ViewAllCommitment",
  viewAllApplied: "ViewAllApplied",
  profile: "Profile",
  myProfile: "MyProfile",
  constructorProfile: "ConstructorProfile",
  cart: "Cart",
  drawer: "Drawer",
  dynamicProfileForm: "DynamicProfileForm",
  listScreen: "ListScreen",
  productDetail: "ProductDetail",
  createProduct: "CreateProduct",
  billDetail: "BillDetail",
  smallBillDetail: "SmallBillDetail",
  billProgress: "BillProgress",
  createBill: "CreateBill",
  smallBillForm: "SmallBillForm",
  chooseRole: "ChooseRole",
  viewAllBill: "ViewAllBill",
  channel: "Channel",
  premium: "Premium",
  paymentHistory: "PaymentHistory",
  verifyAccount: "VerifyAccount",
  verifyCMND: "verifyCMND",
  test: "Test",
  createTest: "CreateTest",
  viewReportedProduct: "ViewReportedProduct",
  viewReportedPost: "ViewReportedPost",
  listQuiz: "ListQuiz",
  applyGroup: "ApplyGroup",
  forgotPwd: "ForgotPassword",
};
export const chatTheme = {
  channelPreview: {
    container: {
      backgroundColor: "transparent",
    },
  },
};

export const API_PATH = {
  contractor: {
    getPosts: "contractorpost/getAll",
    searchPosts: "contractorpost/search",
    createPost: "contractorpost/createPost",
    getDetail: "contractorpost/:id",
    updateProfile: "users/update/contractor",
    getPostHistory: "contractorpost/contractor/getAll",
    favorite: "users/detail/favorite",
    applied: "contractorpost/applied",
    invite: "invite/checkInvite",
  },
  builder: {
    getPosts: "builderpost",
    createPost: "builderpost/createPost",
    getDetail: "builderpost/:id",
    updateProfile: "users/update/builder",
    favorite: "users/detail/builder/favorite",
  },
  store: {
    getPosts: "store",
    updateProfile: "users/update/store",
    getProducts: "store/getAllProduct",
    favorite: "users/detail/store/favorite",
  },
  quiz: {
    base: "quiz",
    getUserAnswer: "/contractorpost/quiz/:id",
  },
  skill: {
    getLists: "skills",
  },
  notification: {
    base: "notification",
  },
  type: {
    getLists: "type",
  },
  identification: {
    base: "identification",
    detect: "identification/test",
  },
  productSystem: {
    getLists: "ProductSystem",
  },
  user: {
    getDetail: "/users/detail",
  },
  cart: {
    base: "/cart",
    delete: "/cart/delete",
  },
  bill: {
    getDetail: "/billController/small/:id",
    getProductsHistory: "/billController/history",
    updateStatus: "/billController/:id",
  },
};

export const BASE_URL = "https://buildingconstruct.click/api/";

export const ROLE = {
  contractor: "contractor",
  builder: "user",
  store: "store",
};

export const NOW = moment();

export const PLACES = [
  "An Giang",
  "Bà rịa – Vũng tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thành phố Hồ Chí Minh",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

//#region regex
export const CURRENCY_VND_REGEX = /(\d)(?=(\d\d\d)+(?!\d))/g;
export const ALL_HTML_TAG = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
export const FORMAT_DATE_REGEX = {
  "DD-MM-YYYY": "DD-MM-YYYY",
  "D/M/YYYY": "D/M/YYYY",
  "DD / MM / YYYY": "DD / MM / YYYY",
  "DD/MM/YYYY": "DD/MM/YYYY",
  "DD MMM, YYYY": "DD MMM, YYYY",
  "DD MMM": "DD MMM",
};
//#endregion

export const CATEGORIES = [
  {
    imageUri:
      "https://ouch-cdn2.icons8.com/dL2Oi9djabluL_TqlsnPM4VJ-mkJ_JTy8ihvL_Qnsy4/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTY3/LzIzMTI0NTZjLWZh/NTAtNGNjMS04MjRj/LTgzNjk1NDBmYmQz/NC5zdmc.png",
    name: "Cổ điển",
    value: 0,
  },
  {
    imageUri:
      "https://ouch-cdn2.icons8.com/dL2Oi9djabluL_TqlsnPM4VJ-mkJ_JTy8ihvL_Qnsy4/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTY3/LzIzMTI0NTZjLWZh/NTAtNGNjMS04MjRj/LTgzNjk1NDBmYmQz/NC5zdmc.png",
    name: "Hiện đại",
    value: 1,
  },
  {
    imageUri:
      "https://ouch-cdn2.icons8.com/dL2Oi9djabluL_TqlsnPM4VJ-mkJ_JTy8ihvL_Qnsy4/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTY3/LzIzMTI0NTZjLWZh/NTAtNGNjMS04MjRj/LTgzNjk1NDBmYmQz/NC5zdmc.png",
    name: "Tân cổ điển",
    value: 2,
  },
  {
    imageUri:
      "https://ouch-cdn2.icons8.com/dL2Oi9djabluL_TqlsnPM4VJ-mkJ_JTy8ihvL_Qnsy4/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTY3/LzIzMTI0NTZjLWZh/NTAtNGNjMS04MjRj/LTgzNjk1NDBmYmQz/NC5zdmc.png",
    name: "Tối giản",
    value: 3,
  },
];

export const SALARIES = [
  "200000",
  ["200000", "300000"],
  ["300000", "400000"],
  ["400000", "500000"],
  ["500000", "600000"],
  "600000",
];

export const CONSTRUCTIONTYPE = [
  { label: "Nhà Ở", value: "Nhà ở" },
  { label: "Tòa nhà chung cư", value: "Tòa nhà chung cư" },
  { label: "Công trình công cộng", value: "Công trình công cộng" },
];
export const BRAND = [
  { label: "SIAM CITY CEMENT", value: "SIAM CITY CEMENT" },
  { label: "VIGLACERA", value: "VIGLACERA" },
  { label: "VICOSTONE", value: "VICOSTONE" },
  { label: "HOLCIM", value: "HOLCIM" },
  { label: "LAFARGE", value: "LAFARGE" },
  { label: "SEMEN INDONESIA", value: "SEMEN INDONESIA" },
  { label: "PRIME GROUP", value: "PRIME GROUP" },
];

export const SORT_BY = {
  time: "lastModifiedAt",
};

export const FILTER_DEFAULT_VALUE = {
  salary: [],
  places: [],
  categories: [],
  participant: null,
  types: [],
};

export const API_RESPONSE_CODE = {
  success: 200,
};

export const NO_IMAGE_URL =
  "https://media.istockphoto.com/id/1357365823/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=PM_optEhHBTZkuJQLlCjLz-v3zzxp-1mpNQZsdjrbns=";

export const ASYNC_STORAGE_KEY = {
  search_history: "SEARCH_HISTORY_POST",
  userInfo: "USER_INFO",
  search_product: "SEARCH_PRODUCT",
  video: "VIDEO",
};

export const MIDDLE_BTN_SIZE = 55;

export const PROFILE_FORM = {
  general: "Thông tin cơ bản",
  personal: "Thông tin cá nhân",
  certificate: "chứng chỉ",
  experience: "Kinh nghiệm làm việc",
  skills: "Kỹ năng",
  company: "Thông tin công ty",
};

export const GENDER = ["Nam", "Nữ", "Khác"];

export const TODAY = moment(
  moment().format(FORMAT_DATE_REGEX["DD/MM/YYYY"]),
  "DD/MM/YYYY"
).toDate();

export const BILL_STATUS_ENUM = [
  "Level1",
  "Level2",
  "Level3",
  "Success",
  "NOT_RESPONSE",
  "Pending",
  "Accepted",
  "Decline",
  "Paid",
  "Received",
  "Cancel",
];

export const BILL_TYPE = {
  all: 0,
  installment: 1,
  periodical: 2,
};

export const NOTIFICATION_TYPE = {
  postDetail: 0,
  billDetail: 1,
  commitmentDetail: 2,
  reportDetail: 3,
};

export const CAMERA_SHAPE = {
  rectangle: "rectangle",
  circle: "circle",
};

export const PRODUCT_TYPE_ENUM = {
  ["color-size"]: 0,
  others: 1,
  none: 2,
};
