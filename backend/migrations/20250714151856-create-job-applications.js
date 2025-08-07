'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      job_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      application_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.ENUM('applied', 'shortlisted', 'rejected', 'accepted'),
        defaultValue: 'applied'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('job_applications');
  }
};
