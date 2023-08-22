
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var helpersENV = require('../helpers/variables.js');

//MIDDLEWARE DE AUTENTICACION
function authenticateToken(req, res, next) {
  console.log("MIDDLEWARE authenticateToken")
    if(!req.cookies.token){
      console.log("no existe el token")
      
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
      return res.render("login",{
        userName: helpersENV.usuario,
      })
    }else{
      console.log("existe el token")
      const authCookie = req.cookies.token; // Lee el valor del token desde la cookie  
      
      jwt.verify(authCookie, process.env.CRYPTO_SECRETKEY, (err, user) => {  
        
        if (err) {
          console.log("error del token")
          console.log(err.name)
          res.clearCookie("token")
          helpersENV.usuario = ""
          helpersENV.usuario_id = ""
          return res.render("login",{
            userName: helpersENV.usuario,      
          })
        }    
        const decodedToken = jwt.decode(authCookie);
        //console.log(decodedToken)
        //console.log(user)
        const expirationDate = new Date(decodedToken.exp * 1000); // Convertir a milisegundos
        console.log('Fecha de expiración:', expirationDate);
        
        
        // Desencriptar el nombre de usuario
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.CRYPTO_SECRETKEY), Buffer.from(user.iv, 'base64'));
        let decryptedNombreUsuario = decipher.update(user.nombreUsuario, 'base64', 'utf8');
        decryptedNombreUsuario += decipher.final('utf8');      
        
        console.log(decryptedNombreUsuario) 
        helpersENV.usuario = decryptedNombreUsuario
        helpersENV.usuario_id = decodedToken.userId
  
        //REFRESCANDO EL TOKEN EN LA COOKIE    
        const newToken = jwt.sign({ userId: decodedToken.userId, nombreUsuario: user.nombreUsuario, iv: decodedToken.iv }, process.env.CRYPTO_SECRETKEY, { expiresIn: '15m' });
        res.clearCookie("token")
        res.cookie("token", newToken)      
        next()   
         
      });
    }
} 

function logRequestInfo(req, res, next){
  console.log("MIDDLEWARE logRequestInfo")
    if(!req.cookies.token){
      console.log("no existe el token")      
    }else{


      //ESTO ES UN TEST PARA MEJORAR EL TEMA DEL NOMRBE_USUARIO
     /* const algorithm = 'aes-256-ctr';
      const ENCRYPTION_KEY = '1234567890123456123456789012345612345678901234561234567890123456'
      const IV_LENGTH = 16;

      function encrypt(text) {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
      }

      function decrypt(text) {
          let textParts = text.split(':');
          let iv = Buffer.from(textParts.shift(), 'hex');
          let encryptedText = Buffer.from(textParts.join(':'), 'hex');
          let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
          let decrypted = decipher.update(encryptedText);
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          return decrypted.toString();
      }

      var usuarioEnc = encrypt(helpersENV.usuario)
      console.log("ACA ABAJO EL NUEVO METODO CHETADO")
      console.log(usuarioEnc)

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res.cookie('user_name', usuarioEnc.toString('base64'), cookieOptions);


      var usuarioCookie = req.cookies.user_name
      var usuarioDes = decrypt(usuarioCookie)
      console.log("ACA ABAJO EL NOMBRE DESENC----------------------")
      console.log(usuarioDes)*/
      //FIN ESTO ES UN TEST PARA MEJORAR EL TEMA DEL NOMRBE_USUARIO

    }


    console.log("-------------------INICIO----------------------------")
    console.log("-----------------------------------------------------")
    const d = new Date();
    const dia = d.getDate()  
    const mes = d.getMonth() + 1
    console.log(d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0") +"  -  " + dia +"-" + mes +"-" + d.getFullYear() )   
    console.log("URL: " + req.method + " " + req.originalUrl)  
    console.log("IP: " + req.ip)  
    console.log("USUARIO: " + helpersENV.usuario) 
    console.log("USUARIO_ID: " + helpersENV.usuario_id)      
    console.log("----------------------------------------------------")
    console.log("-------------------FIN-------------------------------") 
    next();

}

module.exports = {
    authenticateToken,
    logRequestInfo

};