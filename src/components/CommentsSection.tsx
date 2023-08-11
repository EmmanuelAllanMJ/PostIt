import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import PostComment from './PostComment'
import CreateComment from './CreateComment'

interface CommentsSectionProps {
    postId: string
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
    const session = await getAuthSession()
    const comments = await db.comment.findMany({
        where: {
            postId: postId,
            replyToId: null
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true
                }
            }
        }
    })
    return (
        <div className='flex flex-col gap-y-4 mt-4'>
            <hr className='w-full h-px my-6' />
            <CreateComment postId={postId} />
            <div className='flex flex-col gap-y-6 mt-4'>
                {comments.filter(c => c.replyToId === null).map(topLevelComment => {
                    const topLevelCommentVotesAmt = topLevelComment.votes.reduce((acc, curr) => {
                        if (curr.type === 'UP') return acc + 1
                        if (curr.type === 'DOWN') return acc - 1
                        return acc
                    }, 0)

                    const topLevelCommentCurrentVote = topLevelComment.votes.find(v => v.userId === session?.user?.id)

                    return (
                        <div key={topLevelComment.id} className='flex flex-col'>
                            <div className='mb-2'>
                                <PostComment
                                    postId={postId}
                                    comment={topLevelComment}
                                    currentVote={topLevelCommentCurrentVote}
                                    votesAmt={topLevelCommentVotesAmt}
                                />
                            </div>
                            {topLevelComment.replies.sort(
                                (a, b) => b.votes.length - a.votes.length)
                                .map(reply => {
                                    const replyVotesAmt = topLevelComment.votes.reduce((acc, curr) => {
                                        if (curr.type === 'UP') return acc + 1
                                        if (curr.type === 'DOWN') return acc - 1
                                        return acc
                                    }, 0)

                                    const replyVote = topLevelComment.votes.find(v => v.userId === session?.user?.id)

                                    return <div key={reply.id} className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
                                        <PostComment
                                            comment={reply}
                                            currentVote={replyVote}
                                            votesAmt={replyVotesAmt}
                                            postId={postId}
                                        />
                                    </div>
                                }
                                )}
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default CommentsSection