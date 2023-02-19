const mongoose=require("mongoose");

const userInfo=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
 const user=mongoose.model("userinfos",userInfo)
 module.exports=user