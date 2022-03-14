const mongoose = require("mongoose");
const app = require("./app");
const usuariosControlador = require("./src/controllers/usuario.controller");

mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/VentaOnlineIN6BM", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("CONECTADO CORRECTAMENTE CON LA BASE DE DATOS");

    app.listen(3000, function () {
      console.log("EL PROGRAMA ESTA CORRIENDO EN EL PUERTO 3000");
    });
    usuariosControlador.agregarAlUsuarioInicial();
  })
  .catch((err) => console.log(err));
