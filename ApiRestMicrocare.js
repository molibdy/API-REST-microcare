
let port= process.env.PORT || 300;
let express=require ('express');
let app= new express()
app.use(express.urlencoded({extended:false}));
app.use(express.json())
let mysql=require ('mysql');
let cors=require('cors');
app.use(cors())
app.listen(port)

let connection=mysql.createConnection({
    host: "microcare.c7akwgf5vfhs.eu-west-1.rds.amazonaws.com",
    database: "microcareDB",
    user: "admin",
    password: "Molibden0"
})




// ejemplo de GET xq nunca me acuerdo de cómo se hacen las APIs:  //


app.get('/discos',(request,response)=>{
    console.log('holii')
    let respuesta;
    let params;
    let sql;
    if(request.query.disco_id!=null){
        params=[request.query.disco_id]
        sql=`SELECT * FROM discos WHERE disco_id=?`
    }else{
        sql=`SELECT * FROM discos`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.disco_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe disco con id ${request.query.disco_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay discos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})
