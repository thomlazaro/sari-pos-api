const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.getAuth = async(req, res, next) => {
    const userName = req.body.username;
    const password = req.body.password;
    try{
        //find User in DB
        const user = await User.findAll({where: {username: userName,password:password}})

        //console.log(products); 
        if(user.length!==0){
            //create token
            const token = jwt.sign({
                username: user[0].username,
                id:user[0].id
            },'youwillneverknow',{ expiresIn:'7d'}
            );

            //send response
            res.status(200).json({
                token:token,
                id:user[0].id,
              success:true
            });
        }
        else{
            res.status(200).json({
              success:false,
              message:"Invalid username and password combination!"
            });
        }
       
    }
    catch(err){
        console.log(err);
    }
   
  };
