const express = require("express")
const path =require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express()

const connection = mysql.createConnection({ 
  host: 'containers-us-west-159.railway.app',     // Cambia esto a la dirección de tu servidor MySQL si es diferente
  user: 'root',    // Cambia esto a tu nombre de usuario de MySQL
  password: 'AOOtjjw19l1YZyWBRzhM', // Cambia esto a tu contraseña de MySQL
  database: 'railway', // Cambia esto al nombre de tu base de datos,
  port: 5825,
  connectionLimit: 500,
});

const secretKey = 'una_clave_secreta123456789123456';
const iv = crypto.randomBytes(16); // Initialization Vector
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

var datosDesdeBD = []

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
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authCookie = req.cookies.token; // Lee el valor del token desde la cookie
  if (!authCookie) {
    //return res.status(401).json({ message: 'Token no proporcionado' });
    req.user = "";
    next();
  }

  jwt.verify(authCookie, secretKey, (err, user) => {
    if (err) {
     // return res.status(403).json({ message: 'Token inválido' });
      req.user = "";
      next();
    }

    // Desencriptar el nombre de usuario
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), Buffer.from(user.iv, 'base64'));
    let decryptedNombreUsuario = decipher.update(user.nombreUsuario, 'base64', 'utf8');
    decryptedNombreUsuario += decipher.final('utf8');
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

app.get("/", async (req, res)=>{
    if(req.cookies.token){
      console.log(req.user.userId)  
      var respuestaQRY
      miSQLqry = `SELECT * FROM USUARIOS WHERE id = ${req.user.userId}`
      respuestaQRY = await misDatos(miSQLqry)
      datosDesdeBD = respuestaQRY
      console.log(respuestaQRY)
    }

    res.render("index",{
      token: req.user,
      userName: datosDesdeBD
    })
  })
      
app.get("/proyects", authenticateToken, async (req, res)=>{
  var respuestaQRY
  miSQLqry = `SELECT * FROM USUARIOS WHERE id = ${req.user.userId}`
  respuestaQRY = await misDatos(miSQLqry)
  console.log(respuestaQRY)

    res.render("proyects",{
      token: req.user,
      userName: respuestaQRY
    })
  })
  
  app.get("/login", async (req, res)=>{
    if(req.cookies.token){
      console.log(req.user.userId)  
      var respuestaQRY
      miSQLqry = `SELECT * FROM USUARIOS WHERE id = ${req.user.userId}`
      respuestaQRY = await misDatos(miSQLqry)
      datosDesdeBD = respuestaQRY
      console.log(respuestaQRY)
    }


    res.render("login",{
      token: req.user,
      userName: datosDesdeBD
    })
  })
   
  //MARIANAM password23
  //GERMANG password23

 app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    var respuestaQRY
    miSQLqry = `SELECT * FROM USUARIOS WHERE user_name = '${username}'`
    respuestaQRY = await misDatos(miSQLqry)
    console.log(respuestaQRY)
    
    
    if (respuestaQRY.length === 0 || !bcrypt.compareSync(password, respuestaQRY[0].password)) {
      console
      res.status(401).json({ message: 'Credenciales inválidas' });
    } else {
  
      let encryptedNombreUsuario = cipher.update(respuestaQRY[0].user_name, 'utf8', 'base64');
      encryptedNombreUsuario += cipher.final('base64');
  
      const token = jwt.sign({ userId: respuestaQRY[0].id, 
        nombreUsuario: encryptedNombreUsuario, iv: iv.toString('base64') }, secretKey, { expiresIn: '1h' });
      res.status(200).json({ token });
    }
  
 });


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




async function misDatos(qry) {
  const connection = await mysql.createConnection({ 
    host: 'containers-us-west-159.railway.app',    
    user: 'root',    
    password: 'AOOtjjw19l1YZyWBRzhM', 
    database: 'railway', 
    port: 5825,
    connectionLimit: 500,
  });
  
  const [rows, fields] = await connection.execute(qry);
   
  return rows
}




app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})