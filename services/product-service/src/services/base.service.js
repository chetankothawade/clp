export class BaseService {
  static throwError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }
}
