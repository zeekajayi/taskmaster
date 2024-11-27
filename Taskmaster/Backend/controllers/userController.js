const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const config = require('../config/config');

const userController = {
    async register(req, res) {
        try {
            const user = new User(req.body);
            await user.save();
            const token = jwt.sign({ id: user._id }, config.JWT_SECRET);
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid login credentials');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid login credentials');
            }
            const token = jwt.sign({ id: user._id }, config.JWT_SECRET);
            res.json({ user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};