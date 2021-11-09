const dotenv = require('dotenv')

dotenv.config({ path: '/env/' })

exports.config={
    port: process.env.PORT || 300,
    dbconfig :{
        host: process.env.HOST ,
        database: process.env.NAME ,
        user: process.env.USER ,
        password: process.env.PWD 
    }
}