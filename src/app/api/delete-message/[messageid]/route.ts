import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOption } from '../../auth/[...nextauth]/option';

// Simplified route handler with only the NextRequest parameter
export async function DELETE(
  request: NextRequest,
) {
  // Extract the message ID from URL path
  const url = request.url;
  const pathParts = url.split('/');
  const messageId = pathParts[pathParts.length - 1];
  
  await dbConnect();
  
  const session = await getServerSession(authOption);
  const _user: User = session?.user as User;
  
  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );
    
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}