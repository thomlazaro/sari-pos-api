const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Item = sequelize.define('items', {
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  type: {
    type: Sequelize.STRING,
    allowNull:false
  },
  count:{
    type: Sequelize.INTEGER,
    allowNull: false
  },
  date_added: {
    type: Sequelize.STRING,
    allowNull:false
  },
  name:{
    type: Sequelize.STRING,
    allowNull: false
  },
  price:{
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  selling_price:{
    type: Sequelize.DOUBLE,
    allowNull: false
  }

});


module.exports = Item;