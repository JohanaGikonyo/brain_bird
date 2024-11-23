import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button, Modal, TextField, Box } from "@mui/material";
import { useShowTop } from "../store/useStore";
import { useUser } from "../store/useStore";
import GroupChat from './GroupChat'
function Groups() {
  const { user } = useUser();
  const { showTop } = useShowTop();
  const [userGroups, setUserGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch groups the user is in
        const { data: userGroupData, error: userGroupError } = await supabase
          .from("user_groups")
          .select("group_id, groups(name, description)")
          .eq("user_email", user.email)
          .order("group_id", { ascending: true });
        if (userGroupError) throw userGroupError;
  
        const userGroupsList = userGroupData.map((item) => ({
          id: item.group_id,
          ...item.groups,
        }));
        setUserGroups(userGroupsList);
  
        // Fetch unread messages count for each group
        const unreadCountsPromises = userGroupsList.map(async (group) => {
          const { data: unreadMessagesData, error: unreadMessagesError } = await supabase
            .from("groupmessages")
            .select("id")
            .eq("group_id", group.id)
            .eq("is_read", false);
          if (unreadMessagesError) throw unreadMessagesError;
  
          return { groupId: group.id, unreadCount: unreadMessagesData.length };
        });
  
        const unreadCounts = await Promise.all(unreadCountsPromises);
  
        // Map unread counts back to user groups
        const userGroupsWithUnreadCount = userGroupsList.map((group) => {
          const unreadCount = unreadCounts.find((count) => count.groupId === group.id)?.unreadCount || 0;
          return { ...group, unreadCount };
        });
  
        setUserGroups(userGroupsWithUnreadCount);
  
        // Fetch groups the user is not in
        const { data: allGroupsData, error: allGroupsError } = await supabase
          .from("groups")
          .select("*")
          .not("id", "in", `(${userGroupsList.map((g) => g.id).join(",") || 0})`)
          .order("id", { ascending: true });
        if (allGroupsError) throw allGroupsError;
  
        setOtherGroups(allGroupsData);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchGroups();
  }, [user.email]);
  
  

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleCreateGroup = async () => {
    if (!newGroupTitle || !newGroupDescription) return;

    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([{ name: newGroupTitle, description: newGroupDescription }])
        .select();
      if (error) throw error;

      // Add the current user to the new group
      await supabase.from("user_groups").insert([{ user_email: user.email, group_id: data[0].id }]);

      // Update local state
      setUserGroups([...userGroups, data[0]]);
      setNewGroupTitle("");
      setNewGroupDescription("");
      setModalOpen(false); // Close the modal after group creation
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await supabase.from("user_groups").insert([{ user_email: user.email, group_id: groupId }]);
      const joinedGroup = otherGroups.find((group) => group.id === groupId);

      // Update states
      setUserGroups([...userGroups, joinedGroup]);
      setOtherGroups(otherGroups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredUserGroups = userGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOtherGroups = otherGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  if (selectedGroup) {
    return <GroupChat group={selectedGroup} setSelectedGroup={setSelectedGroup}/>;
  }

  return (
    <div className={`flex flex-col ${!showTop ? `mt-36` : ``} lg:mt-14`}>
      {/* Search Input */}
      <div className="flex items-start gap-2  rounded-lg bg-slate-900 p-4 z-10">
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="py-1 px-1 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-slate-500 transition duration-300 flex-grow"
        />

        {/* Create Group Button */}
        <Button onClick={() => setModalOpen(true)} className="mb-4 text-xs">
          Create Group
        </Button>
      </div>

      <div className="flex flex-col gap-8 mt-2">
        {/* Groups the user is in */}
        <div className="flex flex-col gap-4">
          {filteredUserGroups.length > 0 ? (
            filteredUserGroups.map((group) => (
              <div key={group.id} className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer" onClick={() => handleGroupClick(group)}>
                <div className="flex gap-2">
                  <h3 className="text-base font-bold">{group.name}</h3>
                  {group.unread_count > 0 && (
                    <span className="bg-blue-500 rounded-full font-semibold text-white">
                      {group.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-slate-400">{group.description}</p>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No groups available</div>
          )}
        </div>

        {/* Groups the user can join */}
        <div className="flex flex-col gap-4">
          <Button className="text-xs mb-4">More to Join</Button>
          {filteredOtherGroups.length > 0 ? (
            filteredOtherGroups.map((group) => (
              <div key={group.id} className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer">
                <h3 className="flex justify-between items-center">
                  {group.name}
                  <Button onClick={() => handleJoinGroup(group.id)} variant="outlined">
                    Join
                  </Button>
                </h3>
                <p className="text-slate-400">{group.description}</p>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No groups available to join</div>
          )}
        </div>
      </div>

      {/* Modal for Creating Group */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          className="bg-slate-50 p-6 rounded-lg shadow-md flex flex-col gap-3"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
          }}
        >
          <h2 className="text-lg font-bold mb-4 text-slate-800">Create New Group</h2>
          <TextField
            label="Group Title"
            variant="outlined"
            fullWidth
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            className="mb-4"
          />
          <TextField
            label="Group Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            className="mb-4"
          />
          <Button variant="contained" color="primary" onClick={handleCreateGroup}>
            Create Group
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default Groups;
``