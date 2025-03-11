import express from 'express'
import { Connection, Request } from 'tedious';
import path from 'path';

//CONEXION A EXPRESS
const port = process.env.PORT || 3000 //tomar el valor de la variable de entorno PORT, si no hay, el puerto será el 3000(normalmente utilizado para desarrollo)

const app = express() //creamos la aplicacion express quien maneja las rutas, el middleware y configuraciones necesarias para manejar solicitudes http

//const server = createServer(app) //creamos "server" que representa un servidor http creado a partir de la app Express, maneja las conexiones y solicitudes de red (http y websocket).
//Debemos pasarle "app" para integrar la logica de rutas y middleware con el servidor http

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
