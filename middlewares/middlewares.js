
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//MIDDLEWARE DE AUTENTICACION
function authenticateToken(req, res, next) {
  
    if(!req.cookies.token){
      console.log("no existe el token")
      
      usuario = ""
      return res.render("login",{
        userName: usuario,
      })
    }else{
      console.log("existe el token")
      const authCookie = req.cookies.token; // Lee el valor del token desde la cookie  
      
      jwt.verify(authCookie, secretKey, (err, user) => {  
        
        const decodedToken = jwt.decode(authCookie);
        //console.log(decodedToken)
        console.log(user)
        const expirationDate = new Date(decodedToken.exp * 1000); // Convertir a milisegundos
        console.log('Fecha de expiración:', expirationDate);
        
        if (err) {
          console.log("error del token")
          console.log(err.name)
          res.clearCookie("token")
          usuario = ""
          return res.render("login",{
            userName: usuario,      
          })
        }    
        
        // Desencriptar el nombre de usuario
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), Buffer.from(user.iv, 'base64'));
        let decryptedNombreUsuario = decipher.update(user.nombreUsuario, 'base64', 'utf8');
        decryptedNombreUsuario += decipher.final('utf8');      
        
        console.log(decryptedNombreUsuario) 
        usuario = decryptedNombreUsuario
  
        //REFRESCANDO EL TOKEN EN LA COOKIE    
        const newToken = jwt.sign({ userId: decodedToken.userId, nombreUsuario: user.nombreUsuario, iv: decodedToken.iv }, secretKey, { expiresIn: '15m' });
        res.clearCookie("token")
        res.cookie("token", newToken)      
        next()   
         
      });
    }
} 

module.exports = {
authenticateToken

};