const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')

//Load User model
const User = require('../../models/User')

router.get('/test',(req,res) => res.json({msg:'Users works'}))

//register route
router.post('/register',(req,res)=>{
    User.findOne({email:req.body.email})
        .then(user =>{
            if(user){
                return res.status(400).json({
                    email:"Email has already exists!"
                })
            }else{
                //variable avatar
                const avatar = gravatar.url(req.body.email,{
                    s:"200", //size
                    r:"pg", //rating
                    d:"mm", //Default
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar,
                });

                bcrypt.genSalt(10,(err,salt) =>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if(err) throw err;

                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
});

//User Login route
router.post('/login',(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    User.findOne({email})
        .then(user =>{
            if(!user){
                return res.status(404).json({email:"User Not Found!"});
            }
            //check password
            bcrypt.compare(password, user.password)
                .then(isMatch =>{
                    if(isMatch){
                        res.json({msg:"Success..."})
                    }else{
                        return res.status(400).json({password:"Password Incorrect!"})
                    }
                })
        })
})

module.exports = router;