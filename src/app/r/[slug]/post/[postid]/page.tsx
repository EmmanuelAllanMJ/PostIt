import { FC } from 'react'

interface PageProps {
  params:{
    postid: string
  }
}

// force dynamic and no-store
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const page: FC<PageProps> = ({params}) => {
  
  return <div>page</div>
}

export default page