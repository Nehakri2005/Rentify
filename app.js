if(process.env.NODE_ENV!="production"){
require('dotenv').config()
console.log(process.env.secret);
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter=require("./routes/user.js");


const db_url = process.env.ATLAS_URL;
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_url, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 5000, 
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const Store = MongoStore.create({
  mongoUrl:db_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter:24*3600,
});

Store.on("error",(err)=>{
  console.log("Error in mongo session store",err);
})

const sessionOptions={
  store: Store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,

  }

}

// app.get("/", (req, res) => {
//   res.send("i am listening");
// });



 //implemente session
app.use(session(sessionOptions));
app.use(flash());

//passport initialize on session
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
 res.locals.currUser=req.user;
 next();
});





app.use("/listings", listingsRouter);
app.use("/listings/:id/review", reviewsRouter);
app.use("/",userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statuscode = 500, message = "Something went wrong!" } = err;
  res.status(statuscode).render("./listings/error.ejs", { message });
  // res.status(StatusCode).send(message);
});



app.listen(port, () => {
  console.log("server is listening to port 3000");
});
