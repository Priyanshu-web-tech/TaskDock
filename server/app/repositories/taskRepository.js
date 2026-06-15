const { Task } = require("../models");

const createTask = async (data, transaction) => {
  return await Task.create(data, transaction ? { transaction } : {});
};

const findTaskById = async (id, userId, transaction) => {
  return await Task.findOne({
    where: { id, userId },
    ...(transaction ? { transaction } : {}),
  });
};

const findTaskByCondition = async (condition, transaction) => {
  return await Task.findOne({
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const updateTask = async (data, condition, transaction) => {
  return await Task.update(data, {
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const deleteTask = async (condition, transaction) => {
  return await Task.destroy({
    where: condition,
    ...(transaction ? { transaction } : {}),
  });
};

const findAndCountAllTasks = async (condition, options, transaction) => {
  return await Task.findAndCountAll({
    where: condition,
    ...options,
    ...(transaction ? { transaction } : {}),
  });
};

module.exports = {
  createTask,
  findTaskById,
  findTaskByCondition,
  updateTask,
  deleteTask,
  findAndCountAllTasks,
};
