const mongoose=require('mongoose');
//const validator=require('validator') this will be used to use predefined validator

// this is for dev  (local)
// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{
//     useNewUrlParser: true
//     //useCreateIndex: true
// })

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true
    //useCreateIndex: true
})