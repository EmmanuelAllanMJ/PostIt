import Link from "next/link"
import { toast } from "./use-toast"
import { buttonVariants } from "@/components/ui/Button"

export const useCustomToast = () =>{
    const loginToast = () => {
        // when user clicks the login button we need to dismiss the toast
        const {dismiss} = toast({
            title:"Login required",
            description:"You need to login to do that",
            variant:"destructive",
            action:(
                <Link href="/sign-in" onClick={()=>dismiss()} className={buttonVariants({variant:"outline"})} >
                    Login
                </Link>
            )
        })
    }
    return {loginToast}
}