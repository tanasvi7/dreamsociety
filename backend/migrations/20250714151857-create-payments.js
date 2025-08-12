'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      amount: Sequelize.DECIMAL(10,2),
      payment_method: Sequelize.STRING(50),
      payment_status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        defaultValue: 'pending'
      },
      transaction_id: Sequelize.STRING(100),
      transaction_number: Sequelize.STRING(100),
      transaction_type: {
        type: Sequelize.ENUM('upi', 'card', 'netbanking', 'wallet'),
        defaultValue: 'upi'
      },
      payment_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
