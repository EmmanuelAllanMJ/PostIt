"use client"
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, startTransition } from 'react';
import { Button } from './ui/Button';

interface SubscribeLeaveToggleProps {
    subredditId: string;
    subredditName: string;
    isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ subredditId, subredditName, isSubscribed }) => {
    const { loginToast } = useCustomToast()
    const router = useRouter()

    const { mutate:subscribe, isLoading : isSubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            const { data } = await axios.post('/api/subreddit/subscribe', payload)
            return data as string
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }
            return toast({
                title: "There is a problem",
                description: "Something went wrong, please try again later",
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })
            return toast({
                title: "Success",
                description: `You have subscribed to r/${subredditName}`,
            })
        }
    })
    const { mutate:unsubscribe, isLoading : isUnsubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            const { data } = await axios.post('/api/subreddit/unsubscribe', payload)
            return data as string
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }
            return toast({
                title: "There is a problem",
                description: "Something went wrong, please try again later",
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })
            return toast({
                title: "Unsubscribed",
                description: `You have unsubscribed from r/${subredditName}`,
            })
        }
    })


    return isSubscribed ? (
        <Button
            className='w-full mt-1 mb-4'
          isLoading={isUnsubLoading}
          onClick={() => unsubscribe()}
        >
            Leave community
        </Button>
    ) : (
        <Button
            className='w-full mt-1 mb-4'
          isLoading={isSubLoading}
          onClick={() => subscribe()}
        >
            Join to post
        </Button>
    )
}

export default SubscribeLeaveToggle