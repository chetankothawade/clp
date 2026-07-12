export const getPaginationParams = (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;
  const sortedField = query.sortedField || "createdAt";
  const sortedBy = query.sortedBy || "DESC";

  return { page, limit, offset, sortedField, sortedBy };
};

export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 0,
});
