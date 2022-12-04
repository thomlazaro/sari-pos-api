const fs = require('fs');
const fsPromises = require('fs').promises;
const { v4:uuid } = require('uuid');
const path = require('path');
const { format } = require('date-fns');


const eventLogger = async (requestMethod, apiEndpoint,requestBody) =>{
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
    const logItem = `\n${dateTime}\t${uuid()}\t${requestMethod}\t${apiEndpoint}\t${requestBody}`;

    try{
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){
            await fsPromises.mkdir(path.join(__dirname,'..','logs'));
        }
        await fsPromises.appendFile(path.join(__dirname,'..','logs','event-logs.txt'),logItem);
    }
    catch(err){
        console.log(err);
    }
}

const logEvent = (req,res,next) =>{

    eventLogger(req.method,req.url,req.body);
    console.log("Request Event: "+req.method+" "+req.url+" "+req.body);
    next();
    
}

module.exports = { logEvent, eventLogger };