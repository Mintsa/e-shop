const router = require('express').Router();
const User = require('../Models/userModel');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

router.get('/users', async(req, res) => {
  try {
      await User.find()//.select('-passwordHash')
      .then( users => {
         res.status(200).json(users);
      });

  }catch( err) {
     res.status(500).json({err, success:false});
  }
});

// find one by id
router.get('/users/:id', async (req, res) => {
  await User.findById(req.params.id).select('-passwordHash')
  .then(findUser => {
     if(findUser){
       return res.status(200).json(findUser);
     }else{
       return res.status(500).json({success: false,message:'User is note foud!'})
     }
  }).catch( err => {
   return res.status(400).json({success: false, error: err});
  });
});

router.post('/users/login', async(req, res) => {
     await User.findOne({email:req.body.email}).then(fundUser => {
     
       if(fundUser && isValidLogin(req.body.passwordHash,fundUser.passwordHash) ){
        const secret = process.env.SECRET;
        const token = jwt.sign({
                      userId:fundUser.id,
                      admin:fundUser.isAdmin
        },secret, {expiresIn:'1d'})
        res.status(200).json({user:fundUser.email,token:token})
       }else {
        res.status(404).json({success:false, message:'User not found'})
       }
     }).catch(err => {
      res.status(500).json({success:false, error:err});
     })
});

  isValidLogin = (password, passwordHash) =>{
  if( password === undefined){
    console.log("my password tap:"+password);
    return false;
  }
  if( passwordHash === undefined){
    console.log("my password tap:"+passwordHash);
    return false;
  }
  return bcrypt.compareSync(password,passwordHash);
}

router.get('/get/count' , async(req, res) => {
    const countUser = await User.countDocuments({}).exec();
      if(!countUser){
        res.status(500).json({success:false, message:'Product object is not exit'})
      }
      res.send({countUser:countUser});
    });

    //delete
    router.delete('/user/:id', async(req, res) => {
         await User.findByIdAndDelete(req.params.id)
         .then( user => {
           if(user){
            return res.status(200)
            .json({success:true,message:'the user is deleted'});
           } else {
            return res.status(404)
            .json({success: false, message:'user is not found.'});
           }
        }).catch( err => {
           return res.status(400)
           .json({success: false, error: err})
        });
    });


    //update category
    router.put('/update/:id', async(req, res) => {
      const existingUser = await User.findById(req.body.id);
      let newPassword = '';
      
        newPassword = req.body.passwordHash 
                      ? bcrypt.hashSync(req.body.passwordHash,10)
                      :existingUser.passwordHash;

        // update password             
        req.body.passwordHash = newPassword;
      
     await User.findByIdAndUpdate(req.params.id,
        { $set:req.body},{new:true})
        .then(uptedUser => {
           if(uptedUser){
            res.status(200).json(uptedUser);
           }else{
            res.status(404).json({success: false,message:'can not update user because is not found.'});
           }
        }).catch(err => {
           return res.status(400).json({success: false, error: err});
        });
    });

module.exports = router;