

function managePromise(promiseFn,response){
    let respuesta;
    promiseFn.then(res=>{
        if(res.length>0){
            respuesta={error:false, type:1, message: res};
        }else{
            respuesta={error:false, type:-1, message: res};
        } 
        response.send(respuesta)
    }).catch(err=>{
        respuesta={error:true, type:0, message: err};
        response.send(respuesta)
    })
}


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


exports.utils={
    managePromise:managePromise,
    whereCondition:whereCondition
}