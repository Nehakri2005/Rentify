const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});





router
  .route("/")
  .get(wrapAsync(listingControllers.index))
  .post(
    isLoggedIn,
    // validateListing,
    upload.single('listing[image]'),
    wrapAsync(listingControllers.createListing)
  );


// router.get("/:category",(req,res)=>{
//   const {category}=req.params;
//   console.log(category);
//   res.send("completed")
  
// })

router.get('/category/:category', wrapAsync(listingControllers.showByCategory));
router.get("/search",wrapAsync(listingControllers.searchListing));



// new route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingControllers.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

//edit routes
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);

module.exports = router;
