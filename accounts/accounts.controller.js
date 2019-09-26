const express = require('express')
const router = express.Router()
const accountService = require('./accounts.service')


// adds, changes, deletions will be under /admin

router.get('/:accountId', getByIdCB)
router.post('/newaccount', newAccountCB)
router.post('/change/:accountId', changeAccountCB)
router.get('/search/:searchParam', searchAccountCB)

module.exports = router


// *** getAuth ?

function getByIdCB(req, res, next) {
    accountService.getAccount(parseInt(req.params.accountId))
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function newAccountCB(req, res, next) {
    let accountData = req.body
    accountService.newAccount(accountData)
    .then(data => data ? res.json(data) : res.sendStatus(500))
    .catch(err => next(err))
}

function changeAccountCB(req, res, next) {
    let accountData = req.body
    let id = parseInt(req.params.accountId)
    accountService.changeAccount(id, accountData)
    .then(() => res.json({}))
    .catch(err => next(err))
}

function searchAccountCB(req, res, next) {
    let searchParam = req.params.searchParam
    accountService.searchAccount(searchParam)
    .then(data => data ? res.json(data) : res.sendStatus(500))  // *** return something other than empty array for not found results?
    .catch(err => next(err))
}