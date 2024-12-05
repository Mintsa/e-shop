const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
name:{type:String, require:true},
email:{type:String, require:true},
passwordHash:{type:String, require:true},
phone:{type:String, require:true},
street:{type:String, default:''},
apartment:{type:String, default:''},
city:{type:String, default:''},
zipCode:{type:String, default:''},
country:{type:String, default:''},
isAdmin:{type:Boolean, default:false }
},{timestamps:true});

module.exports = mongoose.model('User',userSchema);