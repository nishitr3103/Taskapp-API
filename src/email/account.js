const sendgrid= require('@sendgrid/mail')

// thsi is set in config.env file

sendgrid.setApiKey(process.env.SENDGRIDAPI);

const sendwelcome= (emai,name)=>{
        sendgrid.send({
        to:name,
        from:'',// created authentication in sendgrid
        subject:'testing',
        text:'Welcome'
    }).then((s) => {
        console.log(s)
    }).catch((e) => {
        console.log(e)
    })
}


module.exports={
    sendwelcome
   // ,sendbye // this i hvae created but for example 
}

// when we want to export multiple functions from this file then this is the way to export it. 
// so that's why it is exported as objects
// but here I have not created goodby mail once the user deleted its profile

