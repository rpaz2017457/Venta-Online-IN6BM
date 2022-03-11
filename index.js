const mongoose = require('mongoose');
const app = require('./app');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ControlEmpresas', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    
    console.log("CONECTADO CORRECTAMENTE CON LA BASE DE DATOS");

    app.listen(3000, function (){
      console.log("EL PROGRAMA ESTA CORRIENDO EN EL PUERTO 3000");
    });

  }).catch((err) => console.log(err));