const httpStatus = require("http-status").status;
const db = require("../models/index").sequelize;
const taskRepository = require("../repositories/taskRepository");
const { getPagination } = require("../utils/helper");
const { Op } = require("sequelize");

const createTask = async (userId, body) => {
  const transaction = await db.transaction();
  try {
    const { title, description, status, priority, dueDate } = body;
    const taskData = {
      userId,
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
    };
    const task = await taskRepository.createTask(taskData, transaction);
    
    return {
      error: false,
      data: task,
      msgCode: "TASK_CREATED",
      status: httpStatus.CREATED,
      transaction,
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

const getTasks = async (userId, query) => {
  try {
    const { page, size, status, search, sortBy, sortOrder } = query;
    const { limit, offset } = getPagination(page, size);

    const condition = { userId };
    if (status) {
      condition.status = status;
    }
    if (search) {
      condition.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const sortFieldMap = {
      dueDate: "dueDate",
      priority: "priority",
      createdAt: "createdAt",
    };
    const sortField = sortFieldMap[sortBy] || "createdAt";
    const sortOrderStr = ["ASC", "DESC"].includes(sortOrder?.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    const options = {
      limit,
      offset,
      order: [[sortField, sortOrderStr]],
    };

    const result = await taskRepository.findAndCountAllTasks(condition, options);
    
    const currentPage = page ? parseInt(page, 10) : 1;
    const totalPages = Math.ceil(result.count / limit);

    return {
      error: false,
      data: {
        total: result.count,
        data: result.rows,
        totalPages,
        page : currentPage,
        pageSize : size
      },
      msgCode: "SUCCESS",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const getTaskById = async (userId, id) => {
  try {
    const task = await taskRepository.findTaskById(id, userId);
    if (!task) {
      return {
        error: true,
        data: {},
        msgCode: "TASK_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }
    return {
      error: false,
      data: task,
      msgCode: "SUCCESS",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const updateTask = async (userId, id, body) => {
  const transaction = await db.transaction();
  try {
    const task = await taskRepository.findTaskById(id, userId, transaction);
    if (!task) {
      return {
        error: true,
        data: {},
        msgCode: "TASK_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    const { title, description, status, priority, dueDate } = body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    await taskRepository.updateTask(updateData, { id, userId }, transaction);

    const updatedTask = await taskRepository.findTaskById(id, userId, transaction);

    return {
      error: false,
      data: updatedTask,
      msgCode: "TASK_UPDATED",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

const deleteTask = async (userId, id) => {
  const transaction = await db.transaction();
  try {
    const task = await taskRepository.findTaskById(id, userId, transaction);
    if (!task) {
      return {
        error: true,
        data: {},
        msgCode: "TASK_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    await taskRepository.deleteTask({ id, userId }, transaction);

    return {
      error: false,
      data: {},
      msgCode: "TASK_DELETED",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.error(err);
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
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
