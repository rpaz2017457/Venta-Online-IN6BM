const Producto = require("../models/producto.model");
const Categoria = require("../models/categoria.model");

//AGREGAR UNA CATEGORIA
function agregarCategoria(req, res) {
  var parametros = req.body;
  var verificacion = req.user.rol;
  var categoriaModel = new Categoria();

  if (verificacion != "ROL_ADMIN") {
    return res.status(500).send({
      message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD",
    });
  }

  if (parametros.categoria) {
    categoriaModel.categoria = parametros.categoria;

    Categoria.find(
      { categoria: parametros.categoria },
      (err, categoriaEncontrada) => {
        if (categoriaEncontrada.length == 0) {
          categoriaModel.save((err, categoriaGuardada) => {
            if (err)
              return res
                .status(500)
                .send({ message: "ALGO SALIO MAL, INTENTELO DE NUEVO" });
            if (!categoriaGuardada)
              return res.status(500).send({
                message: "OCURRIO UN ERROR AL INTENTAR AGREGAR LA CATEGORIA",
              });
            return res.status(200).send({ categoria: categoriaGuardada });
          });
        } else {
          return res.status(500).send({ message: "ESTA CATEGORIA YA EXISTE" });
        }
      }
    );
  } else {
    return res
      .status(404)
      .send({ message: "POR FAVOR, LLENE TODOS LOS CAMPOS NECESARIOS" });
  }
}

//EDITAR UNA CATEGORIA
function editarCategoria(req, res) {
  var parametros = req.body;
  var verificacion = req.user.rol;
  var idCategoria = req.params.idCategoria;

  if (verificacion != "ROL_ADMIN")
    return res.status(500).send({
      message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD",
    });

  Categoria.find(
    { categoria: parametros.categoria },
    (err, categoriaEncontrada) => {
      if (categoriaEncontrada.length == 0) {
        Categoria.findByIdAndUpdate(
          idCategoria,
          parametros,
          { new: true },
          (err, categoriaU) => {
            if (idCategoria == null)
              return res
                .status(500)
                .send({ message: "ALGO SALIO MAL, SE DEBE DAR UN ID" });

            if (err)
              return res
                .status(500)
                .send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!categoriaU)
              return res.status(500).send({
                message: "OCURRIO UN ERROR AL INTENTAR EDITAR LA CATEGORIA",
              });
            return res.status(200).send({ categoria: categoriaU });
          }
        );
      } else {
        return res.status(500).send({ message: "ESTA CATEGORIA YA EXISTE" });
      }
    }
  );
}

//ELIMINAR UNA CATEGORIA
function eliminarCategoria(req, res) {
  var idCategoria = req.params.idCategoria;
  var verificacion = req.user.rol;

  if (verificacion != "ROL_ADMIN")
    return res.status(500).send({
      mensaje:
        "ERROR, NO SE POSEEN PERMISOS SUFICIENTES PARA REALIZAR ESTA SOLICITUD",
    });

  Categoria.find({ nombreCategoria: "Default" }, (err, categoriaEnc) => {
    if (categoriaEnc.length == 0) {
      Categoria.create({
        nombreCategoria: "Default",
      });
    }
  });

  Categoria.findOne({ nombreCategoria: "Default" }, (err, categoriaEnc) => {
    Producto.updateMany(
      { idCategoria: idCategoria },
      { idCategoria: categoriaEnc._id },
      (err, categoriaE) => {
        Categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminada) => {
          if (idCategoria == null)
            return res
              .status(500)
              .send({ mensaje: "SE DEBE ENVIAR UN ID DE LA CATEGORIA" });
          if (err)
            return res
              .status(500)
              .send({ mensaje: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
          if (!idCategoria)
            return res.status(500).send({
              mensaje:
                "ALGO SALIO MAL AL INTENTAR ELIMINAR LA CATEGORIA, INTENTELO DE NUEVO",
            });

          return res.status(200).send({ categoria: categoriaEliminada });
        });
      }
    );
  });
}

//VER TODAS LAS CATEGORIAS
function verCategoria(req, res) {
  var verificacion = req.user.rol;

  if (verificacion == "ROL_ADMIN" || verificacion == "ROL_CLIENTE") {
    Categoria.find((err, categoriasEnc) => {
      if (err)
        return res
          .status(500)
          .send({ mensaje: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
      if (categoriasEnc.length == 0) {
        return res.status(500).send({ message: "NO EXISTEN CATEGORIAS" });
      }
      if (!categoriasEnc)
        return res
          .status(400)
          .send({ mensaje: "ALGO SALIO MAL AL MOSTRAR LAS CATEGORIAS" });
      return res.status(200).send({ categoria: categoriasEnc });
    });
  } else {
    return res.status(500).send({
      mensaje:
        "NO SE POSEEN LOS PERMISOS NECESARIOS PARA VISUALIZAR LAS CATEGORIAS",
    });
  }
}

module.exports = {
  agregarCategoria,
  editarCategoria,
  eliminarCategoria,
  verCategoria,
};
