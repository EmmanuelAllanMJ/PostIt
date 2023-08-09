import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req:Request){
    const url = new URL(req.url);

    const session = await getAuthSession()

    // finding which community they are following
    let followedCommunitiesIds:string[] = []

    if(session){
        const followCommunities = await db.subscription.findMany({
            where:{
                userId:session.user.id
            },
            include:{
                subreddit:true
            }

        })
        followedCommunitiesIds = followCommunities.map((subreddit) => subreddit.subreddit.id)
    }

    try{
        // getting data from the request with validation
        const {limit, page, subredditName} = z
        .object({
            limit:z.string(),
            page:z.string(),
            subredditName:z.string().nullish().optional()
        }).parse({
            subredditName:url.searchParams.get('subreddit'),
            limit : url.searchParams.get('limit'),
            page : url.searchParams.get('page')
        })

        // constucting whereClause which can be passed to prisma later
        let whereClause = {}

        if(subredditName){
            whereClause = {
                subreddit:{
                    name:subredditName
                }
            }
        }else if (session){
            whereClause = {
                subreddit:{
                    id:{
                        in:followedCommunitiesIds
                    }
                }
            }
        }

        // which post should be fetched from the db
        const posts = await db.post.findMany({
            take:parseInt(limit),
            skip : (parseInt(page)-1) * parseInt(limit),
            orderBy:{
                createdAt:'desc'
            },
            include:{
                subreddit:true,
                votes:true,
                author:true,
                comments:true
            },
            where:whereClause
        })

        return new Response(JSON.stringify(posts), {status:200})
    }catch(error){
        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response("Invalid request data is passed",{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not subscribe",{status:500});
    }
}