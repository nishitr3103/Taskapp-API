const express= require('express');
const { model } = require('mongoose');
const Task=require('../models/tasks')
const auth= require('../middleware/auth');
const router= express.Router();

//configuring express to parse incoming json
router.use(express.json()); 

// task get request: to find all the tasks
//1) using simple promise and promise chaining
// app.get('/tasks',(req,res)=>{
//     Task.find({}).then((tasks)=>{
//         res.send(tasks)
//     }).catch((e)=>{
//         res.send(e)
//     })
// })
//2) using async await
router.get('/tasks', auth, async(req,res)=>{
    const match=req.query.completed //creating an object to chech what query string is passed  like true or false .. and based on that we will filter the tasks
    // querystring : tasks?completed=false
    
    try{
        //const task = await Task.find({}) old one    
        //const task= await Task.find({owner:req.user._id})
        // alternaive way : 
        const task = await Task.find({ owner: req.user._id,completed:match }).populate({
            path:'owner'
        })
        // this will populate the corresponding user also
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


// task get request : to fetch specific task
// 1) using simple promise and promise chaining
// app.get('/tasks/:id',(req,res)=>{
//     const id = req.params.id;
//     Task.findById(id).then((task)=>{
//         if(!task){
//             return res.status(404).send("Task not found")
//         }
//         res.send(task)
//     }).catch((e)=>{
//         res.send(e)
//     })
// })
// 2) using async await
router.get('/tasks/:id',auth, async(req,res)=>{
    const ID = req.params.id
    try{
        // const task = awati Task.findById(ID) we need authenicated user and his tasks will only be visisble... 

        const task= await Task.findOne({_id:ID, owner:req.user._id }) 
        // filtering based on the task id and owner 
        if(!task){
            return res.send(404).send("Task not found")
        }
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


// task post request: after inserting
// 1) using simple promise and promise chaining
// app.post('/tasks',(req,res)=>{
//     const tasks= new Task(req.body);
//     tasks.save().then(()=>{
//         res.status(201).send(tasks)
//     }).catch((e)=>{
//         res.status(400).send(e);
//     })
// })
//2) usiong async await
router.post('/tasks',auth, async (req,res)=>{
    //const task = new Task(req.body) when we were getting from body
    const task = new Task({
        ...req.body, // ... is an ES6 spread operator. Usage: this will copy all of the body to this object
        owner: req.user._id // here, we are hardcoding the owner field after the task fields.
    })    
    try{
        await task.save();
        res.status(201).send(task)
    }
    catch(e)
    {
        res.status(400).send(e)
    }

})

// particular task property will update 
router.patch('/tasks/:id',auth, async(req,res)=>{
    const update= Object.keys(req.body)
    const allowedUpdate=['description','completed']
    const validUpdate=update.every((value)=>allowedUpdate.includes(value))
    if(!validUpdate){
        return res.status(400).send("Invalid Update")
    }
    try{
        //const task= await Task.findByIdAndUpdate(req.params.id,req.body,{new:true , runValidators:true })
        const task = await Task.findOne({ _id:req.params.id, owner: req.user._id })
        if(!task){
            return res.status(400).send("Task not found! update not possible")
        }
        update.forEach((value)=> task[value] = req.body[value]); /// using bracket notaion to access a property dynamically
        await task.save();
        res.status(201).send(task)
    }
    catch(e){
        res.status(404).send(e)
    }
})

//delete a task
router.delete('/tasks/:id', auth,async (req,res)=>{
    try{
        //const task = await Task.findByIdAndDelete(req.params.id) old one
        const task = await Task.findOneAndDelete({ _id:req.params.id, owner: req.user._id }) 
        if(!task){
            res.status(404).send("Task not found")
        }
        res.send(task)
    }catch(e){
        res.status(404).send(e)
    }

    })

module.exports=router;``