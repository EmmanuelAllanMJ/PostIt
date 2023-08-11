import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req:Request){
    try{
        const body = await req.json();
        const {postId,text,replyToId} = CommentValidator.parse(body); 
        const session =await  getAuthSession()
        if(!session?.user){
            return new Response("Unauthorized",{status:401})
        }
        await db.comment.create({
            data:{
                text,
                postId,
                authorId:session.user.id,
                replyToId,
            }
        })
        return new Response("OK",{status:200})
    }catch(error){
        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response("Invalid request data is passed",{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not post subreddit",{status:500});
    }
}