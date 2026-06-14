const { Otp } = require("../models");

const findByCondition = async (condition, transaction) => {
  return await Otp.findOne({
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const create = async (data, transaction) => {
  return await Otp.create(
    data,
    transaction ? { transaction } : {}
  );
};

const updateOtp = async (data, condition, transaction) => {
  return await Otp.update(data, {
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const deleteByCondition = async (condition, transaction) => {
  return await Otp.destroy({
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

module.exports = {
  findByCondition,
  create,
  updateOtp,
  deleteByCondition,
};