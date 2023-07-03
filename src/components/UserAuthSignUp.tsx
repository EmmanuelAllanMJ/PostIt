'use client'

import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import * as React from 'react'
import { FC } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'
import { Icons } from './Icons'
import axios  from 'axios'
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from "react-hook-form";
import { nanoid } from 'nanoid'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthSignUp: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const { toast } = useToast()
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState<boolean>(false)
  const [isLoadingCredentials, setIsLoadingCredentials] = React.useState<boolean>(false)

  const loginWithGoogle = async () => {
    setIsLoadingGoogle(true)

    try {
      await signIn('google')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingGoogle(false)
    }
  }

  const loginWithCredentials = async(e:any) => {
    e.preventDefault();
    setIsLoadingCredentials(true);
    const data={
      email:e.target[0].value,
      password:e.target[1].value,
    }
    console.log(data)
    try{
      await signIn('credentials', { 
        ...data, 
      })
    }
    catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error logging in with Credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingCredentials(false)
    }
  }


  return (
    <div className={cn('flex justify-center', className)} {...props}>
      <Button
        isLoading={isLoadingGoogle}
        type='button'
        size='sm'
        className='w-full'
        onClick={loginWithGoogle}
        disabled={isLoadingGoogle}>
        {isLoadingGoogle ? null : <Icons.google className='h-4 w-4 mr-2' />}
        Google
      </Button>
      {/* Credentials */}
    <form className='flex flex-col space-y-4' onSubmit={loginWithCredentials}>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='email' className='text-sm font-medium'>
            Email
          </label>
          <input
            type='email'
            name='email'
            id='email'
            className='border border-gray-300 rounded-sm px-2 py-1 text-sm'
          />
          <label htmlFor='password' className='text-sm font-medium'>
            Password
          </label>
          <input
            type='password'
            name='password'
            id='password'
            className='border border-gray-300 rounded-sm px-2 py-1 text-sm'
          />
              <Button
        isLoading={isLoadingCredentials}
        type='submit'
        size='sm'
        className='w-full'
    
        disabled={isLoadingCredentials}>

        Submit
      </Button>
        </div>
      </form>
          
    </div>
  )
}

export default UserAuthSignUp