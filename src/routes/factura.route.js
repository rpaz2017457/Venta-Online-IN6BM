const express = require("express");
const facturasControlador = require("../controllers/factura.controller");
const md_authenticacion = require("../middlewares/authentication");

var api = express.Router();

api.post(
  "/crearFactura",
  md_authenticacion.Authentication,
  facturasControlador.crearFactura
);
api.get(
  "/verFacturasAdmin",
  md_authenticacion.Authentication,
  facturasControlador.verFacturasUsuario
);
api.get(
  "/verFacturasCliente",
  md_authenticacion.Authentication,
  facturasControlador.verFacturasCl
);
api.get(
  "/verAgotados",
  md_authenticacion.Authentication,
  facturasControlador.verAgotados
);
api.get(
  "/verMasVendidos",
  md_authenticacion.Authentication,
  facturasControlador.verProductosMasVendidos
);
api.get(
  "/verProductosFactura",
  md_authenticacion.Authentication,
  facturasControlador.verProductosFactura
);

module.exports = api;
