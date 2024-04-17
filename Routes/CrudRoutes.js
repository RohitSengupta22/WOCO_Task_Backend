require('dotenv').config()
const express = require('express')
const User = require('../Schemas/User.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router();
const nodemailer = require('nodemailer');
const shortid = require('shortid');
const fetchUser = require('../Middleware/FetchUSer.js')

router.patch('/edit/:id', async (req, res) => {
    try {
        const { FirstName, LastName } = req.body;
        const userId = req.params.id;

        // Check if FirstName and LastName are provided
        if (!FirstName || !LastName) {
            return res.status(400).json({ error: "Both FirstName and LastName are required." });
        }

        // Find the user by ID and update their FirstName and LastName
        const user = await User.findByIdAndUpdate(
            userId,
            { FirstName, LastName },
            { new: true } // To return the updated document
        );

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "User details updated successfully.", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id;

       
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/add',async(req,res)=>{
    try{

        const {FirstName,LastName,Email} = req.body
        const Key = shortid.generate(6)
        const salt = await bcrypt.genSalt(10);
        const Pass =  FirstName.toUpperCase()+Key
        const hashedPass = await bcrypt.hash(Pass,salt)
        const savedUser = new User({
            Email,
            FirstName,
            LastName,
            Password: hashedPass
        })

        await savedUser.save()

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            debug: true, // for debugging purposes
            auth: {
              user: 'chints.rsg@gmail.com',
              pass: 'xlvn gmlw mgry txiu', // replace with your app password
            },
          });
          
          var mailOptions = {
            from: '"Contact Support" <chints.rsg@gmail.com>',
            to: Email,
            subject: 'Your Login Password',
            text: `Your Password for login is ${Pass}. Kindly, reset your Password at the earliest.`,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });


        res.status(200).json({savedUser})

    }catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });

    }
})




module.exports = router;


