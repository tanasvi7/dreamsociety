const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class JobApplication extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  JobApplication.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    job_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    application_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('applied', 'shortlisted', 'rejected', 'accepted'),
      defaultValue: 'applied'
    }
  }, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: false
  });
  return JobApplication;
}; 