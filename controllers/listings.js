const Listing = require("../models/listing.js")

module.exports.index = async (req,res)=>{

    const allListings =  await Listing.find();
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req,res)=>{  

    res.render("listings/new.ejs");
}

module.exports.createListing = async (req,res,next)=>{

        // let{title, description, image, price , country, location} = req.body;
        const newListing = req.body.listing;
        console.log(newListing);

        const user1 = new Listing(newListing);
        user1.owner = req.user._id;

        await user1.save()
        .then(()=> console.log("user saved"))
        
        req.flash("success", "New Listing Created!");

        res.redirect("/listings");
    
}

module.exports.showListing = async (req, res)=>{

    let {id} = req.params;

    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"}})
    .populate("owner");
    
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/Listings");
    }
    
    res.render("listings/show.ejs", {listing});
}

module.exports.editListing = async (req,res)=>{

    let {id} = req.params;
    const listing = await Listing.findById(id);

     if(!listing){
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/Listings");
    }

    res.render("listings/edit.ejs", {listing});
}

module.exports.updateListing = async (req,res)=>{

    
    const {id} = req.params;

    const { title, description, price, location, country, image } = req.body.listing;
    
    await Listing.findByIdAndUpdate(id, 
        {title, 
        description, 
        price, 
        location, 
        country, 
        image, 
    }, 
    {runValidators: true}
    )
    .then(()=> console.log("updated the listing"))
    
    req.flash("success", "Listing updated!");

    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res)=>{

    let{id} = req.params;

    await Listing.findByIdAndDelete(id)
    .then((result)=> console.log(result))

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
}

