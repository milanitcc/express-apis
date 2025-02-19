const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

router.post('/register', async (req, res) => {

    const salt = await bcrypt.genSalt(18);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });

    const result = await user.save();

    const {password, ...data} = result.toJSON();

    res.send(data);
});

router.post('/login', async (req, res) => {

    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return res.status(404).send({
            message: 'User not found'
        });
    };

    if(!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'Invalid credentials'
        });
    }

    const {password, ...data} = user.toJSON();

    const token = jwt.sign({_id: user.id}, process.env.JWT_SECRET);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1day
    });

    res.send({
        message: 'success'
    });
});

router.get('/user', async (req, res) => {
    const cookie = req.cookies['jwt'];

    if(cookie !== undefined) {

        const claims = jwt.verify(cookie, process.env.JWT_SECRET);

        if(!claims) {
            return res.status(401).send({
                message: 'Unauthenticated'
            });
        }

        const user = await User.findOne({_id: claims._id});
        const {password, ...data} = user.toJSON();

        res.send(data);
    } else {
        return res.status(401).send({
            message: 'Unauthenticated'
        });
    }
});

router.post('/logout', (req, res) => {

    res.cookie('jwt', '', {maxAge: 0});

    res.send({
        message: 'success'
    });
});

module.exports = router;