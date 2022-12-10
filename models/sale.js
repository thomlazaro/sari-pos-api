const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Sale = sequelize.define('sale',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    debt:{
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    debtors_name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    sale_date:{
        type: Sequelize.STRING,
        allowNull: false
    },
    total_item_count:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    total_price:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    total_selling_price:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    order_ind:{
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    gcash_ref_num:{
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Sale;