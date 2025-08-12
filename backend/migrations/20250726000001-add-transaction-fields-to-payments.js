'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'transaction_number', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('payments', 'transaction_type', {
      type: Sequelize.ENUM('upi', 'card', 'netbanking', 'wallet'),
      defaultValue: 'upi',
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('payments', 'transaction_type');
    await queryInterface.removeColumn('payments', 'transaction_number');
  }
};
