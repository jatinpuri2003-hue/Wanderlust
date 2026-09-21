const mongoose = require("mongoose");
const Review = require("./review.js")


const listingSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true

    },

    description: {
        type: String,
        required: true
    },

    image: { 
        type: String,
        set: (v) => v === "" || !v ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStKLUBeYh13SomWUTGZOvGiQ667mvNYPW1bBvXQuQLTg&s=10" : v,
    },
    
    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    reviews : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}); 

// post mongoose middleware to delete the reviews
listingSchema.post("findOneAndDelete", async(listing)=>{

    if(listing){
        
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
    
});

const Listing = mongoose.models.listing || mongoose.model("listing", listingSchema);

module.exports = Listing;