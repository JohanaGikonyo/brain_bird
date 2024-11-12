import React from 'react'
import { useShowFollowersPosts } from '../store/useStore'
import { Divider } from '@mui/material';
function TopResponsive() {
    const {showFollowersPosts, setShowFollowersPosts}=useShowFollowersPosts();
  return (
  <div className='flex justify-around mx-5 '>
    <button onClick={()=>setShowFollowersPosts(false)} className={`${showFollowersPosts?``:`border-b-blue-600 text-blue-400 transition-all border-b-2 rounded-sm `}`}>For you</button>
    <button onClick={()=>setShowFollowersPosts(true)} className={`${showFollowersPosts?`border-b-blue-600 text-blue-400 transition-all border-b-2 rounded-sm`:``}`}>Following</button>
    <Divider/>
    </div>
  )
}

export default TopResponsive