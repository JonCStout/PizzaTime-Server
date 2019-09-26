const express = require('express')
const router = express.Router()
const productService = require('./products.service')

// adds, changes, deletions will be under /admin

router.get('/:prodId', getProdById)
router.get('/cat/:category', getProdsByCategory)
router.post('/newitem', newProduct)
router.post('/change/:prodId', changeProduct)

module.exports = router


function getProdById(req, res, next) {
    productService.getProdById(parseInt(req.params.prodId))
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function getProdsByCategory(req, res, next) {
    productService.getProdByCategory(req.params.category)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function newProduct(req, res, next) {
    productService.newProduct(req.body)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function changeProduct(req, res, next) {
    productService.changeProduct(parseInt(req.params.prodId), req.body)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}
