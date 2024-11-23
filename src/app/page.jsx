"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import { useUser } from './store/useStore';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";export default function Home() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Set the user in the Zustand store
        setUser(session.user);

        // Store the user in localStorage
        localStorage.setItem('user', JSON.stringify(session.user));

        // Insert the user email into the users table
        const { error: insertError } = await supabase
          .from("users")
          .upsert([{
            email: session.user.email,
            profile: {
              username: session.user.user_metadata?.full_name ?? "",
              profile_pic: session.user.user_metadata?.avatar_url ?? "",
              phone: session.user.user_metadata?.phone ?? "",
            }
          }], 
          { onConflict: ['email'] });
          console.log('User Metadata:', session.user.user_metadata);
        if (insertError) {
          console.error("Error upserting user email into users table:", insertError);
        }

        // Redirect to the main page
        router.push("/pages/mainpage");
      } else {
        // User is not signed in, redirect to login
        router.push("/auth/login");
      }
      setLoading(false);
    };

    checkUser();
  }, [router, setUser]);

  if (loading) {
    return <div className="text-2xl font-extrabold flex items-center justify-center mt-10 mb-10 observer" >
    <Box sx={{ display: "flex" }} className="flex gap-5">
      <CircularProgress size={24} />
    </Box>
  </div>;
  }

  return <div></div>;
}
