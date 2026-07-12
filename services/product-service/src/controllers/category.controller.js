import { sendResponse, handleError } from "../utils/response.js";
import { categoryService } from "../services/category.service.js";

export const listCategories = async (req, res) => {
  try {
    const data = await categoryService.listCategories({ params: req.params, query: req.query });
    return sendResponse(res, 200, true, "category.list.success", data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Category List Error:" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return sendResponse(res, 201, true, "category.create.success", { category });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Create Category Error:" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.uuid, req.body);
    return sendResponse(res, 200, true, "category.update.success", { category });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update Category Error:" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.uuid);
    return sendResponse(res, 200, true, "category.delete.success");
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Delete Category Error:" });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategory(req.params.uuid);
    return sendResponse(res, 200, true, "category.get.success", { category });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get Category Error:" });
  }
};

export const updateCategoryStatus = async (req, res) => {
  try {
    const category = await categoryService.updateCategoryStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, "category.status.success", { category });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Category Status Update Error:" });
  }
};

export const getCategoryList = async (req, res) => {
  try {
    const category = await categoryService.getCategoryList();
    return sendResponse(res, 200, true, "category.list.success", { category });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get category list error:" });
  }
};
