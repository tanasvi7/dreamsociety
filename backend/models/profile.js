const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Profile extends Model {
    static associate(models) {
      // associations will be defined in index.js
    }
  }
  Profile.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true
    },
    photo_url: DataTypes.STRING(1000),
    dob: DataTypes.DATE,
    gender: DataTypes.ENUM('male', 'female', 'other'),
    village: DataTypes.STRING(100),
    mandal: DataTypes.STRING(100),
    district: DataTypes.STRING(100),
    pincode: DataTypes.STRING(10),
    caste: DataTypes.STRING(100),
    subcaste: DataTypes.STRING(100),
    marital_status: DataTypes.STRING(50),
    native_place: DataTypes.STRING(100)
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: false
  });
  return Profile;
}; 