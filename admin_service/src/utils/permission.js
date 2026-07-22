import { userPermissionService } from "../services/userPermission.service.js";

export async function getUserModuleAccess(userId) {
  return userPermissionService.getUserModuleAccess(userId);
}
