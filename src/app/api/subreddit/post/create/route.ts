import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response ("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {subredditId,title,content} = PostValidator.parse(body);
        
        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            }
        });
        if(!subscriptionExists) {
            return new Response("Subcribe to Post", { status: 400 });
        }

        await db.post.create({
            data: {
                subredditId,
                authorId: session.user.id,
                title,
                content
            }
        });


        return new Response("OK")

    } catch(error){
        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response("Invalid request data is passed",{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not post subreddit",{status:500});
    }
}