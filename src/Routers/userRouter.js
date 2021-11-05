const express= require('express');
const { model } = require('mongoose');
const User=require('../models/user')
const jwt=require('jsonwebtoken')// used to generate token for authorization
const multer=require('multer'); // for file uploads
const sharp=require('sharp');// image resizeing and converting png format
const {sendwelcome}= require('../email/account') // this is called destructuring the objects from the list of objects exported from acount file.

const upload = multer({
    //dest:'avatars', // this will create an image folder with name avatars
    // but removing becasue we don't want to store the files in our locals..
    limits: { // limit is a property to limt different limits
        fileSize :200000 //(1mg= 1000000 bytes)      
    },
    fileFilter(req,file,cb){ // predefined funct
        if(!file.originalname.match(/|.(jpg|jpeg|png)$/)){
            //.originalname.match :predeinfed funct
            // /|.(jpg|jpeg|png)$/) is a regular expression syntax
            return cb(new Error('Please upload image'))
        }    
    cb(undefined,true)
    }
});

const auth=require('../middleware/auth')// an approval for the user to get access to different routes

const router= express.Router();

//configuring express to parse incoming json
router.use(express.json()); 

// for user login page
router.post('/users/login', async (req,res)=>{
    try{
        // userCredtials is a custom reuseable func created to fect the email and pass from db.
        const user = await User.userCredtials(req.body.email,req.body.password);
        // adding logic to get the token
        const token= await user.gettoken(); // user because we want to get the one user instance to get its token   
        res.status(201).send({user:user.getpublicprofile()}) 
        // getpublicprofile is created not to display the private data.
        // there is another way to do this like there is not required to call .getpublicprofile method like simply you can user here....
        // instead rename the getpublicprofile method in user.js file to to.JASON. 
        // to.JASON -- will run automatically we don't have to explicitly call it.
    }catch(e){
        res.status(400).send(e)
    }
})

// user logout page: if I have different sessions where I am logged in like pc, phone etc 
//and if I logged out from one place, I don't want to log out from everywhere 
router.post('/users/logout',auth, async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{/// here we are going to set the tokens array equals to the filter version of itself.. 
            return token.token!==req.token
            // token.token-- first token is the object we getting which is carrying token property
            // here, it will return true when the token we are currently looking at isn't the same used for authentication. 
            // it will return false when the tokens are same and it will filter out that token and save in the database.
            // .filter--if return statement is true than it keep it ....if return is false than it going to remove by filter
        })
        await req.user.save()
        res.status(202).send("Logged out")     
    }catch(e){
        res.status(400).send(e)
    }
})
//to log out from all the session or places you logged in
// req.user.tokens=[]
// await req.user.save()
// res.status(202).send("Logged out")  


//user post rquest: create new user
// // 1) using simple promise or promis chaining
// app.post('/users',(req,res)=>{
//     const user = new User(req.body)
//     user.save().then(()=>{
//         res.status(201).send(user)
//     }).catch((e)=>{
//         res.status(400).send(e)
//     })
// })
// 2) using async await
router.post('/users', async (req,res)=>{
    const users = new User(req.body)
    try{
        await users.save()
      //  sendwelcome(user.email,user.name);// this will send welcome mail to the newly created user from the email/account file
        // currently no using it but its working
        const token= await users.gettoken();
        res.status(201).send({users,token})
    }
    catch(e){ 
        console.log(e)
        res.status(400).send(e)
    }
})

// user get req: to read all the users

// 1) using simple promise or promise chaining 
// app.get('/users',(req,res)=>{
//     User.find({}).then((users)=>{
//         res.send(users)
//     }).catch((e)=>{
//         res.status(500).send(e);
//     })
// })
//2 using asyn await
// router.get('/users', auth, async (req,res)=>{
//     try{
//         const users= await User.find({});
//         res.send(users)
//     }
//     catch(e){
//         res.status(500).send(e)
//     }
// })

// user get req: to get the user profile after jwt authentication
router.get('/users/me',auth,(req,res)=>{ // 2nd argument auth will check and there in auth path we have provided next() so that here the 3rd argument will work
    res.send(req.user)// req.user value we are getting from auth middleware
})

// user get req, to read particular user id .. 
//but this we have removed becuase we are not going to use anymore becasue only profile will be displayed for the authenticated user from  /users/me 
// 1) using simple promise or promise chaining 
// app.get('/users/:id',(req,res)=>{
// // users/:id ---- is a route parameter (after colon can give any name)
// // used to capture dynamic values     
// // req.params will contains all the routes parameters we have provided
//     const Id= req.params.id;// to get id parameter which we have passed
//     User.findById(Id).then((user)=>{
//         if(!user){
//             return res.status(404).send("User not found")
//         }
//         res.send(user)
//     }).catch((e)=>{
//         res.send(e)
//     })
// })
// 2) using asysn await
// router.get('/users/:id', async(req,res)=>{
//     const Id = req.params.id
//     try{
//         const users= await User.findById(Id)
//         if(!users){
//             return res.status(404).send("User not found")
//         }    
//         res.send(users)
//     }
//     catch(e){
//         res.status(400).send(e)
//     }
// })


// user will update their info:
// router.patch('/users/:id', async(req,res)=>{
//     // logic to update only the fileds which are there....  but, anyways if someone updated like gneder:'male' will not create field in DB because of the db model how we created and this is just for error handleing
//     const update = Object.keys(req.body)// this will return an array of all the strings where each is property
//     const allowedUpdates=['name','email','password','age']
//     const isValidate= update.every((value)=>allowedUpdates.includes(value))// this will check all the updating objects are in our model or not.. if all updating objects are there then, it will assign the value of isValidate to true (.every return booleon) and if any one of the updating object is not present then it will return the valsue as false..
    
//     if(!isValidate)
//     {
//         return res.status(400).send("Invalid updates")
//     }
//     try{
//         // For user middlewar, everything will work at the time of creating user but it will not work at the time of updating because some mongoose queries likr findbyidandupdate bypass the advance middlewar functions... so, that why wee ned change patch request ...
//         //old code
//         //const user= await User.findByIdAndUpdate(req.params.id, req.body,{ new :true, runValidators:true});
//         //new code
//         const user= await User.findById(req.params.id);
//         update.forEach((value)=> user[value] = req.body[value]); /// using bracket notaion to access a property dynamically
//         await user.save();
//         // properties
//         // { new: true }:--- this will return the new user opposed to existing one that was found earlier before the update 
//         // runValidators: true --- run vlaidation for the updates..
//         if(!user){
//             return res.status(400).send("User not found! update not possible")
//         }
//         res.status(201).send(user)
//     }catch(e){
//         console.log('try problem')
//         res.status(404).send(e)
//     }
// }) // new way after the user got authenticated, user can update the info
router.patch('/users/me', auth, async(req,res)=>{
    // logic to update only the fileds which are there....  but, anyways if someone updated like gneder:'male' will not create field in DB because of the db model how we created and this is just for error handleing
    const update = Object.keys(req.body)// this will return an array of all the strings where each is property
    const allowedUpdates=['name','email','password','age']
    const isValidate= update.every((value)=>allowedUpdates.includes(value))// this will check all the updating objects are in our model or not.. if all updating objects are there then, it will assign the value of isValidate to true (.every return booleon) and if any one of the updating object is not present then it will return the valsue as false..
    
    if(!isValidate)
    {
        return res.status(400).send("Invalid updates")
    }
    try{
        update.forEach((value)=> req.user[value] = req.body[value]); /// using bracket notaion to access a property dynamically
        await req.user.save();
        res.status(201).send(req.user)
    }catch(e){

        res.status(404).send(e)
    }
})


//delete particular use
// router.delete('/users/:id', async(req,res)=>{
//     try{
//     const user= await User.findByIdAndDelete(req.params.id);
//     if(!user){
//         return res.status(404).send("User not found")
//     }
//     res.send(user)
//     }catch(e){
//         res.status(404).send(e)
//     }
// })
router.delete('/users/me', auth, async(req,res)=>{
    try{
    //const user= await User.findByIdAndDelete(req.user._id);
    // req.user._id we are getting from Auth
    
    await req.user.remove() // new way to delete using mongoose method
    // we have added a logic in userschema to delete all user's task if the user is deleted..

    res.send(req.user)
    }catch(e){
        res.status(404).send(e)
    }
})

// for user profile picture:
router.post('/users/me/avatar', auth, upload.single('avatar') , async (req,res)=>{
// upload.single() is an middleware to upload the picture
// 'avatar'  is a placeholder, in postman we have to give pic here... signle will help to get the 'avatar' value.
//req.user.avatar  = req.file.buffer // this will save the origanl photo or the size which the user has uploaded
// file.buffer :-  (pre defined) contains all the binary data for that file and we can acess it 

// new way for image saving
const buffer= await sharp(req.file.buffer).resize({width:300,height:300}).png().toBuffer()
// req.file.buffer -- where the image is stored or from where we can access it.
//resize == resize the image in dimensions provided
//png() will convert the resized image to png format
//toBuffer() -- convert it back to buffer os that we can access that.

req.user.avatar =buffer; //setting the value of buffer (final image) in the databse
await req.user.save();
res.status(200).send('Profile pic uploaded !');
},(error,req,res,next)=>{ // this is another callback function added to handel unexpected errors thrown my multer
// this function needs to have this signature (argumnets).. 
    res.status(400).send({error:error.message})
})

// router to delete the user avatar
router.delete('/users/me/avatar', auth, async (req,res)=>{
//await req.user.avatar.remove();
// we can't use remove() here because the avatar property is not an instance of any model. You can only call .remove() if the property is an instance of a model like User, Task, etc.
req.user.avatar  = undefined;
await req.user.save();
res.status(200).send("Profile pic deleted !")
})


//router to display users profile pic
//here, no need for authentication since We want other users to be able to see each other's avatar which is why we don't add the auth middleware there.
router.get('/users/:id/avatar', async (req,res)=>{
try{
    const user= await User.findById(req.params.id);
    if(!user | !user.avatar){
        throw new Error();
    }
    res.set('Content-Type','image/png');
    // .set is used set a response
    // The Content-Type header is used to indicate the media type of the resource. and image/png is the type

    res.status(200).send(user.avatar)
}catch(e){
    res.status(404).send(e)
}
})


module.exports=router;