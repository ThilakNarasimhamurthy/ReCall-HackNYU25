const express = require('express');

const router = express.Router();

const { signup,login,logout,addelder } = require('../controller/auth');

router.post('/signup',signup).post('/login',login)
router.get('/logout',logout)
router.post('/addelder',addelder)
// router.put('/updatedetails',protect,updateDetails)
// router.put('/updatepassword',protect,updatePassword)
// router.post('/forgotPassword',forgotPassword)
// router.put('/reserPaswword/:resettoken',resetPassword)
// router.put('/reserPaswword/:resettoken',resetPassword)

module.exports = router;