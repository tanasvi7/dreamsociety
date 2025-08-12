'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'admin_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('payments', 'rejection_reason', {
      type: Sequelize.STRING(200),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('payments', 'rejection_reason');
    await queryInterface.removeColumn('payments', 'admin_notes');
  }
};
