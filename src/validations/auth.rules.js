export default {
  register: {
    name: "required|min:2|max:100",
    email: "required|email",
    password: "required|min:6",
  },
  login: {
    email: "required|email",
    password: "required",
  },
  forgot_password: {
    email: "required|email",
  },
  reset_password: {
    token: "required",
    password: "required|min:6",
  },
};
