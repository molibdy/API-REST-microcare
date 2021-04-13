
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
    if(request.query.challenge_id!=null){
        params=[request.query.challenge_id]
        sql=`SELECT * FROM discos WHERE challenge_id=?`
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
                if(request.query.challenge_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe disco con id ${request.query.challenge_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay discos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})

//////////////////////////TABLA INGREDIENTES


app.get('/ingredientes',(request,response)=>{
    console.log('holii')
    let respuesta;
    let params;
    let sql;
    if(request.query.ingredient_id!=null){
        params=[request.query.ingredient_id]
        sql=`SELECT * FROM ingredients  WHERE ingredient_id=?`
    }else{
        sql=`SELECT * FROM ingredients`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.ingredient_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe ingrediente de dieta con id ${request.query.ingredient_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay este ingrediente en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})



app.post('/ingredientes',(request,response)=>{
    let respuesta;
    let params=[request.body.ingredient_name];
    let sql=`INSERT INTO ingredients (ingredient_name) VALUES (?)`;
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
            }else  if (err.errno==1366){
                respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, type:0, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: `ingrediente añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El ingrediente no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})


app.put('/ingredientes',(request,response)=>{
    let respuesta;
    if(request.body.ingredient_id!=null){
        let name=request.body.ingredient_name;
        if(request.body.ingredient_name.length==0){ name=null }
        let params=[name,request.body.ingredient_id]

        let sql=`UPDATE ingredientes SET ingredient_name=COALESCE(?,ingredient_name),  WHERE ingredient_id=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                if (err.errno==1452){
                    respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                }else  if (err.errno==1366){
                    respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
                }else{
                    respuesta={error:true, type:0, message: err};
                }
            }
            else{
                if(res.affectedRows>0){
                    if(res.changedRows>0){
                        respuesta={error:false, type:1, message: `ingrediente con id ${request.body.ingredient_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `ingrediente con id ${request.body.ingredient_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del ingrediente no especificado`};
        response.send(respuesta);
    }
})


app.delete('/ingredientes',(request,response)=>{
    let respuesta;
    if(request.body.ingredient_id!=null){
        let params=[request.body.ingredient_id];
        let sql=`DELETE FROM ingredients WHERE ingredient_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `ingrediente con id ${request.body.ingredient_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `ingrediente con id ${request.body.ingredient_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de ingrediente no especificado`};
        response.send(respuesta);
    }
})



///////// TABLA INTAKES

app.get('/intakes',(request,response)=>{
    console.log('holii')
    let respuesta;
    let params;
    let sql;
    if(request.query.intake_id!=null){
        params=[request.query.intake_id]
        sql=`SELECT * FROM intakes  WHERE intake_id=?`
    }else{
        sql=`SELECT * FROM intakes`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.challenge_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe un intake con id ${request.query.challenge_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay intakes en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})



app.post('/intakes',(request,response)=>{
    let respuesta;
    let params=[request.body.user_id, request.body.date];
    let sql=`INSERT INTO intakes (user_id, date) VALUES (?,?)`;
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
            }else  if (err.errno==1366){
                respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, type:0, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: `Intake añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El intake no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



app.put('/intakes',(request,response)=>{
    let respuesta;
    if(request.body.intake_id!=null){
        let user_id=request.body.user_id;
        if(request.body.user_id.length==0){ user_id=null }
        if(request.body.date.length==0){ date=null }
        let params=[intake_id,request.body.date,request.body.user_id]

        let sql=`UPDATE intakes SET user_id=COALESCE(?,user_id), date=COALESCE(?,date), WHERE intake_id=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                if (err.errno==1452){
                    respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                }else  if (err.errno==1366){
                    respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
                }else{
                    respuesta={error:true, type:0, message: err};
                }
            }
            else{
                if(res.affectedRows>0){
                    if(res.changedRows>0){
                        respuesta={error:false, type:1, message: `intake con id ${request.body.intake_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `intake con id ${request.body.intake_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del intake no especificado`};
        response.send(respuesta);
    }
})


app.delete('/intakes',(request,response)=>{
    let respuesta;
    if(request.body.intake_id!=null){
        let params=[request.body.intake_id];
        let sql=`DELETE FROM intakes WHERE intake_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `intake con id ${request.body.intake_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `intake con id ${request.body.intake_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de intake no especificado`};
        response.send(respuesta);
    }
})


////// TABLA CHALLENGE


app.get('/challenge',(request,response)=>{
    console.log('holii')
    let respuesta;
    let params;
    let sql;
    if(request.query.challenge_id!=null){
        params=[request.query.challenge_id]
        sql=`SELECT * FROM challenge  WHERE challenge_id=?`
    }else{
        sql=`SELECT * FROM challenge`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.challenge_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe un challenge con id ${request.query.challenge_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay challenge en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})



app.post('/challenge',(request,response)=>{
    let respuesta;
    let params=[request.body.name, request.body.ingredient_id, request.body.grams];
    let sql=`INSERT INTO challenge (name,ingredient_id, grmas) VALUES (?,?,?)`;
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
            }else  if (err.errno==1366){
                respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, type:0, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: `challenge añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El challenge no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



app.put('/challenge',(request,response)=>{
    let respuesta;
    if(request.body.challenge_id!=null){
        let name=request.body.name;
        if(request.body.name.length==0){ name=null }
        let params=[name,request.body.ingredient_id,request.body.grams]

        let sql=`UPDATE challenge SET name=COALESCE(?,name), ingredient_id=COALESCE(?,ingredient_id), grams=COALESCE(?,grams), WHERE challenge_id=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                if (err.errno==1452){
                    respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                }else  if (err.errno==1366){
                    respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
                }else{
                    respuesta={error:true, type:0, message: err};
                }
            }
            else{
                if(res.affectedRows>0){
                    if(res.changedRows>0){
                        respuesta={error:false, type:1, message: `challenge con id ${request.body.challenge_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `challenge con id ${request.body.challenge_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del challenge no especificado`};
        response.send(respuesta);
    }
})


app.delete('/challenge',(request,response)=>{
    let respuesta;
    if(request.body.challenge_id!=null){
        let params=[request.body.challenge_id];
        let sql=`DELETE FROM challenge WHERE challenge_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `challenge con id ${request.body.challenge_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `challenge con id ${request.body.challenge_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de challenge no especificado`};
        response.send(respuesta);
    }
})



