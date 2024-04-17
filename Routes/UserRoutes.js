require('dotenv').config()
const express = require('express')
const User = require('../Schemas/User.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router();
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const fetchUser = require('../Middleware/FetchUSer.js')

 


router.post('/signup',async(req,res) =>{
    try{

        const {Email,FirstName,LastName,Password} = req.body
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(Password,salt)
        
        const savedUser = new User({
            Email,
            FirstName,
            LastName,
            Password: hashedPass,
            Role: (Email==process.env.Admin) ? 'Admin' : 'Viewer'
        })

        await savedUser.save();

        const data = {
            id: savedUser._id
        }

        const token = jwt.sign(data,process.env.SECRET)
        res.status(200).json({token})
        

    }catch(e){
        res.status(400).json({error: e.body})
    }
})

router.post('/login', async (req, res) => { 
    try {

        const searchUser = await User.findOne({ Email: req.body.Email })
        if (!searchUser) {
            res.status(400).send("Wrong Credentials")
        }

        else if (searchUser) {

            try {

                const result = await bcrypt.compare(req.body.Password, searchUser.Password)
                const data = {
                    id: searchUser._id
                }

                if (result) {
                    
                    const token = jwt.sign(data, process.env.SECRET)
                    res.json({token})
                }
                else {
                    res.status(401).json({ error: "Wrong Password" }); 
                }

            } catch (error) {
                console.log(error)
            }

        }



    } catch (error) {
        console.log(req.body)
        res.status(400).send(error); 
    }
})

router.get('/user',fetchUser,async(req,res) =>{
    try{

        const userId = req.id;
        const loggedInUser = await User.findById(userId)
        res.status(200).json({loggedInUser})



    }catch(error){

        res.status(400).send(error); 

    }
})

router.post('/reset',async(req,res)=>{
    try{

        const {Email} = req.body;
        const id = shortid.generate(4)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            debug: true, 
            auth: {
              user: 'chints.rsg@gmail.com',
              pass: 'xlvn gmlw mgry txiu', 
            },
          });
          
          var mailOptions = {
            from: '"Contact Support" <chints.rsg@gmail.com>',
            to: Email,
            subject: 'Reset Your Password',
            text: `Your Key is ${id}`,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.status(200).json(id)
          

    }catch(e){

        res.status(500).json({error: e.body})

    }

    
})

router.patch('/update',async(req,res) =>{
    const {Email,Password} = req.body;

    try{

        const user = await User.findOne({Email})

        if(!user){
            res.status(404).send("User not found")
        }

        else if(user){

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Password, salt);
            user.Password = hashedPassword;
            user.save();
            
        }

        res.status(200).json("Password Successfully changed")

    }catch(e){

        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        

    }


})

router.get('/user',fetchUser,async(req,res)=>{
    try{

        const userid = req.id;
        const user = await User.findById(userid)
        if(!user){
            res.status(404).send("User not found")
        }else{
            res.status(200).json(user)
        }

    }catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get('/allusers',async(req,res)=>{
    try{

        const users = await User.find({}).select('-Password');
        res.status(200).json(users)

    }catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


module.exports = router;