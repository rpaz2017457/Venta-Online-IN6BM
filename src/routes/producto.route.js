const express = require("express");
const productoControlador = require("../controllers/producto.controller");
const md_authenticacion = require("../middlewares/authentication");

var api = express.Router();

api.post(
  "/agregarProducto",
  md_authenticacion.Authentication,
  productoControlador.agregarProducto
);
api.put(
  "/editarProducto/:idProducto",
  md_authenticacion.Authentication,
  productoControlador.editarProducto
);
api.delete(
  "/eliminarProducto/:idProducto",
  md_authenticacion.Authentication,
  productoControlador.eliminarProducto
);
api.get(
  "buscarPorCategoria",
  md_authenticacion.Authentication,
  productoControlador.buscarPorCategoria
);
api.get(
  "/buscarPorNombre",
  md_authenticacion.Authentication,
  productoControlador.buscarPorNombre
);
api.get(
  "/verProductos",
  md_authenticacion.Authentication,
  productoControlador.verProducto
);
api.put(
  "/editarStock/:idProducto",
  md_authenticacion.Authentication,
  productoControlador.editarStock
);
api.get(
  "/verStock",
  md_authenticacion.Authentication,
  productoControlador.verStock
);

module.exports = api;
