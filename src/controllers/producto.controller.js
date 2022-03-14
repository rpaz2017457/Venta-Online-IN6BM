const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');

//AGREGAR UN PRODUCTO
function agregarProducto(req,res) {
    var parametros = req.body;
    var verificacion = req.user.rol;
    var productoModel = new Producto();

    if (verificacion == 'ROL_ADMIN') {
        if (parametros.nombreProducto && parametros.precio && parametros.cantidad && parametros.categoria) {
            productoModel.nombreProducto = parametros.nombreProducto;
            productoModel.precio = parametros.precio;
            productoModel.cantidad = parametros.cantidad;
            productoModel.vendidos = 0;

            Producto.find({producto: parametros.nombreProducto}, (err, productoEnc)=> {
                if(productoEnc.length == 0){
                    Categoria.find({categoria: parametros.categoria}, (err, categoriaEnc)=> {
                        if (!categoriaEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR ENCONTRAR LA CATEGORIA, INTENTELO DE NUEVO" });
                        productoModel.categoria = categoriaEnc[0]._id;
        
                        productoModel.save((err, productoG) => {
                            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
                            if (!productoG) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR AGREGAR EL PRODUCTO" });
                            return res.status(200).send({ producto: productoG });
                        })
                    })
                } else {
                    return res.status(500).send({message: 'ESTE PRODUCTO YA SE ENCUENTRA CREADO'});
                }
            })
        }else{
            return res.status(500).send({ message: "POR FAVOR, LLENE TODOS LOS CAMPOS NECESARIOS" });
        }
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//EDITAR UN PRODUCTO
function editarProducto(req,res) {
    var idProducto = req.params.idProducto;
    var verificacion = req.user.rol;
    var parametros = req.body;

    if (verificacion == 'ROL_ADMIN') {
        if(parametros.categoria){
            Categoria.find({categoria: parametros.categoria}, (err, categoriaEnc)=> {
                if(err) return res.status(500).send({ message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD' }); 
                if (!categoriaEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR OBTENER LA CATEGORIA" });
                parametros.categoria = categoriaEnc[0]._id;
                    Producto.findByIdAndUpdate(idProducto, parametros ,{ new:true }, (err, productoU) =>{
                        console.log(err);
                        if (err) return res.status(500).send({ message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD' });
                        if (!productoU) return res.status(404).send({message: 'ALGO SALIO MAL AL INTENTAR EDITAR EL PRODUCTO'})
                        return res.status(200).send({ producto: productoU });
                    });
            });
        } else {
            Producto.findByIdAndUpdate(idProducto, parametros,{ new:true }, (err, productoU) =>{
                if (err) return res.status(500).send({message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD'});
                if (!productoU) return res.status(404).send({message: 'ALGO SALIO MAL AL INTENTAR EDITAR EL PRODUCTO'})
                return res.status(200).send({producto: productoU});
            })
        }
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }

}

//ELIMINAR UN PRODUCTO
function eliminarProducto(req,res) {
    var idProducto = req.params.idProducto;
    var verificacion = req.user.rol;

    if (req.user.rol == 'ROL_ADMIN') {
        Producto.findByIdAndDelete(idProducto,(err, productoE) =>{
            if (err) return res.status(500).send({ message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD' });
            if (!productoE) return res.status(404).send({ message: 'ALGO SALIO MAL AL INTENTAR ELIMINAR EL PRODUCTO' })
            return res.status(200).send({producto: productoE});
        });
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//BUSCAR PRODUCTO POR LA CATEGORIA
function buscarPorCategoria(req,res) {
    var nombreCategoria = req.body.nombreCategoria;
    var verificacion = req.user.rol;

    if (verificacion == "ROL_ADMIN" || verificacion == "ROL_CLIENTE") {
        Categoria.find({categoria: nombreCategoria}, (err, categoriaEnc)=> {
            if (!categoriaEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR ENCONTRAR LA CATEGORIA" });
            nombreCategoria = categoriaEnc[0]._id;

            Producto.find({categoria: nombreCategoria},(err, productoEnc)=>{
                if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
                if (!productoEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR CARGAR LOS DATOS" });
                return res.status(200).send({ productos: productoEnc });
            });
        });        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//BUSCAR PRODUCTOS POR EL NOMBRE
function buscarPorNombre(req,res) {
    var nomProd = req.body.producto;
    var verificacion = req.user.rol;

    if (verificacion == "ROL_ADMIN" || verificacion == "ROL_CLIENTE") {
        Producto.find({producto: nomProd},(err, productoEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!productoEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR MOSTRAR LOS DATOS" });
            return res.status(200).send({ productos: productoEnc });
        });        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//VER LOS PRODUCTOS
function verProducto(req,res) {
    var verificacion = req.user.rol;

    if (verificacion == "ROL_ADMIN" || verificacion == "ROL_CLIENTE") {
        Producto.find((err, productosEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!productosEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR MOSTRAR LOS PRODUCTOS" });
            return res.status(200).send({ productos: productosEnc });
        });        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//EDITAR LA CANTIDAD
function editarStock(req,res) {
    var idProducto = req.params.idProducto;
    var verificacion = req.user.rol;
    var parametros = req.body;

    if (verificacion == 'ROL_ADMIN') {
        Producto.findById(idProducto, (err, productoEnc) => {
            if (!productoEnc) return res.status(404).send({message: 'ALGO SALIO MAL AL INTENTAR OBTENER LOS DATOS'});
            if(parametros.stock <= 0){
                if(Number(productoEnc.cantidad) + Number(parametros.cantidad) <0){
                    return res.status(500).send({message:'LA CANTIDAD QUE SE DESEA QUITAR SOBREPASA A LA CANTIDAD ACTUAL'});
                } else {
                    Producto.findByIdAndUpdate(idProducto, { $inc :{stock:parametros.stock}},{new: true},(err, productoU)=>{
                        if(err) return res.status(404).send({message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD'});
                        if(!productoU) return res.status(500).send({message:'ALGO SALIO MAL AL INTENTAR EDITAR LA CANTIDAD'});
        
                        return res.status(200).send({producto: productoU});
                    });
                }
            } else {
                Producto.findByIdAndUpdate(idProducto, { $inc :{stock:parametros.stock}},{new: true},(err, productoU)=>{
                    if(err) return res.status(404).send({ message: 'HA OCURRIDO UN ERROR EN LA SOLICITUD' });
                    if(!productoU) return res.status(500).send({ message:'ALGO SALIO MAL AL INTENTAR EDITAR LA CANTIDAD' });
    
                    return res.status(200).send({producto: productoU});
                });
            }
        });  
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//VER LA CANTIDAD
function verStock(req,res) {
    var nombreProducto = req.body.nombreProducto;
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_ADMIN') {
        Producto.find({producto: nombreProducto},(err, productoEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!productoEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR MOSTRAR LOS DATOS" });
            return res.status(200).send({ stock: productoEnc[0].stock });
        })        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS PARA REALIZAR ESTA SOLICITUD" });
    }
}


module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    buscarPorCategoria,
    buscarPorNombre,
    verProducto,
    editarStock,
    verStock
}