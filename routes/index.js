var router = require("express").Router()
const fs = require('fs');
var helpersENV = require('../helpers/variables.js');

router.get("/", async (req, res)=>{    
  
    if(!req.cookies.token){    
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
    }
    
    let usuario_config = helpersENV.usuario_configuraciones.find((objeto) => objeto.user_name === helpersENV.usuario);

    res.render("index",{      
      userName: helpersENV.usuario,
      usuario_config: usuario_config
    })
})

router.get("/proyects",  async (req, res)=>{  
    if(!req.cookies.token){    
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
    }  
   // bk_bd()
   let usuario_config = helpersENV.usuario_configuraciones.find((objeto) => objeto.user_name === helpersENV.usuario);
    res.render("proyects",{    
      userName: helpersENV.usuario,
      usuario_config: usuario_config
    })
})

router.get("/test",  async (req, res)=>{  
    if(!req.cookies.token){    
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
    }  
   // bk_bd()
  
    res.render("test",{    
      userName: helpersENV.usuario
    })
})

router.get("/aprender",  async (req, res)=>{  
  if(!req.cookies.token){    
    helpersENV.usuario = ""
    helpersENV.usuario_id = ""
  }  
 // bk_bd()
  var dataFILEstrings
  try {
  dataFILEstrings = fs.readFileSync('./public/files/strings.txt', 'utf8');    
  } catch (err) {
    console.error('Error al leer el archivo:', err);
  }

 var dataFILEarrays
  try {
  dataFILEarrays = fs.readFileSync('./public/files/arrays.txt', 'utf8');    
  } catch (err) {
    console.error('Error al leer el archivo:', err);
  }

  var dataFILEtiposDatos
  try {
    dataFILEtiposDatos = fs.readFileSync('./public/files/tiposDatos.txt', 'utf8');    
  } catch (err) {
    console.error('Error al leer el archivo:', err);
  }
  

  res.render("aprender",{    
    userName: helpersENV.usuario,
    dataFILEstrings:  dataFILEstrings,
    dataFILEarrays: dataFILEarrays,
    dataFILEtiposDatos: dataFILEtiposDatos,

  })
})


module.exports = router