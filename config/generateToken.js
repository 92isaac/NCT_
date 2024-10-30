const jwt = require("jsonwebtoken")

const generateToken = (uniqueId)=>{
    return jwt.sign({uniqueId}, process.env.JWT_SECRET, {expiresIn: '3d'})
}

const generateRefreshToken = (uniqueId) =>{
    return jwt.sign({ uniqueId}, process.env.JWT_SECRET, {expiresIn: "1d"})
}

module.exports = {
    generateRefreshToken,
    generateToken
}