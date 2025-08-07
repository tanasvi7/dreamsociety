'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'company', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'work_model', {
      type: Sequelize.ENUM('office', 'remote', 'hybrid'),
      allowNull: true,
      defaultValue: 'office'
    });

    await queryInterface.addColumn('jobs', 'experience_required', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'salary_min', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'salary_max', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'salary_currency', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'INR'
    });

    await queryInterface.addColumn('jobs', 'application_deadline', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'contact_email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'company_website', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'company');
    await queryInterface.removeColumn('jobs', 'work_model');
    await queryInterface.removeColumn('jobs', 'experience_required');
    await queryInterface.removeColumn('jobs', 'salary_min');
    await queryInterface.removeColumn('jobs', 'salary_max');
    await queryInterface.removeColumn('jobs', 'salary_currency');
    await queryInterface.removeColumn('jobs', 'application_deadline');
    await queryInterface.removeColumn('jobs', 'contact_email');
    await queryInterface.removeColumn('jobs', 'company_website');
    await queryInterface.removeColumn('jobs', 'updated_at');
    
    // Remove the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_jobs_work_model;');
  }
};
