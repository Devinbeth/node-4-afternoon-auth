require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const { DOMAIN, CLIENT_ID, CLIENT_SECRET, SECRET, PORT } = process.env;
const students = require('./students.json');

const app = express();
app.use(session({
    secret: '@nyth!ng y0u w@nT',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: '/login',
    scope: "openid email profile"
},
    function (accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.get('/login',
    passport.authenticate('auth0',
        { successRedirect: '/students', failureRedirect: '/login', connection: 'github' }
    )
);

function authenticated(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.sendStatus(401);
    }
}

app.get('/students', authenticated, (req, res, next) => {
    res.status(200).send(students)
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
