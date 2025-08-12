const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  Payment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10,2),
    payment_method: DataTypes.STRING(50),
    payment_status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      defaultValue: 'pending'
    },
    transaction_id: DataTypes.STRING(100),
    transaction_number: DataTypes.STRING(100),
    transaction_type: {
      type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet'),
      defaultValue: 'upi'
    },
    admin_notes: DataTypes.TEXT,
    rejection_reason: DataTypes.STRING(200),
    payment_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: false
  });
  return Payment;
}; 