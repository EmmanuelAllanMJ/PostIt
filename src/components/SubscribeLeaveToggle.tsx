import { FC } from 'react'
import { Button } from './ui/Button';

interface SubscribeLeaveToggleProps {
  
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({}) => {
    const isSubscribed = false;
    return isSubscribed ? (
        <Button
          className='w-full mt-1 mb-4'
        //   isLoading={isUnsubLoading}
        //   onClick={() => unsubscribe()}
          >
          Leave community
        </Button>
      ) : (
        <Button
          className='w-full mt-1 mb-4'
        //   isLoading={isSubLoading}
        //   onClick={() => subscribe()}
          >
          Join to post
        </Button>
      )
}

export default SubscribeLeaveToggle