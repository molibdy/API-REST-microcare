
const db=require('../common/dbaccess').db.connection


function whereCondition(filters){
    let params=[]
    let additionalWhere=''
    if(filters!=undefined){
        additionalWhere=' where 1=1'
        for(key in filters){
            additionalWhere+=' and ' + key + '=?'
            params.push(filters[key])
        }
    }
    return {sqlWhere:additionalWhere, params:params}
}

///// RECETAS
function selectRecetas(filters){
    return new Promise((resolve,reject)=>{
        let conditions=whereCondition(filters)
        db.query('SELECT * FROM recipes'+conditions.sqlWhere,conditions.params,(err,result)=>{
            if (err){
                console.log('Hola error');
                reject(err)
            }
            else{
                console.log('hola no error');
                resolve(result)
            }
        })
    })
}
// ///Sacar las recetas ricas en x micronutriente
// app.get('/recetas/ricas',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.micronutrient_id!=null){
//         params=[request.query.micronutrient_id]
//         sql=`SELECT recipe_ingredient.recipe_id AS recipe_id, 
//         ingredient_micronutrient.micronutrient_id AS micronutrient_id, 

//         SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
//         FROM ingredient_micronutrient
//         JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id

//         WHERE micronutrient_id=?
//         GROUP BY recipe_id, micronutrient_id
//         ORDER BY percent DESC
//         LIMIT 6`
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
//                     respuesta={error:true, code:200, type:-1, message: `No existe receta con id ${request.query.recipe_id}`};
//                 }else{
//                     respuesta={error:true, code:200, type:-2, message: res};
//                 }
               
//             } response.send(respuesta)
//         }
//     })
// })

// app.get('/recetas/detalles',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
//     if(request.query.recipe_id!=null){
//         params=[request.query.recipe_id]
//         sql=`SELECT recipe_ingredient.recipe_id, recipe_ingredient.total_grams, recipe_ingredient.amount,
// 		recipe_ingredient.ingredient_id, ingredients.ingredient_name, diet_name, allergen_name FROM recipe_ingredient 
//         JOIN ingredients ON ingredients.ingredient_id=recipe_ingredient.ingredient_id
//         LEFT JOIN diet_recipe ON diet_recipe.recipe_id=recipe_ingredient.recipe_id
//         LEFT JOIN diets ON diet_recipe.diet_id=diets.diet_id
//         LEFT JOIN allergen_ingredient ON allergen_ingredient.ingredient_id=recipe_ingredient.ingredient_id
//         LEFT JOIN allergens ON allergens.allergen_id=allergen_ingredient.allergen_id
//         WHERE recipe_ingredient.recipe_id=?`
//         console.log('detalles con id')
//     }else{
//         sql=`SELECT recipe_ingredient.recipe_id, recipe_ingredient.total_grams, recipe_ingredient.amount,
// 		recipe_ingredient.ingredient_id, ingredients.ingredient_name, diet_name FROM recipe_ingredient 
//         JOIN ingredients ON ingredients.ingredient_id=recipe_ingredient.ingredient_id
//         LEFT JOIN diet_recipe ON diet_recipe.recipe_id=recipe_ingredient.recipe_id
//         LEFT JOIN diets ON diet_recipe.diet_id=diets.diet_id
//         ORDER BY recipe_id`
//     }
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{console.log('getting detalles')
//             if(res.length>0){
//                 respuesta={error:false, code:200, type:1, message: res};
//             }else{
//                 respuesta={error:false, code:200, type:-1, message: res};  
//             } 
//         }
//         response.send(respuesta)
      
//     })
// })


// app.get('/recetas/parati',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
   
//         params=[request.query.user_id, request.query.user_id, request.query.user_id, request.query.user_id]
//         sql=`SELECT DISTINCT recetas.recipe_id 
//         FROM (
//             SELECT recipe_ingredient.recipe_id AS recipe_id, ingredient_micronutrient.micronutrient_id as micronutrient_id,
//             SUM(ingredient_micronutrient.micronutrient_percent*recipe_ingredient.grams_serving/ingredient_micronutrient.grams) AS percent
//             FROM ingredient_micronutrient
//             JOIN recipe_ingredient ON recipe_ingredient.ingredient_id=ingredient_micronutrient.ingredient_id
//             WHERE recipe_id NOT IN(
// 				SELECT recipe_id FROM recipe_ingredient
// 				WHERE ingredient_id IN (
// 					SELECT * FROM (
// 						SELECT ingredient_id FROM avoid_ingredients
// 						WHERE user_id=?
// 					) AS avoid_these
// 				) OR ingredient_id IN (
// 					 SELECT * FROM (
// 						SELECT ingredient_id FROM diet_ingredient
// 						JOIN user_diet ON user_diet.diet_id=diet_ingredient.diet_id
// 						WHERE user_id=?
// 					) AS avoid_diets
// 				) OR ingredient_id IN (
// 					 SELECT * FROM (
// 						SELECT ingredient_id FROM allergen_ingredient
// 						JOIN user_allergen ON user_allergen.allergen_id=allergen_ingredient.allergen_id
// 						WHERE user_id=?
// 					) AS avoid_allergens
// 				)
// 			)
//             AND micronutrient_id IN (
//                 SELECT * FROM (
//                     SELECT progress.micronutrient_id FROM progress
//                     WHERE progress.user_id=?
//                     ORDER BY progress.date DESC, progress.percent ASC
//                     LIMIT 10) AS lowest_progress
//                 )    
//             GROUP BY recipe_id, micronutrient_id
//             ORDER BY percent DESC
//             LIMIT 10
//             ) AS recetas`

//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//             console.log(err)
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 respuesta={error:true, code:200, type:-1, message: res};
               
//             } 
//         }
//         response.send(respuesta)
        
//     })
// })


// app.get('/recetas/planeadas',(request,response)=>{
//     let respuesta;
//     let params;
//     let sql;
//         params=[request.query.user_id, request.query.date]
//         sql=`SELECT planned_recipes.planned_recipe_id, planned_recipes.date, planned_recipes.recipe_id, 
//         planned_recipes.isConsumed, recipes.recipe_name 
//         FROM planned_recipes
//         JOIN recipes ON recipes.recipe_id=planned_recipes.recipe_id
//         WHERE user_id=? AND date=?`

//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//             console.log(err)
//         }
//         else{
//             if(res.length>0){
//                 respuesta={error:true, code:200, type:1, message: res};
//             }else{
//                 respuesta={error:true, code:200, type:-1, message: res};
               
//             } 
//         }
//         response.send(respuesta)
        
//     })
// })



// app.post('/recetas/planeadas', (request,response) =>{

//     let respuesta;

//     let params=[request.body.user_id,request.body.date,request.body.recipe_id, request.body.isConsumed];
//     let sql='INSERT INTO planned_recipes (user_id,date,recipe_id,isConsumed) VALUES (?,?,?,?)';
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//             console.log('err de post recetas planeadas')
//             console.log(err)
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, code:200, type:1, message: res.insertId};
//             }
//             else{
//                 respuesta={error:true, code:200, message: `Receta no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })


// app.put('/recetas/planeadas',(request,response)=>{
//     let respuesta;
//     let params=[request.body.isConsumed,request.body.planned_recipe_id]
//     let sql="UPDATE planned_recipes SET isConsumed=?  WHERE planned_recipe_id=?"
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message: err};
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, type:1, message: res};
//             }else{
//                 respuesta={error:true, type:-1, message: `receta con id ${request.body.planned_recipe_id} no encontrado`};
//             }
//         }
//         response.send(respuesta)
//     })
// })

// app.delete('/recetas/planeadas',(request,response)=>{
//     let respuesta;
//     let params=[request.query.planned_recipe_id]
//     let sql="DELETE FROM planned_recipes WHERE planned_recipe_id=?"
//     connection.query(sql,params,(err,res)=>{
//         if (err){
//             respuesta={error:true, type:0, message:err};
//         }
//         else{
//             if(res.affectedRows>0){
//                 respuesta={error:false, type:1, message:` receta con id ${request.query.planned_recipe_id} eliminado correctamente`};
//             }
//             else{
//                 respuesta={error:true, type:-1, message:` receta con id ${request.query.planned_recipe_id} no encontrado`};
//             }
//         }
//         response.send(respuesta);
//     })
// })




// app.post('/recetas', (request,response) =>{

//     let respuesta;

//     let params=[request.body.recipe_name,request.body.instructions,request.body.photo_url, request.body.serves];
//     let sql='INSERT INTO recipes (recipe_name,instructions,photo_url,serves) VALUES (?,?,?,?)';
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
//                 respuesta={error:false, code:200, message: `Receta añadida correctamente con id ${res.insertId}`};
//             }
//             else{
//                 respuesta={error:true, code:200, message: `Receta no se ha podido añadir a la base de datos`};
//             }
//         }
//         response.send(respuesta)
//     })
// })



// app.put('/recetas',(request,response)=>{
//     let respuesta;
//     if(request.body.recipe_id!=null){
//         let name=request.body.recipe_name;
//         if(request.body.recipe_name.length==0){ name=null }
//         let params=[name,request.body.recipe_id]
//         let sql="UPDATE recipes SET recipe_name=COALESCE(?,recipe_name),  WHERE recipe_id=?"
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
//                         respuesta={error:false, type:1, message: `receta con id ${request.body.recipe_id} modificado correctamente`};
//                     }
//                     else{
//                         respuesta={error:true, type:2, message: `No se ha modificado ningún dato`};
//                     }
//                 }
//                 else{
//                     respuesta={error:true, type:-3, message: `receta con id ${request.body.recipe_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta)
//         })
//     }else{
//         respuesta={error:true, type:-4, message: `id del receta no especificado`};
//         response.send(respuesta);
//     }
// })

// app.delete('/recetas',(request,response)=>{
//     let respuesta;
//     if(request.body.recipe_id!=null){
//         let params=[request.body.recipe_id];
//         let sql=`DELETE FROM recipes WHERE recipe_id=?`;
//         connection.query(sql,params,(err,res)=>{
//             if (err){
//                 respuesta={error:true, type:0, message:err};
//             }
//             else{
//                 if(res.affectedRows>0){
//                     respuesta={error:false, type:1, message:` receta con id ${request.body.recipe_id} eliminado correctamente`};
//                 }
//                 else{
//                     respuesta={error:true, type:-1, message:` receta con id ${request.body.recipe_id} no encontrado`};
//                 }
//             }
//             response.send(respuesta);
//         })
//     }else{
//         respuesta={error:true, type:-2, message:` id de receta no especificado`};
//         response.send(respuesta);
//     }
// })


exports.recetasdb={
    selectRecetas:selectRecetas
}