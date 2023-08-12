import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed"
import { getAuthSession } from "@/lib/auth"


const UserFeed = async () => {
    const session = await getAuthSession()
    const posts = await db.post.findMany({
        where: {
            authorId: session?.user.id
        },
        include:{
        votes: true,
        author: true,
        comments: true,
        subreddit: true,
    },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
    })

return <PostFeed initialPosts={posts} userId={session?.user.id}/>
}

export default UserFeed