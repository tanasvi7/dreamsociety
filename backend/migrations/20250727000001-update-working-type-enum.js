'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'working_type')
      .then(function () {
        return queryInterface.addColumn('users', 'working_type', {
          type: Sequelize.ENUM('govt employee', 'private employee', 'unemployed', 'businessman', 'student'),
          allowNull: true,
          defaultValue: null
        });
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'working_type')
      .then(function () {
        return queryInterface.addColumn('users', 'working_type', {
          type: Sequelize.ENUM('employee', 'businessman', 'unemployed', 'student'),
          allowNull: true,
          defaultValue: null
        });
      });
  }
};
