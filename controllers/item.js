const Item = require('../models/item');
const { validationResult } = require('express-validator');
const sequelize = require('../util/database');

const getItemsPageCount = async(itemPerPage)=>{
  let totalItemCount = 0;
  let totalPageCount = 0;
  //get all item count
  const result = await sequelize.query(
    "SELECT COUNT(id) AS item_id"+
    " FROM ITEMS"
  )

  if(result[0][0].item_id){
    totalItemCount = result[0][0].item_id;
    totalPageCount = Math.ceil(totalItemCount / itemPerPage);
  }

  return totalPageCount;
}

exports.getItems = async(req, res, next) => {
    let itemPerPage =12;//limit of 12 rows per page
    //const PAGE = req.query.page;
 
    try{
        const totalPageCount = await getItemsPageCount(itemPerPage);
        const PAGE = req.query.page;
        const limitStart = (parseInt(PAGE)-1)*itemPerPage;
        //get all item on requested page
        const result2 = await sequelize.query(
          "SELECT *"+
          " FROM ITEMS"+
          " ORDER BY name ASC LIMIT "+limitStart+","+itemPerPage
        )
        //get all Items
        const items = await sequelize.query(
          "SELECT *"+
          " FROM ITEMS"+
          " ORDER BY name ASC"
        )

        //console.log(products); 
        res.status(200).json({
          items:items[0],
          pageItems: result2[0],
          pages:totalPageCount,
          currentPage:parseInt(PAGE),
          success:true
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
          error:err,
          success:false
        });
    }
   
  };

  exports.postAddItem = async(req, res, next) => {

    const errors = validationResult(req);
    //console.log(errors.array());
    if(!errors.isEmpty()){
      return res.status(422).json({
          error: errors.array()[0],
          success:false
    });
    }

    const name = req.body.name;
    const type = req.body.type;
    const count = req.body.count;
    const selling_price = req.body.selling_price;
    const price = req.body.price;
    const date_added = req.body.date_added;
    try{
       const result =  await Item.create({
            name: name, 
            type:type,
            count: count, 
            selling_price: selling_price, 
            price: price,
            date_added:date_added
        });

        //console.log(result.dataValues);
        const pageCount = await getItemsPageCount(12);
        res.status(200).json({
            name: name,
            item_page_count:pageCount,
            id:result.dataValues.id,
            success:true
        });
    }
    catch(err){
        console.log(err);
    }
  
  };

  exports.postEditItem = (req, res, next) => {

    const errors = validationResult(req);
    if(!req.body.id){
      return res.status(422).json({
        error: "Item ID cannot be empty!",
        success:false
       });
    }
    //console.log(errors.array());
    if(!errors.isEmpty()){
      return res.status(422).json({
          error: errors.array()[0],
          success:false
    });
    }

    const itemId = req.body.id;
    const updatedName = req.body.name;
    const updatedType = req.body.type;
    const updatedCount = req.body.count;
    const updatedSelling_price = req.body.selling_price;
    const updatedPrice = req.body.price;
    Item.findByPk(itemId)
    .then(item=>{
      item.name = updatedName;
      item.type = updatedType;
      item.count = updatedCount;
      item.selling_price = updatedSelling_price;
      item.price = updatedPrice;

      return item.save();//any changes to product can be updated by using save()
    })
    .then(result=>{
      console.log(result);
      res.status(200).json({
        success:true
      });
    })
    .catch(err=>{
      console.log(err);
    });
    
  };

  exports.postDeleteItem = (req, res, next) => {

    if(!req.body.id){
      return res.status(422).json({
        error: "Item ID cannot be empty!",
        success:false
       });
    }

    const itemId = req.body.id;
    Item.findByPk(itemId)
      .then(item=>{
        return item.destroy();
      })
      .then(result=>{
        console.log('Destroyed Item');
          getItemsPageCount(12).then(pageCount=>{
            console.log('testxxxxxxxxxx'+pageCount);
            res.status(200).json({
              item_page_count:pageCount,
              success:true
            });
          });
          
      })
      .catch(err=>{
        console.log(err);
      });
    
  };
  