
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require("connect-mongo").default;

// requiring routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);


async function main(){
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    await mongoose.connect(process.env.ATLASDB_URL);
}

main()
.then(() => {
    console.log(" DB Connection successful!");
    
    //Server boots up ONLY after database connection finishes
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(` Server is listening to port ${PORT}`);
    });

    // app.listen(8080, ()=>{
    //     console.log("server is listening to port 8080");
    // })
})
.catch((err) => {
    console.error("CRITICAL DATABASE ERROR ON STARTUP:", err);
});

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
     crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600
});

store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE", err);
})
 
const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (7*24*60*60*1000),
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( (req,res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
 
// use routes for listings and reviews
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/", (req,res)=>{
//     res.send("Hi, I am root");
// });

// middlewares

// Page 404 not found middleware for all routes not found
app.all("*path", (req,res,next)=>{

    next(new ExpressError(404, "Page Not Found!"));
});

// error middleware
app.use((err, req, res, next)=>{

    let {status = 500, message = "Something went wrong!"}
    = err;

    res.status(status).render("listings/error.ejs", {message});
});

