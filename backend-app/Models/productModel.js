const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{type: String, require:true},
    description:{type: String, require:true},
    richDescription:{type: String, default:''},
    image:{type: String, default:''},
    images:[{type: String}],
    brand:{type: String, default:''},
    price:{type: Number, default:0.0},
    category:{type: mongoose.Schema.Types.ObjectId, ref:'Category',require:true},
    countIntStok:{type: Number, require:true, min:0 , max: 255 },
    rating:{type: Number, default:0},
    isFeatured: {type:Boolean, default:false}
    
}, {timestamps:true},)
// Duplicate the ID field.
productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
productSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Product',productSchema);

