import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabaseClient";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CustomAvatar from './CustomAvatar';
import CustomModal from './CustomModal';
function AllMembers({ group, setViewAll }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [viewingPost, setViewingPost] = useState(null);
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Fetch members of the group
        const { data, error } = await supabase
          .from("user_groups")
          .select("user_email")
          .eq("group_id", group.id);

        if (error) throw error;

        // Set members state
        setMembers(data);
      } catch (error) {
        console.error("Error fetching group members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [group.id]);

  if (loading) return <div>Loading...</div>;

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleView = async (user_email) => {

        setViewingPost(user_email);
       
    
}
const filteredMembers=members.filter((member)=>member.user_email.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <h2 className='flex gap-3 items-center text-xl bg-slate-800 rounded-lg p-3 mb-4'> 
        <div onClick={() => { setViewAll(null) }}>
          <ArrowBackIcon />
        </div> {group.name}</h2>
        <input
        type="text"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 p-2 rounded-lg text-slate-950 focus:outline-0"
      />
        {filteredMembers.map((member, index) => (
            <div key={index}
          className="flex items-center m-4 justify-between bg-slate-900 hover:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer transition"
          onClick={() => handleView(member.user_email)}
        >
          <CustomAvatar email={member.user_email} />
        </div>
        ))}
              <CustomModal email={viewingPost} viewingPost={viewingPost} setViewingPost={setViewingPost}/>

    </div>
  );
}

export default AllMembers;