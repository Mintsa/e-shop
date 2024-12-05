const router = require('express').Router();
const dotenv = require('dotenv');
const Category = require('../Models/category');
const category = require('../Models/category');

dotenv.config();


router.post('/categories',  async(req, res) => {
    const newCategory = new Category(req.body);
    try {
         await newCategory.save()
                         .then(category => {
                          res.status(200).json(category);
         });
    }catch( err) {
        res.status(500).json({err, success:false});
    }
});

router.get('/categories', async(req, res) => {
    try {
        await Category.find()
        .then( categories => {
           res.status(200).json(categories);
        });

    }catch( err) {
       res.status(500).json({err, success:false});
    }
});

//delete
router.delete('/category/:id', async(req, res) => {
     await Category.findByIdAndDelete(req.params.id)
     .then( cat => {
       if(cat){
        return res.status(200)
        .json({success:true,message:'the category is deleted'});
       } else {
        return res.status(404)
        .json({success: false, message:'category is not found.'});
       }
    }).catch( err => {
       return res.status(400).json({success: false, error: err})
    });
});

// find one by id
router.get('/category/:id', async (req, res) => {
   await Category.findById(req.params.id).then(findCategory => {
      if(findCategory){
        return res.status(200).json(findCategory);
      }else{
        return res.status(500).json({success: false,message:'category is note foud!'})
      }
   }).catch( err => {
    return res.status(400).json({success: false, error: err});
   });
});

//update category
router.put('/category/:id', async(req, res) => {
 await Category.findByIdAndUpdate(req.params.id,
    { $set:req.body},{new:true})
    .then(uptedCategory => {
       if(uptedCategory){
        res.status(200).json(uptedCategory);
       }else{
        res.status(404).json({success: false,message:'can not update category because is not found.'});
       }
    }).catch(err => {
       return res.status(400).json({success: false, error: err});
    });
});



module.exports = router;