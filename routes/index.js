var router = require("express").Router()
var helpersENV = require('../helpers/variables.js');

router.get("/", async (req, res)=>{    
  
    if(!req.cookies.token){    
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
    }
  
    res.render("index",{      
      userName: helpersENV.usuario
    })
})

router.get("/proyects",  async (req, res)=>{  
    if(!req.cookies.token){    
      helpersENV.usuario = ""
      helpersENV.usuario_id = ""
    }  
   // bk_bd()
  
    res.render("proyects",{    
      userName: helpersENV.usuario
    })
  })


module.exports = router