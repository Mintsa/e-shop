const router = require('express').Router();
const Order = require('../Models/order');
const OrderItem = require('../Models/orderItem');
const dotenv = require('dotenv');

dotenv.config();

router.post('/order',  async(req, res) => {
    const orderItemIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
       let newOrderItem = new OrderItem(orderItem);
       newOrderItem = await newOrderItem.save();

       return newOrderItem.id;
    }));
    
     req.body.orderItems =  await orderItemIds;

     const totalPrises = await Promise
                        .all((await orderItemIds)
                        .map(async(orderItemId) => {
                        const ordetItem = await OrderItem
                                                .findById(orderItemId)
                                                .populate('product','price');
                        const totalPrise = ordetItem.product.price * ordetItem.quantity;
                         return  totalPrise;                        
     }));
     const totalPrice = totalPrises
                        .reduce((acc, currentValue) => acc + currentValue,0 );

     req.body.totalPrice = totalPrice;
     const newOrder = new Order(req.body);
     newOrder.save().then(savedOrder => {
         if(savedOrder){
             res.status(200).json(savedOrder);
         }else{
             res.status(500).json({success:false, message:'can not save this object.'})
         }
     })
 
 });

// get all orders
 router.get('/orders', async(req, res) => {
   try {
       await Order.find().populate('orderItems').populate('user')//.select('-passwordHash')
       .then( order => {
          res.status(200).json(order);
       });
 
   }catch( err) {
      res.status(500).json({err, success:false});
   }
 });



 router.get('/orders/:id', async(req, res) => {
    try {
        await Order.findById(req.params.id)
        .populate({path:'orderItems',populate:'product'})//.select('-passwordHash')
        .then( order => {
           res.status(200).json(order);
        });
  
    }catch( err) {
       res.status(500).json({err, success:false});
    }
  });

  router.put('/order/:id', async(req, res) => {
   await Order.findByIdAndUpdate(req.params.id,
      { $set:req.body},{new:true})
      .then(uptedOrder => {
         if(uptedOrder){
          res.status(200).json(uptedOrder);
         }else{
          res.status(404).json({success: false,message:'can not update order because is not found.'});
         }
      }).catch(err => {
         return res.status(400).json({success: false, error: err});
      });
  });

  //delete
      router.delete('/order/:id', async(req, res) => {
               await Order.findByIdAndDelete(req.params.id)
               .then( order => {
                 if(order){
                  order.orderItems.map(async(element) => {
                    await OrderItem.findByIdAndDelete(element.valueOf())
                           .then(result => {
                              console.log('OrderItem child deleted:', result.id);
                           })
                           .catch(err => {
                              console.error('Error deleting OrderItem:', err);
                           });
                 });
                  return res.status(200)
                  .json({success:true,order});
                 } else {
                  return res.status(404)
                  .json({success: false, message:'order is not found.'});
                 }
              }).catch( err => {
                 return res.status(400)
                 .json({success: false, error:err})
              });
          });

   router.get('/order/get/totalsales', async (req, res) => {
      const totalsales = await Order.aggregate([
         { $group:{ _id: null, totalSales : { $sum: '$totalPrice'}}}
      ])

      if(!totalsales){
         res.status(400).send('The order sales connot be generated');
      }
     res.status(200).send({ tolalesales: totalsales.pop().totalSales});
   });
      

   router.get('/order/orderHistory/:userId', async(req, res) => {
      try {
          await Order.find({user:req.params.userId})
          .populate({path:'orderItems',populate:{path:'product',populate:'category'}})
          .sort({'createdAt':-1})
          //.select('-passwordHash')
          .then( ordersHistorique => {
            if(ordersHistorique){
               res.status(200).json(ordersHistorique);
            } else {
               res.status(400).json({'cannot find order with this user id:' :req.params.userId});
            }
             
          })
    
      }catch( err) {
         res.status(500).json({err, success:false});
      }
    });

 module.exports = router;
 