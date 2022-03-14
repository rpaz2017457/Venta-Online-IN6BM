const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto.model');
const Factura = require('../models/factura.model');
const req = require('express/lib/request');
const pdf = require('pdfmake');
const fs = require('fs'); 

//FACTURAR
function crearFactura(req, res) {
    const facturaModel = new Factura();
    const usuario = req.user.nombre;
    var verificacion = req.user.rol;
    var nitF;

    if(verificacion == 'ROL_CLIENTE'){
        if (req.body.nit){
            nitF = req.body.nit
        } else {
            nitF = "Consumidor Final"
        }
        Usuario.findById(req.user.sub, (err, usuarioEnc) => {
            if(usuarioEnc.carrito.length == 0) return res.status(500).send({ message: 'NO EXISTE UN CARRITO CON PRODUCTOS' });
            facturaModel.nit = nitF;
            facturaModel.listaCompra = usuarioEnc.carrito;
            facturaModel.idUsuario = req.user.sub;
            facturaModel.total = usuarioEnc.totalCarrito;

            facturaModel.save((err, facturaG) => {
                if(err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITD" });
                if(!facturaG) return res.status(400).send({message: "ALGO SALIO MAL AL INTENTAR GUARDAR LA FACTURA" });
                crearPdf(facturaG, usuario);

                for(let i = 0; i < usuarioEnc.carrito.length; i++){
                            Producto.findOneAndUpdate({nombreProducto: usuarioEnc.carrito[i].nombreProducto},
                                {$inc:{cantidad: usuarioEnc.carrito[i].cantidad*-1, vendidos:usuarioEnc.carrito[i].cantidad}}, (err, productoU)=>{
                                    if(err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
                                    if(!productoU) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR ACTUALIZAR" });
                            })
                }
                
                Usuario.findByIdAndUpdate(req.user.sub, {$set:{carrito:[]},totalCarrito: 0},{new:true},(err, carritoVacio)=>{
                        return res.status(200).send({usuario:facturaG})
                    })
            })
        })
    }else{
        return res.status(500).send({message: 'NO SE TIENEN LOS PERMISOS PARA FACTURAR'});
    } 
}

//VER LAS FACTURAS QUE TIENE UN USUARIO
function verFacturasUsuario(req,res) {
    var idUser = req.params.idUsuario;
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_ADMIN') {
        Factura.find({ idUsuario : idUser}, (err, facturaEnc) => {
            if(err) return res.status(500).send({message: "HA OCURRIDO UN ERROR EN LA PETICION"});
            if(!facturaEnc) return res.status(500).send({message: "ALGO SALIO MAL AL INTENTAR OBTENER LAS FACTURAS"});
    
            return res.status(200).send({facturas: facturaEnc});
        })     
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//VER FACTURAS GENERAL PARA CLIENTES
function verFacturasCl(req,res) {
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_CLIENTE') {
        Factura.find({ idUsuario : req.user.sub}, (err, facturaEnc) => {
            if(err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA PETICION" });
            if(!facturaEnc) return res.status(500).send({ message: "ALGO SALIO MAL AL INTENTAR OBTENER LAS FACTURAS" });
    
            return res.status(200).send({facturas: facturaEnc});
        })     
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//VER PRODUCTOS DE UNA FACTURA
function verProductosFactura(req,res) {
    var idFac = req.params.idFactura;
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_ADMIN') {
        Factura.findById(idFac, (err, facturaEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!facturaEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR CARGAR LOS PRODUCTOS" }); 
            return res.status(200).send({ productos: facturaEnc.productos});
        })      
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//BUSCAR LOS PRODUCTOS AGOTADOS
function verProductosAgotados(req,res) {
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_ADMIN' || verificacion =='ROL_CLIENTE') {
        Producto.find({cantidad: 0},(err, productoEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!productoEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR CARGAR LOS PRODUCTOS" });
            return res.status(200).send({ productos: productoEnc });
        });        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

//VER LOS PRODUCTOS MAS VENDIDOS
function verProductosMasVendidos(req,res) {
    var verificacion = req.user.rol;

    if (verificacion == 'ROL_ADMIN' || verificacion =='ROL_CLIENTE') {
        Producto.find((err, productoEnc)=>{
            if (err) return res.status(500).send({ message: "HA OCURRIDO UN ERROR EN LA SOLICITUD" });
            if (!productoEnc) return res.status(400).send({ message: "ALGO SALIO MAL AL INTENTAR CARGAR LOS PRODUCTOS" });
            productoEnc.sort((a, b)=>{
                if(a.vendidos>b.vendidos){
                    return -1;
                }
                else if(a.vendidos<b.vendidos){
                    return 1;
                }
                else{
                    return 0;
                }
            })
            return res.status(200).send({ productos: productoEnc });
        })        
    } else {
        return res.status(500).send({ message: "NO SE POSEEN LOS PERMISOS NECESARIOS PARA REALIZAR ESTA SOLICITUD" });
    }
}

module.exports={
    crearFactura,
    verFacturasUsuario,
    verFacturasCl,
    verProductosAgotados: verProductosAgotados,
    verProductosMasVendidos: verProductosMasVendidos,
    verProductosFactura: verProductosFactura,
}