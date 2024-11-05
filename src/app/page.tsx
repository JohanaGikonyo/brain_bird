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
      const { data: { session }, } = await supabase.auth.getSession();
      
      if (session) {
        // Set the user in the Zustand store
        await setUser(session.user);
        
        // Insert the user email into the users table
        const { error: insertError } = await supabase
          .from("users")
          .insert([{ email: session.user.email }])
        
        if (insertError) {
          console.error("Error inserting user email into users table:", insertError);
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
