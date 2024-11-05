"use client";
import React, { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopItems from "../../components/TopItems";
import Main from "../../components/main";
import Menu from "../../components/menu";
import Messages from "../../components/messages";
import { useUser } from "@apply/app/store/useStore";
import { useRouter } from "next/navigation";

function Mainpage() {
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const updateUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await setUser(session.user);
      } else {
        router.push("/auth/login");
      }

      // Insert or update user in 'users' table
      const { error: dbError } = await supabase.from("users").upsert({
        email: session.user.email,
      });

      if (dbError) {
        console.error("Error inserting/updating user profile:", dbError.message);
      }
    };

    updateUser();
  }, [router, setUser]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* TopItems component for all screen sizes */}
      <div className="sticky top-0 lg:mb-0 mb-10 bg-slate-950 z-50">
        <TopItems />
      </div>

      {/* Three-part content layout */}
      <div className="flex flex-1 flex-row bg-slate-950">
        {/* Left Sidebar (Menu) */}
        <div className="hidden lg:block lg:w-64 xl:w-72 h-full overflow-y-auto fixed left-0">
          <Menu />
        </div>

        {/* Main content section */}
        <div className="flex-1 lg:ml-64 lg:mr-64 xl:ml-72 p-0 lg:p-8 overflow-y-auto sm:m-0">
          <Main />
        </div>

        {/* Right Sidebar (Messages) */}
        <div className="hidden lg:block lg:w-64 xl:w-72 h-full overflow-y-auto fixed right-0">
          <Messages />
        </div>
      </div>
    </div>
  );
}

export default Mainpage;
