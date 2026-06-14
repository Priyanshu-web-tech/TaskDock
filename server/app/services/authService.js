const httpStatus = require("http-status").status;

const db = require("../models/index").sequelize;

const authRepository = require("../repositories/authRepository");
const sessionService = require("../services/sessionService");
const { generateHash, comparePassword } = require("../utils/password");

const loginByEmail = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password, deviceId } = body;

    const checkUser = await authRepository.findUserByEmail(
      email,
      null,
      transaction,
    );
    if (!checkUser) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    if (checkUser.lockUntil && Date.now() < checkUser.lockUntil) {
      const remainingMs = checkUser.lockUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      const minutesText = `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
      return {
        error: true,
        data: {},
        msgCode: `Your account has been temporarily locked due to multiple failed login attempts. Please try again in ${minutesText} or reset your password.`,
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const isPasswordValid = await comparePassword(password, checkUser.password);
    if (!isPasswordValid) {
      const newAttempts = (checkUser.loginAttempts || 0) + 1;
      const updateData = { loginAttempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lockUntil = Date.now() + 10 * 60 * 1000;
        updateData.loginAttempts = 0;
      }
      await authRepository.updateUser(updateData, { id: checkUser.id });
      if (newAttempts >= 5) {
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed login attempts. Please try again in 10 minutes or reset your password.`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }
      return {
        error: true,
        data: {},
        msgCode: "INVALID_PASSWORD",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    await authRepository.updateUser(
      { loginAttempts: 0, lockUntil: null },
      { id: checkUser.id },
    );

    const sessionTokens = sessionService.generateSessionTokens(
      { user: checkUser, deviceId },
      res,
    );

    const existingSession = await sessionService.checkIfSessionExist(
      checkUser.id,
      deviceId,
      transaction,
    );
    if (!existingSession) {
      await sessionService.createSession(
        {
          userId: checkUser.id,
          deviceId,
          accessToken: sessionTokens.accessToken,
          refreshToken: sessionTokens.refreshToken,
        },
        transaction,
      );
    } else {
      await sessionService.updateSession(
        { userId: checkUser.id, deviceId },
        {
          accessToken: sessionTokens.accessToken,
          refreshToken: sessionTokens.refreshToken,
          lastLogin: new Date(),
        },
        transaction,
      );
    }

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        user: {
          id: checkUser.id,
          email: checkUser.email,
          firstName: checkUser.firstName,
          lastName: checkUser.lastName,
          userType: checkUser.userType,
          designation: checkUser.designation ?? null,
        },
      },
      msgCode: "LOGIN_SUCCESSFUL",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

const registerUser = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password, firstName, lastName, deviceId } = body;

    const existingUser = await authRepository.findUserByEmail(
      email,
      null,
      transaction,
    );
    if (existingUser) {
      return {
        error: true,
        data: {},
        msgCode: "ALREADY_EXIST",
        status: httpStatus.CONFLICT,
        transaction,
      };
    }

    const hash = await generateHash(password);
    const user = await authRepository.createUser(
      {
        email,
        password: hash,
        firstName,
        lastName,
        userType: "user",
      },
      transaction,
    );

    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "UNABLE_TO_CREATE",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        transaction,
      };
    }

    const sessionTokens = sessionService.generateSessionTokens(
      { user, deviceId },
      res,
    );

    const newSession = await sessionService.createSession(
      {
        userId: user.id,
        deviceId,
        accessToken: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
      },
      transaction,
    );

    if (!newSession) {
      return {
        error: true,
        data: {},
        msgCode: "UNABLE_TO_CREATE",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        transaction,
      };
    }

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          designation: user.designation ?? null,
        },
      },
      msgCode: "REGISTERED_SUCCESSFULLY",
      status: httpStatus.CREATED,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

module.exports = {
  loginByEmail,
  registerUser
}