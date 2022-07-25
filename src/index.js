const express = require("express");
const mongoose = require("mongoose")

const app = express();


app.use(express.json())

mongoose.connect("mongodb+srv://jiyalaltyagi:6PkFJWQJt7HgmggH@cluster0.8arzf.mongodb.net/groupXDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("HEY.. 😍😍 mongoDB is connected "))
    .catch((error) => console.log(error))

app.use("/", (req,res)=>{
    res.send("this is my ever api")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, function () { console.log(`Express is running on port ${PORT}`) })