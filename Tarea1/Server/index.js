//*************LIBRERIAS A UTILIZAR*************
import express from 'express'; // Framework para manejar rutas y solicitudes HTTP
import { Connection, Request, TYPES } from 'tedious'; // Librería para conectarse a SQL Server
import path from "path"; // Módulo para manejar rutas de archivos
import { fileURLToPath } from 'url'; // Módulo para trabajar con URLs y rutas de archivos

// Obtener el directorio actual del archivo
const __dirname = path.dirname(fileURLToPath(import.meta.url));
//*************LIBRERIAS A UTILIZAR*************

//*************CONEXION A EXPRESS*************
const app = express(); // Crear la aplicación Express
const port = 3000; // Puerto en el que correrá el servidor
app.set("port", port); // Configurar el puerto en la aplicación Express

// Configuración para servir archivos estáticos desde la carpeta "publico"
app.use(express.static(__dirname + "/publico"));
//*************CONEXION A EXPRESS*************


/////////////////////////////////////////////////////////////////////////////////////////
//*************CONEXION A LA BASE DE DATOS*************
const config = {
    server: 'mssql-193905-0.cloudclusters.net', // Dirección del servidor SQL
    authentication: {
        type: 'default', // Tipo de autenticación (SQL Server)
        options: {
            userName: 'WebApp', // Usuario para conectarse a la base de datos
            password: 'Santiydilan1' // Contraseña del usuario
        }
    },
    options: {
        port: 13080, // Puerto del servidor SQL
        database: 'DataBase_Tarea1', // Nombre de la base de datos
        trustServerCertificate: true // Confianza en el certificado del servidor
    }
};

// Crear la conexión a la base de datos
const connection = new Connection(config);

// Intentar conectar a la base de datos
connection.connect();

// Manejar el evento "connect" para verificar si la conexión fue exitosa o falló
connection.on('connect', (err) => {
    if (err) {
        console.log('No se pudo conectar a la base de datos');
        console.log(err);
    } else {
        console.log("Se ha conectado a la base de datos");
    }
});
//*************CONEXION A LA BASE DE DATOS*************
/////////////////////////////////////////////////////////////////////////////////////////

//*************MANEJO DE SOLICITUDES*************
app.get('/', (req, res) => {
    // Servir el archivo index.html desde la carpeta Client
    res.sendFile(path.join(process.cwd(), 'Client', 'index.html'));
});

app.get('/ingresar', (req, res) => {
    // Servir el archivo ingresar.html desde la carpeta Client
    res.sendFile(path.join(process.cwd(), 'Client', 'ingresar.html'));
});

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Middleware para analizar solicitudes con cuerpo en formato JSON
app.use(express.json());
// Middleware para analizar solicitudes con datos enviados desde formularios
app.use(express.urlencoded({ extended: true }));

//*************RUTAS*************

// Ruta POST para insertar un empleado en la base de datos
app.post('/empleados', (req, res) => {
    const { nombre, salario } = req.body; // Obtener los datos enviados en la solicitud

    // Crear un request para ejecutar el stored procedure "dbo.InsertarEmpleado"
    const request = new Request('dbo.InsertarEmpleado', (err) => {
        if (err) {
            console.error('Error al ejecutar el stored procedure:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
    });

    // Agregar parámetros de entrada al stored procedure
    request.addParameter('nombreInsertar', TYPES.VarChar, nombre);
    request.addParameter('salarioInsertar', TYPES.Money, salario);

    // Agregar un parámetro de salida para obtener el código de resultado
    request.addOutputParameter('OutResultCode', TYPES.Int);

    // Manejar el valor del parámetro de salida
    request.on('returnValue', (parameterName, value) => {
        if (value === 0) {
            res.status(201).json({ message: 'Empleado insertado exitosamente' });
        } else {
            res.status(400).json({ error: 'Error al insertar empleado', code: value });
        }
    });

    // Manejar errores durante la ejecución del request
    request.on('error', (err) => {
        console.error('Error en el request:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    });

    // Ejecutar el stored procedure
    connection.callProcedure(request);
});

// Ruta GET para listar todos los empleados
app.get('/empleados', (req, res) => {
    // Crear un request para ejecutar el stored procedure "dbo.ListarEmpleados"
    const request = new Request('dbo.ListarEmpleados', (err) => {
        if (err) {
            console.error('Error al ejecutar el stored procedure:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
    });

    const empleados = []; // Arreglo para almacenar los empleados recuperados

    // Manejar cada fila devuelta por el stored procedure
    request.on('row', (columns) => {
        const empleado = {};
        columns.forEach((column) => {
            switch (column.metadata.colName) {
                case 'id':
                    empleado.id = column.value;
                    break;
                case 'Nombre':
                    empleado.nombre = column.value;
                    break;
                case 'Salario':
                    empleado.salario = column.value;
                    break;
            }
        });
        empleados.push(empleado); // Agregar el empleado al arreglo
    });

    // Cuando se completa el request, enviar los empleados como respuesta JSON
    request.on('requestCompleted', () => {
        res.json(empleados);
    });

    // Manejar errores durante la ejecución del request
    request.on('error', (err) => {
        console.error('Error en el request:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    });

    // Ejecutar el stored procedure
    connection.callProcedure(request);
});