"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import { useUser } from './store/useStore';

export default function Home() {
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }} = await supabase.auth.getSession();
      
      if (session) {
        // Set the user in the Zustand store
        setUser(session.user);
        
        // Store the user in localStorage
        localStorage.setItem('user', JSON.stringify(session.user));
        
        // Insert the user email into the users table
        const { error: insertError } = await supabase
          .from("users")
          .upsert([ {
            email: session.user.email,
            profile: {
              username: session.user.full_name || "", // default to empty string if no full_name
              profile_pic: session.user.avatar_url || null, 
              phone: session.user.phone || "" // default to empty string if no phone
            }
          }], { onConflict: ['email'] });
        
        if (insertError) {
          console.error("Error upserting user email into users table:", insertError);
        }

        // Redirect to the main page
        router.push("/pages/mainpage");
      } else {
        // User is not signed in, redirect to login
        router.push("/auth/login");
      }
    };

    checkUser();
  }, [router, setUser]);

  return (
    <div></div>
  );
}
