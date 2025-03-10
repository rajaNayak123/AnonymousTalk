import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    /* When data is passed in a URL, certain characters (e.g., spaces, @, #, &, etc.) are encoded to ensure the URL remains valid. 
         decodeURIComponent helps retrieve the original data by decoding these encoded characters.
         "John%20Doe" output "John Doe" */
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCorrectCode = user.isVerified === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCorrectCode && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return NextResponse.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user code: ", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user code" },
      { status: 500 }
    );
  }
}
