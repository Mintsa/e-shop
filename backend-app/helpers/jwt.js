const { expressjwt: jwt } = require('express-jwt');
const dotenv = require('dotenv');

dotenv.config();

function  authJwt() {
    const secret = process.env.SECRET
    return jwt({
        secret,
        algorithms:["HS256"]
    }).unless({
        
        path:[
        {url:'/\/api\/v1\/products(.*)/', methods: ['GET','OPTION']},
        {url:'/\/api\/v1\/categories(.*)/', methods: ['GET','OPTION']},
        '/api/v1/users/login',
        '/api/v1/users/registration']
    })
}
async function isRevoked(req, payload, done){
  if(!payload?.isAdmin){
    done(null,true);
  }
  done();
}

module.exports = authJwt;
