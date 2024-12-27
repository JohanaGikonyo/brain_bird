"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import { useUser } from './store/useStore';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function Home() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true); // Ensure loading state is set to true while fetching data

      if (typeof window !== 'undefined') { // Ensure this runs only on the client side
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Fetch user data from "users" table
          const { data, error } = await supabase
            .from("users")
            .select("id, profile, email")
            .eq("email", session.user.email)
            .single();

          if (error && error.code !== 'PGRST116') { 
            console.error("Error fetching user data:", error);
            setLoading(false); 
            return;
          }

          if (data) {
            setUser(data);
            console.log("The data is ", data.profile);
            localStorage.setItem('user', JSON.stringify(data));
            // Redirect to the main page
            router.push("/pages/mainpage");
            console.log("First option used");
          } else {
            // Upsert new user data if not found
            const { error: insertError } = await supabase
              .from("users")
              .upsert([{
                email: session.user.email,
                profile: {
                  username: session.user.user_metadata?.full_name ?? "",
                  profile_pic: session.user.user_metadata?.avatar_url ?? "",
                  phone: session.user.user_metadata?.phone ?? "",
                }
              }], { onConflict: ['email'] });

            if (insertError) {
              console.error("Error upserting user email into users table:", insertError);
              setLoading(false); // Ensure loading state is set to false in case of error
              return;
            }

            setUser(session.user);
            localStorage.setItem('user', JSON.stringify(session.user));
            // Redirect to the main page
            router.push("/pages/mainpage");
            console.log("Second option used");
          }
        } else {
          // User is not signed in, redirect to login
          router.push("/auth/login");
        }
      }
      setLoading(false); // Ensure loading state is set to false after processing
    };

    checkUser();

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="text-2xl font-extrabold flex items-center justify-center mt-36 mb-10">
        <Box sx={{ display: "flex" }} className="flex gap-5">
          <CircularProgress size={24} />
        </Box>
      </div>
    );
  }

  return <div></div>;
}
