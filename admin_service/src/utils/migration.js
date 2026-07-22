export const quoteIdentifier = (identifier) => {
  return `"${String(identifier).replaceAll('"', '""')}"`;
};

export const dropEnumType = async (queryInterface, tableName, columnName) => {
  const enumTypeName = `enum_${tableName}_${columnName}`;
  await queryInterface.sequelize.query(
    `DROP TYPE IF EXISTS ${quoteIdentifier(enumTypeName)};`
  );
};
