import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subredditValitador } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req:Request){
    try{
        const session = await getAuthSession();
        if(!session?.user){
            // 401 - Unautorized
            return new Response("Unautorized",{status:401});
        }
        const body = await req.json();
        
        // here we are checking if the body is valid 
        const {name} = subredditValitador.parse(body);

        const subredditExists = await db.subreddit.findFirst({
            where:{
                name
            }
        });
        if(subredditExists){
            // 409 - Conflict
            return new Response("Subreddit already exists",{status:409});
        }
        const subreddit = await db.subreddit.create({
            data:{
                name,
                creatorId:session.user.id
            }
        });

        await db.subscription.create({
            data:{
                userId:session.user.id,
                subredditId:subreddit.id
            }
        });
        // 201 - Created
        return new Response(subreddit.name,{status:201});
    }catch(error){
        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response(error.message,{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not create subreddit",{status:500});
    }
}