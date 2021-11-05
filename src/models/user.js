const mongoose=require('mongoose');
const validator=require('validator');

const bcrypt = require('bcryptjs'); // installed npm i bcryptjs
const jwt = require('jsonwebtoken')// used to generate token for authorization

const task=require('./tasks');

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required: true,
        trim:true
        },

    email:{
        type:String,
        reuired:true,
        unique:true,
        trim:true,
        lowercase:true,   
            //use validate keyword !!
        validate(value){// here, we will use predefined validator. so, validato library is defined.
            if(!validator.isEmail(value))
            throw new Error("Invalid Email")
            }
        },
    password:{
        type:String,
        trim: true,
        required:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Password strength should not contain the word password");
                }
            }
        },
    age: {
        type : Number,
        default:0,
        validate(value){ /// this one is custom validator. so, validator library for this is not required
            if (value<0){
                throw new Error("Age can not be less than zero")
                }
            }
        },
        // here token is an array of objects, 
        tokens:[{
            token : {
                type:String,
                required:true
            }
        }],
        avatar:{
            type:Buffer// this will allow us to store the buffer with our binary images type
        }
    },{
        timestamps:true
    });

// setting this to acces task schema alsoat the time using populate 
// virtual property will not stored in database, just to create relationship btw two models
// userSchema.virtual('tasks',{ /// tasks : you can give any name
//     ref:'Task',
//     localField:'_id',
//     foreignField:'owner'
// })
//NEED TO CHECK THISSSS NOT WOKRING!!


// setting up new token when a new user is created or when a exisitng user is logged in
userSchema.methods.gettoken= async function(){
        const user=this;
        try{
           /// const token= await jwt.sign({_id:user._id.toString() },'thisismysecrettoken');
           const token= await jwt.sign({_id:user._id.toString() },process.env.JWTSECRET);
            const tokens=user.tokens.push({token});//here it add the token values to the array of tokens
            await user.save();
            return token
        }
        catch(e){
            console.log(e)
            throw new Error('token not generating')
        }            
}

// setting up logic for hiding private data in the profile
        // there is another way to do this like there is not required to call .getpublicprofile method like simply you can user here....
        // instead rename the getpublicprofile method in user.js file to to.JASON. 
        // to.JASON -- will run automatically we don't have to explicitly call it.
userSchema.methods.getpublicprofile =  function(){
    const user= this;
    const userObject = user.toObject();
    // toObject() --- This is provided by mandgoose, it will give the raw object with our user data attached 
     delete userObject.password;
     delete userObject.tokens;
    // this two will delete the password and token from the userObject but, it will not delete from DB.
    delete userObject.avatar;
    return userObject
}

// setting middlewar to check user credentials in login page
userSchema.statics.userCredtials= async (email,password)=>{
    //userCredtials is custome build
    //static -- helps to directly access the model when we have actually have access to ... like every time userschema is called this will also run
    const user = await User.findOne({email : email}) // find the passed email to check if its present or not
    if(!user){
        throw new Error("User not found")
    }
    const isMatch= await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error("Credentials invalid")
    }
    return user;
}

//setting middlewar for saving the password using hash algo to save in db.. and using pre and post because before an event (changes before saving user)
userSchema.pre('save', async function(next){   
    /// save is the name of the event
    // here, we will not use arrow function becasue arrow function can not bind  things.. need to chek !!!
    // this : is used to get access to the individual user thats about to be saved
    // next : if next is not used then the code will hang becasue it will think we are still running some lgics before saving the user and it will not save the user
    // everything will work at the time of creating user but it will not work at the time of updating because some mongoose queries bypass the advance middlewar functions... so, that why wee ned change patch request ...
    const user = this
    if(user.isModified('password')){ // is modefied will give true when new user password is created and also when any user password is updated
        user.password= await bcrypt.hash(user.password,8) //bcypt is installed and required
    }
    next()
})


// logic to delete all the cascasding tasks when the user profile is deleted....
userSchema.pre('remove', async function(next){
    const user=this;
    await task.deleteMany({owner:user._id})
    next();
})


const User = mongoose.model('User', userSchema)

module.exports=User;


// const user= new User({
//     name:"Nshit",
//     age:25,
//     email:"NISHIT@gmail.com",
//     password:"nnpassword"
// })

// user.save().then(()=>{
//     console.log('created document')
// }).catch((e)=>{
//     console.log("Erorrrrr ", e)
// })
