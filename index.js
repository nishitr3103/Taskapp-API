const { application } = require('express');
const express= require('express');
require('./src/db/mongoose');// allow mangoose connects to database

const userRouter=require('./src/Routers/userRouter');
const taskRouter=require('./src/Routers/taskRouter');

const port=process.env.PORT;
const app=express();


// if the site is in maintenance
// app.use((req,res,next)=>{
//     res.statu(503).send('<h1>Currently, the site is in maintenance</h1>')
//      here, next is not required coz we don't want to run further routes
// })

app.use(userRouter);
app.use(taskRouter);

app.use('/',(req,res)=>{
    res.status(404).send('<h1>Page not Found !</h1>')
})

app.listen(port);