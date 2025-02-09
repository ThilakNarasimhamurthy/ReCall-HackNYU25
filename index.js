const express = require('express');
const dotenv = require('dotenv');
// const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
// const fileupload = require('express-fileupload');
// const errorHandler = require('./Middleware/Error');
// const mongoSanitize = require('express-mongo-sanitize')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
// const helmet = require('helmet')
// const xss = require('xss-clean')
// const rateLimit = require('express-rate-limit')
// const hpp = require('hpp')
// const cors = require('cors')

//load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();



const auth = require('./routes/auth')
const appointments = require('./routes/appointments')




const app = express();

//Body parser
app.use(express.json())

// //Cookie parser
app.use(cookieParser());

// // Dev logging middleware
// if (process.env.NODE_ENV=== 'development'){
//     app.use(morgan('dev'));
// }




// //sanitize data
// app.use(mongoSanitize())

// //set security headers
// app.use(helmet());

//Prevent Xss attacks
// app.use(xss());

// //Ratelimitng
// const Limiter = rateLimit({
//     windowMs:10 *60*1000, //10 min
//     max :100
// });
// app.use(Limiter);

//Prevent http param pollution
// app.use(hpp());

// //Enable CROS
// app.use(cors())

//set static folder
// app.use(express.static(path.join(__dirname,'public')))

//Mount router

app.use('/api/auth', auth);
app.use('/api/appointments', appointments);


// app.use(errorHandler);


const PORT= process.env.PORT || 5000;

const server = app.listen(
    PORT,
     console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold )
);

//Handle Unhandled promise rejection
process.on('unhandledRejection',(err,Promise)=>{
    console.log(`Error: ${err.message}`)
    //close server and exit process
    server.close(()=> process.exit(1));
})