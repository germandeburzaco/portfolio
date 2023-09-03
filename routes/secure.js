var router = require("express").Router()
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var helpersENV = require('../helpers/variables.js');
const middlewares = require('../middlewares/middlewares.js');
var {misDatos} = require('../helpers/funciones')

router.get("/cine", middlewares.authenticateToken, async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }

  let usuario_config = helpersENV.usuario_configuraciones.find((objeto) => objeto.user_name === helpersENV.usuario);

  res.render("cine",{    
    userName: helpersENV.usuario,
    usuario_config: usuario_config
  })
})

router.get("/perfil",  middlewares.authenticateToken, async (req, res)=>{  
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

router.get("/login", async (req, res)=>{   
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }

  res.render("login",{    
    userName: helpersENV.usuario
  })
})

router.post("/login", async (req, res) => {
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
  
})


module.exports = router