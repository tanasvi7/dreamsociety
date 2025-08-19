'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'working_type', {
      type: Sequelize.ENUM('employee', 'businessman', 'unemployed', 'student'),
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'working_type');
  }
};
