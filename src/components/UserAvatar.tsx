import { User } from 'next-auth';
import {FC} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import Image from 'next/image';
import { Icons } from './Icons';
import { AvatarProps } from '@radix-ui/react-avatar';

interface Props extends AvatarProps{
    user:Pick<User,  'image' | 'name'>

};

const UserAvatar: FC<Props> = ({user , ...props}) => {
  return (
    <div>
      <Avatar {...props}>
        {user.image ? (
            <div>
                <Image fill src={user.image} alt={user.name || "Profile photo"} referrerPolicy='no-referrer' />
            </div>
        ) : (
            <AvatarFallback>
                <span className='sr-only'> {user?.name}</span>
                <Icons.user className='h-4 w-4' />
            </AvatarFallback>
        )}

      </Avatar>
    </div>
  );
};

export default UserAvatar;