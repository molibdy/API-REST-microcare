
const cors=require('cors');
const defaultC=require('./controller/default')
const recetas=require('./controller/recetas').recetas




function route(app) {

	app.use(cors());

	app.get('/', defaultC.index);
	
	///RECETAS
    app.route('/recetas').get(recetas.get)
    app.route('/recetas/ricas').get(recetas.getRecetasRichIn)

}

exports.route = route;


