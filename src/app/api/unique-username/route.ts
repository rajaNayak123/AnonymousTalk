import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from 'zod'
import {usernameValidation} from '@/schemas/signUpSchema'
import { NextRequest,NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:NextRequest){
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url);

        const queryParam = {
            username: searchParams.get('username')
        }

        // validation with zod
        const result = UsernameQuerySchema.safeParse(queryParam);

        // console.log(result);

        if(!result.success){
            const usernameError = result.error.format().username?._errors || []
            return NextResponse.json({
                success:false,
                message: usernameError?.length>0 ? usernameError.join(", ") : "Invalid query parameter"
            }, {status:400})
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username,isVerified:true})

        if(existingVerifiedUser){
            return NextResponse.json(
                {
                success:false,
                message:"user name already taken"
                },
                {status:400}
            )
        }

        return NextResponse.json(
            {
            success:true,
            message:"username is unique"
            },
            {status:400}
        )

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {success:false, message:"Error checking username"},
            {status:500}
        )
    }
}