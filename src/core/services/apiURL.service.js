export const LOGIN_URL = "user/staff-login";
export const FORGOT_URL = "user/forgotpwd";
export const RESET_URL = "user/forgotpwd/newpwd";
export const IS_VALID = "user/exists"
export const REFRESH_TOKEN_URL = "auth/exchange-token";

export const USERS_URL = "user/filter";
export const VIEW_USER = "user/";
export const COMMON_DATA = "common";

export const AUTH_URL = "auth";
export const PROFILE_URL = "profile";
export const USER_URL = "user";
export const INACTIVE_USERS = "user/in-active";
export const UPDATE_STAFF = "user/update-staff-byadmin";
export const PLAN_URL = "plans";
export const USER_SUBSCRIBE = "plans/subscribe/"
export const BRANCH_URL = "branch";
export const COUPON_URL = "coupon";
export const REPORT_PAYMENT_BASE = "report/paymentBased"
export const EXPORT_PAYMENT_BASE = "report/exportPayment"

export const REPORT_USER_BASE = "report/userBased"
export const EXPORT_USER_REPORT = "report/exportUser"

export const IMAGE_APPROVAL = "profile/images/approval/"
export const IMAGE_APPROVAL_FILTER = "profile/images/filters"

//MASTER_API_URL_START
export const LANGUAGE_URL = "master/language";
export const COLLAGE_URL = "master/collage";
export const COMPANY_URL = "master/company";
export const PROFESSION_URL = "master/profession";
export const RELIGION_URL = "master/religion";
export const DEGREE_URL = "master/degree";
export const COMMUNITY_URL = "master/community";

//MASTER-LANGUAGE

export const LANGUAGE_CREATE = "master/language";
export const LANGUAGE_FILTER = "master/language/filter";
export const LANGUAGE_GET_BY_ID = "master/language/";
export const LANGUAGE_DELETE = "master/language/";

//MASTER-COMPANY
export const COMPANY_CREATE = "master/company";
export const COMPANY_FILTER = "master/company/";
export const COMPANY_GET_BY_ID = "master/company/";
export const COMPANY_DELETE = "master/language/";

//MASTER-RELIGION
export const RELIGION_CREATE = "master/religion";
export const RELIGION_FILTER = "master/religion/filter";
export const RELIGION_GET_BY_ID = "master/religion/";
export const RELIGION_DELETE = "master/religion/";

//MASTER-PROFESSION
export const PROFESSION_CREATE = "master/profession/";
export const PROFESSION_FILTER = "master/profession/";
export const PROFESSION_GET_BY_ID = "master/profession/";
export const PROFESSION_DELETE = "master/profession/";

//MASTER-COMMUNITY
export const COMMUNITY_CREATE = "master/community";
export const COMMUNITY_FILTER = "master/community/filter";
export const COMMUNITY_GET_BY_ID = "master/community/";
export const COMMUNITY_DELETE = "master/community/";

//MASTER-DEGREE
export const DEGREE_CREATE = "master/degree";
export const DEGREE_FILTER = "master/degree/";
export const DEGREE_GET_BY_ID = "master/degree/";
export const DEGREE_DELETE = "master/degree/";

//MASTER-COLLAGE
export const COLLAGE_PATH = "master/country";
export const COLLAGE_CREATE = "master/collage";
export const COLLAGE_FILTER = "master/collage/";
export const COLLAGE_GET_BY_ID = "master/collage/";
export const COLLAGE_DELETE = "master/degree/";

//MASTER-COUNTRY
export const COUNTRY_PATH = "master/country";

//MASTER-STATE
export const STATE_PATH = "master/state";

//MASTER-CITY
export const CITY_PATH = "master/city";

//MASTER_API_URL_END

//COMMON_API_URL_START
//COMMON_BLOG
export const BLOG_CREATE = "common/blog";
export const BLOG_UPDATE = "common/blog/";
export const BLOG_FILTER = "common/blog/filter";
export const BLOG_GET_BY_ID = "common/blog/";
export const BLOG_DELETE = "common/blog/";
//COMMON_FAQ
export const FAQ_CREATE = "common/faq";
export const FAQ_UPDATE = "common/faq/";
export const FAQ_FILTER = "common/faq/filter";
export const FAQ_GET_BY_ID = "common/faq/";
export const FAQ_DELETE = "common/faq/";

//COMMON_SUCCESS_STORY
export const SUCCESS_STORY_FILTER = "common/success-story/filter";
export const SUCCESS_STORY_GET = "common/success-story";

//COMMON_CONTACT_US
// export const CONTACT_US_REPLY = "common/contact-us/"
export const CONTACT_US_UPDATE = "common/contact-us/";
export const CONTACT_US_FILTER = "common/contact-us/filter";
export const CONTACT_US_GET_BY_ID = "common/contact-us/";
export const CONTACT_US_DELETE = "common/contact-us/";
export const REPLY_CONTACT_US = "common/contact-us/reply"
//COMMON_SETTINGS
export const SETTINGS_PATH = "common/settings";
export const UPLOAD_IMAGES = "common/images";
export const PROFILE_IMAGE_UPLOAD = "profile/images"

export const CUSTOMER_REGISTER = "user/customer-register";
export const USER_PROFILE = "profile";
export const UPLOAD_PHOTOS = "profile/images";
export const TODAY_MATCHES = "profile/today-matchs";
export const NEAR_BY_MATCHES = "profile/nearby-matchs";
export const RECENT_VIEWED_BY_ME = "profile/recently-viewedby-me";
export const RECENT_VIEWED_BY_THEM = "profile/recently-viewedby-them";
export const PREMIUM_MEMBERS = "profile/premium-members";
export const BLOCK_PROFILE = "profile/action/block/";
export const DONT_SHOW = "profile/action/donotshow/";
export const MY_MATCHES = "profile/my-matchs";
export const NEW_MATCHES = "profile/new-matchs";
export const PROFILE_DELETE_REQUEST = "profile/delReq-filter";
export const APPROVE_AND_DELETE_REQUEST = "profile/delReq/";
export const DELETE_PROFILE = "profile/delete/"

//DASHBOARD
export const REGISTERED_USERS = "user/registered-users";
export const SUBSCRIPTION_CHART = "user/subscriptions-pichart";
export const SUBSCRIPTION_ANALYSIS = "user/subscription-analysis";

//PLAN
export const PLAN_CREATE = "plans";
export const PLAN_UPDATE = "plans";
export const PLAN_GET_BY_ID = "plans/";

//COUPON
export const COUPON_CREATE = "coupon";
export const COUPON_FILTER = "coupon/filter";
export const COUPON_UPDATE = "coupon/";
export const COUPON_GET_BY_ID = "coupon/";
export const COUPON_DELETE = "coupon/";
export const COUPON_ISVALID = "coupon/isValid"

//Payment
export const PAYMENT_FILTER = "payment/filter";
export const PAYMENT_GET_BY_ID = "payment/";
export const PAYMENT = "payment";

export const OLD_PAYMENT_FILTER = "oldsiteplan/filter";
export const OLD_PAYMENT_GET_BY_ID = "oldsiteplan/";

//Old site users
export const OLD_SITE_USERS_FILTER = "oldsiteuser/filter";
export const OLD_SITE_USER_GET_BY_ID = "oldsiteuser/";

//Notifications
export const NOTIFICATION_FILTER = "profile/notification";
export const UPDATE_NOTIFICATION = "profile/notification/"

//Subscription Expiry Report
export const REPORT_SUBSCRIPTION_EXPIRY = "report/subscription-expiry";
export const EXPORT_SUBSCRIPTION_EXPIRY = "report/export-subscription-expiry";