const Usuario = require("../models/usuario.model");
const Factura = require("../models/factura.model");
const Producto = require("../models/producto.model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

// REGISTRAR POR DEFAULT
function agregarAlUsuarioInicial() {
  var usuarioModel = new Usuario();

  usuarioModel.nombre = "Administrador";
  usuarioModel.usuario = "ADMIN";
  usuarioModel.rol = "ROL_ADMIN";

  Usuario.find({ usuario: "ADMIN" }, (err, usuarioEncontrado) => {
    if (usuarioEncontrado.length == 0) {
      bcrypt.hash("123456", null, null, (err, paswordEncriptada) => {
        usuarioModel.password = paswordEncriptada;
      });
      usuarioModel.save();
    } else {
      console.log("EL USUARIO POR DEFECTO YA ESTA REGISTRADO");
    }
  });
}

//LOGEARSE
function login(req, res) {
  var parametros = req.body;

  Usuario.findOne({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
    if (err)
      return res
        .status(500)
        .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });

    if (usuarioEncontrado) {
      bcrypt.compare(
        parametros.password,
        usuarioEncontrado.password,
        (err, verifyPassword) => {
          if (verifyPassword) {
            if (parametros.obtenerToken === "true") {
              return res
                .status(200)
                .send({ token: jwt.crearToken(usuarioEncontrado) });
            } else {
              usuarioEncontrado.carrito = undefined;
              usuarioEncontrado.password = undefined;
              Factura.find(
                { idUsuario: usuarioEncontrado._id },
                (err, facturasEncontradas) => {
                  return res.status(200).send({
                    usuario: usuarioEncontrado,
                    factura: facturasEncontradas,
                  });
                }
              );
            }
          } else {
            return res
              .status(500)
              .send({ message: "LA CONTRASENA NO COINCIDE" });
          }
        }
      );
    } else {
      return res.status(500).send({
        message: "ALGO SALIÓ MAL, EL USUARIO NO ESTA PREVIAMENTE REGISTRADO",
      });
    }
  });
}

//REGISTRAR CON ROL DE CLIENTE
function registrarCliente(req, res) {
  var parametros = req.body;
  var usuarioModel = new Usuarios();

  if (parametros.nombre && parametros.usuario && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.usuario = parametros.usuario;
    usuarioModel.rol = "ROL_CLIENTE";
    usuarioModel.totalCarrito = 0;

    Usuario.find({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length == 0) {
        bcrypt.hash(
          parametros.password,
          null,
          null,
          (err, passwordEncriptada) => {
            usuarioModel.password = passwordEncriptada;
          }
        );

        usuarioModel.save((err, usuarioGuardado) => {
          if (err)
            return res
              .status(500)
              .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
          if (!usuarioGuardado)
            return res
              .status(405)
              .send({
                message: "ALGO SALIO MAL AL INTENTAR REGISTRAR AL USUARIO",
              });
          return res.status(200).send({ usuario: usuarioGuardado });
        });
      } else {
        return res
          .status(500)
          .send({ message: "ESTE USUARIO YA ESTA REGISTRADO" });
      }
    });
  }
}

//AGREGAR UN USUARIO SIENDO ADMIN
function agregarUsuario(req, res) {
  var parametros = req.body;
  var verificacion = req.user.rol;
  var usuarioModel = new Usuario();

  if (verificacion == "ROL_ADMIN") {
    if (
      parametros.nombre &&
      parametros.usuario &&
      parametros.password &&
      parametros.rol
    ) {
      usuarioModel.nombre = parametros.nombre;
      usuarioModel.usuario = parametros.usuario;
      usuarioModel.rol = parametros.rol;

      Usuario.find(
        { usuario: parametros.usuario },
        (err, usuarioEncontrado) => {
          if (usuarioEncontrado.length == 0) {
            bcrypt.hash(
              parametros.password,
              null,
              null,
              (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;
              }
            );

            usuarioModel.save((err, usuarioGuardado) => {
              if (err)
                return res
                  .status(500)
                  .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
              if (!usuarioGuardado)
                return res
                  .status(500)
                  .send({
                    message:
                      "ALGO SALIO MAL AL INTENTAR AGREGAR UN USUARIO, INTENTELO DE NUEVO",
                  });
              return res.status(200).send({ usuario: usuarioGuardado });
            });
          } else {
            return res
              .status(404)
              .send({ message: "ESTE USUARIO YA ESTA CREADO" });
          }
        }
      );
    }
  } else {
    return res
      .status(500)
      .send({
        message: "NO SE TIENEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD",
      });
  }
}

//EDITAR USUARIO
function editarUsuario(req, res) {
  var parametros = req.body;
  var verificacion = req.user.rol;
  let idUsuario;

  if (verificacion == "ROL_CLIENTE") {
    idUsuario = req.user.sub;
  } else if (verificacion == "ROL_ADMIN") {
    if (req.params.idUsuario == null) {
      return res
        .status(404)
        .send({
          message: "ALGO SALIO MAL, PORFAVOR INGRESE EL ID DEL USUARIO",
        });
    }
    idUsuario = req.params.idUsuario;
  }

  Usuario.findById(idUsuario, (err, usuarioEncontrado) => {
    if (verificacion != "ROL_ADMIN" && parametros.rol) {
      return res
        .status(500)
        .send({
          message: "NO SE TIENEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD",
        });
    }
    if (usuarioEncontrado == null) {
      return res
        .status(500)
        .send({
          message: "HA OCURRIDO UN ERROR, NO SE HA PODIDO ENCONTRAR AL USUARIO",
        });
    }

    if (usuarioEncontrado.rol == "ROL_ADMIN")
      return res
        .status(500)
        .send({
          message: "ERROR, NO SE PUEDEN EDITAR LOS VALORES DEL ADMINISTRADOR",
        });
    if (usuarioEncontrado.rol == "ROL_CLIENTE" && parametros.rol != "ROL_ADMIN")
      return res
        .status(500)
        .send({ message: "ALGO SALIO MAL, EL ROL NO ES VALIDO" });

    if (err)
      return res
        .status(500)
        .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
    if (!usuarioEncontrado)
      return res
        .status(500)
        .send({ message: "ALGO SALIO MAL, AL INTENTAR ENCONTRAR EL USUARIO" });

    Usuario.findByIdAndUpdate(
      idUsuario,
      parametros,
      { new: true },
      (err, usuarioU) => {
        if (err)
          return res
            .status(500)
            .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
        if (!usuarioU)
          return res
            .status(500)
            .send({ message: "ALGO SALIO MAL, AL INTENTAR EDITAR EL USUARIO" });
        return res.status(200).send({ usuario: usuarioU });
      }
    );
  });
}

//ELIMINAR UN USUARIO
function eliminarUsuario(req, res) {
  let idUsuario;
  var verificacion = req.user.rol;

  if (verificacion == "ROL_CLIENTE") {
    idUsuario = req.user.sub;
  } else if (verificacion == "ROL_ADMIN") {
    if (req.params.idUsuario == null) {
      return res
        .status(500)
        .send({
          message: "ALGO SALIO MAL, PORFAVOR INGRESE EL ID DEL USUARIO",
        });
    }
    idUsuario = req.params.idUsuario;
  }

  Usuario.findById(idUsuario, (err, usuarioEncontrado) => {
    if (usuarioEncontrado == null) {
      return res
        .status(500)
        .send({
          message: "HA OCURRIDO UN ERROR, NO SE HA PODIDO ENCONTRAR AL USUARIO",
        });
    }

    if (usuarioEncontrado.rol == "ROL_ADMIN")
      return res
        .status(500)
        .send({
          message: "ERROR, NO SE PUEDEN ELIMINAR LOS VALORES DEL ADMINISTRADOR",
        });

    if (err)
      return res
        .status(500)
        .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
    if (!usuarioEncontrado)
      return res
        .status(500)
        .send({ message: "ALGO SALIO MAL, AL INTENTAR ENCONTRAR EL USUARIO" });

    Usuario.findByIdAndDelete(idUsuario, (err, usuarioE) => {
      if (err)
        return res
          .status(500)
          .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
      if (!usuarioE)
        return res
          .status(500)
          .send({ message: "ALGO SALIO MAL, AL INTENTAR EDITAR EL USUARIO" });
      return res.status(200).send({ usuario: usuarioE });
    });
  });
}

function mostrarFactura(req, res) {
  Facturas.find({ idUsuario: req.user.sub }, (err, facturasEncontradas) => {
    if (err)
      return res
        .status(500)
        .send({
          message: "Error en la peticion, no existen facturas del cliente",
        });
    if (!facturasEncontradas || facturasEncontradas.length == 0)
      return res.status(500).send({ message: "El cliente no posee facturas." });
    return res.status(200).send({ facturas: facturasEncontradas });
  }).populate("idUsuario", "nombre");
}

function agregarProductoCr(req, res) {
  const usuarioLogeado = req.user.sub;
  const parametros = req.body;

  Producto.findOne(
    { nombreProducto: parametros.nombreProducto },
    (err, productoEnc) => {
      if (err)
        return res
          .status(500)
          .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
      if (!productoEnc)
        return res
          .status(404)
          .send({ message: "ALGO SALIO MAL AL INTENTAR OBTENER EL PRODUCTO" });

      Usuario.findOne(
        {
          _id: usuarioLogeado,
          carrito: {
            $elemMatch: { nombreProducto: parametros.nombreProducto },
          },
        },
        (err, usuarioEnc) => {
          if (usuarioEnc == null || !usuarioEnc) {
            if (parametros.cantidad > productoEnc.stock)
              return res
                .status(500)
                .send({ message: "LA CANTIDAD A AGREGAR EXCEDE AL STOCK" });
            if (parametros.cantidad <= 0)
              return res
                .status(500)
                .send({ message: "LA CANTIDAD TIENE QUE SER MAYOR A 0" });
            let subtotalProducto = parametros.cantidad * productoEnc.precio;
            Usuario.findByIdAndUpdate(
              usuarioLogeado,
              {
                $push: {
                  carrito: {
                    nombreProducto: parametros.nombreProducto,
                    cantidadComprada: parametros.cantidad,
                    precioUnitario: productoEnc.precio,
                    subTotal: subtotalProducto,
                  },
                },
              },
              { new: true },
              (err, usuarioU) => {
                if (err)
                  return res
                    .status(500)
                    .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
                if (!usuarioU)
                  return res
                    .status(500)
                    .send({
                      message: "ALGO SALIO MAL AL INTENTAR AGREGAR AL CARRITO",
                    });

                let totalCarritoLocal = 0;
                for (let i = 0; i < usuarioU.carrito.length; i++) {
                  totalCarritoLocal += usuarioU.carrito[i].subTotal;
                }
                Usuario.findByIdAndUpdate(
                  usuarioLogeado,
                  { totalCarrito: totalCarritoLocal },
                  { new: true },
                  (err, totalU) => {
                    if (err)
                      return res
                        .status(500)
                        .send({ message: "ERROR EN LA SOLICITUD DEL CARRITO" });
                    if (!totalU)
                      return res
                        .status(500)
                        .send({
                          message:
                            "ALGO SALIO MAL AL INTENTAR MODIFICAR EL CARRITO",
                        });

                    return res.status(200).send({ carrito: totalU });
                  }
                );
              }
            );
          } else {
            let cantidadCl = 0;
            for (let i = 0; i < usuarioEnc.carrito.length; i++) {
              if (
                usuarioEnc.carrito[i].nombreProducto ==
                parametros.nombreProducto
              ) {
                cantidadCl =
                  usuarioEnc.carrito[i].cantidadComprada +
                  parseInt(parametros.cantidad);
              }
            }

            if (cantidadCl > productoEnc.cantidad)
              return res
                .status(500)
                .send({ message: "LA CANTIDAD A AGREGAR EXCEDE AL STOCK" });
            if (parametros.cantidad <= 0)
              return res
                .status(500)
                .send({ message: "LA CANTIDAD TIENE QUE SER MAYOR A 0" });

            let subtotalProducto = parametros.cantidad * productoEnc.precio;
            Usuario.findOneAndUpdate(
              {
                _id: usuarioLogeado,
                carrito: {
                  $elemMatch: { nombreProducto: parametros.nombreProducto },
                },
              },
              {
                $inc: {
                  "carrito.$.cantidadComprada": parametros.cantidad,
                  "carrito.$.subTotal": subtotalProducto,
                },
              },
              { new: true },
              (err, productoU) => {
                if (productoU == null) {
                  return res
                    .status(500)
                    .send({ message: "EL PRODUCTO NO SE HA PODIDO ENCONTRAR" });
                }

                let totalCarritoLocal = 0;

                for (let i = 0; i < productoU.carrito.length; i++) {
                  totalCarritoLocal += productoU.carrito[i].subTotal;
                }

                Usuario.findByIdAndUpdate(
                  usuarioLogeado,
                  { totalCarrito: totalCarritoLocal },
                  { new: true },
                  (err, totalU) => {
                    if (err)
                      return res
                        .status(500)
                        .send({ message: "ERROR EN LA SOLICITUD DEL CARRITO" });
                    if (!totalU)
                      return res
                        .status(500)
                        .send({
                          message:
                            "ALGO SALIO MAL AL INTENTAR MODIFICAR EL CARRITO",
                        });
                    return res.status(200).send({ carrito: totalU });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
}

function eliminarProductoCr(req, res) {
  const usuarioLogeado = req.user.sub;
  const parametros = req.body;

  Producto.findOne(
    { nombreProducto: parametros.nombreProducto },
    (err, productoEnc) => {
      if (err)
        return res
          .status(500)
          .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
      if (!productoEnc)
        return res
          .status(404)
          .send({ message: "ALGO SALIO MAL AL INTENTAR OBTENER EL PRODUCTO" });

      Usuario.findOne(
        {
          _id: usuarioLogeado,
          carrito: {
            $elemMatch: { nombreProducto: parametros.nombreProducto },
          },
        },
        (err, usuarioEnc) => {
          if (usuarioEnc == null || !usuarioEnc)
            return res
              .status(404)
              .send({
                message: "NO SE HA PODIDO ENCONTRAR EL PRODUCTO EN EL CARRITO",
              });
          if (err)
            return res
              .status(500)
              .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });

          let cantidadCl = 0;

          for (let i = 0; i < usuarioEnc.carrito.length; i++) {
            if (
              usuarioEnc.carrito[i].nombreProducto == parametros.nombreProducto
            ) {
              cantidadCl = usuarioEnc.carrito[i].cantidadComprada;
            }
          }
          if (parseInt(parametros.cantidad) > cantidadCl)
            return res
              .status(500)
              .send({
                message:
                  "LA CANTIDAD A QUITAR ES MAYOR A LA DEL CARRITO, INTENTELO DE NUEVO",
              });

          if (
            parseInt(parametros.cantidad) == cantidadCl ||
            parametros.cantidad == "Todos los Productos"
          ) {
            Usuario.findByIdAndUpdate(
              usuarioLogeado,
              {
                $pull: {
                  carrito: { nombreProducto: parametros.nombreProducto },
                },
              },
              { new: true },
              (err, productoE) => {
                if (err)
                  return res
                    .status(500)
                    .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
                if (!productoE)
                  return res
                    .status(404)
                    .send({
                      message: "ALGO SALIO MAL AL INTENTAR OBTENER EL PRODUCTO",
                    });

                let totalCarritoLocal = 0;

                for (let i = 0; i < productoE.carrito.length; i++) {
                  totalCarritoLocal += productoE.carrito[i].subTotal;
                }

                Usuario.findByIdAndUpdate(
                  usuarioLogeado,
                  { totalCarrito: totalCarritoLocal },
                  { new: true },
                  (err, totalU) => {
                    if (err)
                      return res
                        .status(500)
                        .send({
                          message: "HA OCURRIDO UN ERROR EN LA SOLICITUD",
                        });
                    if (!totalU)
                      return res
                        .status(500)
                        .send({
                          message:
                            "ALGO SALIO MAL AL INTENTAR MODIFICAR EL TOTAL DEL CARRITO",
                        });

                    return res.status(200).send({ carrito: totalU });
                  }
                );
              }
            );
          }

          if (parseInt(parametros.cantidad) != cantidadCl) {
            let subtotalProducto =
              (cantidadCl - parametros.cantidad) * productoEnc.precio;

            Usuario.findOneAndUpdate(
              {
                _id: usuarioLogeado,
                carrito: {
                  $elemMatch: { nombreProducto: parametros.nombreProducto },
                },
              },
              {
                "carrito.$.subTotal": subtotalProducto,
                $inc: {
                  "carrito.$.cantidadComprada": parametros.cantidad * -1,
                },
              },
              { new: true },
              (err, productoEditado) => {
                let totalCarritoLocal = 0;

                for (let i = 0; i < productoEditado.carrito.length; i++) {
                  totalCarritoLocal += productoEditado.carrito[i].subTotal;
                }

                Usuario.findByIdAndUpdate(
                  usuarioLogeado,
                  { totalCarrito: totalCarritoLocal },
                  { new: true },
                  (err, totalU) => {
                    if (err)
                      return res
                        .status(500)
                        .send({
                          message: "HA OCURRIDO UN ERROR EN LA SOLICITUD",
                        });
                    if (!totalU)
                      return res
                        .status(500)
                        .send({
                          message:
                            "ALGO SALIO MAL AL INTENTAR MODIFICAR EL TOTAL DEL CARRITO",
                        });

                    return res.status(200).send({ carrito: totalU });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
}

module.exports = {
  agregarAlUsuarioInicial,
  login,
  registrarCliente,
  agregarUsuario,
  editarUsuario,
  eliminarUsuario,
  agregarProductoCr,
  eliminarProductoCr,
};
