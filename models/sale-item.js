const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const SaleItem = sequelize.define('saleItem',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    buy_count:Sequelize.INTEGER
});

module.exports = SaleItem;