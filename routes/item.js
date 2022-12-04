const express = require('express');

const itemController = require('../controllers/item');

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');//jwt auth

const router = express.Router();

const validationArray =   [
    body('name')
    .trim().isLength({min:1})
    .withMessage('Name cannot be empty!'),
    body('count')
    .isInt()
    .withMessage('Stock must be a number!')
    .custom((value,{ req })=>{
        if(value<1){
            throw new Error('Stock cannot be negative!')
        }
        return true;
    })
    ,
    body('selling_price')
    .isFloat()
    .withMessage('Selling price must be a number!')
    .custom((value,{ req })=>{
        if(value<1){
            throw new Error('Selling price cannot be negative!')
        }
        return true;
    })
    ,
    body('price')
    .isFloat()
    .withMessage('Price must be a number!')
    .custom((value,{ req })=>{
        if(value<1){
            throw new Error('Price cannot be negative!')
        }
        return true;
    })
    ,
    body('date_added')
    .trim().isLength({min:9})
    .withMessage('Date added must be in MM/DD//YYYY format!')
    ]

// GET /items
router.get('/',isAuth,itemController.getItems);

// POST /items
router.post('/', isAuth,validationArray,itemController.postAddItem);

// PUT /items
router.put('/', isAuth,validationArray,itemController.postEditItem);

// DELETE /items
router.delete('/', isAuth,itemController.postDeleteItem);

module.exports = router;