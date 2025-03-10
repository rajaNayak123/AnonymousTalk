import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    /* without exec() its return object not promise If we want to work with it using async/await, you should call .exec() to execute the query and return a proper Promise. */
    const user = await UserModel.findOne({ username }).exec();
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        { message: "User is not accepting messages", success: false },
        { status: 403 } // 403 Forbidden status
      );
    }
    
    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return NextResponse.json(
      { message: "Message sent successfully", success: true },
      { status: 201 }
    );
  } catch (error) { 
    console.error("Error while sending or adding message:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
