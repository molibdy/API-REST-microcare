
let port= process.env.PORT || 300;
let express=require ('express');
let app= new express()
app.use(express.urlencoded({extended:false,limit: '50mb'}));
app.use(express.json({limit: '50mb'}))
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

// //////// HASH CONTRASEÑA 

// // (A) REQUIRE CRYPTO LIBRARY
// var crypto = require('crypto');

// // (B) CREATE PASSWORD HASH
// var creepy = function (clear) {
//   // Generate random salt
//   let length = 16;
//   let salt =  crypto.randomBytes(Math.ceil(length / 2))
//   .toString('hex') 
//   .slice(0, length); 

//   // SHA512 at work
//   let hash = crypto.createHmac('sha512', salt);
//   hash.update(clear);
//   return {
//     salt: salt,
//     hash: hash.digest('hex')
//   };
// };

// // (C) TEST ENCRYPT
// // Save BOTH the password and salt into database or file
// var clearpass = "He110Wor!d";
// var creeped = creepy(clearpass);
// console.log("===== HASHED PASSWORD + SALT =====");
// console.log(creeped);

// // (D) VALIDATE PASSWORD
// var validate = function (userpass, hashedpass, salt) {
//   let hash = crypto.createHmac('sha512', salt);
//   hash.update(userpass);
//   userpass = hash.digest('hex');
//   return userpass == hashedpass;
// };

// // (E) TEST VALIDATE
// // clearpass = "FOOBAR";
// var validated = validate(clearpass, creeped.hash, creeped.salt);
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
                    respuesta={error:true, code:200, type:-2, message: res};
                }
               
            } response.send(respuesta)
        }
         
       
    })
})
///Sacar las recetas ricas en x micronutriente
app.get('/recetas/ricas',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.micronutrient_id!=null){
        params=[request.query.micronutrient_id]
        sql=`SELECT recipe_ingredient.recipe_id AS recipe_id, 
        ingredient_micronutrient.micronutrient_id AS micronutrient_id, 

        SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id

        WHERE micronutrient_id=?
        GROUP BY recipe_id, micronutrient_id
        ORDER BY percent DESC
        LIMIT 6`
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
                    respuesta={error:true, code:200, type:-2, message: res};
                }
               
            } response.send(respuesta)
        }
    })
})

app.get('/recetas/detalles',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.recipe_id!=null){
        params=[request.query.recipe_id]
        sql=`SELECT recipe_ingredient.recipe_id, diets.diet_name, ingredients.ingredient_name, recipe_ingredient.total_grams, 
        recipe_ingredient.amount, recipe_ingredient.unit, recipe_ingredient.ingredient_id FROM recipe_ingredient 
        JOIN ingredients ON ingredients.ingredient_id=recipe_ingredient.ingredient_id
        JOIN diet_recipe ON diet_recipe.recipe_id=recipe_ingredient.recipe_id
        JOIN diets ON diet_recipe.diet_id=diets.diet_id
        WHERE recipe.ingredient.recipe_id=?`
    }else{
        sql=`SELECT recipe_ingredient.recipe_id, diets.diet_name, ingredients.ingredient_name, recipe_ingredient.total_grams, 
        recipe_ingredient.amount, recipe_ingredient.unit, recipe_ingredient.ingredient_id FROM recipe_ingredient 
        JOIN ingredients ON ingredients.ingredient_id=recipe_ingredient.ingredient_id
        JOIN diet_recipe ON diet_recipe.recipe_id=recipe_ingredient.recipe_id
        JOIN diets ON diet_recipe.diet_id=diets.diet_id
        ORDER BY recipe_id`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};
               
            } 
        }
        response.send(respuesta)
    })
})


app.get('/recetas/parati',(request,response)=>{
    let respuesta;
    let params;
    let sql;
        params=[request.query.user_id, request.query.user_id, request.query.date]
        sql=`SELECT DISTINCT recetas.recipe_id 
        FROM (
            SELECT recipe_ingredient.recipe_id AS recipe_id, ingredient_micronutrient.micronutrient_id as micronutrient_id,
            SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
            FROM ingredient_micronutrient
            JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
            WHERE recipe_ingredient.ingredient_id NOT IN (
                SELECT * FROM (
                    SELECT avoid_ingredients.ingredient_id FROM avoid_ingredients
                    WHERE avoid_ingredients.user_id=?
                    ) AS avoid_these
                )
            AND micronutrient_id IN (
                SELECT * FROM (
                    SELECT progress.micronutrient_id FROM progress
                    WHERE progress.user_id=? AND progress.date=?
                    ORDER BY progress.percent ASC
                    LIMIT 10) AS lowest_progress
                )    
            GROUP BY recipe_id, micronutrient_id
            ORDER BY percent DESC
            LIMIT 10
            ) AS recetas`

    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
            console.log(err)
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};
               
            } 
        }
        response.send(respuesta)
        
    })
})


app.get('/recetas/planeadas',(request,response)=>{
    let respuesta;
    let params;
    let sql;
        params=[request.query.user_id, request.query.date]
        sql=`SELECT planned_recipes.planned_recipe_id, planned_recipes.date, planned_recipes.recipe_id, 
        planned_recipes.isConsumed, recipes.recipe_name 
        FROM planned_recipes
        JOIN recipes ON recipes.recipe_id=planned_recipes.recipe_id
        WHERE user_id=? AND date=?`

    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
            console.log(err)
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};
               
            } 
        }
        response.send(respuesta)
        
    })
})



app.post('/recetas/planeadas', (request,response) =>{

    let respuesta;

    let params=[request.body.user_id,request.body.date,request.body.recipe_id, request.body.isConsumed];
    let sql='INSERT INTO planned_recipes (user_id,date,recipe_id,isConsumed) VALUES (?,?,?,?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
            console.log('err de post recetas planeadas')
            console.log(err)
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, type:1, message: res.insertId};
            }
            else{
                respuesta={error:true, code:200, message: `Receta no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})


app.put('/recetas/planeadas',(request,response)=>{
    let respuesta;
    let params=[request.body.isConsumed,request.body.planned_recipe_id]
    let sql="UPDATE planned_recipes SET isConsumed=?  WHERE planned_recipe_id=?"
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: res};
            }else{
                respuesta={error:true, type:-1, message: `receta con id ${request.body.planned_recipe_id} no encontrado`};
            }
        }
        response.send(respuesta)
    })
})

app.delete('/recetas/planeadas',(request,response)=>{
    let respuesta;
    let params=[request.query.planned_recipe_id]
    let sql="DELETE FROM planned_recipes WHERE planned_recipe_id=?"
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message:err};
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message:` receta con id ${request.query.planned_recipe_id} eliminado correctamente`};
            }
            else{
                respuesta={error:true, type:-1, message:` receta con id ${request.query.planned_recipe_id} no encontrado`};
            }
        }
        response.send(respuesta);
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
                    respuesta={error:true, code:200, type:-2, message:res};
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



//  OBTENER MICROSCORES DE RECETAS, INTAKES Y RETOS:

app.get('/micronutrientes/receta',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.recipe_id!=null){
        params=[request.query.recipe_id]
        sql=`SELECT ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id,
        SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
        JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
        WHERE recipe_ingredient.recipe_id=?
        GROUP BY micronutrient_id
        ORDER BY percent DESC`
    }else{
        sql=`SELECT recipe_ingredient.recipe_id AS recipe_id, ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id,
        SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
        JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
        GROUP BY recipe_id, micronutrient_id
        ORDER BY recipe_id, percent DESC`
    }

    
   
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:false, code:200, type:1, message: res};
            }else{
                respuesta={error:false, code:200, type:-1, message: res};
                
            }
        }
        response.send(respuesta)
    })
})


app.get('/micronutrientes/intakes',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.recipe_id!=null){
        params=[request.query.recipe_id]
        sql=`SELECT ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id,
        SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
        JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
        WHERE recipe_ingredient.recipe_id=?
        GROUP BY micronutrient_id
        ORDER BY percent DESC`
    }else{
        sql=`SELECT recipe_ingredient.recipe_id AS recipe_id, ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id,
        SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
        JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
        GROUP BY recipe_id, micronutrient_id
        ORDER BY recipe_id, percent DESC`
    }

    
   
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:false, code:200, type:1, message: res};
            }else{
                respuesta={error:false, code:200, type:-1, message: res};
                
            }
        }
        response.send(respuesta)
    })
})





app.get('/micronutrientes/reto',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    params=[request.query.challenge_id]
    sql=`SELECT ingredient_micronutrient.micronutrient_id as micronutrient_id, 
    SUM(ingredient_micronutrient.micronutrient_percent*challenge_ingredient.grams/ingredient_micronutrient.grams) AS percent
    FROM ingredient_micronutrient
    JOIN challenge_ingredient ON challenge_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
    WHERE challenge_ingredient.challenge_id=?
    ORDER BY percent DESC`
   
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:false, code:200, type:1, message: res};
            }else{
                respuesta={error:false, code:200, type:-1, message: res};
                
            }
        }
        response.send(respuesta)
    })
})




//////////////////////////TABLA INGREDIENTES


app.get('/ingredientes',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.ingredient_id!=null){
        params=[request.query.ingredient_id]
        sql=`SELECT * FROM ingredients  WHERE ingredient_id=?`
    }else{
        sql=`SELECT ingredient_id, ingredient_name FROM ingredients`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};

            }
        }
        response.send(respuesta)
    })
})
app.get('/ingredientes/avoid',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.ingredient_id!=null){
        params=[request.query.ingredient_id]
        sql=`SELECT * FROM ingredients  WHERE ingredient_id=?`
    }else{
        sql=`SELECT  avoid_ingredients.ingredient_id, avoid_id, ingredients.ingredient_name FROM avoid_ingredients 
        JOIN ingredients ON ingredients.ingredient_id = avoid_ingredients.ingredient_id`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};

            }
        }
        response.send(respuesta)
    })
})
app.get('/ingredientes/allergen',(request,response)=>{
    console.log("entrando al get de alergias");
    let respuesta;
    let params;
    let sql;
    if(request.query.ingredient_id!=null){
        params=[request.query.ingredient_id]
        sql=`SELECT * FROM ingredients  WHERE ingredient_id=?`
    }else{
        sql=`SELECT  user_allergen.allergen_id, user_id, allergens.allergen_name FROM user_allergen 
            JOIN allergens ON allergen.allergen_id = user_allergen.allergen_id`
    }
    connection.query(sql,params,(err,res)=>{
        console.log("entrando al mysq de alergias" + res);
        console.log(res);
        console.log(err);

        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};

            }
        }
        response.send(respuesta)
    })
})
///// query para sacar los ingredientes ricos en micronutrientes
app.get('/ingredientes/micronutrientes',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.micronutrient_id!=null){
        params=[request.query.micronutrient_id]
        sql=`SELECT ingredients.ingredient_id, ingredient_name FROM ingredient_micronutrient 
        JOIN ingredients ON ingredients.ingredient_id = ingredient_micronutrient.ingredient_id
        WHERE micronutrient_id=? ORDER BY micronutrient_percent
        LIMIT 12`
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
                    respuesta={error:true, code:200, type:-1, message: `No existe ingrediente de micronutriente con este id ${request.query.ingredient_id}`};
                }else{
                    respuesta={error:true, code:200, type:-2, message: `No hay este ingrediente de micronutriente en la base de datos`};
                }
            }
        }
        response.send(respuesta)
    })
})
app.get('/ingredientes/all_allergen',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.allergic!=null){
        params=[request.query.allergic]
        sql=`SELECT * FROM allergens  WHERE allergen_id=?`
    }else{
        sql=`SELECT  * FROM allergens`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            respuesta = res

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

app.post('/ingredientes/avoid',(request,response)=>{
    let respuesta;
    let paramsGet= [request.body.user_id]
    
    let sqlDelete=`DELETE from avoid_ingredients WHERE user_id = ?`;

    connection.query(sqlDelete,paramsGet,(err,res)=>{

        if(err){
            console.log('error en post ingredientes/avoid')
            respuesta={error:true, type:0, message: err};
            response.send(respuesta)

        }
        else{ 
                console.log(res);
                let sql2 = `INSERT INTO avoid_ingredients (user_id, ingredient_id) VALUES `
                params2=[]
                    for(let i=0;i<request.body.ingredientes.length;i++){
                        params2.push(request.body.user_id,request.body.ingredientes[i].ingredient_id)

                        if(i==request.body.ingredientes.length-1){
                            sql2 += `(?,?)`
                        }else{
                            sql2 += `(?,?),`
                        }  
                    }


            connection.query(sql2,params2,(negativo,positivo)=>{

                    if (negativo){
                        console.log('error en post ingredientes/avoid')
                    }
                    else{
                        if(positivo.affectedRows>0){
                            respuesta={error:false, type:1, message: positivo};
                        }
                        else{
                            respuesta={error:true, type:2, message: `El Usuario no se ha podido añadir a la base de datos`};
                        }
                    }
                    response.send(respuesta)
            })  
                
                
            
        } 
    })

})

app.post('/ingredientes/allergen',(request,response)=>{
    console.log('entrada al post de alergenos');
    let respuesta;
    let paramsGet= [request.body.user_id]
    
    let sqlDelete=`DELETE from user_allergen WHERE user_id = ?`;

    connection.query(sqlDelete,paramsGet,(err,res)=>{
        console.log('entrada al mysql de alergenos');

        if(err){
            console.log(err);
            respuesta={error:true, type:0, message: err};
            response.send(respuesta)

        }
        else{ 
                console.log(res);
                if(request.body.alergias.length>0){
                    let sql2 = `INSERT INTO user_allergen (user_id, allergen_id) VALUES `
                    params2=[]
                    console.log(request.body.alergias);
                        for(let i=0;i<request.body.alergias.length;i++){
                            params2.push(request.body.user_id,request.body.alergias[i].allergen_id)
                            console.log(request.body.alergias[i].allergen_id);

                            if(i==request.body.alergias.length-1){
                                sql2 += `(?,?)`
                            }else{
                                sql2 += `(?,?),`
                            }  
                        }
                        console.log(sql2);

                    connection.query(sql2,params2,(negativo,positivo)=>{
                        console.log(params2.ingredientes);

                            if (negativo){
                            console.log('negativo');
                                console.log(negativo)
                            }
                            else{
                                console.log(positivo)
                                console.log('positivo')
                                if(positivo.affectedRows>0){
                                    respuesta={error:false, type:1, message: positivo};
                                }
                                else{
                                    respuesta={error:true, type:2, message: `El Usuario no se ha podido añadir a la base de datos`};
                                }
                            }
                            console.log(respuesta)

                    })  
                }
                else{
                    response.send(res)
                
                }    
            
            } 
    })

})



app.post('/ingredientes/micronutrientes',(request,response)=>{
    let respuesta;
    let params=[];
    let sql=`SELECT micronutrient_id, usda_id, cdr_amount, cdr_unit FROM micronutrients`;
    connection.query(sql,(err,micros)=>{
        if(err)   console.log('error en ingredientes/micronutrientes')
        else{
            for(i=0;i<micros.length;i++){
                for(j=0;j<request.body.micronutrients.length;j++){
                    // matchear los micronutrientes de nuestra tabla con los obtenidos de usda
                    if(micros[i].usda_id==request.body.micronutrients[j].nutrient.number){
                        //modificar el id de los nutrientes de usda con nuestro micronutrient_id
                    request.body.micronutrients[j].nutrient.id=micros[i].micronutrient_id
                        // comprobar que la unidad de usda es la misma que la usada en la cdr
                        if(request.body.micronutrients[j].nutrient.unitName==micros[i].cdr_unit){
                            // calcular el % de la cdr para el micronutriente j
                            request.body.micronutrients[j].nutrient.rank=100*request.body.micronutrients[j].amount/micros[i].cdr_amount
                            if(request.body.micronutrients[j].nutrient.rank>100){
                                // cota superior=100%
                                request.body.micronutrients[j].nutrient.rank=100
                            }
                        }else{
                            request.body.micronutrients[j].nutrient.rank=0
                        }
                    }
                }
            }

            let sqlPost=`INSERT INTO ingredient_micronutrient 
            (ingredient_id,grams,micronutrient_id,micronutrient_amount,micronutrient_unit,micronutrient_percent) VALUES `
            
            for(j=0;j<request.body.micronutrients.length;j++){
                params.push(request.body.ingredient_id,request.body.grams,request.body.micronutrients[j].nutrient.id,
                    request.body.micronutrients[j].amount,request.body.micronutrients[j].nutrient.unitName,request.body.micronutrients[j].nutrient.rank)
                if(j==request.body.micronutrients.length-1){
                    sqlPost+=` (?,?,?,?,?,?)` 
                }else{
                    sqlPost+=`(?,?,?,?,?,?),`
                }
            }
            connection.query(sqlPost,params,(err,res)=>{
                if (err){
                    respuesta={error:true, type:0, message: err};
                }
                else{
                    respuesta={error:false, type:1, message: res};
                }
                response.send(respuesta)
            })
        }
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

app.get('/ingestas',(request,response)=>{
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



app.post('/ingestas',(request,response)=>{
    let respuesta;
    let params=[request.body.user_id, request.body.date];
    let sql=`INSERT INTO intakes (user_id, date) VALUES (?,?)`;
    
    connection.query(sql,params,(err,res)=>{
        

        if (err){
            respuesta = err;
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: res.insertId}
                let params2=[]
                let sql2 = 'INSERT INTO intake_ingredient (intake_id, ingredient_id, grams ) VALUES '

                for(let i=0;i<request.body.ingredientes.length;i++){
                    params2.push(res.insertId,request.body.ingredientes[i].ingrediente.ingredient_id, request.body.ingredientes[i].peso)
                    console.log(request.body.ingredientes[i].ingredient_id);

                    if(i==request.body.ingredientes.length-1){
                        sql2 += `(?,?,?)`
                    }else{
                        sql2 += `(?,?,?),`
                    }  
                }
                connection.query(sql2,params2,(error,positivo)=>{
                    console.log(sql2);
                    

                        if(error){
                            respuesta = {error}
                    
                        }
                        else{
                            respuesta = {error:false, type:1, message: res.insertId}
                            console.log('respuetsa correcta de inatek_ingredients' + res.insertId);
                            let params3;
                            let sql3;
                            if(res.insertId!=null){
                                params=[res.insertId]
                                sql=`SELECT ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
                                micronutrients.micronutrient_name AS micronutrient_name,
                                micronutrients.acronym AS acronym,
                                micronutrient_groups.color AS color,
                                micronutrient_groups.group_id AS group_id,
                                SUM(ingredient_micronutrient.micronutrient_percent*intake_ingredient.grams/ingredient_micronutrient.grams) AS percent
                                FROM ingredient_micronutrient
                                JOIN intake_ingredient ON intake_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
                                JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
                                JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
                                WHERE intake_ingredient.intake_id=?
                                GROUP BY micronutrient_id
                                ORDER BY percent DESC`
                            }else{
                                sql=`SELECT intake_ingredient.intake_id AS intake_id, ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
                                micronutrients.micronutrient_name AS micronutrient_name,
                                micronutrients.acronym AS acronym,
                                micronutrient_groups.color AS color,
                                micronutrient_groups.group_id AS group_id,
                                SUM(ingredient_micronutrient.micronutrient_percent*intake_ingredient.grams/ingredient_micronutrient.grams) AS percent
                                FROM ingredient_micronutrient
                                JOIN intake_ingredient ON intake_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
                                JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
                                JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
                                GROUP BY intake_id, micronutrient_id
                                ORDER BY intake_id, percent DESC`
                            }
                        
                            
                           
                            connection.query(sql,params,(err,micros)=>{
                                if (err){
                                    respuesta={error:true, type:0, message: err};
                                }
                                else{
                                    if(micros.length>0){
                                        respuesta={error:false, code:200, type:1, intake_id:res.insertId, microscore:micros};
                                    }else{
                                        respuesta={error:false, code:200, type:-1, intake_id:res.insertId, microscore:micros};
                                        
                                    }
                                }
                                response.send(respuesta)
                            })
                        }
                        })             
            }
            
        }    
    })

})


app.put('/ingestas',(request,response)=>{
    let respuesta;
    if(request.body.intake_id!=null){
        let user_id=request.body.user_id;
        if(request.body.user_id.length==0){ user_id=null }
        if(request.body.date.length==0){ date=null }
        let params=[request.body.date,request.body.user_id]

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


app.delete('/ingestas',(request,response)=>{
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

 //////////// ingestas / favoritos 
 
 app.post('/ingestas/favoritos',(request,response)=>{
     console.log('entrando a post ingestas/favoritos')
    let respuesta;
    let params=[request.body.user_id, request.body.name, request.body.intake_id];
    let sql=`INSERT INTO favourites (user_id, name, intake_id) VALUES (?,?,?)`;

    connection.query(sql,params,(err,res)=>{

        if (err){
            respuesta = err;
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: res.insertId}

            }
            else{
                respuesta={error:true, type:2, message: `El intake no se ha podido añadir a la base de datos`};
            }
        }   response.send(respuesta)



    })

})
app.post('/ingestas/consumidos', (request,response) =>{

    let respuesta;

    let params=[request.body.user_id,request.body.date,request.body.favourite_id, request.body.isConsumed];
    let sql='INSERT INTO consumed_favourites (user_id,date,favourite_id,isConsumed) VALUES (?,?,?,?)';
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
            console.log('err de post recetas planeadas')
            console.log(err)
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, code:200, type:1, message: res.insertId};
            }
            else{
                respuesta={error:true, code:200, message: `Receta no se ha podido añadir a la base de datos`};
            }
        }
        response.send(respuesta)
    })
})

app.get('/ingestas/favoritos',(request,response)=>{
    let respuesta;
    let params = [request.query.user_id]
    let sql=`SELECT favourites.*, intake_ingredient.intake_id AS intake_id, ingredient_micronutrient.micronutrient_id AS micronutrient_id, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id,
        SUM(ingredient_micronutrient.micronutrient_percent*intake_ingredient.grams/ingredient_micronutrient.grams) AS percent
        FROM ingredient_micronutrient
        JOIN intake_ingredient ON intake_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
        JOIN micronutrients ON micronutrients.micronutrient_id=ingredient_micronutrient.micronutrient_id
        JOIN micronutrient_groups ON micronutrient_groups.group_id=micronutrients.group_id
        JOIN favourites ON favourites.intake_id = intake_ingredient.intake_id
        JOIN intakes ON intakes.intake_id = intake_ingredient.intake_id
        WHERE intakes.user_id = ?
        GROUP BY favourite_id, micronutrient_id
        ORDER BY favourite_id, percent DESC`
        console.log('entrando en get favs')
        let arrFavoritos = [{favourite_id: 0, intake_id: 0, name: '', microscore: []}]

    connection.query(sql,params,(err,favoritos)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            
            if(favoritos.length>0){
                console.log('hasta aqui');
                for(let i=0; i<favoritos.length;i++){
                    
                    if(favoritos[i].favourite_id == arrFavoritos[arrFavoritos.length -1].favourite_id){
                        console.log('if ' + i);
                        arrFavoritos[arrFavoritos.length -1].microscore.push({micronutrient_id: favoritos[i].micronutrient_id, 
                                                                            micronutrient_name: favoritos[i].micronutrient_name,
                                                                            acronym: favoritos[i].acronym,
                                                                            color: favoritos[i].color,
                                                                            percent: favoritos[i].percent,
                                                                            group_id: favoritos[i].group_id})

                    }else{
                        if(arrFavoritos[0].favourite_id==0){
                            console.log('else ' + i);
                            arrFavoritos[0] = {favourite_id: favoritos[i].favourite_id, intake_id: favoritos[i].intake_id, name: favoritos[i].name, microscore: []}
                        }
                        else{ arrFavoritos.push({favourite_id: favoritos[i].favourite_id, intake_id: favoritos[i].intake_id, name: favoritos[i].name, microscore: []})
                        }

                       
                    }                

                }              console.log('arrFavoritos');           console.log(arrFavoritos);


                respuesta={error:true, code:200, type:1, message: arrFavoritos};
                console.log(respuesta)
            }
        }
        response.send(respuesta)
    })
})


app.delete('/ingestas/favorito',(request,response)=>{
    let respuesta;
    if(request.query.favourite_id!=null){
        let params=[request.query.favourite_id];
        let sql=`DELETE FROM favourites WHERE favourite_id = ?`;
        connection.query(sql,params,(err,res)=>{
        
            if (err){   
                respuesta={error:true, type:0, message:err};
            }
            else{
                if(res.affectedRows>0){
                    respuesta={error:false, type:1, message: `favourite con id ${request.query.favourite_id} eliminado correctamente`};
                }
                else{
                    respuesta={error:true, type:-1, message: `favourite con id ${request.query.favourite_id} no encontrado`};
                }
            }
            response.send(respuesta);
        })
    }else{
        respuesta={error:true, type:-2, message: `id de favourite no especificado`};
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
        sql=`SELECT user_id, username, profile_picture FROM users 
            WHERE user_id=?`
    }else if(request.query.username!=null){
        if(request.query.username.length>0){
            params=[request.query.username]
            sql=`SELECT user_id, username, profile_picture FROM users 
            WHERE username=?`
        }}
        else{
        sql=`SELECT user_id, username, profile_picture FROM users`
    }
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{ 
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: res};
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
    let paramsPost=[request.body.username,request.body.password,request.body.email];
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
                }) 
            }
        } 
        
    })

        
    

})

app.post('/usuario/preferencias',(request,response)=>{
    console.log('entrada al select usuario/preferencias');
    let respuesta;
    let paramsGet= []
    let paramsPost=[request.body.username,request.body.password,request.body.email];
    let sqlPrueba = `SELECT * from micronutrients `
    let sqlPost=`INSERT INTO users (username, password, email) VALUES (?,?,?)`;
    let sqlGet=`SELECT  diet_ingredient.ingredient_id, allergen_ingredient.ingredient_id FROM diet_ingredient
    JOIN ingredients ON ingredients.ingredient_id = diet_ingredient.ingredient_id
    JOIN allergen_ingredient ON allergen_ingredient.ingredient_id=ingredients.ingredient_id
    WHERE diet_id IN (`
    for(let i =0; i<request.body.dietas.length; i++){
        if(i==request.body.dietas.length-1){
            paramsGet.push(request.body.dietas[i])
            sqlGet += `?`
        }else{
            paramsGet.push(request.body.dietas[i])
            sqlGet += `?,`
        }
        
    } sqlGet += `) OR allergen_id IN (`
    for(let i =0; i<request.body.alergenos.length; i++){
        if(i==request.body.alergenos.length-1){
            paramsGet.push(request.body.alergenos[i])
            sqlGet += `?`
        }else{
            paramsGet.push(request.body.alergenos[i])
            sqlGet += `?,`
        }
    }            sqlGet += `)`


    connection.query(sqlGet,paramsGet,(err,res)=>{
        console.log('entrada al post usuario/preferencias');

        if(err){
            console.log(err);
            respuesta={error:true, type:0, message: err};
        }
        else{ 
            if(res.length>0){
                respuesta={error:false, code:200, type:3, message: res};     
            }
            else{
                respuesta={error:false, code:200, type:2, message: res};
                console.log(res);
                let sql2 = `INSERT INTO avoid_ingredients (user_id, ingredient_id) VALUES`
                params2=[]
                    for(let i=0;i<request.body.ingredientes.length;i++){
                        params2.push(request.body.user_id,request.body.ingredientes[i])
                        sql=+ `(?,?),`
                    }
                    for(let i=0;i<res.length;i++){
                        params2.push(request.body.user_id,res[i])
                        if(i==res.length-1){
                            sql=+ `(?,?)`
                        }else{
                            sql=+ `(?,?),`
                        }  
                    }

            connection.query(sql2,params2,(negativo,positivo)=>{
                    if (negativo){
                    
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
                    }
                    console.log(respuesta)
                    response.send(respuesta)

                })  
            }
        } 
    })

        
    

})





app.post('/usuario/login',(request,response)=>{
    let respuesta;
    let params= [request.body.username, request.body.password]
    let sql=`SELECT user_id, username, profile_picture FROM users WHERE username=? && password=? `
    
    connection.query(sql,params,(err,res)=>{
        if (err){
            console.log(err)
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.length>0){
                respuesta={error:true, code:200, type:1, message: res};
            }else{
                respuesta={error:true, code:200, type:-1, message: `No existe usuario con username ${request.body.username}`};
            }
        }
        console.log(err)
        response.send(respuesta)
    })
})






app.put('/usuario/config',(request,response)=>{
    let respuesta;
    // if(request.body.username.length==0){request.body.username=null}
    if(request.body.password.length==0){request.body.password=null}
    if(request.body.email.length==0){request.body.email=null}
    if(request.body.profile_picture.length==0){request.body.profile_picture=null}
    let params=[request.body.username,request.body.password,request.body.email,request.body.profile_picture, request.body.user_id]
    let sql=`UPDATE users SET username=COALESCE(?,username), password=COALESCE(?,password), 
    email=COALESCE(?,email), profile_picture=COALESCE(?,profile_picture) WHERE user_id=?`
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: `usuario con id ${request.body.user_id} modificado correctamente`};
            }
            else{
                respuesta={error:true, type:-1, message: `usuario con id ${request.body.user_id} no encontrado`};
            }
        }
        response.send(respuesta)
    })
  
})

app.put('/ingestas/consumidos',(request,response)=>{
    let respuesta;
    let params=[request.body.isConsumed,request.body.consumed_favourites_id]
    let sql="UPDATE consumed_favourites SET isConsumed=?  WHERE consumed_favourites_id=?"
    connection.query(sql,params,(err,res)=>{
        if (err){
            respuesta={error:true, type:0, message: err};
        }
        else{
            if(res.affectedRows>0){
                respuesta={error:false, type:1, message: res};
            }else{
                respuesta={error:true, type:-1, message: `favorito con id ${request.body.consumed_favourites_id} no encontrado`};
            }
        }
        response.send(respuesta)
    })
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









//  PROGRESO  //


// Obtener el progreso por grupos
// Este post es un get, pero en formato post para proteger el id del usuario
app.post('/progreso/grupos',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.body.user_id!=null && request.body.date!=null){
        params=[request.body.user_id, request.body.date]
        sql=`SELECT micronutrient_groups.group_id AS group_id, micronutrient_groups.name AS name, micronutrient_groups.color AS color, micronutrient_groups.color2 AS color2, micronutrient_groups.description AS description, AVG(progress.percent) AS percent FROM progress 
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
                    respuesta={error:true, code:200, type:-1, message: `User ${request.body.user_id} has no progress on date ${request.body.date}`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, code:200, type:-3, message: `Missing date or user_id`};
        response.send(respuesta)
    }
    
})




// Obtener progreso del user en una fecha
app.get('/progreso',(request,response)=>{
    let respuesta;
    let params;
    let sql;
        params=[request.query.user_id, request.query.date]
        
        sql=`SELECT progress.micronutrient_id, progress.percent, 
        micronutrients.micronutrient_name AS micronutrient_name,
        micronutrients.acronym AS acronym,
        micronutrient_groups.color AS color,
        micronutrient_groups.group_id AS group_id
        FROM progress
        JOIN micronutrients ON micronutrients.micronutrient_id = progress.micronutrient_id 
        JOIN micronutrient_groups ON micronutrients.group_id=micronutrient_groups.group_id
        WHERE progress.user_id=? AND progress.date=?`
    
        connection.query(sql,params,(err,res)=>{
            if (err){
                console.log('error en /progreso')
                respuesta={error:true, type:0, message: err};
            }
            else{
                if(res.length>0){
                    respuesta={error:false, code:200, type:1, message: res};
                }else{
                    respuesta={error:false, code:200, type:-1, message: res};
                }
            }
            response.send(respuesta)
            // console.log(respuesta)
        })
    
})



app.get('/progreso/average',(request,response)=>{
    let respuesta;
    let params;
    let sql;
    if(request.query.user_id!=null){  
        
        params=[request.query.user_id]
        sql=`SELECT date, AVG(percent) AS percent FROM progress 
        WHERE progress.user_id=? 
        GROUP BY progress.date
        ORDER BY progress.date`
    }else{          
        params=[]
        sql=`SELECT date, AVG(percent) AS percent FROM progress 
        GROUP BY progress.date
        ORDER BY progress.date`
    }
        connection.query(sql,params,(err,res)=>{
            if (err){
                console.log('error en /progreso/average')
                respuesta={error:true, type:0, message: err};
            }
            else{
                // Average de TODOS
                if(request.query.user_id==null){
                    if(res.length>0){
                        respuesta={error:false, code:200, type:1, message: res};
                    }else{
                        respuesta={error:false, code:200, type:-1, message: res};
                    }
                    response.send(respuesta)

                }else{    // Average de USER y todos sin user
                    let sql2=`SELECT date, AVG(percent) AS percent FROM progress
                    WHERE progress.user_id!=?  
                    GROUP BY progress.date
                    ORDER BY progress.date`

                    connection.query(sql2,params,(err,total)=>{
                        if (err){
                            console.log('error en /progreso/average')
                            respuesta={error:true, type:0, message: err};
                        }
                        else{
                            respuesta={error:false, code:200, type:1, userAverage: res, totalAverage: total};
                        }
                        response.send(respuesta)
                    })        
                }


                
            }
            
        })
    
})






// Inicializar el progreso del día en 0
app.post('/progreso/start',(request,response)=>{
    let respuesta;
    
        let params=[];
        let sql=`INSERT INTO progress (user_id, date, micronutrient_id, percent) VALUES`;
        for(let i=1;i<24;i++){
            if(i==23){
                params.push(request.body.user_id,request.body.date,i,request.body.percent)
                sql += ' (?,?,?,?)'
            }else{
                params.push(request.body.user_id,request.body.date,i,request.body.percent)
                sql += ' (?,?,?,?),'
            }
        }
        connection.query(sql,params,(err,res)=>{
            if (err){
                console.log('err de /progreso/start'); console.log(err)
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



app.put('/progreso',(request,response)=>{
    let respuesta;
    if(request.body.user_id>0){
        
        let params=[]
        let sql=`UPDATE progress SET percent = (CASE micronutrient_id `
        for(let i=0;i<request.body.percents.length;i++){
            params.push(request.body.percents[i].micronutrient_id,request.body.percents[i].percent)
            sql += `WHEN ? THEN percent + ? `
        }
        params.push(request.body.user_id, request.body.date)
        sql += `END) WHERE user_id=? AND date=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                console.log(err)
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
                        respuesta={error:false, type:1, message: `progresos modificados correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `El usuario con id ${request.body.user_id} no tiene progresos el día ${request.body.date}`};
                }
            }
            response.send(respuesta)
        })
    }else{
        respuesta={error:true, type:-4, message: `user_id no especificado`};
        response.send(respuesta);
    }
})



app.put('/progreso/remove',(request,response)=>{
    let respuesta;
        let params=[]
        let sql=`UPDATE progress SET percent = (CASE micronutrient_id `
        for(let i=0;i<request.body.percents.length;i++){
            params.push(request.body.percents[i].micronutrient_id,request.body.percents[i].percent)
            sql += `WHEN ? THEN percent - ? `
        }
        params.push(request.body.user_id, request.body.date)
        sql += `END) WHERE user_id=? AND date=?`
        connection.query(sql,params,(err,res)=>{
            if (err){
                console.log(err)
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
                        respuesta={error:false, type:1, message: `progresos modificados correctamente`};
                    }
                    else{
                        respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
                    }
                }
                else{
                    respuesta={error:true, type:-3, message: `El usuario con id ${request.body.user_id} no tiene progresos el día ${request.body.date}`};
                }
            }
            response.send(respuesta)
        })
    
})
        


// /// DIETAS

// app.get('/dietas',(request,response)=>{
//     console.log('dietas')
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.diets_id!=null){
//         params=[request.query.recipe_id]
//         sql=`SELECT * FROM diets WHERE recipe_id=?`
//     }else{
//         sql=`SELECT * FROM diets`
//     }
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 if(request.query.recipe_id!=null){
//                     respuesta={error:true, code:200, type:-1, message: `No existe dieta con id ${request.query.recipe_id}`};
//                 }else{
//                     respuesta={error:true, code:200, type:-2, message: `No hay recetas en la base de datos`};
//                 }
//             }
//         }
//         response.send(respuesta)
//     })
// })


// app.post('/dietas', (request,response) =>{

//     let respuesta;

//     let params=[request.body.diet.name];
//     let sql='INSERT INTO diets (diet.name) VALUES (?)';
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, message:'faltan campos por rellenar'}
//             } else  if (err.errno==1452){
//                 respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, code:200, message: `dieta añadida correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, code:200, message: `dieta no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })



//     app.put('/dietas',(request,response)=>{
//         let respuesta;
//         if(request.body.diet_id!=null){
//             let name=request.body.diet.name;
//             if(request.body.diet.name.length==0){ name=null }
//             let params=[name,request.body.diet_id]
//             let sql="UPDATE diets SET diet.name=COALESCE(?,diet.name),  WHERE diet_id=?"
//             connection.query(sql,params,(err,res)=>{
//                 if (err){
//                     if (err.errno==1452){
//                         respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
//                     }else  if (err.errno==1366){
//                         respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
//                     }else{
//                         respuesta={error:true, type:0, message: err};
//                     }
//                 }
//                 else{
//                     if(res.affectedRows>0){
//                         if(res.changedRows>0){
//                             respuesta={error:false, type:1, message: `dieta con id ${request.body.diet_id} modificado correctamente`};
//                         }
//                         else{
//                             respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                         }
//                     }
//                     else{
//                         respuesta={error:true, type:-3, message: `dieta con id ${request.body.diet_id} no encontrado`};
//                     }
//                 }
//                 response.send(respuesta)
//             })
//         }else{
//             respuesta={error:true, type:-4, message: `id del dieta no especificado`};
//             response.send(respuesta);
//         }
//     })
    
//     app.delete('/dietas',(request,response)=>{
//         let respuesta;
//         if(request.body.diet_id!=null){
//             let params=[request.body.diet_id];
//             let sql=`DELETE FROM diets WHERE diet_id=?`;
//             connection.query(sql,params,(err,res)=>{
//                 if (err){
//                     respuesta={error:true, type:0, message:err};
//                 }
//                 else{
//                     if(res.affectedRows>0){
//                         respuesta={error:false, type:1, message:` dieta con id ${request.body.diet_id} eliminado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:-1, message:` dieta con id ${request.body.diet_id} no encontrado`};
//                     }
//                 }
//                 response.send(respuesta);
//             })
//         }else{
//             respuesta={error:true, type:-2, message:` id de dieta no especificado`};
//             response.send(respuesta);
//         }
//     })






// /// GRUPOS

app.get('/micronutrientes/grupos',(request,response)=>{
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
                respuesta={error:true, code:200, type:-11, message: res};
            }
        }
        response.send(respuesta)
    })
})



// app.post('/grupos', (request,response) =>{

//     let respuesta;

//     let params=[request.body.name,request.body.color,request.body.color2,request.body.description];
//     let sql='INSERT INTO micronutrient_groups (name, color, colo2, description) VALUES (?,?,?,?)';
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, message:'faltan campos por rellenar'}
//             } else  if (err.errno==1452){
//                 respuesta={error:true, message:'el id especificado para uno de los campos no existe', detalle: err.sqlMessage}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, code:200, message: `grupo añadida correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, code:200, message: `grupo no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })



// app.put('/grupos',(request,response)=>{
//     let respuesta;
//     if(request.body.group_id!=null){
//         let name=request.body.name;
        
//         let params=[name,request.body.color,request.body.description,request.body.color2,request.body.group_id]
//         let sql="UPDATE micronutrient_groups SET name=COALESCE(?,name), color=COALESCE(?,color), description=COALESCE(?,description), color2=COALESCE(?,color2)  WHERE group_id=?"
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 if (err.errno==1452){
//                     respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
//                 }else  if (err.errno==1366){
//                     respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto, detalle: ${err.sqlMessage}`}
//                 }else{
//                     respuesta={error:true, type:0, message: err};
//                 }
//             }
//             else{
//                 if(res.affectedRows>0){
//                     if(res.changedRows>0){
//                         respuesta={error:false, type:1, message: `grupo con id ${request.body.group_id} modificado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                     }
//                 }
//                 else{
//                     respuesta={error:true, type:-3, message: `grupo con id ${request.body.group_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta)
//         })
//     }else{
//         respuesta={error:true, type:-4, message: `id del grupo no especificado`};
//         response.send(respuesta);
//     }
// })

// app.delete('/grupos',(request,response)=>{
//     let respuesta;
//     if(request.body.group_id!=null){
//         let params=[request.body.group_id];
//         let sql=`DELETE FROM micronutrient_groups WHERE group_id=?`;
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 respuesta={error:true, type:0, message:err};
//             }
//             else{
//                 if(res.affectedRows>0){
//                     respuesta={error:false, type:1, message:` grupo con id ${request.body.group_id} eliminado correctamente`};
//                 }
//                 else{
//                     respuesta={error:true, type:-1, message:` grupo con id ${request.body.group_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta);
//         })
//     }else{
//         respuesta={error:true, type:-2, message:` id de grupo no especificado`};
//         response.send(respuesta);
//     }
// })






// ////// TABLA CHALLENGE


// app.get('/challenge',(request,response)=>{
//     console.log('holii')
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.challenge_id!=null){
//         params=[request.query.challenge_id]
//         sql=`SELECT * FROM challenge  WHERE challenge_id=?`
//     }else{
//         sql=`SELECT * FROM challenge`
//     }
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 if(request.query.challenge_id!=null){
//                     respuesta={error:true, code:200, type:-1, message: `No existe un challenge con id ${request.query.challenge_id}`};
//                 }else{
//                     respuesta={error:true, code:200, type:-2, message: `No hay challenge en la base de datos`};
//                 }
//             }
//         }
//         response.send(respuesta)
//     })
// })


// app.post('/challenge',(request,response)=>{
//     let respuesta;
//     let params=[request.body.name, request.body.ingredient_id, request.body.grams];
//     let sql=`INSERT INTO challenge (name,ingredient_id, grmas) VALUES (?,?,?)`;
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, type:0, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, type:1, message: `challenge añadido correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, type:2, message: `El challenge no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })

// app.put('/challenge',(request,response)=>{
//     let respuesta;
//     if(request.body.challenge_id!=null){
//         let name=request.body.name;
//         if(request.body.name.length==0){ name=null }
//         let params=[name,request.body.ingredient_id,request.body.grams]

//         let sql=`UPDATE challenge SET name=COALESCE(?,name), ingredient_id=COALESCE(?,ingredient_id), grams=COALESCE(?,grams), WHERE challenge_id=?`
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 if (err.errno==1452){
//                     respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
//                 }else  if (err.errno==1366){
//                     respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//                 }else{
//                     respuesta={error:true, type:0, message: err};
//                 }
//             }
//             else{
//                 if(res.affectedRows>0){
//                     if(res.changedRows>0){
//                         respuesta={error:false, type:1, message: `challenge con id ${request.body.challenge_id} modificado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                     }
//                 }
//                 else{
//                     respuesta={error:true, type:-3, message: `challenge con id ${request.body.challenge_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta)
//         })
//     }else{
//         respuesta={error:true, type:-4, message: `id del challenge no especificado`};
//         response.send(respuesta);
//     }
// })

// app.delete('/challenge',(request,response)=>{
//     let respuesta;
//     if(request.body.challenge_id!=null){
//         let params=[request.body.challenge_id];
//         let sql=`DELETE FROM challenge WHERE challenge_id=?`;
//         connection.query(sql,params,(err,res)=>{
//             if (err){   
//                 respuesta={error:true, type:0, message:err};
//             }
//             else{
//                 if(res.affectedRows>0){
//                     respuesta={error:false, type:1, message: `challenge con id ${request.body.challenge_id} eliminado correctamente`};
//                 }
//                 else{
//                     respuesta={error:true, type:-1, message: `challenge con id ${request.body.challenge_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta);
//         })
//     }else{
//         respuesta={error:true, type:-2, message: `id de challenge no especificado`};
//         response.send(respuesta);
//     }
// })



// ////   TABLA ALLERGENS ////


// app.get('/alergeno',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.allergen_id!=null){
//         params=[request.query.allergen_id]
//         sql=`SELECT * FROM allergens 
//             WHERE allergen_id=?`
//     }else{
//         sql=`SELECT * FROM allergens`
//     }
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 if(request.query.disco_id!=null){
//                     respuesta={error:true, code:200, type:-1, message: `No existe alergeno con id ${request.query.allergen_id}`};
//                 }else{
//                     respuesta={error:true, code:200, type:-2, message: `No hay alergenos en la base de datos`};
//                 }
//             }
//         }
//         response.send(respuesta)
//     })
// })





// app.get('/alergeno/ingredientes',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.allergen_id!=null){
//         params=[request.query.allergen_id]
//         sql=`SELECT allergens.allergen_name, ingredients.ingredient_name FROM allergens 
//             JOIN allergen_ingredient ON allergen_ingredient.allergen_id=allergen.allergen_id
//             JOIN ingredients ON ingredient.ingredient_id=allergen_ingredient-ingredient_id
//             WHERE allergens.allergen_id=?`
//     }else{
//         sql=`SELECT * FROM allergens`
//     }
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 if(request.query.allergen_id!=null){
//                     respuesta={error:true, code:200, type:-1, message: `No existe alergeno con id ${request.query.allergen_id}`};
//                 }else{
//                     respuesta={error:true, code:200, type:-2, message: `No hay alergenos en la base de datos`};
//                 }
//             }
//         }
//         response.send(respuesta)
//     })
// })



// app.post('/alergeno',(request,response)=>{
//     let respuesta;
//     let params=[request.body.allergen_name];
//     let sql=`INSERT INTO allergens (allergen_name) VALUES (?)`;
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, type:0, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, type:1, message: `alergeno añadido correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, type:2, message: `El alergeno no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })


// app.post('/alergeno/ingredientes',(request,response)=>{
//     let respuesta;
//     let params=[request.body.allergen_id, request.body.ingredient_id];
//     let sql=`INSERT INTO allergen_ingredient (allergen_id,ingredient_id) VALUES (?,?)`;
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, type:0, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
   
//                 respuesta={error:false, type:1, message: `ingrediente añadido correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, type:2, message: `El ingrediente no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })
 






// app.put('/alergeno',(request,response)=>{
//     let respuesta;
//     if(request.body.allergen_id!=null){
//         let name=request.body.name;
//         if(request.body.name.length==0){ name=null }
//         let params=[name,request.body.allergen_id]

//         let sql=`UPDATE allergens SET name=COALESCE(?,name)  WHERE allergen_id=?`
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 if (err.errno==1452){
//                     respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
//                 }else  if (err.errno==1366){
//                     respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//                 }else{
//                     respuesta={error:true, type:0, message: err};
//                 }
//             }
//             else{
//                 if(res.affectedRows>0){
//                     if(res.changedRows>0){
//                         respuesta={error:false, type:1, message: `alergeno con id ${request.body.allergen_id} modificado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                     }
//                 }
//                 else{
//                     respuesta={error:true, type:-3, message: `alergeno con id ${request.body.allergen_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta)
//         })
//     }else{
//         respuesta={error:true, type:-4, message: `id del alergeno no especificado`};
//         response.send(respuesta);
//     }
// })




// app.delete('/alergeno',(request,response)=>{
//     let respuesta;
//     if(request.body.allergen_id!=null){
//         let params=[request.body.allergen_id];
//         let sql=`DELETE FROM allergens WHERE allergen_id=?`;
//         connection.query(sql,params,(err,res)=>{
//             if (err){   
//                 respuesta={error:true, type:0, message:err};
//             }
//             else{
//                 if(res.affectedRows>0){
//                     respuesta={error:false, type:1, message: `allergen con id ${request.body.allergen_id} eliminado correctamente`};
//                 }
//                 else{
//                     respuesta={error:true, type:-1, message: `allergen con id ${request.body.allergen_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta);
//         })
//     }else{
//         respuesta={error:true, type:-2, message: `id de allergen no especificado`};
//         response.send(respuesta);
//     }
// })






// //  favoritos  //





// app.post('/favoritos',(request,response)=>{
//     let respuesta;
//     let params=[request.body.name,request.body.password,request.body.email];
//     let sql=`INSERT INTO favourites (name, password, email) VALUES (?,??)`;
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             if (err.errno==1048){
//                 respuesta={error:true, type:-2, message:'faltan campos por rellenar'}
//             }else  if (err.errno==1366){
//                 respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//             }else{
//                 respuesta={error:true, type:0, message: err};
//             }
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, type:1, message: `Disco añadido correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, type:2, message: `El disco no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })




// app.put('/favorito',(request,response)=>{
//     let respuesta;
//     if(request.body.favourite_id!=null){
//         let name=request.body.name;
//         let password=request.body.password;
//         let email=request.body.email;
//         if(request.body.name.length==0){ name=null }
//         if(request.body.password.length==0){ password=null }
//         if(request.body.email.length==0){ email=null }
//         let params=[name,password,email,request.body.favourite_id]

//         let sql=`UPDATE favourites SET name=COALESCE(?,name), password=COALESCE(?,password), email=COALESCE(?,email) WHERE favourite_id=?`
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 if (err.errno==1452){
//                     respuesta={error:true, type:-2, message:'el id especificado para uno de los campos no existe'}
//                 }else  if (err.errno==1366){
//                     respuesta={error:true, type:-1, message:`el valor introducido para uno de los campos no es correcto`, detalle: err.sqlMessage}
//                 }else{
//                     respuesta={error:true, type:0, message: err};
//                 }
//             }
//             else{
//                 if(res.affectedRows>0){
//                     if(res.changedRows>0){
//                         respuesta={error:false, type:1, message: `favorito con id ${request.body.favourite_id} modificado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                     }
//                 }
//                 else{
//                     respuesta={error:true, type:-3, message: `favorito con id ${request.body.favourite_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta)
//         })
//     }else{
//         respuesta={error:true, type:-4, message: `id del favorito no especificado`};
//         response.send(respuesta);
//     }
// })




// app.delete('/favorito',(request,response)=>{
//     let respuesta;
//     if(request.body.favourite_id!=null){
//         let params=[request.body.favourite_id];
//         let sql=`DELETE FROM favourites WHERE favourite_id=?`;
//         connection.query(sql,params,(err,res)=>{
//             if (err){   
//                 respuesta={error:true, type:0, message:err};
//             }
//             else{
//                 if(res.affectedRows>0){
//                     respuesta={error:false, type:1, message: `favourite con id ${request.body.favourite_id} eliminado correctamente`};
//                 }
//                 else{
//                     respuesta={error:true, type:-1, message: `favourite con id ${request.body.favourite_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta);
//         })
//     }else{
//         respuesta={error:true, type:-2, message: `id de favourite no especificado`};
//         response.send(respuesta);
//     }
// })






