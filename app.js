const express = require("express");
const cors = require("cors");
var app = express();

const RutasUsuario = require("./src/routes/usuario.route");
const RutasProducto = require("./src/routes/producto.route");
const RutasCategoria = require("./src/routes/categoria.route");
const RutasFactura = require("./src/routes/factura.route");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

app.use("/api", RutasUsuario, RutasProducto, RutasCategoria, RutasFactura);

module.exports = app;
