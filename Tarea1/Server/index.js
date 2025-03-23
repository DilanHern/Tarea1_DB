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

const server = createServer(app) //creamos "server" que representa un servidor http creado a partir de la app Express, maneja las conexiones y solicitudes de red (http).
//Debemos pasarle "app" para integrar la logica de rutas y middleware con el servidor http

//CONFIGURACION
app.use(express.static(__dirname + "/publico"));

//RUTAS
app.get('/', (req, res) => {
    // Servir el archivo index.html desde la carpeta client en la raíz del proyecto
    res.sendFile(path.join(process.cwd(), 'Client', 'index.html'));
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
/////////////////////////////////////////////////////////////////////////////////////////


//MANEJO DE SOLICITUDES
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'index.html')); //Envia un archivo html al cliente como respuesta a la solicitud
});

app.get('/ingresar', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'Client', 'ingresar.html'));
});
  
app.listen(port, () => { //escucha el puerto especificado para inicializar el servidor
    console.log(`Server running on port ${port}`)
})

app.use(express.json());
app.post('/insertarEmpleado', (req, res) => {
    const { nombre, salario } = req.body;
    console.log("Datos recibidos:", nombre, salario);
    ejecutarDboInsertarEmpleado(nombre, salario)
    res.status(201).json({ message: "Empleado insertado exitosamente" });
});

//Funciones
        // Función para ejecutar el stored procedure dbo.InsertarEmpleado
        function ejecutarDboInsertarEmpleado(nombreInsertar, salarioInsertar) {
            // Crear el request para ejecutar el stored procedure
            const request = new Request('dbo.InsertarEmpleado', (err) => {
                if (err) {
                    console.log('Error al ejecutar el stored procedure:', err);
                }
            });

            // Agregar parámetros al request
            request.addParameter('Nombre', TYPES.VarChar, nombreInsertar);
            request.addParameter('Salario', TYPES.Money, salarioInsertar);

            // Ejecutar el stored procedure
            connection.callProcedure(request);

            // Manejar el resultado del stored procedure
            request.on('requestCompleted', () => {
                console.log('Stored procedure ejecutado exitosamente');
                // Mostrar mensaje de éxito:
                const successMessageDiv = document.getElementById('success-message');
                successMessageDiv.textContent = "Empleado insertado exitosamente.";
                successMessageDiv.style.display = "block";
                setTimeout(() => {
                    successMessageDiv.style.display = "none";
                }, 3000);
            });

            request.on('error', (err) => {
                console.log('Error en el request:', err);
            });
        }

// Función para ejecutar el stored procedure dbo.ListarEmpleados
function ejecutarDboListarEmpleado() {
    // Crear el request para ejecutar el stored procedure
    const request = new Request('dbo.ListarEmpleados', (err) => {
        if (err) {
            console.log('Error al ejecutar el stored procedure:', err);
        }
    });

    // Ejecutar el stored procedure
    connection.callProcedure(request);

    // Manejar el resultado del stored procedure
    request.on('row', (columns) => {
        let id, Nombre, Salario;
        columns.forEach((column) => {
            switch (column.metadata.colName) {
                case 'id':
                    id = column.value;
                    break;
                case 'Nombre':
                    Nombre = column.value;
                    break;
                case 'Salario':
                    Salario = column.value;
                    break;
            }
        });
        console.log(`Id: ${id}, Nombre: ${Nombre}, Salario: ${Salario}`);
    });

    request.on('requestCompleted', () => {
        console.log('Stored procedure ejecutado exitosamente');
    });

    request.on('error', (err) => {
        console.log('Error en el request:', err);
    });
}