const express = require("express")
const path = require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fetch = require("node-fetch");

const util = require('util');
const {config} = require('dotenv');

const middlewares = require('./middlewares/middlewares.js');
var helpersENV = require('./helpers/variables.js');
var funcionesENV = require('./helpers/funciones')
const appConfiguraciones = require("./helpers/configuraciones");

const app = express()
helpersENV.usuario = ""
 
config()

const connection = mysql.createConnection({ 
  host: process.env.DB_HOST,     // Cambia esto a la dirección de tu servidor MySQL si es diferente
  user: process.env.DB_USER,    // Cambia esto a tu nombre de usuario de MySQL
  password: process.env.DB_PASSWORD, // Cambia esto a tu contraseña de MySQL
  database: 'railway', // Cambia esto al nombre de tu base de datos,
  port: 5825,
  connectionLimit: 500,
});
    
//const iv = crypto.randomBytes(16); // Initialization Vector
//const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
 
appConfiguraciones(app);

//************************************************************/
// VARIABLES
//************************************************************/

const APP_PORT = process.env.PORT ?? "8080"


//************************************************************/
// MIDDLEWARES
//************************************************************/


// MIDDLEWARES DE LOG

app.use(middlewares.logRequestInfo);

//************************************************************/
// RUTAS
//************************************************************/

app.get("/", async (req, res)=>{    
  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
  }

  res.render("index",{      
    userName: helpersENV.usuario
  })
})
        
app.get("/proyects", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
  }

  res.render("proyects",{    
    userName: helpersENV.usuario
  })
})

app.get("/cine", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
  }

  res.render("cine",{    
    userName: helpersENV.usuario
  })
})
  
app.get("/perfil", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
  }

  var respuestaQRY
  miSQLqry = `SELECT * FROM USUARIOS WHERE user_name = '${helpersENV.usuario}'`
  respuestaQRY = await misDatos(miSQLqry)
  console.log(respuestaQRY)

  res.render("perfil",{    
    userName: helpersENV.usuario,
    datosUsuario: respuestaQRY
  })
})

app.get("/login",  async (req, res)=>{   
  if(!req.cookies.token){    
    helpersENV.usuario = ""
  }

  res.render("login",{    
    userName: helpersENV.usuario
  })
})
     
  //MARIANAM password23
  //GERMANG password23
  
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  var respuestaQRY
  miSQLqry = `SELECT * FROM USUARIOS WHERE user_name = '${username}'`
  respuestaQRY = await misDatos(miSQLqry)
  console.log("DESDE BD WEB DIGO:")
  console.log(respuestaQRY)
    
       
  if (respuestaQRY.length === 0 || !bcrypt.compareSync(password, respuestaQRY[0].password)) {
    // console
    res.status(401).json({ message: 'Credenciales inválidas' });
  } else { 
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.CRYPTO_SECRETKEY), iv);
   
    let encryptedNombreUsuario = cipher.update(respuestaQRY[0].user_name, 'utf8', 'base64');
    encryptedNombreUsuario += cipher.final('base64');
    


    const token = jwt.sign({ userId: respuestaQRY[0].id,nombreUsuario: encryptedNombreUsuario, iv: iv.toString('base64') }, process.env.CRYPTO_SECRETKEY, { expiresIn: '15m' });
    helpersENV.usuario = respuestaQRY[0].user_name
    res.status(200).json({ token, rutaURL: req.originalUrl });
  }
  
}); 

app.get("/salir",  async (req, res)=>{   

  res.clearCookie("token")
  helpersENV.usuario = ""

  res.render("index",{    
    userName: helpersENV.usuario
  })
})

//************************************************************/
// API UNIVERSAL
//************************************************************/
app.get("/protegida/api*", middlewares.authenticateToken,  async (req, res)=>{   
  var apiKey = '&api_key=' + 'a7499e5ecf0fb5add0e060e12d189dad'

  if(req.query.tipoQry === "TOPMovies"){ // top trend upcoming
    var setPAge = `&page=${req.query.NroPagina}`  

    fetch(`${req.query.urlToFetch}${apiKey}${setPAge}`)   
    .then(promesaFetch => promesaFetch.json())
    .then(contenido => {
     // console.log(contenido)
      res.json(contenido)
    }) 
    
  }else if(req.query.tipoQry === "QRYmovies"){ // busca peli por nombre

    var setPage = `&page=${req.query.NroPagina}`
    var setNombreMovie = `&query=${req.query.query}`
    var setPopularity = '&sort_by=popularity.desc'
    console.log(req.query)  
    console.log(`${req.query.urlToFetch}${apiKey}${setPage}${setNombreMovie}${setPopularity}`)    

    fetch(`${req.query.urlToFetch}${apiKey}${setPage}${setNombreMovie}${setPopularity}`)   
    .then(promesaFetch => promesaFetch.json())
    .then(contenido => {
     // console.log(contenido)
      res.json(contenido)
    }) 
    
  }

 
})

app.post('/register', (req, res) => {
    const randomNum = funcionesENV.generateRandomNumber();
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
    host: process.env.DB_HOST,    
    user: process.env.DB_USER,    
    password: process.env.DB_PASSWORD, 
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