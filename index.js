const express = require("express")
const path =require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

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

app.use(cookieParser());
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
    const max = 99999; // El valor máximo de 4 cifras
  
    // Math.random() genera un número decimal entre 0 (incluido) y 1 (excluido)
    // Multiplicamos por (max - min + 1) para obtener un rango inclusivo
    // Luego sumamos min para desplazar el rango
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }



// Middleware de autenticación
function authenticateToken(req, res, next) {
 // console.log(req.cookies)
  const authCookie = req.cookies.token; // Lee el valor del token desde la cookie

  if (!authCookie) {
    //return res.status(401).json({ message: 'Token no proporcionado' });
    req.user = "";
    next();
  }

  jwt.verify(authCookie, 'secret_key', (err, user) => {
    if (err) {
     // return res.status(403).json({ message: 'Token inválido' });
      req.user = "";
      next();
    }
    req.user = user;
    next();
  });
} 


/******MIDDLEWARES********/
app.use((req, res, next)=>{
    console.log("-------------------INICIO----------------------------")
    console.log("-----------------------------------------------------")
    const d = new Date();
    const dia = d.getDate()  
    const mes = d.getMonth() + 1
    console.log(d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0") +"  -  " + dia +"-" + mes +"-" + d.getFullYear()  )  
   // console.log(req.cookies)
    jwt.verify(req.cookies.token, 'secret_key', (err, user) => {
     // console.log(user)
      if (err) {
      }else{
        console.log("USER: " + user.userId)  
      }
    })
    console.log("URL: " + req.method + " " + req.originalUrl)  
    console.log("IP: " + req.ip)  
    console.log("----------------------------------------------------")
    console.log("-------------------FIN-------------------------------") 

    next();
})


/************************************************************/
//  RUTAS
/************************************************************/

app.get("/", authenticateToken, (req, res)=>{
    //console.log(req.user)
    res.render("index",{
      userName: req.user
    })
  })
      
app.get("/proyects", authenticateToken, (req, res)=>{
    
    res.render("proyects",{
      userName: req.user
    })
  })
  
  app.get("/login", (req, res)=>{
    
    res.render("login",{
      userName: req.user
    })
  })
   
  //MARIANAM password23
  //GERMANG password23

  app.post('/register', (req, res) => {
    const randomNum = generateRandomNumber();
    console.log(req.body)
    const { username, password } = req.body;

  // Hash de la contraseña antes de almacenarla
  const hashedPassword = bcrypt.hashSync(password, 15);

  connection.query(`INSERT INTO USUARIOS (id, user_name, password) VALUES (${randomNum},?, ?)`, [username, hashedPassword], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error al registrar el usuario' });
    } else {
      res.status(200).json({ message: 'Usuario registrado exitosamente' });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username)
  console.log(password)

  connection.query('SELECT * FROM USUARIOS WHERE user_name = ?', [username], (err, result) => {
    console.log("RESULTADO D LA BD")
    console.log(result)
    if (err || result.length === 0 || !bcrypt.compareSync(password, result[0].password)) {
      console
      res.status(401).json({ message: 'Credenciales inválidas' });
    } else {
      const token = jwt.sign({ userId: result[0].id }, 'secret_key', { expiresIn: '1h' });
      res.status(200).json({ token });
    }
  });
});

app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})