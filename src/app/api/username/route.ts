import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UsernameValidator } from "@/lib/validators/username"
import { z } from "zod"

export async function PATCH(req: Request) {
    try{
        const session = await getAuthSession()
        if(!session?.user){
            return new Response('Unauthorized', { status: 401 })
        }
        const body = await req.json()
        const { name  } = UsernameValidator.parse(body)

        const username = await db.user.findFirst({
            where: {
                name
            }
        })

        if(username){
            return new Response('Username already exists', { status: 409 })
        }

        await db.user.update({
            where: {
                id: session.user.id
            },
            data: {
                username : name
            }
        })

        return new Response('Username updated', { status: 200 })

    }catch(error){
        if(error instanceof z.ZodError){
            // 422 - Unprocessable Entity
            return new Response("Invalid request data is passed",{status:422});
        }
        // 500 - Internal Server Error
        return new Response("Could not update username, try again",{status:500});
    }
}