// this file 
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
.then(()=> console.log("connected to DB"))
.catch((err)=> console.log(err));

const initDB = async ()=>{

    await Listing.deleteMany({});

    initData.data = initData.data.map((obj)=>({...obj, owner: '6aae26501837e13d6abbcdfe'}));

    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();