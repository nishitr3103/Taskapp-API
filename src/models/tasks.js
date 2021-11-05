const mongoose=require('mongoose');

const taskschema= new mongoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, // object id will be stored in the owner field.
        required:true,
        ref: 'User' // this alow to create a reference with this model to another model
    }
},{
    timestamps:true
})

// const task = new Task({
//     description:"    Complete node js",
//     completed:false
// })

// task.save().then(()=>{
//     console.log('created document')
// }).catch((e)=>{
//     console.log(e)
// })

const Task=mongoose.model('Task',taskschema)

module.exports=Task;