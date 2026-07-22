import { dropEnumType } from "../utils/migration.js";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.ENUM("active", "inactive", "suspended"),
      allowNull: true,
      defaultValue: "active",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "status");
    await dropEnumType(queryInterface, "users", "status");
  },
};
