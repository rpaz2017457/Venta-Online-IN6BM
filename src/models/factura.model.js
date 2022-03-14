const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
  nit: String,
  idUsuario: { type: Schema.Types.ObjectId, ref: "Usuarios" },
  listaCompra: [
    {
      nombreProducto: String,
      cantidadF: Number,
      precioU: Number,
      subTotal: Number,
    },
  ],
  total: Number,
});

module.exports = mongoose.model("Facturas", FacturaSchema);
