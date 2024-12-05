const router = require('express').Router();
const dotenv = require('dotenv');
const Product = require('../Models/productModel');
const Category = require('../Models/category');

dotenv.config();

router.post('/products',  async(req, res) => {
    await Category.findById(req.body.category)
    .then( category => {
        if(category) {
            const newProduct = new Product(req.body);
             newProduct.save()
                       .then(createdProduct => {
                          res.status(200).json(createdProduct);
         });
        }else{
            res.status(400).json({success: false, message: 'category is not existed'});  
        }
    }).catch(err => {
        res.status(404).json({success: false, error: err});
    });

 
});

// Get all products
router.get('/products/:categories', async(req, res) => {
    let filter = {};
   if(req.query.categories){
      filter = {category:req.query.categories.split(',')};
   }
    try {
        await Product.find(filter).populate('category')
        .then( products => {
           res.status(200).json(products);
        });

    }catch( err) {
       res.status(500).json({err, success:false});
    }

});

//Update product
router.put('/:id', async(req, res) => {
    await Category.findById(req.body.category)
    .then(findCategory => {
        if(findCategory) {
            Product.findByIdAndUpdate(req.params.id, {
                $set:req.body},{new:true}).populate('category')
            .then(updatedProduct => {
              return res.status(200).json(updatedProduct);
            })
        }else{
          return res.status(404).json({successt:false, message:'Invalid product object structure.'})
        }
    }).catch( err => {
        return res.status(500).json({success: false, error: err});
    });
   
});

//find one by id


router.get("/find/:id", async(req,res) => {
    try{
     const product = await Product.findById(req.params.id).populate('category');
     const { password, ...others } = product._doc;
        res.status(200).json(others);
        
    }catch(err){
        res.status(500).json("custom erre");
    }  
});

router.get('/get/count' , async(req, res) => {
    const countProduct = await Product.countDocuments({}).exec();
      if(!countProduct){
        res.status(500).json({success:false, message:'Product object is not exit'})
      }
      res.send({countProduct:countProduct});
    });

    router.get('/get/featured' , async(req, res) => {
        const products = await Product.find({isFeatured:true});
          if(!products){
            res.status(500).json({success:false, message:'Product object is not exit'})
          }
          res.send(products);
        });

module.exports = router;