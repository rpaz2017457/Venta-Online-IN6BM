const moment = require("moment");
const jwt_simple = require("jwt-simple");
const secret = 'clave_secreta_IN6BM2';

exports.Authentication = function (req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(404)
      .send({
        message: "ESTA PETICION, NO POSEE LA CABECERA DE AUTENTICACION",
      });
  }
  var token = req.headers.authorization.replace(/['"]+/g, '');

  try {
    var payload = jwt_simple.decode(token, secret);
    if (payload.exp <= moment().unix()) {
      return res.status(404).send({ message: "ESTE TOKEN YA HA EXPIRADO" });
    }
  } catch (error) {
    return res.status(500).send({ message: "ESTE TOKEN NO ES VALIDO" });
  }

  req.user = payload;
  next();
};