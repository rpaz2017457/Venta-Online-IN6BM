const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
  nombreProducto: String,
  precio: Number,
  cantidad: Number,
  vendidos: Number,
  idCategoria: { type: Schema.Types.ObjectId, ref: "Categorias" },
});

module.exports = mongoose.model("Productos", ProductoSchema);
