const { Session, User } = require("../models");

const create = async (data, transaction) => {
  return await Session.create(data, transaction ? { transaction } : {});
};

const findByCondition = async (condition, transaction) => {
  return await Session.findOne({
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const updateSession = async (condition, data, transaction) => {
  return await Session.update(data, {
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const deleteSession = async (
  condition,
  transaction = undefined,
  force = false,
) => {
  const deletedCount = await Session.destroy({
    where: condition,
    force,
    ...(transaction ? { transaction } : {}),
  });

  return deletedCount > 0;
};

const getAuthDetails = async (condition) => {
  try {
    const result = await Session.findOne({
      where: condition,
      attributes: {
        exclude: ["created_at", "updated_at"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
      ],
    });

    return result ? result.toJSON() : false;
  } catch (error) {
    console.log("error>>", error);
    return false;
  }
};

module.exports = {
  create,
  findByCondition,
  updateSession,
  deleteSession,
  getAuthDetails,
};
