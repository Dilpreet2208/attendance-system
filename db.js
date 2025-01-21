const { Sequelize, DataTypes } = require('sequelize');
// Initialize SQLite database 
const sequelize = new Sequelize({ 
    dialect: 'sqlite', 
    storage: './attendance-system.sqlite', // File where the database will be stored 
});

module.exports = sequelize;