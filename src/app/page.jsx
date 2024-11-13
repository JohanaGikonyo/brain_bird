"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import { useUser } from './store/useStore';
import Skeleton from './components/Skeleton'
export default function Home() {
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
    return <div><Skeleton/>.</div>;
  }

  return <div></div>;
}
