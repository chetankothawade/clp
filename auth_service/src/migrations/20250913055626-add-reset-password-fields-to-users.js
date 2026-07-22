export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "reset_password_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "reset_password_expire", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "reset_password_token");
    await queryInterface.removeColumn("users", "reset_password_expire");
  },
};
