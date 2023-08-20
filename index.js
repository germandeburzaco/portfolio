const express = require("express")
const path = require("node:path")
var bodyParser = require('body-parser')
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const util = require('util');
const {config} = require('dotenv');
const middlewares = require('./middlewares/middlewares.js');


const app = express()
var usuario = ""

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
 
app.use(cookieParser());
app.use(express.json());
app.set('views', path.join(__dirname, '/src/views'))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//************************************************************/
// VARIABLES
//************************************************************/
var datosDesdeBD = []
const secretKey = 'una_clave_secreta123456789123456';
const APP_PORT = process.env.PORT ?? "8080"

//************************************************************/
// FUNCIONES
//************************************************************/
function generateRandomNumber() {
    const min = 1000; // El valor mínimo de 4 cifras
    const max = 99999; // El valor máximo de 4 cifras
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//************************************************************/
// MIDDLEWARES
//************************************************************/




// MIDDLEWARES DE LOG
app.use((req, res, next)=>{
    console.log("-------------------INICIO----------------------------")
    console.log("-----------------------------------------------------")
    const d = new Date();
    const dia = d.getDate()  
    const mes = d.getMonth() + 1
    console.log(d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0") +"  -  " + dia +"-" + mes +"-" + d.getFullYear() )   
    console.log("URL: " + req.method + " " + req.originalUrl)  
    console.log("IP: " + req.ip)  
    console.log("USUARIO: " + usuario)  
    console.log("----------------------------------------------------")
    console.log("-------------------FIN-------------------------------") 
    next();
})



//************************************************************/
// VARIABLES
//************************************************************/

app.get("/", async (req, res)=>{    
  
  if(!req.cookies.token){    
    usuario = ""
  }

  res.render("index",{      
    userName: usuario
  })
})
        
app.get("/proyects", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    usuario = ""
  }

  res.render("proyects",{    
    userName: usuario
  })
})

app.get("/cine", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    usuario = ""
  }

  res.render("cine",{    
    userName: usuario
  })
})
  
app.get("/perfil", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    usuario = ""
  }

  var respuestaQRY
  miSQLqry = `SELECT * FROM USUARIOS WHERE user_name = '${usuario}'`
  respuestaQRY = await misDatos(miSQLqry)
  console.log(respuestaQRY)

  res.render("perfil",{    
    userName: usuario,
    datosUsuario: respuestaQRY
  })
})

app.get("/login",  async (req, res)=>{   
  if(!req.cookies.token){    
    usuario = ""
  }

  res.render("login",{    
    userName: usuario
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
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
   
    let encryptedNombreUsuario = cipher.update(respuestaQRY[0].user_name, 'utf8', 'base64');
    encryptedNombreUsuario += cipher.final('base64');
    


    const token = jwt.sign({ userId: respuestaQRY[0].id,nombreUsuario: encryptedNombreUsuario, iv: iv.toString('base64') }, secretKey, { expiresIn: '15m' });
    usuario = respuestaQRY[0].user_name
    res.status(200).json({ token, rutaURL: req.originalUrl });
  }
  
}); 

app.get("/salir",  async (req, res)=>{   

  res.clearCookie("token")
  usuario = ""

  res.render("index",{    
    userName: usuario
  })
})

//************************************************************/
// API UNIVERSAL
//************************************************************/
app.get("/protegida/api*",  async (req, res)=>{   

  res.clearCookie("token")
  usuario = ""

  res.render("index",{    
    userName: usuario
  })
})

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