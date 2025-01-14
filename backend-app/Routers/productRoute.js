const router = require('express').Router();
const dotenv = require('dotenv');
const Product = require('../Models/productModel');
const Category = require('../Models/category');
const multer = require('multer');
const { default: mongoose } = require('mongoose');

dotenv.config();

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadedError = new Error('invid image type')
        uploadedError = isValid 
                        ? null 
                        : uploadedError

      cb(uploadedError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })


router.post('/products',uploadOptions.single('image'), async(req, res) => {
    if(!req.file) {
        return res.status(400).json({success: false, message: 'image  is required'});  
    }
    await Category.findById(req.body.category)
    .then( category => {
        if(category) {
            const fileName = req.file.filename;
            const basePath =`${req.protocol}://${req.get('host')}/public/uploads/`;
            req.body.image = `${basePath}${fileName}`;
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
router.put('/:id',uploadOptions.single('image'), async(req, res) => {
    await Category.findById(req.body.category)
    .then(findCategory => {
        if(findCategory) {
            Product.findById(req.params.id)
            .then(foundProduct => {

               const fileName = req.file.filename;
               const basePath =`${req.protocol}://${req.get('host')}/public/uploads/`;
               
               req.body.image = req.file 
                                ? `${basePath}${fileName}` 
                                : foundProduct.image;
            //req.body.updatedAt = Date.now();

                                Product.findByIdAndUpdate(req.params.id, {
                                    $set:req.body},{new:true}).populate('category')
                                .then(updatedProduct => {
                                  return res.status(200).json(updatedProduct);
                                })
            });
             
           
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

//update product by adding galery.
router.put('/galery/:id',uploadOptions.array('images', 5), async(req, res) => {
        if(!mongoose.isValidObjectId(req.params.id)) {
           return res.status(400).json('Invalid product id.');
        }

        const files = req.files;
        const imagePaths = [];
       const basePath =`${req.protocol}://${req.get('host')}/public/uploads/`;

        if(files) {
            files.map((file) =>{
                const element = `${basePath}${file.fileName}`;
                imagePaths.push(element);
            });
        }
        
        await Product.findByIdAndUpdate(req.params.id,
            { images:imagePaths },{new:true})
            .then(productUpdated => {

                if(productUpdated){
                  return res.status(200).send({succes:true,productUpdated});
                } else {
                    return res.status(400).send({succes:false,message:'cannot find product'}); 
                }
            })

        
});


module.exports = router;