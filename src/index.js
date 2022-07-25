const express = require("express");
const mongoose = require("mongoose")
const route=require("./routes/route")

const app = express(); 


app.use(express.json())

mongoose.connect("mongodb+srv://jiyalaltyagi:6PkFJWQJt7HgmggH@cluster0.8arzf.mongodb.net/group65Database", {
    useNewUrlParser: true
})
    .then(() => console.log("HEY.. 😍😍 mongoDB is connected "))
    .catch((error) => console.log(error)) 

app.use("/", route) 
 
const PORT = process.env.PORT || 4000

app.listen(PORT, function () { console.log(`Express is running on port ${PORT}`) })