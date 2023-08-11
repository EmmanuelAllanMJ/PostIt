import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Redis } from "@/lib/redis"
import { CommentVoteValidator, PostVoteValidator } from "@/lib/validators/vote"
import { CachedPost } from "@/types/redis"
import { z } from "zod"



export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { commentId, vote:voteType } = CommentVoteValidator.parse(body)
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const existingVote = await db.commentVote.findFirst({
            where: {
                commentId,
                userId: session.user.id
            }
        })

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            userId: session.user.id,
                            commentId
                        }
                    }
                })
                return new Response('Vote removed', { status: 200 })
            } else {
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            userId: session.user.id,
                            commentId
                        }
                    },
                    data: {
                        type: voteType
                    }
                })
            }  
            
            return new Response('Vote updated', { status: 200 })
        }

        await db.commentVote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                commentId
            }
        })


        return new Response('Vote updated', { status: 200 })

    } catch (error) {

        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response("Invalid request data is passed",{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not register your vote, try again",{status:500});
    }
}