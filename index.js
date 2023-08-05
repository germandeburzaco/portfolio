const express = require("express")

const app = express()

/*****VARIABLES******/
const APP_PORT = process.env.PORT ?? "8080"

app.get("/*", (req, res)=>{
    res.send("HOLA MUNDO CRUEL")
})

app.listen(APP_PORT, ()=>{
    console.log("APP COORIENDO EN: " + APP_PORT)
})