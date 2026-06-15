const { success, error } = require("../response/index");
const taskService = require("../services/taskService");

const createTask = async (req, res) => {
  try {
    const result = await taskService.createTask(req.data.id, req.body);
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

const getTasks = async (req, res) => {
  try {
    const result = await taskService.getTasks(req.data.id, req.query);
    if (result.error) {
      throw result;
    }
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const getTaskById = async (req, res) => {
  try {
    const result = await taskService.getTaskById(req.data.id, req.params.id);
    if (result.error) {
      throw result;
    }
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const updateTask = async (req, res) => {
  try {
    const result = await taskService.updateTask(req.data.id, req.params.id, req.body);
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

const deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.data.id, req.params.id);
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

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
