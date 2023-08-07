const express = require("express")
const path =require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql');
const app = express()


const connection = mysql.createConnection({
  host: 'localhost',     // Cambia esto a la dirección de tu servidor MySQL si es diferente
  user: 'tu_usuario',    // Cambia esto a tu nombre de usuario de MySQL
  password: 'tu_contraseña', // Cambia esto a tu contraseña de MySQL
  database: 'nombre_de_tu_base_de_datos' // Cambia esto al nombre de tu base de datos
});


app.use(express.json());
app.set('views', path.join(__dirname, '/src/views'))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/*****VARIABLES******/
const APP_PORT = process.env.PORT ?? "8080"


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
    res.render("index")
})

app.get("/proyects", (req, res)=>{
    console.log("pido pro")
    res.render("proyects")
})

app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})