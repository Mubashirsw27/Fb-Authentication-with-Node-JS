const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/facebookauth", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var userSchema = mongoose.Schema({
    uid: String,
    email: String,
    name: String,
    pic: String
})

module.exports = mongoose.model("User", userSchema)