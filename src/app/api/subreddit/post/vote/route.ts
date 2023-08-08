import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Redis } from "@/lib/redis"
import { PostVoteValidator } from "@/lib/validators/vote"
import { CachedPost } from "@/types/redis"
import { z } from "zod"

const CACHE_AFTER_UPVOTES = 1


export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { postId, voteType } = PostVoteValidator.parse(body)
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const existingVote = await db.vote.findFirst({
            where: {
                postId,
                userId: session.user.id
            }
        })

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                author: true,
                votes: true
            }
        })

        if (!post) {
            return new Response('Post not found', { status: 404 })
        }

        if (existingVote) {
            if (existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            userId: session.user.id,
                            postId
                        }
                    }
                })
                return new Response('Vote removed', { status: 200 })
            } else {
                await db.vote.update({
                    where: {
                        userId_postId: {
                            userId: session.user.id,
                            postId
                        }
                    },
                    data: {
                        type: voteType
                    }
                })
            }

            // recount votes
            const votesAmt = post.votes.reduce((acc, vote) => {
                if (vote.type === 'UP') {
                    return acc + 1;
                } else if (vote.type === 'DOWN') {
                    return acc - 1;
                } else {
                    return acc;
                }
            }, 0)

            if (votesAmt >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    id: post.id,
                    title: post.title,
                    authorUserName: post.author.username ?? '',
                    content: JSON.stringify(post.content),
                    currentVote: voteType,
                    createdAt: post.createdAt
                }
                await Redis.set(`posts : ${post.id}`, JSON.stringify(cachePayload))
            }
            return new Response('Vote updated', { status: 200 })
        }

        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId
            }
        })

        // recount votes
        const votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') {
                return acc + 1;
            } else if (vote.type === 'DOWN') {
                return acc - 1;
            } else {
                return acc;
            }
        }, 0)

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                id: post.id,
                title: post.title,
                authorUserName: post.author.username ?? '',
                content: JSON.stringify(post.content),
                currentVote: voteType,
                createdAt: post.createdAt
            }
            await Redis.set(`posts : ${post.id}`, JSON.stringify(cachePayload))
        }
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