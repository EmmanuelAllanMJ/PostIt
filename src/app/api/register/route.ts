import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(
  request: Request, 
) {
  const body = await request.json();
  const { 
    email,
    password,
   } = body;

   const hashedPassword = await bcrypt.hash(password, 12);

   const user = await db.user.create({
    data: {
      email,
      hashedPassword,
      username:nanoid(10),
      name:email.split('@')[0]
    }
  });

  return NextResponse.json(user);
}

export async function GET(
    request: Request, 
    ) {
    // const { email } = request.query;
    
    // const user = await db.user.findFirst({
    //     where: {
    //     email: email as string
    //     }
    // });
    
    return NextResponse.json({message: 'hello'});
    }
