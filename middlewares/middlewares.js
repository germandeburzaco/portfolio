
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var helpersENV = require('../helpers/variables.js');

//MIDDLEWARE DE AUTENTICACION
function authenticateToken(req, res, next) {
  
    if(!req.cookies.token){
      console.log("no existe el token")
      
      helpersENV.usuario = ""
      return res.render("login",{
        userName: helpersENV.usuario,
      })
    }else{
      console.log("existe el token")
      const authCookie = req.cookies.token; // Lee el valor del token desde la cookie  
      
      jwt.verify(authCookie, process.env.CRYPTO_SECRETKEY, (err, user) => {  
        
        const decodedToken = jwt.decode(authCookie);
        //console.log(decodedToken)
        console.log(user)
        const expirationDate = new Date(decodedToken.exp * 1000); // Convertir a milisegundos
        console.log('Fecha de expiración:', expirationDate);
        
        if (err) {
          console.log("error del token")
          console.log(err.name)
          res.clearCookie("token")
          helpersENV.usuario = ""
          return res.render("login",{
            userName: helpersENV.usuario,      
          })
        }    
        
        // Desencriptar el nombre de usuario
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.CRYPTO_SECRETKEY), Buffer.from(user.iv, 'base64'));
        let decryptedNombreUsuario = decipher.update(user.nombreUsuario, 'base64', 'utf8');
        decryptedNombreUsuario += decipher.final('utf8');      
        
        console.log(decryptedNombreUsuario) 
        helpersENV.usuario = decryptedNombreUsuario
  
        //REFRESCANDO EL TOKEN EN LA COOKIE    
        const newToken = jwt.sign({ userId: decodedToken.userId, nombreUsuario: user.nombreUsuario, iv: decodedToken.iv }, process.env.CRYPTO_SECRETKEY, { expiresIn: '15m' });
        res.clearCookie("token")
        res.cookie("token", newToken)      
        next()   
         
      });
    }
} 

function logRequestInfo(req, res, next){

    console.log("-------------------INICIO----------------------------")
    console.log("-----------------------------------------------------")
    const d = new Date();
    const dia = d.getDate()  
    const mes = d.getMonth() + 1
    console.log(d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0") +"  -  " + dia +"-" + mes +"-" + d.getFullYear() )   
    console.log("URL: " + req.method + " " + req.originalUrl)  
    console.log("IP: " + req.ip)  
    console.log("USUARIO: " + helpersENV.usuario)  
    console.log("----------------------------------------------------")
    console.log("-------------------FIN-------------------------------") 
    next();

}

module.exports = {
    authenticateToken,
    logRequestInfo

};