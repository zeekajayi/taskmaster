const { Task } = require('../models/Task');

const taskController = {
    async createTask(req, res) {
        try {
            const task = new Task({
                ...req.body,
                user: req.user._id
            });
            await task.save();
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getTasks(req, res) {
        try {
            const match = {};
            const sort = {};

            if (req.query.priority) {
                match.priority = req.query.priority;
            }

            if (req.query.completed) {
                match.completed = req.query.completed === 'true';
            }

            if (req.query.sortBy) {
                const parts = req.query.sortBy.split(':');
                sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
            }

            const tasks = await Task.find({ 
                user: req.user._id,
                ...match
            }).sort(sort);

            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateTask(req, res) {
        const updates = Object.keys(req.body);
        try {
            const task = await Task.findOne({ 
                _id: req.params.id,
                user: req.user._id
            });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            updates.forEach(update => task[update] = req.body[update]);
            await task.save();
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteTask(req, res) {
        try {
            const task = await Task.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = { userController, taskController };