const Listing = require("../models/listing");
const reviewController = require("../controllers/review.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};



module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({ 
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
};

module.exports.createListing= async (req, res, next) => {
    let url = req.file.path;
    let filename = req.filename;
   
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();

    req.flash("success","new Listing Created!");
    res.redirect("/listings"); 
    
    };


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listing");
    }

    // Prepare a resized image URL for preview
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Update text fields directly
        let listing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true } // return updated document
        );

        // Only update image if a new file was uploaded
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next({ statusCode: 400, message: err.message });
    }
};


  module.exports.deleteListing =async (req, res) => {
      let { id } = req.params;
  
      let deletedListing = await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      req.flash("success","Listing Deleted!");
      res.redirect("/listings");
  };
 