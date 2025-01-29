import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

// The main reason of using nextAuth is that, it automatically design the page

export const authOptions: NextAuthOptions = {
    providers: [
        // There may be more number of providers
        // It is credentials provider
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
              },
              async authorize(credentials:any): Promise<any>{

                await dbConnect()

                try {
                    const user = await UserModel.findOne({

                        // Here we can find using email or username
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })

                    if(!user){
                        throw new Error("No user found with this email")
                    }

                    //For this reason we use Credentials Auth, because user may exist, but no verified
                    if(!user.isVerified){
                        throw new Error("Please verified your account before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error("Incorrect Password")
                    }
                    
                } catch (error: any) {
                    throw new Error(error)
                }
              }
        })
        // There also may add more provider. Suppose we add github provider, then give comma and write github provider
        
    ],

    callbacks: {
        async jwt({ token, user }) { //This the user which we return from providers

            // Here we try to modify token and in token, we keep all the maximum imformation.

            if(user){
                // Now if I modify user, it gives error, because it is next js user type. So, we declear it's type in type folder

                token._id = user._id?.toString(); // Convert ObjectId to string
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }

            return token
            // But it is not good approch, because then payload size is increase. So we may can use another approch.
        },

        async session({ session, token }) {
            // After modifing token, we keep it's value im session

            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }

            return session
        }
        
    },

    pages: {
        signIn: '/sign-in'   //Now it automatically design sign in page
    },

    session: {
        strategy: "jwt"
    },

    secret: process.env.NEXTAUTH_SECRET
}
