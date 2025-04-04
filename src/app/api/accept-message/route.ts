import { getServerSession } from "next-auth";
import { authOption} from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOption);
  // const user = session?.user;

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "user not authenticated" },
      { status: 401 }
    );
  }

  // const userId = (session.user as any)._id;
  const user = session.user as User & { _id: string };
  const userId = user._id;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID not found in session" },
      { status: 400 }
    );
  }
  // const userId = user?._id;

  try {
    const { acceptMessages } = await request.json();

    if (typeof acceptMessages !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid input for acceptmessages" },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "failed to update user status" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "message acceptance status updated successfuly",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept message", error);
    return NextResponse.json(
      {
        success: false,
        message: "failed to update user status to accept message",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOption);
  // const user = session?.user;

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "user not authenticated" },
      { status: 401 }
    );
  }

  // const userId = (session.user as any)._id;
  const user = session.user as User & { _id: string };
  const userId = user._id;

  // const userId = user?._id;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID not found in session" },
      { status: 400 }
    );
  }

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, isAcceptingMessage: foundUser.isAcceptingMessage },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept message", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error is geting message acceptance status",
      },
      { status: 500 }
    );
  }
}
