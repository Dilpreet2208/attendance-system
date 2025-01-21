const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  loginTime: { type: DataTypes.TIME, allowNull: false },
  signOffTime: { type: DataTypes.TIME },
});



module.exports = Attendance;
