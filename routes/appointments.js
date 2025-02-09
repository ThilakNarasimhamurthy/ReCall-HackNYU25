const express = require('express');
const {
    add
   } = require('../controller/appointment');

// const{protect,authorize}= require('../middleware/auth')

const router = express.Router({ mergeParams:true});

// router.route('/').post(protect, authorize('caretaker'), add);
router.route('/add').post(add);
// router.get('/,add)

module.exports = router;