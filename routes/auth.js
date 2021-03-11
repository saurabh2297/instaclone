const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User_data')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {SENDGRID_API,EMAIL} = require('../config/keys')



const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: SENDGRID_API
    }
}))

//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


router.post('/signup',(req,res)=>{
    const {name,email,password,pic} = req.body
    if(!email || !password || !name){
        return res.status(422).json({error:"all fields required"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exist"})
        }
        bcrypt.hash(password,10)
        .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                pic
            })
            user.save()
            .then(user=>{
                 transporter.sendMail({
                    to:user.email,
                    from:"saurabhgangwar621@gmail.com",
                    subject:"signup success",
                    html:"<h1>welcome to sginstagram</h1>"
                })
                res.json({message:"registeration succesfull"})
            })
            .catch(err=>{
                console.log(err)
            })
        })     
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
       return res.status(422).json({error:"add email and password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
        
          return  res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const{_id,name,email,followers,following,pic,bio} = savedUser
                res.json({token,User:{_id,name,email,followers,following,pic}})
            }
            else{
                return  res.status(422).json({error:"Invalid email or password"}) 
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User dont exists with that email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"saurabhgangwar621@gmail.com",
                    subject:"password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message:"check your email"})
            })

        })
    })
})


router.post('/new-password',(req,res)=>{
   const newPassword = req.body.password
   const sentToken = req.body.token
   User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
   .then(user=>{
       if(!user){
           return res.status(422).json({error:"Try again session expired"})
       }
       bcrypt.hash(newPassword,12).then(hashedpassword=>{
          user.password = hashedpassword
          user.resetToken = undefined
          user.expireToken = undefined
          user.save().then((saveduser)=>{
              res.json({message:"password updated success"})
          })
       })
   }).catch(err=>{
       console.log(err)
   })
})



module.exports = router