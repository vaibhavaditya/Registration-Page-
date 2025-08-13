import { asyncHandler } from "../utils/asyncHandler.js"
import prisma from "../db/prismaClient.js"

const registerUser = asyncHandler( async(req,res) => {
    const {AdharNumber, RegisteredName} = req.body

    if(!AdharNumber || !RegisteredName) {
        return res.status(400).json({ message: "AdharNumber and RegisteredName are required" });
    }
    const existedUser = await prisma.user.findUnique({
        where: { AdharNumber }
    })

    if (existedUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
        data : {AdharNumber, RegisteredName}
    })
    

    res.status(201).json({
        user,
        message: "User registered successfully"
    });
})

const loginUser = asyncHandler( async(req,res) => {
    const {AdharNumber, RegisteredName} = req.body

    if(!AdharNumber || !RegisteredName) {
        return res.status(400).json({ message: "AdharNumber and RegisteredName are required" });
    }

    const user = await prisma.user.findUnique({
        where: { AdharNumber }
    })

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
        user,
        message: "Login successful"
    });
})

export {
    registerUser,
    loginUser
}