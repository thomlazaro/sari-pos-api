//npm modules
const express = require('express');
const bodyParser = require('body-parser');
//routes
const itemRoutes = require('./routes/item');
const saleRoutes = require('./routes/sale');
const userRoutes = require('./routes/user');
//models
const Item = require('./models/item');
const Sale = require('./models/sale');
const SaleItem = require('./models/sale-item');
//database
const sequelize = require('./util/database');
//express
const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
//setup api endpoint routes
app.use('/items',itemRoutes);
app.use('/sales',saleRoutes);
app.use('/users',userRoutes);
//setup table relationships for sequelize
//many to many
Item.belongsToMany(Sale, { through: SaleItem });
Sale.belongsToMany(Item, { through: SaleItem, onDelete:'CASCADE' });

//look at all models and create table if they do not exist in database
sequelize
    .sync()//{force:true} is use to force sync on database. it will alter table structure of db base on the model definition but will remove exisiting records
    .then(result=>{
        app.listen(8080);
    })
    .catch(err=>{
        console.log(err);
    });