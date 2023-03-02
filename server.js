require ('dotenv').config()
const express=require("express")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const cors=require("cors")
const bcrypt=require("bcrypt")
const app=express()
const signupModal=require("./modals/userinfo");
const {isUserExist, genPasswordHash}=require("./utility/utility")
const todoModel=require("./modals/usertodoinfo")
const unProtected=["/login","/signup","/"]
const DATABASE=process.env.DATABASE
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors());
app.use((req,res,next)=>{
    if(unProtected.includes(req.url)){
        next()
    }else{
        
        if(req.headers.authorization){
            jwt.verify(req.headers.authorization, process.env.SECRET_KEY, (err,uname)=>{
                if(err){
                    return res.sendStatus(403)
                }
                req.username=uname;
                next()
            })
        }else{
            res.send("Authorization required")
        }
    }
})

const port=process.env.PORT || 5000
app.listen(port,(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("server started", port)
    }
})

// mongoose.connect("mongodb://localhost/todo", ()=>{
//     console.log("connected to db")
// }, (err)=>{
//     console.log(err)
// })
mongoose.connect(`${DATABASE}`,()=>{
    console.log('connected to db');
    // console.log(DATABASE)
  },(err)=>{
    console.log(err);
  })



app.post("/signup",async (req,res)=>{
    if(await isUserExist(req.body.username)){
        // console.log(req.body.username)
        res.send("User is already present")
    }else{
        genPasswordHash(req.body.password).then((passwordHash)=>{
            signupModal.create({
                username:req.body.username,
                password:passwordHash
            })
            .then(()=>{
                res.send(`${req.body.username} added sucessfully`)
            }).catch((err)=>{
                res.send(err.message)
            })
        })
    }
})

// app.post("/login",(req,res)=>{
//     signupModal.find({username:req.body.username}).then((userData)=>{
//         if(userData.length){
//             bcrypt.compare(req.body.password, userData[0].password).then((val)=>{
//                 // console.log(userData)
//                 if(val){
//                     const authToken= jwt.sign(userData[0].username, process.env.SECRET_KEY)
//                     console.log(userData[0].username)
//                     res.json({
//                         authToken:authToken,
//                         name:userData[0].username
//                     })
//                 }else{
//                     res.send("wrong password")
//                 }
//             })
//         }else{
//             res.send("user not exist")
//         }
//     })
// })
app.post("/login",(req,res)=>{
    console.log(req.body.username)
    signupModal.find({username:req.body.username}).then((userData)=>{
        if(userData.length){
            console.log(req.body.username)
            bcrypt.compare(req.body.password, userData[0].password).then((val)=>{
                if(val){
                    const authToken= jwt.sign(userData[0].username, process.env.SECRET_KEY)
                    res.send({authToken})
                }else{
                    res.send("wrong password")
                }
            })
        }else{
            res.send("user not exist")
        }
    })
})


app.get("/uname",(req,res)=>{
    let name=req.username;
    res.send({name})
})

app.post("/addtodo",async(req,res)=>{
    console.log("enter to add todo route")
    const user = req.username;
    const data=req.body
    console.log(data,user)
    const isUser=await todoModel.find({user:user});
    if(isUser.length){
        const tododata=isUser.map((d)=>d.todos)
        const oldData=tododata[0]
        const newData=[...oldData, data]
        todoModel.updateOne({user:user}, {todos:newData}).then(()=>{
            res.status(200).send("added sucessfully")
        }).catch((err)=>{
            res.send(err.message)
        })
    }else{
        todoModel.create({
            user:user,
            todos:data
        }).then(()=>{
            res.status(200).send("task added sucessfully")
        })
    }
})

app.get("/alltasks", async (req, res) => {
    try {
      const user = req.username;
      const data = await todoModel.find({ user });
      console.log(data)
      const tododata = data.map((d) => d.todos);
      console.log(...tododata)
      res.status(200).send(...tododata);
    } catch {
      res.status(400).send("An error occured while getting data");
    }
  });
  app.delete("/delete", async (req, res) => {
    try {
      const deleteitems = req.body.deleteitems;
      const user = req.username;
      const deleted = await todoModel.updateOne(
        { user: user },
        { $pull: { todos: { _id: { $in: deleteitems } } } }
      );
      if (deleted.modifiedCount) {
        // console.log("done")
        res.status(200).send("task Deleted Successfully");
      } else {
        res.status(200).send("There is no task to delete");
      }
    } catch {
      res.status(400).send("An error occured while deleting");
    }
  });

  app.put("/edit/:id",(req,res)=>{
    const todoID=req.params.id
    // console.log(todoID)
    todoModel.updateOne(
        {
            "todos._id":todoID
        },
        {
            $set:{
                "todos.$.task":req.body.task
            }
        }).then(()=>{
            res.status(200).send("task updated sucessfully")
        }).catch((err)=>{
            res.status(400).send(err.message)
        })
})

app.get("/",(req,res)=>{
    const name={"App":"Full stack Todo List"}
    res.status(200).send({name})
})