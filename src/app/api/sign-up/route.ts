import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"; 

export async function POST(request:Request) {
    await dbConnect()

    try {

        const {username,email,password} = await request.json()

        // This is the logic to check if the user is already registered or not
        const existingUserVerifyByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifyByUsername){
            return Response.json({
                success: false,
                message: "This username is already taken"
            },{ status: 400 })
        }

        const existingUserVerifyByEmail = await UserModel.findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserVerifyByEmail){

            if(existingUserVerifyByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exist with this email and user is already verified"
                },{ status: 4000 })

            }else{

                // Now this email is exist but it is not verified. So, user may change it's password and then may verify email
                const hasedPassword = await bcrypt.hash(password,10)
                existingUserVerifyByEmail.password = hasedPassword;
                existingUserVerifyByEmail.verifyCode = verifyCode;
                existingUserVerifyByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserVerifyByEmail.save()
            }

        }else{
            // Now this is the condotion that user comes first time for sign up, but here we do not send verification code in email

            const hasedPassword = await bcrypt.hash(password,10)

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1 )

            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()

        }

        //here we send verification email

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        // If some error occured in sending email verification code
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        // Now successfully send verification code in email
        return Response.json({
            success: true,
            message: "User registeres successfully, please verify your email"
        }, { status: 201 })

    } catch (error) {

        console.log("Error in registration",error)
        return Response.json({
                success: true,
                message: "Error in registration"
        },{ status: 500 })
        
    }
}
