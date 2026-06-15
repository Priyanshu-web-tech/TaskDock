const httpStatus = require("http-status").status;

const db = require("../models/index").sequelize;

const sessionRepository = require("../repositories/sessionRepository");
const authRepository = require("../repositories/authRepository");
const otpRepository = require("../repositories/otpRepository");
const sessionService = require("../services/sessionService");
const { generateHash, comparePassword } = require("../utils/password");
const { otpType } = require("../constant/constant");
const {
  verifyAccessTokenRaw,
  generateOtpToken,
  generateVerifyToken,
} = require("../middlewares/jwt");
const { sendEmail, emailTypeSubject } = require("../utils/mailer");
const { getTimeDiffInMin } = require("../utils/helper");

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

const refreshTokens = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const refreshToken =
      req.cookies?.["REFRESH-TOKEN"] ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!refreshToken) {
      return {
        error: true,
        data: {},
        msgCode: "MISSING_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    let decoded;
    try {
      decoded = verifyAccessTokenRaw(refreshToken);
    } catch (err) {
      return {
        error: true,
        data: {},
        msgCode:
          err.message === "jwt expired"
            ? "REFRESH_TOKEN_EXPIRED"
            : "INVALID_REFRESH_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const existingSession = await sessionService.findSessionByCondition(
      { userId: decoded.id, refreshToken },
      transaction,
    );
    if (!existingSession) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_REFRESH_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const user = await authRepository.findUserById(
      decoded.id,
      null,
      transaction,
    );
    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    const deviceId = existingSession.deviceId;
    const sessionTokens = sessionService.generateSessionTokens(
      { user, deviceId },
      res,
    );

    await sessionService.updateSession(
      { userId: user.id, deviceId },
      {
        accessToken: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        lastLogin: new Date(),
      },
      transaction,
    );

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
      },
      msgCode: "TOKEN_REFRESHED",
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

const forgotPassword = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email } = body;

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

    let otp;
    if (process.env.OTP_BYPASS === "true") {
      otp = process.env.OTP;
    } else {
      otp = otpGenerator.generate(Number(process.env.OTP_DIGIT) || 6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
    }

    const hashOtp = await generateHash(otp.toString());
    const otpCond = { userId: checkUser.id, otpType: otpType.RESET_PASSWORD };
    const checkOtp = await otpRepository.findByCondition(otpCond, transaction);

    if (checkOtp) {
      const timeDiffInMin = getTimeDiffInMin(checkOtp.otpSentAt);
      const retryTimeDiffInMin = getTimeDiffInMin(checkOtp.lastAttempt);
      let updateData = { otp: hashOtp, otpSentAt: Date.now() };

      if (checkOtp.otpRetries >= 2 && retryTimeDiffInMin < 10) {
        const remaining = Math.ceil(10 - retryTimeDiffInMin);
        const minutesText =
          remaining > 0
            ? `${remaining} minute${remaining !== 1 ? "s" : ""}`
            : null;
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }

      if (checkOtp.otpSent >= 6 && timeDiffInMin < 10) {
        const remaining = Math.ceil(10 - timeDiffInMin);
        const minutesText =
          remaining > 0
            ? `${remaining} minute${remaining !== 1 ? "s" : ""}`
            : null;
        return {
          error: true,
          data: { time_in_minutes: 10 - timeDiffInMin },
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }

      if (timeDiffInMin <= 5) {
        updateData.otpSent = checkOtp.otpSent + 1;
      } else if (timeDiffInMin >= 10) {
        updateData.otpSent = 1;
        updateData.otpRetries = 0;
      } else {
        updateData.otpSent = checkOtp.otpSent + 1;
      }

      const updateOtpDetails = await otpRepository.updateOtp(
        updateData,
        otpCond,
        transaction,
      );
      if (!updateOtpDetails) {
        return {
          error: true,
          data: {},
          msgCode: "UNABLE_TO_UPDATE",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          transaction,
        };
      }
    } else {
      const otpData = {
        userId: checkUser.id,
        otp: hashOtp,
        otpType: otpType.RESET_PASSWORD,
        otpSentAt: Date.now(),
        otpSent: 1,
        otpRetries: 0,
        lastAttempt: null,
      };

      const createOtpDetails = await otpRepository.create(otpData, transaction);
      if (!createOtpDetails) {
        return {
          error: true,
          data: {},
          msgCode: "OTP_NOT_SEND",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          transaction,
        };
      }
    }

    generateOtpToken({ id: checkUser.id, email: checkUser.email }, res);

    if (process.env.OTP_BYPASS !== "true") {
      await sendEmail(
        email,
        { otp, userName: `${checkUser.firstName} ${checkUser.lastName}` },
        emailTypeSubject.FORGET_PASSWORD,
      );
    }

    return {
      error: false,
      data: {},
      msgCode: "OTP_SENT",
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

const verifyOtp = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { otp } = req.body;
    const { id: userId, email } = req.token;

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

    const otpCond = { userId: checkUser.id, otpType: otpType.RESET_PASSWORD };
    const checkOtp = await otpRepository.findByCondition(otpCond, transaction);

    if (!checkOtp) {
      return {
        error: true,
        data: {},
        msgCode: "OTP_EXPIRED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    if (checkOtp.otpRetries >= 3) {
      const retryDiff = getTimeDiffInMin(checkOtp.lastAttempt);
      if (retryDiff < 10) {
        const remaining = Math.ceil(10 - retryDiff);
        const minutesText =
          remaining > 0
            ? `${remaining} minute${remaining !== 1 ? "s" : ""}`
            : null;
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }
      await otpRepository.updateOtp({ otpRetries: 0 }, otpCond);
    }

    const isOtpValid = await comparePassword(otp.toString(), checkOtp.otp);

    if (!isOtpValid) {
      await otpRepository.updateOtp(
        { otpRetries: checkOtp.otpRetries + 1, lastAttempt: Date.now() },
        otpCond,
      );
      return {
        error: true,
        data: {},
        msgCode: "INVALID_OTP",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    res.clearCookie("OTP-TOKEN", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    generateVerifyToken({ id: checkUser.id, email: checkUser.email }, res);

    return {
      error: false,
      data: {},
      msgCode: "OTP_VERIFIED",
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

const resetPassword = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { password } = req.body;
    const { email } = req.token;

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

    const hash = await generateHash(password);
    await authRepository.updateUser(
      { password: hash, loginAttempts: 0, lockUntil: null },
      { id: checkUser.id },
      transaction,
    );

    await otpRepository.deleteByCondition(
      { userId: checkUser.id, otpType: otpType.RESET_PASSWORD },
      transaction,
    );

    res.clearCookie("VERIFY-TOKEN", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("OTP-TOKEN", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return {
      error: false,
      data: {},
      msgCode: "PASSWORD_RESET_SUCCESSFUL",
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

const updateProfile = async (req) => {
  const transaction = await db.transaction();
  try {
    const { firstName, lastName } = req.body;
    const userId = req.data.id;

    const updateData = { firstName, lastName };

    await authRepository.updateUser(updateData, { id: userId }, transaction);

    const updatedUser = await authRepository.findUserById(
      userId,
      { exclude: ["password"] },
      transaction,
    );

    return {
      error: false,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          userType: updatedUser.userType,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      msgCode: "PROFILE_UPDATED",
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

const changePassword = async (req) => {
  const transaction = await db.transaction();
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.data.id;

    const user = await authRepository.findUserById(userId, null, transaction);
    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_CURRENT_PASSWORD",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return {
        error: true,
        data: {},
        msgCode: "SAME_PASSWORD",
        status: httpStatus.BAD_REQUEST,
        transaction,
      };
    }

    const hash = await generateHash(newPassword);
    await authRepository.updateUser(
      { password: hash },
      { id: userId },
      transaction,
    );

    return {
      error: false,
      data: {},
      msgCode: "PASSWORD_CHANGED",
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

const logout = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const userId = req.data.id;
    const token =
      req.cookies?.["SESSION-TOKEN"] ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    await sessionRepository.deleteSession({ userId, accessToken: token });

    res.clearCookie("SESSION-TOKEN", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("REFRESH-TOKEN", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return {
      error: false,
      data: {},
      msgCode: "LOGOUT_SUCCESSFUL",
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

module.exports = {
  loginByEmail,
  registerUser,
  refreshTokens,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
  logout,
};
