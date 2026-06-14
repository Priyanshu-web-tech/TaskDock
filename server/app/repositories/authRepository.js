const { User } = require("../models");

const findUserByEmail = async (email, attributes, transaction) => {
  return await User.findOne({
    where: { email },
    ...(attributes ? { attributes } : {}),
    ...(transaction ? { transaction } : {}),
  });
};

const findUserForSessionData = async (userId) => {
  return await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
};

const findUserById = async (userId, attributes, transaction) => {
  return await User.findByPk(userId, {
    ...(attributes ? { attributes } : {}),
    ...(transaction ? { transaction } : {}),
  });
};

const updateUser = async (data, condition, transaction) => {
  return await User.update(data, {
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const createUser = async (data, transaction) => {
  return await User.create(data, transaction ? { transaction } : {});
};

module.exports = {
  findUserByEmail,
  findUserForSessionData,
  findUserById,
  updateUser,
  createUser,
};
