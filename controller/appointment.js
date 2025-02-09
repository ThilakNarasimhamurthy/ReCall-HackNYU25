const appointment = require('../model/appointment');
const ErrorResponse = require('../Utils/errorresponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto')
const user = require('../model/User');

// @desc  add appointment
//@route POST /api/v1/auth.register
//@access Public
exports.add = asyncHandler(async (req, res, next) => {
  const { date, location, doctor } = req.body;

  // Check if req.user is defined and has an id
  if (!req.user || !req.user.id) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  const caretaker = req.user.id;  // Directly using the logged-in user's ID as the caretaker

  // Validate required fields (you can add more validations if needed)
  if (!date || !location || !doctor) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  req.body.user = req.user.id;
  // Create new appointment with the logged-in user as the caretaker
  const newAppointment = new appointment({
    date,
    location,
    doctor,
    caretaker:req.body.user  // Automatically assign the logged-in user as the caretaker
  });

  // Save the appointment to the database
  await newAppointment.save();

  // Respond with success and appointment data
  res.status(200).json({
    success: true,
    data: newAppointment
  });
});




// @desc  Login user
//@route POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req,res,next)=>{
    const{username,password}=req.body;

   //validate email and password
   if(!username || !password){
        return next(new ErrorResponse('Please provide an username and password',400));
   }

   //check for user
   const user = await User.findOne({username}).select('+password');

   if(!user){
    return next(new ErrorResponse('Invalid credentials',401));
   }

   //Check if password matches
   const isMatch = await user.matchPassword(password);

   if(!isMatch){
    return next(new ErrorResponse('Invalid credentials',401))
   }

  sendTokenResponse(user,200,res);
})


// @desc  get current logged in user
//@route POST /api/v1/auth/me
//@access Private
exports.getMe=asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.user.id)

  res.status(200).json({success: true,data:user})
})
