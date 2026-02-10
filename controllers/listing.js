const Listing = require("../models/listing.js");
const opencage = require('opencage-api-client');

module.exports.index = async (req, res) => {
  // try {
  //   const searchLocation = req.query.location || "";
  //   const filter = {};
  //   if (searchLocation) {
  //     // exact, case‑insensitive match on the `location` field
  //     filter.location = new RegExp(`^${searchLocation.trim()}$`, 'i');
  //   }


  const alllistings = await Listing.find();
  res.render("./listings/index.ejs", { alllistings });
 
// } catch (err) {
//   next(err);
// }
};

module.exports.searchListing= async(req,res)=>{
  const searchLocation = req.query.location || "";
  const filter ={};
  if(searchLocation){
    // filter.location = new RegExp(`^${searchLocation.trim()}$`, 'i');
    const regex = new RegExp(searchLocation.trim(), 'i'); // case-insensitive partial match
    filter.$or = [
      { location: regex },
      { country: regex }
    ];
    const alllistings = await Listing.find(filter);
    res.render("listings/index", { alllistings});
  }
}

module.exports.showByCategory = async (req, res) => {
  const { category } = req.params;
  const alllistings = await Listing.find({ category });
  res.render("listings/index", { alllistings}); // reuse your index.ejs or any template
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("Owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  res.render("./listings/show.ejs", { listing,searchLocation:" " });
};

module.exports.createListing=async (req, res, next) => {
  let url=req.file.path;
  let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.Owner = req.user._id;
    newListing.image={url,filename};
      
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  }

  module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs", { listing ,originalImageUrl,searchLocation:" "});
  }

  module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success", " Listing Updated");
    res.redirect(`/listings/${id}`);
  }

  module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  }

 
  