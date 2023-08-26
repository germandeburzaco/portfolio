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
helpersENV.usuario_id = ""
 
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
    helpersENV.usuario_id = ""
  }

  res.render("index",{      
    userName: helpersENV.usuario
  })
})
        
app.get("/proyects",  async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }

  res.render("proyects",{    
    userName: helpersENV.usuario
  })
})

app.get("/cine", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }

  res.render("cine",{    
    userName: helpersENV.usuario
  })
})
  
app.get("/perfil", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
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
    helpersENV.usuario_id = ""
  }

  res.render("login",{    
    userName: helpersENV.usuario
  })
})
     
  //MARIANAM password23
  //GERMANG password23
  
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username)
  console.log(password)
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
    


    const token = jwt.sign({ userId: respuestaQRY[0].id, nombreUsuario: encryptedNombreUsuario, iv: iv.toString('base64') }, process.env.CRYPTO_SECRETKEY, { expiresIn: '15m' });
    helpersENV.usuario = respuestaQRY[0].user_name
    helpersENV.usuario_id = respuestaQRY[0].id
    res.status(200).json({ token, rutaURL: req.originalUrl });
  }
  
}); 



app.get("/bancocentral", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  } 

    const urls = [
      'https://api.estadisticasbcra.com/tasa_depositos_30_dias',
      'https://api.estadisticasbcra.com/inflacion_mensual_oficial',
      'https://api.estadisticasbcra.com/inflacion_interanual_oficial',
      'https://api.estadisticasbcra.com/inflacion_esperada_oficial',
      'https://api.estadisticasbcra.com/dif_inflacion_esperada_vs_interanual'
    ];
    
    const fetchPromises = urls.map(url => {
      return fetch(url, {
        headers: {
          Authorization: `${process.env.BAN_CEN_BEARER}`
        }
      })
      .then(response => response.json());
    });
    
    Promise.all(fetchPromises)
      .then(responses => {
        const processedData = responses.map(data => {
          // Realiza aquí el procesamiento que necesitas en cada conjunto de datos
          return data.slice(-40);
        });
    
        // Renderizar la vista con los datos procesados
        res.render("bancocentral", {
          userName: helpersENV.usuario,
          datosCentral: processedData
        });
      })
      .catch(error => {
        // Manejar errores si es necesario
        console.error(error);
        res.status(500).send('Error en la solicitud');
      });

  
})


app.get("/clima", middlewares.authenticateToken, async (req, res)=>{  

  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }    
    

  res.render("clima", {
    userName: helpersENV.usuario   
  });
       
  
})



app.get("/salir",  async (req, res)=>{   

  res.clearCookie("token")
  helpersENV.usuario = ""
  helpersENV.usuario_id = ""

  res.render("index",{    
    userName: helpersENV.usuario
  })
})

//************************************************************/
// API UNIVERSAL
//************************************************************/
app.get("/protegida/api*", middlewares.authenticateToken,  async (req, res)=>{   
  var apiKey = '&api_key=' + 'a7499e5ecf0fb5add0e060e12d189dad'

  var moviesFromUser = ""
  //SELECT * FROM USUARIO_MOVIA WHERE (ID_USUARIO = ${helpersENV.usuario_id})
  miSQLqry = `SELECT * FROM USUARIO_MOVIA WHERE (ID_USUARIO = ${helpersENV.usuario_id})`
  moviesFromUser = await misDatos(miSQLqry)
 // console.log(moviesFromUser)

  console.log(req.query)

  if(req.query.tipoQry === "TOPMovies"){ // top trend upcoming
    var setPAge = `&page=${req.query.NroPagina}`  
    fetch(`${req.query.urlToFetch}${apiKey}${setPAge}`)   
    .then(promesaFetch => promesaFetch.json())
    .then(contenido => {      
      contenido.results.forEach(movieData => {
        moviesFromUser.forEach(movieUser =>{
          if(movieUser.ID_MOVIE === movieData.id.toString() ){          
            movieData[movieUser.DESCRIPCION] = true;
          }
        })             
      });
      res.json(contenido)
    })  
    
  } else if(req.query.tipoQry === "QRYmovies"){ // busca peli por nombre

    var setPage = `&page=${req.query.NroPagina}`
    var setNombreMovie = `&query=${req.query.query}`
    var setPopularity = '&sort_by=popularity.desc' 

    fetch(`${req.query.urlToFetch}${apiKey}${setPage}${setNombreMovie}${setPopularity}`)   
    .then(promesaFetch => promesaFetch.json())
    .then(contenido => {
      contenido.results.forEach(movieData => {
        moviesFromUser.forEach(movieUser =>{
          if(movieUser.ID_MOVIE === movieData.id.toString() ){          
            movieData[movieUser.DESCRIPCION] = true;
          }
        })             
      });
      res.json(contenido)
    })     
  } else if(req.query.tipoQry === "AddRemoveMOVIESuser"){ // busca peli por nombre
     
    console.log(req.query)
    var respuestaQRY
    if(req.query.accion === "alta"){
      miSQLqry = `INSERT INTO USUARIO_MOVIA (ID_USUARIO, ID_MOVIE, DESCRIPCION ) values (${helpersENV.usuario_id}, ${req.query.id}, N'${req.query.descripcion}')`
      respuestaQRY = await misDatos(miSQLqry)
    }else{
      miSQLqry = `DELETE FROM USUARIO_MOVIA WHERE (ID_USUARIO = ${helpersENV.usuario_id} AND ID_MOVIE = ${req.query.id} AND DESCRIPCION = N'${req.query.descripcion}')`
      respuestaQRY = await misDatos(miSQLqry)
    } 
 
    console.log(miSQLqry)
    console.log(respuestaQRY)
    res.json(respuestaQRY)
    
  } else if(req.query.tipoQry === "FAVORITASmovies"){ // busca peli por nombre

    //`https://api.themoviedb.org/3/movie/${id pelicula}?api_key=a7499e5ecf0fb5add0e060e12d189dad`

    const uniqueIds = [...new Set(moviesFromUser.filter(movie => movie.DESCRIPCION === req.query.tipoDescripcion).map(movie => movie.ID_MOVIE))];

    const fetchPromises = uniqueIds.map(id => {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=a7499e5ecf0fb5add0e060e12d189dad&language=es-es`;
    
      return fetch(url)
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
          console.error(`Error fetching movie with ID ${id}:`, error);
          return null;
        });
    });
    
    Promise.all(fetchPromises)
      .then(results => {
        const moviesData = { results: results.filter(movie => movie !== null) };
        moviesData.results.forEach(movieData => {
          moviesFromUser.forEach(movieUser =>{
            if(movieUser.ID_MOVIE === movieData.id.toString() ){          
              movieData[movieUser.DESCRIPCION] = true;
            }
          })             
        });
        res.json(moviesData)
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
      });

  } else if(req.query.tipoQry === "QRYpeliXid"){ // busca peli por nombre

    //`https://api.themoviedb.org/3/movie/${id pelicula}?api_key=a7499e5ecf0fb5add0e060e12d189dad`
    
      const url = `https://api.themoviedb.org/3/movie/${req.query.id_pelicula}?api_key=a7499e5ecf0fb5add0e060e12d189dad&language=es-es`;
    
      fetch(url)
        .then(response => response.json())
        .then(data => {          
          
          res.json(data)
        })
        .catch(error => {
          console.error(`Error fetching movie with ID ${id}:`, error);
          return null;
        });
   
    
   

  } // ACA CONTINUA EL IF ELSE


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




//***************************************************** */
//WHATSAPP WEB
//***************************************************** */
//https://medium.com/como-programar-em-1-dia/como-fazer-um-rob%C3%B4-de-whatsapp-chatbot-em-1-dia-644ee98054d7
/*const client = new Client({
  headless:false,
  puppeteer: {
		args: ['--no-sandbox'],
	},
 // authStrategy: new LocalAuth()
});


client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('Client is ready!');
});



client.on('message', async message => { 
 
  const d = new Date();
  console.log("-------------------------" )
  console.log(d )
  console.log(message.from )
  console.log(message.body )
  console.log("-------------------------" )
  //CONTROL USUARIOS AUTENTICADOS
  if(message.from == "5491138026729@c.us"){
      client.sendMessage(message.from, 'Hola German soy *SHERLOCK* 🕵️ v1');
  }else if(message.from == "5491132852915@c.us"){
     // client.sendMessage(message.from, 'Hola German soy *SHERLOCK* 🕵️ v1');
  }else {
     // client.sendMessage(message.from, 'Hola soy *SHERLOCK* 🕵️ v1 - NO estas registrado en mi base de datos');
      return
  }// FIN CONTROL USUARIOS AUTENTICADOS

 // console.log(message);
 // console.log(message.body);
  if (message.body.toLowerCase() == 'hola') {      
      
      const contact = await message.getContact();
      const chat = await message.getChat();
      
     // console.log(contact)
      
      await chat.sendMessage(`Hola @${contact.id.user}`, {
          mentions: [contact]
      });

      await chat.sendMessage(`Soy una version mejorada 🤙... probá CHISTE`, {
          mentions: [contact]
      });

     // return client.sendMessage(message.from, `Hola ${message._data.notifyName}, soy un bot 🤖`);

  }  

}); 
 
client.initialize();*/



//***************************************************** */







app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})