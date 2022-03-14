const express = require("express");
const usuariosControlador = require("../controllers/usuario.controller");
const md_authenticacion = require("../middlewares/authentication");

var api = express.Router();

api.post("/login", md_authenticacion.Authentication, usuariosControlador.login);
api.post(
  "/registrarCliente",
  md_authenticacion.Authentication,
  usuariosControlador.registrarCliente
);
api.post(
  "/agregarUsuario",
  md_authenticacion.Authentication,
  usuariosControlador.agregarUsuario
);
api.put(
  "/editarUsuario/:idUsuario",
  md_authenticacion.Authentication,
  usuariosControlador.editarUsuario
);
api.delete(
  "/eliminarUsuario/:idUsuario",
  md_authenticacion.agregarUsuario,
  usuariosControlador.eliminarUsuario
);
api.put(
  "/agregarProductoCarrito",
  md_authenticacion.Authentication,
  usuariosControlador.agregarProductoCr
);
api.put(
  "/eliminarProductoCarrito",
  md_authenticacion.Authentication,
  usuariosControlador.eliminarProductoCr
);

module.exports = api;
