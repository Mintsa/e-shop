const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
product:{type:mongoose.Schema.Types.ObjectId, ref:'Product',require:true},
quantity:{type:Number, require:true},
},{timestamps:true});

// Duplicate the ID field.
orderItemSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
orderItemSchema.set('toJSON', {
    virtuals: true
});


module.exports = mongoose.model('OrderItem',orderItemSchema);