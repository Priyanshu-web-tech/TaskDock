const { success, error } = require("../response/index");
const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const result = await authService.loginByEmail(
      req.body,
      res,
    );

    if (result.error) {
      throw result;
    }

    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
      err.transaction,
    );
  }
};

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(
      req.body,
      res,
    );

    if (result.error) {
      throw result;
    }

    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
      err.transaction,
    );
  }
};

module.exports = { login, register };
