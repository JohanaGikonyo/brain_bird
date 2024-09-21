import { useEffect } from "react";
import { useUser, useUserName, useUserAvatarUrl } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";
import { getNameFromEmail } from "../utils/userUtils";
function FetchCurrentUser() {
  const { setUser } = useUser();
  const { setUserAvatar } = useUserAvatarUrl();
  const { setUserName } = useUserName();

  // Fetch the current user session
  const fetchUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setUser(session.user);

      // Get the avatar URL
      const googleAvatarUrl = session.user?.user_metadata?.avatar_url;

      if (googleAvatarUrl) {
        setUserAvatar(googleAvatarUrl); // Use Google avatar
      } else {
        // Fetch from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();

        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        }
      }

      // Set username based on email
      const email = session.user.email;
      // const extractedUsername = email.split("@")[0];
      setUserName(getNameFromEmail(email));
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch the user on mount
  }); // Empty dependency array to ensure it runs only once

  return null; // No UI needs to be rendered
}

export default FetchCurrentUser;
