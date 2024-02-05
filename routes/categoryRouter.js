const categoryController = require('../controllers/categoryController');

const express = require('express');
const auth = require('../middlewares/auth');
const categoryRouter = express.Router()

categoryRouter.post("/create", categoryController.create)
categoryRouter.get("/", categoryController.getTags)


module.exports = categoryRouter