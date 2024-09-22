"use client";
import React, { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopItems from "../../components/TopItems";
import Main from "../../components/main";
import Menu from "../../components/menu";
import Messages from "../../components/messages";
import { useUser } from "@apply/app/store/useStore";
import Drawer from "../../components/Drawer";
function Mainpage() {
  useUser();

  useEffect(() => {
    const updateUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        return;
      }

      if (!session || !session.user) {
        console.error("No session or user found.");
        return;
      }

      const { user } = session;

      // Insert or update user in 'users' table
      const { error: dbError } = await supabase.from("users").upsert({
        email: user.email, // User email
        // Add other fields as necessary
      });

      if (dbError) {
        console.error("Error inserting/updating user profile:", dbError.message);
      }
    };

    updateUser();
  }, []); // Run once on mount

  return (
    <div className="flex flex-col h-screen p-0 m-0 bg-slate-950 text-white-900">
      <div className="lg:hidden block">
        <Drawer />
      </div>{" "}
      <div className=" top-0">
        <TopItems />
      </div>
      {/* Three-part content layout */}
      <div className="flex flex-row flex-1 bg-slate-950">
        {/* Fixed left menu */}
        <div className="w-64  lg:block fixed left-0 h-full overflow-y-auto hidden">
          <Menu />
        </div>
        {/* Main content with margin to avoid overlapping with the fixed menu */}
        <div className="lg:flex-1 flex-1 lg:ml-64 md:ml-20  overflow-y-auto lg:mr-64 justify-center items-center">
          <Main />
        </div>
        {/* Messages section */}
        <div className="hidden lg:block w-64 h-full overflow-y-auto fixed right-0">
          <Messages />
        </div>
      </div>
    </div>
  );
}

export default Mainpage;
