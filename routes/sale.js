const express = require('express');

const saleController = require('../controllers/sale');

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');//jwt auth

const router = express.Router();

const validationArray = [
    body('items').isLength({min:1})
    .withMessage('Cannot create sale without items on cart!'),
    body('sale_date').isLength({min:8})
    .withMessage('Sale date must be in MM/DD/YYYY format!'),
    body('total_item_count')
    .isInt()
    .withMessage('Total Items must be a number!')
    .custom((value,{req})=>{
        if(value<1){
            throw new Error('Total Items cannot be negative')
        }
        return true;
    }),
    body('total_price')
    .isFloat()
    .withMessage('Total Base price must be a number!')
    .custom((value,{req})=>{
        if(value<1){
            throw new Error('Total Base price cannot be negative')
        }
        return true;
    }),
    body('total_selling_price')
    .isFloat()
    .withMessage('Total Selling amount must be a number!')
    .custom((value,{req})=>{
        if(value<1){
            throw new Error('Total Selling amount cannot be negative')
        }
        return true;
    })
];

// GET /sales
router.get('/', isAuth,saleController.getSales);

// POST /sales
router.post('/',isAuth,validationArray,saleController.postSale);

// POST /sales/order
router.post('/order',validationArray,saleController.postOrder);

// DELETE /sales
router.delete('/',isAuth, saleController.deleteSale);

// PUT /sales
router.put('/',isAuth,
body('id')
.isInt()
.withMessage('Sale ID cannot be empty!')
,saleController.putPaidDebt);

// GET /sales/data
router.get('/data', isAuth,saleController.getSalesData);

module.exports = router;