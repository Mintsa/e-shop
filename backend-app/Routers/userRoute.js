const router = require('express').Router();
const User = require('../Models/userModel');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();



//registration user 
router.post('/users/registration', async(req, res) => {
     const newUser = new User(req.body);
     newUser.passwordHash = bcrypt.hashSync(req.body.passwordHash,10);
     await newUser
     .save()
     .then(saveUser => {
          if(saveUser){
            res
            .status(200)
            .json(saveUser);
          }else {
            res.status(404).json({success:false,message:'registration failed'})
          }
     }).catch(err => {
        res.status(500).json({success:false,error:err});
     })
});

module.exports = router;