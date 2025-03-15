import express from 'express'
import { Connection, Request } from 'tedious';
import path from "path";
//import path, { dirname } from 'path';
import { createServer } from 'http';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//CONEXION A EXPRESS
const app = express() //creamos la aplicacion express quien maneja las rutas, el middleware y configuraciones necesarias para manejar solicitudes http

//const port = process.env.PORT || 4000; //creamos la aplicacion express quien maneja las rutas, el middleware y configuraciones necesarias para manejar solicitudes http
const port = 3000;
app.set("port", port);
//app.listen(app.get("port")); ESTA INSTRUCCION ERA LA QUE ME DABA PROBLEMASAS
console.log("Servidor corriendo en el puerto", app.get("port"));

const server = createServer(app) //creamos "server" que representa un servidor http creado a partir de la app Express, maneja las conexiones y solicitudes de red (http y websocket).
//Debemos pasarle "app" para integrar la logica de rutas y middleware con el servidor http

//CONFIGURACION
app.use(express.static(__dirname + "/publico"));

//RUTAS
//app.get("/ingresar_empleado",(req,res)=> res.sendFile("/Client/paginas/ingresar.html"))
//app.get("/mostrar_empleados",(req,res)=> res.sendFile("/Client/paginas/empleados.html"))
app.get('/', (req, res) => {
    // Servir el archivo index.html desde la carpeta client en la raíz del proyecto
    res.sendFile(path.join(process.cwd(), 'Client', 'paginas', 'empleados.html'));
    res.sendFile(path.join(process.cwd(), 'Client', 'paginas', 'ingresar.html'));
});

/////////////////////////////////////////////////////////////////////////////////////////
//CONEXION A LA BASE DE DATOS
const config = {
    server: 'mssql-193905-0.cloudclusters.net',
    authentication: {
        type: 'default', //autentificacion SQL server
        options: {
            userName: 'WebApp',
            password: 'Santiydilan1'
        }
    },
    options: {
        port: 13080,
        database: 'DataBase_Tarea1',
        trustServerCertificate: true
    }
}

const connection = new Connection(config);

connection.connect(); //realizar la conexion

//cuando ocurre el evento connect, verifica si se conecto o no a la base de datos y despliega su error
connection.on('connect', (err)=>{
    if (err){
        console.log('No se pudo conectar a la base de datos');
        console.log(err);
    }
    else console.log("Se ha conectado a la base de datos");
}); 
//FIN DE LA CONEXION A LA BASE DE DATOS


app.get('/', (req, res) => {
    // Servir el archivo index.html desde la carpeta client en la raíz del proyecto
    res.sendFile(path.join(process.cwd(), 'Client', 'index.html'));
});
  
app.listen(port, () => { //escucha el puerto especificado para inicializar el servidor
    console.log(`Server running on port ${port}`)
})
/////////////////////////////////////////////////////////////////////////////////////////

