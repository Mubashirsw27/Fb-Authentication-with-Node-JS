require("./config/dotEnv")

// 3rd Party Modules
const express = require("express");
const passport = require("passport");

// User Defined Modules



const app = express();


const session = require("express-session")
const fbStrategy = require("passport-facebook").Strategy;
app.use(session({
    secret: "MubashirIbrahim", resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session())

const User = require("./models/User")


app.set("view engine", "ejs");


// Make Fb Strategy

passport.use(new fbStrategy({

    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: `http://localhost:${process.env.PORT}/facebook/callback`,
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
},
    function (token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {

            // find the user in the database based on their facebook id
            User.findOne({ 'uid': profile.id }, function (err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    console.log("user found")
                    console.log(user)
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();

                    // set all of the facebook information in our user model
                    newUser.uid = profile.id; // set the users facebook id                  
                    // newUser.token = token; // we will save the token that facebook provides to the user                    
                    newUser.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    // newUser.gender = profile.gender
                    newUser.pic = profile.photos[0].value
                    // save our user to the database
                    newUser.save(function (err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });

        })


    }

))


app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get('/auth/facebook', passport.authenticate('facebook', { scope: "email" }))

app.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: "/profile",
    failureRedirect: "/failed"
}))

// app.get('/profile', (req, res) => {
//     res.send("You are authenticated Successfully✅")
// })

app.get('/profile', isLoggedIn, function (req, res) {
    console.log(req.user)
    res.render('profile', {
        user: req.user // get the user out of session and pass to template
    });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

app.get("/failed", (req, res) => {
    res.send('You are not authenticated❌')
})

passport.serializeUser(function (user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})


app.listen(process.env.PORT,
    () => console.log(`listening on port: ${process.env.PORT}`));




