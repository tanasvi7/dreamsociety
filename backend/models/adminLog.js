const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AdminLog extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  AdminLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action: DataTypes.STRING(255),
    target_table: DataTypes.STRING(100),
    target_id: DataTypes.INTEGER,
    log_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'AdminLog',
    tableName: 'admin_logs',
    timestamps: false
  });
  return AdminLog;
}; 