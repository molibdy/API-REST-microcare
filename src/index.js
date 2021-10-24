const port=require('./common/config').config.port
const express=require ('express');
const router=require('./router');

const app= new express()
app.use(express.urlencoded({extended:false,limit: '50mb'}));
app.use(express.json({limit: '50mb'}))


app.listen(port,()=>{
    console.log("Servicio iniciado en puerto "+ port);
})

router.route(app)