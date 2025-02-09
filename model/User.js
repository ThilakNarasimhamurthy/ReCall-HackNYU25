const crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please add a name']
    },
    username:{
        type:String,
        required:[true,'please add a name']
    },
    password:{
        type:String,
        required:[true,'please add a password'],
        minlength:6,
        select:false
    },
    role: {
        type: String,
        enum: ['caretaker', 'elderly'],
        required: true
    },
    elderlyUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // For elderly users
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    medicalCondition: {
        type: String,
        required: function() {
            return this.role === 'elderly'; // Only required for elderly users
        }
    },
    age: {
        type: Number,
        required: function() {
            return this.role === 'elderly'; // Only required for elderly users
        }
    },
    gender: {
        type: String,
        enum:
        [
            'male',
            'female',
            'doesn\'t apply'
        ],
        required: function() {
            return this.role === 'elderly'; // Only required for elderly users
        }
    },
    relationToCaregiver: {
        type: String,
        required: function() {
            return this.role === 'elderly'; // Only required for elderly users
        }
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]


});

//Sign JWT and Return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
});

module.exports = mongoose.model('User',UserSchema)