const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Job extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  Job.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    posted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: DataTypes.STRING(255),
    description: DataTypes.TEXT,
    skills_required: DataTypes.TEXT,
    job_type: DataTypes.ENUM('full-time', 'part-time', 'contract'),
    salary_range: DataTypes.STRING(50),
    location: DataTypes.STRING(255),
    map_lat: DataTypes.DOUBLE,
    map_lng: DataTypes.DOUBLE,
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: false
  });
  return Job;
}; 