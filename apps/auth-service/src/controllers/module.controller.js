import { sendResponse, sendListResponse, handleError } from "../utils/response.js";
import { moduleService } from "../services/module.service.js";

/**
 * @desc List modules with pagination/search
 * @route GET /module/list
 * @access Authenticated
 */
export const listModule = async (req, res) => {
  try {
    const result = await moduleService.listModule({ params: req.params, query: req.query });
    return sendListResponse(res, 200, true, "module.list.success", result.module, result.pagination);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "List module error:" });
  }
};

/**
 * @desc Create a new module
 * @route POST /module/create
 * @access Authenticated
 */
export const createModule = async (req, res) => {
  try {
    const module = await moduleService.createModule(req.body);
    return sendResponse(res, 201, true, "module.create.success", { module });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Create module error:" });
  }
};

/**
 * @desc Update a module by UUID
 * @route PUT /module/update/:uuid
 * @access Authenticated
 */
export const updateModule = async (req, res) => {
  try {
    const module = await moduleService.updateModule(req.params.uuid, req.body);
    return sendResponse(res, 200, true, "module.update.success", { module });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update module error:" });
  }
};

/**
 * @desc Soft-delete a module by UUID
 * @route DELETE /module/delete/:uuid
 * @access Authenticated
 */
export const deleteModule = async (req, res) => {
  try {
    await moduleService.deleteModule(req.params.uuid);
    return sendResponse(res, 200, true, "module.delete.success");
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Delete module error:" });
  }
};

/**
 * @desc Get a single module by UUID
 * @route GET /module/get/:uuid
 * @access Authenticated
 */
export const getModule = async (req, res) => {
  try {
    const module = await moduleService.getModule(req.params.uuid);
    return sendResponse(res, 200, true, "module.get.success", { module });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get module error:" });
  }
};

/**
 * @desc Toggle module status by UUID
 * @route PUT /module/status/:uuid
 * @access Authenticated
 */
export const moduleStatus = async (req, res) => {
  try {
    const module = await moduleService.moduleStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, "module.status.success", { module });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Module status error:" });
  }
};

/**
 * @desc Get active module list
 * @route GET /module/getList
 * @access Authenticated
 */
export const getModuleList = async (req, res) => {
  try {
    const module = await moduleService.getModuleList();
    return sendResponse(res, 200, true, "module.list.success", { module });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get module list error:" });
  }
};
