const express = require("express");
require("dotenv").config();
const { dbConnection } = require("./db/config")
const cors = require("cors")
//creo server de express 
const app = express();
dbConnection();
//bdd

//escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log("Server inciado")
})

app.use(cors())

//lectura y parseo del body
app.use(express.json())

//rutas auth
app.use("/api/auth", require("./routes/auth"))
app.use("/api/events", require("./routes/events"))

//directorio publico
app.use(express.static('public'))

