const Sequelize = require('sequelize');

const sequelize = new Sequelize('sari-pos-db','root','9nub5M81godR',{
    dialect:'mysql',
    host:'localhost'
});


module.exports = sequelize;