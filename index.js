const express = require("express")

const app = express()

app.set('views', './src/views')
app.set("view engine", "ejs")

/*****VARIABLES******/
const APP_PORT = process.env.PORT ?? "8080"

app.get("/*", (req, res)=>{
    res.render(index)
})

app.listen(APP_PORT, ()=>{
    console.log("APP CORRIENDO EN: " + APP_PORT)
})