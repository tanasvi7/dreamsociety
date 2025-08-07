const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BulkUploadLog extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  BulkUploadLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    filename: DataTypes.STRING(255),
    total_records: DataTypes.INTEGER,
    success_count: DataTypes.INTEGER,
    failure_count: DataTypes.INTEGER,
    upload_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BulkUploadLog',
    tableName: 'bulk_upload_logs',
    timestamps: false
  });
  return BulkUploadLog;
}; 