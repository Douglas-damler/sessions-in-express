const express = require('express');
const session = require('express-session');
const app = express();
const store = session.MemoryStore();
const authorizedUser = require('./utils');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy();
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(express.json());

app.use(session({
    secret: "abijachari",
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true, sameSite: "none" },
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(passport.initialize());
app.use(passport.session());

const passwordHash = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    catch (err) {
        console.log(err);
    }

    return null;
}

const comparePassword = async (password, hash) => {
    try {
        const matchFound = await bcrypt.compare(password, hash);
        return matchFound;
    } catch (err) {
        console.log(err)
    }

    return false;

}

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.user.findById(id, (err, user) => {
        if (err) return done(err);
        done(null, user);
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
    db.users.findByUsername(username, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (user.password != password) return done(null, false);
        return done(null, user);
    });
}));

app.get("/protected", authorizedUser, (req, res, next) => {
    res.render("protected", { user: req.session.user });
});



app.post("/login", (req, res, next) => {
    const { username, password } = req.body;
    db.users.findByUsername(username, (err, user) => {
        if (!user) return res.status(403).json({ msg: "No user found!" });

        if (user.password === password) {
            req.session.authenticated = true;
            req.session.user = {
                username: username,
                password: password,
                cartcount: 3
            }

            console.log(req.session);
            res.redirect("/shop");
        }

        else {
            res.status(403).json({ msg: "Wrong credentials!" });
        }
    });
});

app.get("profile", (req, res) => {
    res.render("profile", { user: req.user });
    res.render("/profile");
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/login" }, (req, res) => {
    res.redirect("/profile");
}));

app.post("/register", async(req, res, next) => {
   const { username, password } = req.body;
   const newUser = await db.createUser(username, password); 

   if (newUser) {
       res.status(201).json({msg: "User created"}, username, password);
   }

   else {
       res.status(500).json({msg: "Internal server error"});
   }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}.`);
});