// this is to provide authentication for the users to get access for http request ... so this authenication is not there for user creation and user uprofile updataion. 
// so this will be exculed in two http mmethod: user login POST req and update user POST req

const User= require('../models/user')
const jwt=require('jsonwebtoken');

const auth= async(req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')//remove 'Bearer '
        //const valid=jwt.verify(token,'thisismysecrettoken')
        const valid=jwt.verify(token,process.env.JWTSECRET);
        const user= await User.findOne({_id:valid._id,'tokens.token':token}) ;

        if(!user){
            throw new Error()
        }
        req.token=token//setting the req.token value to the current token used for authentication.
        req.user=user// setting the value of req.user for the authenticated user
        next();
        // here this next() is important.. this will let run the third argument (req,res) for all the called router

    }catch(e){
        res.status(401).send('Please Authenticate !')
    }   
}
module.exports= auth;