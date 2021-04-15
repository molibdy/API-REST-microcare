
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

//////// HASH CONTRASEÑA 

// (A) REQUIRE CRYPTO LIBRARY
var crypto = require('crypto');

// (B) CREATE PASSWORD HASH
var creepy = function (clear) {
  // Generate random salt
  let length = 16;
  let salt =  crypto.randomBytes(Math.ceil(length / 2))
  .toString('hex') 
  .slice(0, length); 

  // SHA512 at work
  let hash = crypto.createHmac('sha512', salt);
  hash.update(clear);
  return {
    salt: salt,
    hash: hash.digest('hex')
  };
};

// (C) TEST ENCRYPT
// Save BOTH the password and salt into database or file
var clearpass = "He110Wor!d";
var creeped = creepy(clearpass);
// console.log("===== HASHED PASSWORD + SALT =====");
// console.log(creeped);

// (D) VALIDATE PASSWORD
var validate = function (userpass, hashedpass, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(userpass);
  userpass = hash.digest('hex');
  return userpass == hashedpass;
};

// (E) TEST VALIDATE
// clearpass = "FOOBAR";
var validated = validate(clearpass, creeped.hash, creeped.salt);
// console.log("===== VALIDATION =====");
// console.log("Clear password: " + clearpass);
// console.log("Validation status: " + validated);



///// RECETAS
app.get('/recetas',(request,response)=>{
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
               
            } response.send(respuesta)
        }
         
       
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
        sql=`SELECT * FROM micronutrient_groups WHERE group_id=?`
    }else{
        sql=`SELECT * FROM micronutrient_groups`
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

    let params=[request.body.name,request.body.color,request.body.color2,request.body.description];
    let sql='INSERT INTO micronutrient_groups (name, color, colo2, description) VALUES (?,?,?,?)';
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
        
        let params=[name,request.body.color,request.body.description,request.body.color2,request.body.group_id]
        let sql="UPDATE micronutrient_groups SET name=COALESCE(?,name), color=COALESCE(?,color), description=COALESCE(?,description), color2=COALESCE(?,color2)  WHERE group_id=?"
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
        let sql=`DELETE FROM micronutrient_groups WHERE group_id=?`;
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
                respuesta={error:false, code:200, message: `micronutriente añadido correctamente con id ${res.insertId}`};
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
        if(micronutrient_name.length==0){ micronutrient_name=null }
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



////   TABLA ALLERGENS ////


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
    }else if(request.query.username!=null){
        if(request.query.username.length>0){
            params=[request.query.username]
            sql=`SELECT * FROM users 
                WHERE username=?`
        }}
        else{
        sql=`SELECT * FROM users`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{ console.log(res)
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





app.post('/usuario',(request,response)=>{
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




app.post('/usuario/registro',(request,response)=>{
    let respuesta;
    let paramsGet= [request.body.username]
    let paramsPost=[request.body.username,creepy(request.body.password).hash,request.body.email];
    let sqlPost=`INSERT INTO users (username, password, email) VALUES (?,?,?)`;
    let sqlGet=`SELECT * FROM users WHERE username=?`
    
    connection.query(sqlGet,paramsGet,(err,res)=>{
        if(err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:3, message: "el usuario " + res + " ya esta registrado"};     
            }
            else{
                console.log('hola');
                connection.query(sqlPost,paramsPost,(negativo,positivo)=>{
                    if (negativo){
                        if (negativo.errno==1048){
                            respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
                        }else  if (negativo.errno==1366){
                            respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: negativo.sqlMessage}
                        }else{
                            respuesta={error:true, type:0, message: negativo};
                        }
                        console.log(negativo)
                    }
                    else{
                        console.log(positivo)
                        if(positivo.affectedRows>0){
                            respuesta={error:false, type:1, message: `Usuario añadido correctamente con id ${positivo.insertId}`};
                        }
                        else{
                            respuesta={error:true, type:2, message: `El Usuario no se ha podido añadir a la base de datos`};
                        }
                    }response.send(respuesta)
                    console.log(respuesta)
                }) 
            }
        } 
        
    })

        
    

})





app.post('/usuario/login',(request,response)=>{
    let respuesta;
    let params= [request.body.username, creepy(request.body.password).hash]
    let sql=`SELECT user_id, profile_picture FROM users WHERE username=? && password=? `
    
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: `No existe usuario con id ${request.body.username}`};
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


//////LOGIN  llama a UserService y hace GET

app.get('/login',(request,response)=>{
    console.log('holii')
    let respuesta;
    let params;
    let sql;
    if(request.query.intake_id!=null){
        params=[request.query.intake_id]
        sql=`SELECT username, password FROM users  WHERE user_id=?`
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
                    respuesta={error:true, code:200, type:-1, message: `No existe un usuario con ese id ${request.query.challenge_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay usuarios en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})







//  PROGRESO  //


// Obtener el progreso por grupos
// Este post es un get, pero en formato post para proteger el id del usuario
app.post('/progreso/grupos',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.body.user_id!=null && request.body.date!=null){
        params=[request.body.user_id, request.body.date]
        sql=`SELECT micronutrient_groups.name AS name, micronutrient_groups.color AS color, micronutrient_groups.color2 AS color2, micronutrient_groups.description AS description, AVG(progress.percent) AS percent FROM progress 
        JOIN micronutrients ON micronutrients.micronutrient_id=progress.micronutrient_id 
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id 
        WHERE progress.user_id=? AND progress.date=?
        GROUP BY name`
        connection.query(sql,params,(err,res)=>{
            if (err){
                respuesta={error:true, type:0, message: err};
            }
            else{
                if(res.length>0){
                    respuesta={error:false, code:200, type:1, message: res};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `User ${request.body.user_id} has no progress on date ${request.body.date}`};
                }
            }
            response.send(respuesta)
            console.log('progreso/grupos')
            console.log(respuesta)
        })
    }else{
        respuesta={error:true, code:200, type:-3, message: `Missing date or user_id`};
        response.send(respuesta)
        console.log(respuesta)
    }
    
})




// Obtener progreso del user en una fecha
app.post('/progreso',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.body.user_id!=null && request.body.date!=null){
        params=[request.body.user_id, request.body.date]
        sql=`SELECT micronutrient_id, percent FROM progress 
        WHERE progress.user_id=? AND progress.date=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                respuesta={error:true, type:0, message: err};
            }
            else{
                if(res.length>0){
                    respuesta={error:false, code:200, type:1, message: res};
                }else{
                    respuesta={error:false, code:200, type:-1, message: `User ${request.body.user_id} has no progress on date ${request.body.date}`};
                }
            }
            response.send(respuesta)
            console.log(respuesta)
        })
    }else{
        respuesta={error:true, code:200, type:-3, message: `Missing date or user_id`};
        response.send(respuesta)
        console.log(respuesta)
    }
    
})


// Inicializar el progreso del día en 0
app.post('/progreso/start',(request,response)=>{
    let respuesta;
    let params=[request.body.user_id,request.body.date,request.body.micronutrient_id,request.body.percent];
    let sql=`INSERT INTO progress (user_id, date, micronutrient_id, percent) VALUES (?,?,?,?)`;
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
                respuesta={error:false, type:1, message: `progreso añadido correctamente con id ${res.insertId}`};
            }
            else{
                respuesta={error:true, type:2, message: `El progreso no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})




