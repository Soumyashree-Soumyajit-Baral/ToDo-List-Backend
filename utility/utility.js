const signupModal=require("../modals/userinfo");
const bcrypt=require("bcrypt")

const isUserExist= async(name)=>{
    let existUser=false;
    await signupModal.find({username:name}).then((data)=>{
        if(data.length){
            existUser=true
        }
    })
    return existUser;

}

const genPasswordHash=(pass)=>{
    const salt=10;
    return new Promise((res,rej)=>{
        bcrypt.genSalt(salt).then((hashSalt)=>{
            bcrypt.hash(pass,hashSalt).then((passHash)=>{
                res(passHash)
            })
        })
    })
}

module.exports={isUserExist,genPasswordHash}