
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

///// RECETAS
app.get('/recetas',(request,response)=>{
    console.log('holi')
    let respuesta;
    let params;
    let sql;
    if(request.query.recipe_id!=null){
        params=[request.query.recipe_id]
        sql=`SELECT * FROM recipes WHERE recipe_id=?`
    }else{
        sql=`SELECT * FROM recipes`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.recipe_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe receta con id ${request.query.recipe_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay recetas en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})

app.post('/recetas', (request,response) =>{

    let respuesta;

    let params=[request.body.recipe_name,request.body.instructions,request.body.photo_url, request.body.serves];
    let sql='INSERT INTO recipes (recipe_name,instructions,photo_url,serves) VALUES (?,?,?,?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, message:'faltan campos por rellenar'}
            } else  if (err.errno==1452){
                respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
            }else  if (err.errno==1366){
                respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, message: `Receta añadida correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, code:200, message: `Receta no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



    app.put('/recetas',(request,response)=>{
        let respuesta;
        if(request.body.recipe_id!=null){
            let name=request.body.recipe_name;
            if(request.body.recipe_name.length==0){ name=null }
            let params=[name,request.body.recipe_id]
            let sql="UPDATE recipes SET recipe_name=COALESCE(?,recipe_name),  WHERE recipe_id=?"
            connection.query(sql,params,(err,res)=>{
                if (err){
                    if (err.errno==1452){
                        respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                    }else  if (err.errno==1366){
                        respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
                    }else{
                        respuesta={error:true, type:0, message: err};
                    }
                }
                else{
                    if(res.affectedRows>0){
                        if(res.changedRows>0){
                            respuesta={error:false, type:1, message: `receta con id ${request.body.recipe_id} modificado correctamente`};
                        }
                        else{
                            respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                        }
                    }
                    else{
                        respuesta={error:true, type:-3, message: `receta con id ${request.body.recipe_id} no encontrado`};
                    }
                }
                response.send(respuesta)
            })
        }else{
            respuesta={error:true, type:-4, message: `id del receta no especificado`};
            response.send(respuesta);
        }
    })
    
    app.delete('/recetas',(request,response)=>{
        let respuesta;
        if(request.body.recipe_id!=null){
            let params=[request.body.recipe_id];
            let sql=`DELETE FROM recipes WHERE recipe_id=?`;
            connection.query(sql,params,(err,res)=>{
                if (err){
                    respuesta={error:true, type:0, message:err};
                }
                else{
                    if(res.affectedRows>0){
                        respuesta={error:false, type:1, message:` receta con id ${request.body.recipe_id} eliminado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:-1, message:` receta con id ${request.body.recipe_id} no encontrado`};
                    }
                }
                response.send(respuesta);
            })
        }else{
            respuesta={error:true, type:-2, message:` id de receta no especificado`};
            response.send(respuesta);
        }
    })

/// DIETAS

app.get('/dietas',(request,response)=>{
    console.log('dietas')
    let respuesta;
    let params;
    let sql;
    if(request.query.diets_id!=null){
        params=[request.query.recipe_id]
        sql=`SELECT * FROM diets WHERE recipe_id=?`
    }else{
        sql=`SELECT * FROM diets`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.recipe_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe dieta con id ${request.query.recipe_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay recetas en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})

app.post('/dietas', (request,response) =>{

    let respuesta;

    let params=[request.body.diet.name];
    let sql='INSERT INTO diets (diet.name) VALUES (?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, message:'faltan campos por rellenar'}
            } else  if (err.errno==1452){
                respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
            }else  if (err.errno==1366){
                respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, message: `dieta añadida correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, code:200, message: `dieta no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



    app.put('/dietas',(request,response)=>{
        let respuesta;
        if(request.body.diet_id!=null){
            let name=request.body.diet.name;
            if(request.body.diet.name.length==0){ name=null }
            let params=[name,request.body.diet_id]
            let sql="UPDATE diets SET diet.name=COALESCE(?,diet.name),  WHERE diet_id=?"
            connection.query(sql,params,(err,res)=>{
                if (err){
                    if (err.errno==1452){
                        respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                    }else  if (err.errno==1366){
                        respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
                    }else{
                        respuesta={error:true, type:0, message: err};
                    }
                }
                else{
                    if(res.affectedRows>0){
                        if(res.changedRows>0){
                            respuesta={error:false, type:1, message: `dieta con id ${request.body.diet_id} modificado correctamente`};
                        }
                        else{
                            respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                        }
                    }
                    else{
                        respuesta={error:true, type:-3, message: `dieta con id ${request.body.diet_id} no encontrado`};
                    }
                }
                response.send(respuesta)
            })
        }else{
            respuesta={error:true, type:-4, message: `id del dieta no especificado`};
            response.send(respuesta);
        }
    })
    
    app.delete('/dietas',(request,response)=>{
        let respuesta;
        if(request.body.diet_id!=null){
            let params=[request.body.diet_id];
            let sql=`DELETE FROM diets WHERE diet_id=?`;
            connection.query(sql,params,(err,res)=>{
                if (err){
                    respuesta={error:true, type:0, message:err};
                }
                else{
                    if(res.affectedRows>0){
                        respuesta={error:false, type:1, message:` dieta con id ${request.body.diet_id} eliminado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:-1, message:` dieta con id ${request.body.diet_id} no encontrado`};
                    }
                }
                response.send(respuesta);
            })
        }else{
            respuesta={error:true, type:-2, message:` id de dieta no especificado`};
            response.send(respuesta);
        }
    })

/// GRUPOS

app.get('/grupos',(request,response)=>{
    console.log('grupos')
    let respuesta;
    let params;
    let sql;
    if(request.query.group_id!=null){
        params=[request.query.group_id]
        sql=`SELECT * FROM grupos WHERE group_id=?`
    }else{
        sql=`SELECT * FROM groups`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.group_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe grupo con id ${request.query.group_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay grupos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})

app.post('/grupos', (request,response) =>{

    let respuesta;

    let params=[request.body.name,request.body.color,request.body.description];
    let sql='INSERT INTO groups (name, color, description) VALUES (?,?,?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, message:'faltan campos por rellenar'}
            } else  if (err.errno==1452){
                respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
            }else  if (err.errno==1366){
                respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, message: `grupo añadida correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, code:200, message: `grupo no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



    app.put('/grupos',(request,response)=>{
        let respuesta;
        if(request.body.group_id!=null){
            let name=request.body.name;
            if(request.body.name.length==0){ name=null }
            let params=[request.body.name,request.body.color,request.body.description,request.body.group_id]
            let sql="UPDATE groups SET name=COALESCE(?,name), color=COALESCE(?,color), description=COALESCE(?,description),  WHERE group_id=?"
            connection.query(sql,params,(err,res)=>{
                if (err){
                    if (err.errno==1452){
                        respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                    }else  if (err.errno==1366){
                        respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
                    }else{
                        respuesta={error:true, type:0, message: err};
                    }
                }
                else{
                    if(res.affectedRows>0){
                        if(res.changedRows>0){
                            respuesta={error:false, type:1, message: `grupo con id ${request.body.group_id} modificado correctamente`};
                        }
                        else{
                            respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                        }
                    }
                    else{
                        respuesta={error:true, type:-3, message: `grupo con id ${request.body.group_id} no encontrado`};
                    }
                }
                response.send(respuesta)
            })
        }else{
            respuesta={error:true, type:-4, message: `id del grupo no especificado`};
            response.send(respuesta);
        }
    })
    
    app.delete('/grupos',(request,response)=>{
        let respuesta;
        if(request.body.group_id!=null){
            let params=[request.body.group_id];
            let sql=`DELETE FROM groups WHERE group_id=?`;
            connection.query(sql,params,(err,res)=>{
                if (err){
                    respuesta={error:true, type:0, message:err};
                }
                else{
                    if(res.affectedRows>0){
                        respuesta={error:false, type:1, message:` grupo con id ${request.body.group_id} eliminado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:-1, message:` grupo con id ${request.body.group_id} no encontrado`};
                    }
                }
                response.send(respuesta);
            })
        }else{
            respuesta={error:true, type:-2, message:` id de grupo no especificado`};
            response.send(respuesta);
        }
    })

/// MICRONUTRIENTES

app.get('/micronutrientes',(request,response)=>{
    console.log('micronutrientes')
    let respuesta;
    let params;
    let sql;
    if(request.query.micronutrient_id!=null){
        params=[request.query.micronutrient_id]
        sql=`SELECT * FROM micronutrients WHERE ,micronutrient_id=?`
    }else{
        sql=`SELECT * FROM micronutrients`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.group_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe micronutriente con id ${request.query.micronutrient_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay micronutrientes en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})

app.post('/micronutrientes', (request,response) =>{

    let respuesta;

    let params=[request.body.micronutrient_name,request.body.group_id,request.body.acronym];
    let sql='INSERT INTO micronutrients (micronutrient_name, group_id, acronym) VALUES (?,?,?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            if (err.errno==1048){
                respuesta={error:true, message:'faltan campos por rellenar'}
            } else  if (err.errno==1452){
                respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
            }else  if (err.errno==1366){
                respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
            }else{
                respuesta={error:true, message: err};
            }
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, message: `micronutriente añadida correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, code:200, message: `micronutriente no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})



    app.put('/micronutrientes',(request,response)=>{
        let respuesta;
        if(request.body.micronutrient_id!=null){
            let micronutrient_name=request.body.micronutrient_name;
            if(request.body.micronutrient_name.length==0){ micronutrient_name=null }
            let params=[request.body.micronutrient_name,request.body.micronutrient_id,request.body.acronym,request.body.micronutrient_id]
            let sql="UPDATE micronutrients SET micronutrient_name=COALESCE(?,micronutrient_name), micronutrient_id=COALESCE(?,micronutrient_id), acronym=COALESCE(?,acronym),  WHERE micronutrient_id=?"
            connection.query(sql,params,(err,res)=>{
                if (err){
                    if (err.errno==1452){
                        respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
                    }else  if (err.errno==1366){
                        respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
                    }else{
                        respuesta={error:true, type:0, message: err};
                    }
                }
                else{
                    if(res.affectedRows>0){
                        if(res.changedRows>0){
                            respuesta={error:false, type:1, message: `micronutriente con id ${request.body.micronutrient_id} modificado correctamente`};
                        }
                        else{
                            respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                        }
                    }
                    else{
                        respuesta={error:true, type:-3, message: `micronutriente con id ${request.body.micronutrient_id} no encontrado`};
                    }
                }
                response.send(respuesta)
            })
        }else{
            respuesta={error:true, type:-4, message: `id del micronutriente no especificado`};
            response.send(respuesta);
        }
    })
    
    app.delete('/micronutrientes',(request,response)=>{
        let respuesta;
        if(request.body.micronutrient_id!=null){
            let params=[request.body.micronutrient_id];
            let sql=`DELETE FROM micronutrients WHERE micronutrient_id=?`;
            connection.query(sql,params,(err,res)=>{
                if (err){
                    respuesta={error:true, type:0, message:err};
                }
                else{
                    if(res.affectedRows>0){
                        respuesta={error:false, type:1, message:` micronutriente con id ${request.body.micronutrient_id} eliminado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:-1, message:` micronutriente con id ${request.body.micronutrient_id} no encontrado`};
                    }
                }
                response.send(respuesta);
            })
        }else{
            respuesta={error:true, type:-2, message:` id de micronutriente no especificado`};
            response.send(respuesta);
        }
    })