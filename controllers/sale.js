const Sale = require('../models/sale');
const Item = require('../models/item');
const SaleItem = require('../models/sale-item');
const sequelize = require('../util/database');
const { validationResult } = require('express-validator');

const getSalesPageCount = async() =>{
        let totalSaleCount = 0;
        let SalePageCount = 0;
        let totalDebtCount = 0;
        let DebtPageCount = 0;
        let totalOrderCount = 0;
        let OrderPageCount = 0;
        let itemPerPage =12;//limit of 12 rows per page
        //const PAGE = 1;

        //get all sale count where debt = false
        const result = await sequelize.query(
          "SELECT COUNT(id) AS sale_id"+
          " FROM SALES WHERE debt=false AND  order_ind=false"
        )
  
        if(result[0][0].sale_id){
          totalSaleCount = result[0][0].sale_id;
          SalePageCount = Math.ceil(totalSaleCount / itemPerPage);
        }

        //get all sale count where debt = true
        const result2 = await sequelize.query(
          "SELECT COUNT(id) AS sale_id"+
          " FROM SALES WHERE debt=true AND  order_ind=false"
        )
  
        if(result2[0][0].sale_id){
          totalDebtCount = result2[0][0].sale_id;
          DebtPageCount = Math.ceil(totalDebtCount / itemPerPage);
        }

        //get all sale count where debt = true
        const result3 = await sequelize.query(
          "SELECT COUNT(id) AS sale_id"+
          " FROM SALES WHERE order_ind=true"
        )
  
        if(result3[0][0].sale_id){
          totalOrderCount = result3[0][0].sale_id;
          OrderPageCount = Math.ceil(totalOrderCount / itemPerPage);
        }

        return {salePageCount:SalePageCount,debtPageCount:DebtPageCount,orderPageCount:OrderPageCount}
}

exports.getSales = async(req, res, next) => {

    try{
        // let totalSaleCount = 0;
        // let SalePageCount = 0;
        // let totalDebtCount = 0;
        // let DebtPageCount = 0;
        // let itemPerPage =10;//limit of 10 rows per page
        // //const PAGE = 1;

        // //get all sale count where debt = false
        // const result = await sequelize.query(
        //   "SELECT COUNT(id) AS sale_id"+
        //   " FROM SALES WHERE debt=false"
        // )
  
        // if(result[0][0].sale_id){
        //   totalSaleCount = result[0][0].sale_id;
        //   SalePageCount = Math.ceil(totalSaleCount / itemPerPage);
        // }

        // //get all sale count where debt = true
        // const result2 = await sequelize.query(
        //   "SELECT COUNT(id) AS sale_id"+
        //   " FROM SALES WHERE debt=true"
        // )
  
        // if(result2[0][0].sale_id){
        //   totalDebtCount = result2[0][0].sale_id;
        //   DebtPageCount = Math.ceil(totalDebtCount / itemPerPage);
        // }
        const pageCountObj = await getSalesPageCount();

        //get all sales
        let mainSale = [];
        let sales = await sequelize.query(
          "SELECT *"+
          " FROM SALES ORDER BY updatedAt DESC"
        )
        //let sales = await Sale.findAll();
        //console.log(sales[0].id)
        //for(let sale of sales)
        for(let sale of sales[0]){
            //get sale items by using saleId foreign key
            const saleItems = await SaleItem.findAll({where: {saleId: sale.id}})
            const saleItemsArray = [];

            for(let saleitem of saleItems){

                //get item data from itemId
                const itemData = await Item.findByPk(saleitem.itemId);

                saleItemsArray.push({
                    buy_count:saleitem.buy_count,
                    id:itemData.id,
                    name:itemData.name,
                    price:itemData.price,
                    selling_price: itemData.selling_price
              });
            }
            mainSale.push({...sale,items:[...saleItemsArray]});
        }

        //console.log(products); 
        res.status(200).json({
          sales: mainSale,
          sale_page_count:pageCountObj.salePageCount,
          debt_page_count:pageCountObj.debtPageCount,
          order_page_count:pageCountObj.orderPageCount,
          success:true
        });
    }
    catch(err){
        console.log(err);
    }
   
  };

exports.postSale = async(req,res,next) =>{

    const errors = validationResult(req);
    //console.log(errors.array());
      if(!errors.isEmpty()){
        return res.status(422).json({
        error: errors.array(),
        success:false
       });
    }

    const items = req.body.items;
    const total_item_count = req.body.total_item_count;
    const total_selling_price = req.body.total_selling_price;
    const total_price = req.body.total_price;
    const sale_date = req.body.sale_date;
    const debt = req.body.debt;
    const debtors_name = req.body.debtors_name;
    const order = false;

    const itemIds = req.body.items.map(item=>{
        return item.id
    });


    try{
        //create Sale
        const sale = await Sale.create({
            debt:debt,
            debtors_name:debtors_name,
            sale_date:sale_date,
            total_item_count:total_item_count,
            total_price:total_price,
            total_selling_price: total_selling_price,
            order_ind:order
        });
        //get Sale id after insert
        const saleId = sale.dataValues.id;
        //look for items in items table and save it to array
        let getItems = [];
        getItems = await Item.findAll({where: {id: itemIds}})
        //console.log(items[0].id);
        //update count of each item
        getItems.forEach(item=>{

            //get item from request payload 
            const getCurrentItem = items.find(item2=>item2.id===item.id)
            //console.log(getCurrentItem.id);
            Item.findByPk(item.id)
            .then(item2=>{
                //console.log("table: "+item2.count)
                const new_count = (item2.count - getCurrentItem.buy_count);
                //console.log("request new count: "+new_count);
                item2.count = +new_count;
                item2.save();
            })
            .catch(err=>console.log(err));
        });

        items.forEach(item => {
            SaleItem.create({
                buy_count:item.buy_count,
                itemId:item.id,
                saleId:saleId
            })
        });

        const pageCountObj = await getSalesPageCount();

        res.status(200).json({
            id:saleId,
            items:items,
            sale_page_count:pageCountObj.salePageCount,
            debt_page_count:pageCountObj.debtPageCount,
            order_page_count:pageCountObj.orderPageCount,
            success:true
          });

    }
    catch(err){
        console.log(err);
    }

  }

  exports.postOrder = async(req,res,next) =>{

    const errors = validationResult(req);
    //console.log(errors.array());
      if(!errors.isEmpty()){
        return res.status(422).json({
        error: errors.array(),
        success:false
       });
    }

    const items = req.body.items;
    const total_item_count = req.body.total_item_count;
    const total_selling_price = req.body.total_selling_price;
    const total_price = req.body.total_price;
    const sale_date = req.body.sale_date;
    const debt = req.body.debt;
    const debtors_name = req.body.debtors_name;
    const gcash_ref_num = req.body.gcash_ref_num;
    const order = true;

    const itemIds = req.body.items.map(item=>{
        return item.id
    });


    try{
        //create Sale
        const sale = await Sale.create({
            debt:debt,
            debtors_name:debtors_name,
            sale_date:sale_date,
            total_item_count:total_item_count,
            total_price:total_price,
            total_selling_price: total_selling_price,
            order_ind:order,
            gcash_ref_num:gcash_ref_num
        });
        //get Sale id after insert
        const saleId = sale.dataValues.id;
        //look for items in items table and save it to array
        let getItems = [];
        getItems = await Item.findAll({where: {id: itemIds}})
        //console.log(items[0].id);
        //update count of each item
        getItems.forEach(item=>{

            //get item from request payload 
            const getCurrentItem = items.find(item2=>item2.id===item.id)
            //console.log(getCurrentItem.id);
            Item.findByPk(item.id)
            .then(item2=>{
                //console.log("table: "+item2.count)
                const new_count = (item2.count - getCurrentItem.buy_count);
                //console.log("request new count: "+new_count);
                item2.count = +new_count;
                item2.save();
            })
            .catch(err=>console.log(err));
        });

        items.forEach(item => {
            SaleItem.create({
                buy_count:item.buy_count,
                itemId:item.id,
                saleId:saleId
            })
        });

        const pageCountObj = await getSalesPageCount();

        res.status(200).json({
            id:saleId,
            items:items,
            sale_page_count:pageCountObj.salePageCount,
            debt_page_count:pageCountObj.debtPageCount,
            order_page_count:pageCountObj.orderPageCount,
            success:true
          });

    }
    catch(err){
        console.log(err);
    }

  }

  exports.deleteSale = async(req,res,next) =>{

    if(!req.body.id){
      return res.status(422).json({
        error: "Sale ID cannot be empty!",
        success:false
       });
    }
    
    const saleId = req.body.id;
    Sale.findByPk(saleId)
    .then(sale=>{
      return sale.destroy();
    })
    .then(result=>{
      console.log('Destroyed Sale');
      getSalesPageCount().then(pageCountObj=>{
        res.status(200).json({
          sale_page_count:pageCountObj.salePageCount,
          debt_page_count:pageCountObj.debtPageCount,
          order_page_count:pageCountObj.orderPageCount,
          success:true
        });
      });
    })
    .catch(err=>{
      console.log(err);
    });
  }

  exports.putPaidDebt = (req, res, next) => {

    const errors = validationResult(req);
    //console.log(errors.array());
      if(!errors.isEmpty()){
        return res.status(422).json({
        error: errors.array(),
        success:false
       });
    }

    const saleId = req.body.id;
    const updatedDebt = false;
    Sale.findByPk(saleId)
    .then(sale=>{
      sale.debt = updatedDebt;
      return sale.save();//any changes to product can be updated by using save()
    })
    .then(result=>{
      console.log(result);
      getSalesPageCount().then(pageCountObj=>{
        res.status(200).json({
          sale_page_count:pageCountObj.salePageCount,
          debt_page_count:pageCountObj.debtPageCount,
          order_page_count:pageCountObj.orderPageCount,
          success:true
        });
      })
      
    })
    .catch(err=>{
      console.log(err);
      res.status(422).json({
        error:"Cannot update Debt!",
        success:false
      });
    });
    
  };

  exports.getSalesData = async(req,res,next)=>{

    if(!req.query.today_date){
      return res.status(422).json({
        error: "Today's date cannot be empty!",
        success:false
       });
    }

    const todayDate = req.query.today_date;
    
    let resultObj = {
      today_total_profit:0,
      today_total_selling_price:0,
      today_total_price:0,
      overall_total_profit:0,
      overall_total_selling_price:0,
      overall_total_price:0,
      total_profit:0,
      total_selling_price:0,
      total_price:0,
      total_debt_profit:0,
      total_debt_selling_price:0,
      total_debt_price:0
    }
    try{
      //get total profit, selling price and price by today's date ON SALES TABLE
      const result = await sequelize.query(
        "SELECT SUM(total_selling_price) AS t_selling_price"+
        ",SUM(total_price) as t_price"+
        ",SUM((total_selling_price-total_price)) AS t_profit"+
        " FROM SALES WHERE sale_date LIKE '"+todayDate+"'"+
        " AND debt=false"
      )

      if(result[0][0].t_selling_price){
        resultObj.today_total_selling_price = result[0][0].t_selling_price;
      }
      if(result[0][0].t_price){
        resultObj.today_total_price = result[0][0].t_price;
      }
      if(result[0][0].t_profit){
        resultObj.today_total_profit = result[0][0].t_profit;
      }
      
  
      //get total profit, selling price and price ON ITEM TABLE
      const result2 = await sequelize.query(
        "SELECT SUM(selling_price*count) as t_selling_price"+
        ",SUM(price*count) as t_price"+
        ",SUM((selling_price-price)*count) as t_profit"+
        " FROM ITEMS"
      )
      //update resultObj to send as json
      if(result2[0][0].t_selling_price){
        resultObj.total_selling_price = result2[0][0].t_selling_price;
      }
      if(result2[0][0].t_price){
        resultObj.total_price = result2[0][0].t_price;
      }
      if(result2[0][0].t_profit){
        resultObj.total_profit = result2[0][0].t_profit;
      }
     

      //get total profit, selling price and price ON SALES TABLE where debt = true
      const result3 = await sequelize.query(
        "SELECT SUM(total_selling_price) AS t_selling_price"+
        ",SUM(total_price) as t_price"+
        ",SUM((total_selling_price-total_price)) AS t_profit"+
        " FROM SALES WHERE debt=true"
      )
      //update resultObj to send as json

      if(result3[0][0].t_selling_price){
        resultObj.total_debt_selling_price = result3[0][0].t_selling_price;
      }
      if(result3[0][0].t_price){
        resultObj.total_debt_price = result3[0][0].t_price;
      }
      if(result3[0][0].t_profit){
        resultObj.total_debt_profit = result3[0][0].t_profit;
      }

      //get overall total profit, selling price and price ON SALES TABLE
      const result4 = await sequelize.query(
        "SELECT SUM(total_selling_price) AS t_overall_selling_price"+
        ",SUM(total_price) as t_overall_price"+
        ",SUM((total_selling_price-total_price)) AS t_overall_profit"+
        " FROM SALES WHERE"+
        " debt=false"
      )

      if(result4[0][0].t_overall_selling_price){
        resultObj.overall_total_selling_price = result4[0][0].t_overall_selling_price;
      }
      if(result4[0][0].t_overall_price){
        resultObj.overall_total_price = result4[0][0].t_overall_price;
      }
      if(result4[0][0].t_overall_profit){
        resultObj.overall_total_profit = result4[0][0].t_overall_profit;
      }

      //send resultObj as json response
      res.status(200).json({
        data:resultObj,
        success:true
      });
    }
    catch(err){
      console.log(err);
      res.status(500).json({
        success:false
      });
      
    }
    
  }

  