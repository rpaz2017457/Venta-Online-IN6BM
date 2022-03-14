const express = require("express");
const categoriaControlador = require("../controllers/categoria.controller");
const md_authenticacion = require("../middlewares/authentication");

var api = express.Router();

api.post(
  "/agregarCategoria",
  md_authenticacion.Authentication,
  categoriaControlador.agregarCategoria
);
api.put(
  "/editarCategoria/:idCategoria",
  md_authenticacion.Authentication,
  categoriaControlador.editarCategoria
);
api.delete(
  "/eliminarCategoria/:idCategoria",
  md_authenticacion.Authentication,
  categoriaControlador.eliminarCategoria
);
api.get(
  "verCategoria",
  md_authenticacion.Authentication,
  categoriaControlador.verCategoria
);

module.exports = api;
