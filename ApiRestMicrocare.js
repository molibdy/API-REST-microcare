
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




// alergeno  //


app.get('/alergeno',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.allergen_id!=null){
        params=[request.query.allergen_id]
        sql=`SELECT * FROM allergens 
            WHERE allergen_id=?`
    }else{
        sql=`SELECT * FROM allergens`
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
                    respuesta={error:true, code:200, type:-1, message: `No existe alergeno con id ${request.query.allergen_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay alergenos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})



app.get('/alergeno/ingredientes',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.allergen_id!=null){
        params=[request.query.allergen_id]
        sql=`SELECT allergens.allergen_name, ingredients.ingredient_name FROM allergens 
            JOIN allergen_ingredient ON allergen_ingredient.allergen_id=allergen.allergen_id
            JOIN ingredients ON ingredient.ingredient_id=allergen_ingredient-ingredient_id
            WHERE allergens.allergen_id=?`
    }else{
        sql=`SELECT * FROM allergens`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.allergen_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe alergeno con id ${request.query.allergen_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay alergenos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})



app.post('/alergeno',(request,response)=>{
    let respuesta;
    let params=[request.body.allergen_name];
    let sql=`INSERT INTO allergens (allergen_name) VALUES (?)`;
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
                respuesta={error:false, type:1, message: `alergeno añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El alergeno no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})


app.post('/alergeno/ingredientes',(request,response)=>{
    let respuesta;
    let params=[request.body.allergen_id, request.body.ingredient_id];
    let sql=`INSERT INTO allergen_ingredient (allergen_id,ingredient_id) VALUES (?,?)`;
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





app.put('/alergeno',(request,response)=>{
    let respuesta;
    if(request.body.allergen_id!=null){
        let name=request.body.name;
        if(request.body.name.length==0){ name=null }
        let params=[name,request.body.allergen_id]

        let sql=`UPDATE allergens SET name=COALESCE(?,name)  WHERE allergen_id=?`
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
                        respuesta={error:false, type:1, message: `alergeno con id ${request.body.allergen_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `alergeno con id ${request.body.allergen_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del alergeno no especificado`};
        response.send(respuesta);
    }
})




app.delete('/alergeno',(request,response)=>{
    let respuesta;
    if(request.body.allergen_id!=null){
        let params=[request.body.allergen_id];
        let sql=`DELETE FROM allergens WHERE allergen_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `allergen con id ${request.body.allergen_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `allergen con id ${request.body.allergen_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de allergen no especificado`};
        response.send(respuesta);
    }
})





///////  users  //////



app.get('/usuario',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.user_id!=null){
        params=[request.query.user_id]
        sql=`SELECT * FROM users 
            WHERE user_id=?`
    }else{
        sql=`SELECT * FROM users`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.user_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe usuario con id ${request.query.user_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay usuarios en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})




app.post('/usuarios',(request,response)=>{
    let respuesta;
    let params=[request.body.username,request.body.password,request.body.email];
    let sql=`INSERT INTO users (username, password, email) VALUES (?,??)`;
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
                respuesta={error:false, type:1, message: `Disco añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El disco no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})




app.put('/usuario',(request,response)=>{
    let respuesta;
    if(request.body.user_id!=null){
        let username=request.body.username;
        let password=request.body.password;
        let email=request.body.email;
        if(request.body.username.length==0){ username=null }
        if(request.body.password.length==0){ password=null }
        if(request.body.email.length==0){ email=null }
        let params=[username,password,email,request.body.user_id]

        let sql=`UPDATE users SET username=COALESCE(?,username), password=COALESCE(?,password), email=COALESCE(?,email) WHERE user_id=?`
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
                        respuesta={error:false, type:1, message: `usuario con id ${request.body.user_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `usuario con id ${request.body.user_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del usuario no especificado`};
        response.send(respuesta);
    }
})




app.delete('/usuario',(request,response)=>{
    let respuesta;
    if(request.body.user_id!=null){
        let params=[request.body.user_id];
        let sql=`DELETE FROM users WHERE user_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `user con id ${request.body.user_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `user con id ${request.body.user_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de user no especificado`};
        response.send(respuesta);
    }
})



//  favoritos  //

app.get('/favorito',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.favourite_id!=null){
        params=[request.query.favourite_id]
        sql=`SELECT * FROM favourites 
            WHERE favourite_id=?`
    }else{
        sql=`SELECT * FROM favourites`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                if(request.query.favourite_id!=null){
                    respuesta={error:true, code:200, type:-1, message: `No existe favorito con id ${request.query.favourite_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay favoritos en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})




app.post('/favoritos',(request,response)=>{
    let respuesta;
    let params=[request.body.name,request.body.password,request.body.email];
    let sql=`INSERT INTO favourites (name, password, email) VALUES (?,??)`;
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
                respuesta={error:false, type:1, message: `Disco añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El disco no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})




app.put('/favorito',(request,response)=>{
    let respuesta;
    if(request.body.favourite_id!=null){
        let name=request.body.name;
        let password=request.body.password;
        let email=request.body.email;
        if(request.body.name.length==0){ name=null }
        if(request.body.password.length==0){ password=null }
        if(request.body.email.length==0){ email=null }
        let params=[name,password,email,request.body.favourite_id]

        let sql=`UPDATE favourites SET name=COALESCE(?,name), password=COALESCE(?,password), email=COALESCE(?,email) WHERE favourite_id=?`
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
                        respuesta={error:false, type:1, message: `favorito con id ${request.body.favourite_id} modificado correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `favorito con id ${request.body.favourite_id} no encontrado`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `id del favorito no especificado`};
        response.send(respuesta);
    }
})




app.delete('/favorito',(request,response)=>{
    let respuesta;
    if(request.body.favourite_id!=null){
        let params=[request.body.favourite_id];
        let sql=`DELETE FROM favourites WHERE favourite_id=?`;
        connection.query(sql,params,(err,res)=>{
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `favourite con id ${request.body.favourite_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `favourite con id ${request.body.favourite_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de favourite no especificado`};
        response.send(respuesta);
    }
})