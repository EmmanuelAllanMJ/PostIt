import {z} from 'zod'

export const subredditValitador = z.object({
    name: z.string().min(3).max(21),
})

export const SubredditSubcriptionzvalidator = z.object({
    subredditId: z.string().uuid(),
})

export type CreateSubredditPayload = z.infer<typeof subredditValitador>
export type SubscribeToSubredditPayload = z.infer<typeof SubredditSubcriptionzvalidator>
