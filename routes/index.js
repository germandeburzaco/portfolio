var router = require("express").Router()
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

  res.render("aprender",{    
    userName: helpersENV.usuario
  })
})


module.exports = router