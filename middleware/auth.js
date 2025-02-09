const asyncHandler = require('../middleware/async');
const ErrorResponse = require('./Utils/errorresponse');
const User = require('../model/User');

//protect routes
exports.protect = asyncHandler(async (req,res,next)=>{
    let token;

    if(req.headers.authorization  &&
       req.headers.authorization.startsWith('Bearer')
        ){
            token = req.headers.authorization.split(' ')[1];
        }

    else if(req.cookies.token){
        token =req.cookies.token
    }

    //make usre token exists
    if(!token){
        return next(new ErrorResponse('not authorized to access this route',401))
    }
    try {
        //verify token
        const decoded =jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);

        req.user = await User.findById(decoded.id);
        next()
    } catch (err) {
        return next(new ErrorResponse('not authorized to access this route',401))
    }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

