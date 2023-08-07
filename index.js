const express = require("express")
const path =require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql2');
const app = express()


const connection = mysql.createConnection({
  host: 'containers-us-west-159.railway.app',     // Cambia esto a la dirección de tu servidor MySQL si es diferente
  user: 'root',    // Cambia esto a tu nombre de usuario de MySQL
  password: 'AOOtjjw19l1YZyWBRzhM', // Cambia esto a tu contraseña de MySQL
  database: 'railway', // Cambia esto al nombre de tu base de datos,
  port: 5825
});

connection.connect((err) => {
    if (err) {
      console.error('Error de conexión: ', err);
    } else {
      console.log('Conexión exitosa a la base de datos');
    }
  });


app.use(express.json());
app.set('views', path.join(__dirname, '/src/views'))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/*****VARIABLES******/
const APP_PORT = process.env.PORT ?? "8080"

/*********FUNCIONES************** */
function generateRandomNumber() {
    const min = 1000; // El valor mínimo de 4 cifras
    const max = 9999; // El valor máximo de 4 cifras
  
    // Math.random() genera un número decimal entre 0 (incluido) y 1 (excluido)
    // Multiplicamos por (max - min + 1) para obtener un rango inclusivo
    // Luego sumamos min para desplazar el rango
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


/******MIDDLEWARES********/
app.use((req, res, next)=>{
    console.log("-------------------INICIO----------------------------")
    console.log("-----------------------------------------------------")
    const d = new Date();
    const dia = d.getDate()  
    const mes = d.getMonth() + 1
    console.log(d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0") +"  -  " + dia +"-" + mes +"-" + d.getFullYear()  )  
    console.log("URL: " + req.method + " " + req.originalUrl)  
    console.log("IP: " + req.ip)  
    console.log("----------------------------------------------------")
    console.log("-------------------FIN-------------------------------") 

    next();
})

app.get("/", (req, res)=>{
    const randomNum = generateRandomNumber();
   /* connection.query(
        `INSERT INTO USUARIOS values(${randomNum}, "test", "123")`,
        function(err, results, fields) {
          console.log(results); // results contains rows returned by server
          console.log(fields); // fields contains extra meta data about results, if available
        }
      );*/

    res.render("index")
})

app.get("/proyects", (req, res)=>{
    console.log("pido pro")
    res.render("proyects")
})

app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})