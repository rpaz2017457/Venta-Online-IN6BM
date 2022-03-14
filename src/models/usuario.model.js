const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
  nombre: String,
  usuario: String,
  password: String,
  rol: String,
  carrito: [
    {
      nombreProducto: String,
      cantidad: Number,
      precioUnitario: Number,
      subTotal: Number,
    },
  ],
  totalCarrito: Number,
});

module.exports = mongoose.model("Usuarios", UsuarioSchema);
