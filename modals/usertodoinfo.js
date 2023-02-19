const mongoose=require("mongoose")

const todoInfo=new mongoose.Schema({
    task:{
        type:String,
        required:true
    }
})

const allTasks=new mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    todos:[todoInfo]
})

const todomodel=mongoose.model("todoTask",allTasks)
module.exports=todomodel