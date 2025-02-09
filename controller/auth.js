const User = require('../model/User');
const ErrorResponse = require('../Utils/errorresponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto')


exports.signup = asyncHandler(async (req, res, next) => {
    const { name, username, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        username,
        password,
        role: "caretaker",
    });

    sendTokenResponse(user, 200, res);
});

exports.add = asyncHandler(async (req, res, next) => {
    const { name, username, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        username,
        password,
        role: "caretaker",
    });

    sendTokenResponse(user, 200, res);  // Only send this response
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

//@dec  add elderly people
exports.addelder = asyncHandler(async (req, res, next) => {
    try {
        const { name, username, password, medicalCondition, age, gender, relationToCaregiver } = req.body;

        // Ensure the logged-in user is a caretaker
        if (req.user.role !== 'caretaker') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create elderly user
        const elderlyUser = new User({
            name,
            username,
            password: hashedPassword,
            role: 'elderly',
            medicalCondition,
            caretaker: req.user.userId, // Link to caretaker
            age,
            gender, // Fix typo here
            relationToCaregiver,
        });

        await elderlyUser.save();

        // Check if caretaker already has an elderly user
        const caretaker = await User.findById(req.user.userId);
        if (caretaker.elderlyUser) {
            return res.status(400).json({ message: 'You already have an assigned elderly user.' });
        }

        // Assign the elderly user to the caretaker
        await User.findByIdAndUpdate(req.user.userId, { elderlyUser: elderlyUser._id });

        res.status(201).json({ message: 'Elderly user added successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

  

// @desc  Log user out /clear cookie
//@route get /api/v1/auth/me
//@access Private
exports.logout=asyncHandler(async(req,res,next)=>{
  res.cookie('token','none',{
    expires: new Date(Date.now() + 10*1000),
    httpOnly:true
  })

  res.status(200).json({success: true,data:{}})
})





//get token from model ,create cookie and send response
const sendTokenResponse=(user,statusCode,res)=>{
    // Create token
    const token = user.getSignedJwtToken();

    const options={
        expires : new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statusCode)
    .cookie('token',token,options)
    .json({
        success:true,
        token
    })
  }