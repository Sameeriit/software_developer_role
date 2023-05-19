const mysql = require('mysql');

const connecting = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"cointab1",
    port:"3306"
 
});
connecting.connect((err)=>{
    if(err)throw err
    console.log("connection created...!")

})
module.exports.connecting = connecting;