const config=require('./config').config
const dbconfig=config.dbconfig
const mysql=require ('mysql');

const connection=mysql.createConnection(dbconfig)

exports.db={
    connection:connection
}