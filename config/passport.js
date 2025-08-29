const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const User=require('../models/userModel');
const env=require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
},


async(accessToken,refreshToken,Profile,done)=>{
try{
    let user=await User.findOne({googleId:Profile.id})
  if (user) {
    if (user.isBlocked) {
        return done(null, false, { message: "Your account has been blocked" });
    }
    return done(null, user);
}

    else{
        const fullName = Profile.displayName || "";
        const nameParts = fullName.split(" "); 
        const firstName = nameParts[0] || ""; 
        const lastName = nameParts.slice(1).join(" ") || ""; 

        const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: Profile.emails[0].value,
        googleId: Profile.id
        });
        await user.save();
        return done(null,user)
    }

}
catch(error){
    return done(error,null)
}
}));

passport.serializeUser((user,done)=>{
    done(null,user._id)
})

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{
        // console.log("deserializeUser ",user)
        done(null,user);
    })
    .catch(err=>{
        done(err,null)
    })
})

module.exports=passport;
