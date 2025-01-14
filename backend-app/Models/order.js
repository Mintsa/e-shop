const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
orderItems:[{type:mongoose.Schema.Types.ObjectId, ref:'OrderItem',require:true}],
phone:{type:String, require:true},
status:{type:String, require:true, default:'Pending'},
totalPrice:{type:Number,require:true},
user:{type:mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
country:{type:String, require:true,},
zip:{type:String, require:true},
city:{type:String, require:true},
shippingAddress:{type:String, require:true},
billingAddress:{type:String, require:true},
},{timestamps:true});

// Duplicate the ID field.
orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
orderSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Order',orderSchema);