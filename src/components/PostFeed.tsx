"use client"

import { ExtendedPost } from '@/types/db';
import { FC, useEffect, useRef } from 'react'
import { useIntersection } from "@mantine/hooks"
import { useInfiniteQuery } from '@tanstack/react-query';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Post from './Post';
import { Loader2 } from 'lucide-react';

interface PostFeedProps {
    initialPosts: ExtendedPost[];
    subredditName?: string;
    userId?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName, userId }) => {
    const { data: session } = useSession() // for client side 

    const lastPostRef = useRef<HTMLElement>(null)
    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    })

    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
        ['infinite-query'],
        async ({ pageParam = 1 }) => {
            if(!hasNextPage) return []
            const query = `/api/post?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
                (!!subredditName ? `&subreddit=${subredditName}`: '')+
                (!!userId ? `&userId=${userId}` : '')
                const { data } = await axios.get(query)
            return data as ExtendedPost[]
        },
        {
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.length < INFINITE_SCROLL_PAGINATION_RESULTS) return false
                return pages.length + 1
            },
            initialData: {
                pages: [initialPosts],
                pageParams: [1]
            }
        }
    )

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry?.isIntersecting])

    const posts = data?.pages.flatMap(page => page) || initialPosts

    return <ul className='flex flex-col col-span-2 space-y-6'>
        {posts.map((post, index) => {
            const voteAmt = post.votes.reduce((acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            const currentVote = post.votes.find(vote => vote.userId === session?.user.id)

            if (index == posts.length - 1) {
                return (
                    <li key={post.id} ref={ref}>
                        <Post
                            subredditName={post.subreddit.name}
                            post={post}
                            commentAmt={post.comments.length} 
                            currentVote={currentVote}
                            voteAmt={voteAmt}
                            />
                    </li>

                )
            } else {
                return <li key={post.id}>
                    <Post
                        subredditName={post.subreddit.name}
                        post={post}
                        commentAmt={post.comments.length}
                        currentVote={currentVote}
                        voteAmt={voteAmt}
                         />
                </li>
            }
        })}
        {isFetchingNextPage && hasNextPage && <div className='w-full flex item-center justify-center'> <Loader2 className='h-5 w-5 animate-spin text-zinc-500' /></div>}


    </ul>
}

export default PostFeed