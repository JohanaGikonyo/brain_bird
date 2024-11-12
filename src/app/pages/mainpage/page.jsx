"use client";

import React, { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopItems from "../../components/TopItems";
import Main from "../../components/main";
import Menu from "../../components/menu";
import Messages from "../../components/messages";
import MessageResponsive from "@apply/app/components/MessageResponsive";
import { useUser } from "@apply/app/store/useStore"; 
import { useRouter } from "next/navigation";
import { useSelected } from "@apply/app/store/useSection";
import BottomTabs from '../../components/BottomTabs'
import TopResponsive from '../../components/TopResponsive'
import { useShowTop } from "@apply/app/store/useStore";
function Mainpage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { selectedItem } = useSelected();
  const {showTop}=useShowTop();

  useEffect(() => {
    const initializeSession = async () => {
      // Check for user in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser) {
        setUser(storedUser);
      } else {
        // Fetch session from Supabase if not found in localStorage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);
          localStorage.setItem('user', JSON.stringify(session.user));
        } else {
          router.push("/auth/login");
        }
      }
    };

    initializeSession();
  }, [router, setUser]);

  if (!user) {
    return null; // Avoid rendering while loading user data
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* TopItems component for all screen sizes */}
      {showTop?
      <div className="sticky py-5 top-0  mb-10 bg-slate-950 z-50  lg:hidden">
      <TopResponsive/>
      </div>:
      <div className="sticky top-0  mb-10 bg-slate-950 z-50 lg:hidden">
        <TopItems />
      </div>}

      <div className="sticky top-0 lg:mb-0 mb-10 bg-slate-950 z-50 hidden lg:block">
        <TopItems />
      </div>

      {/* Three-part content layout */}
      <div className="flex flex-1 flex-row bg-slate-950">
        {/* Left Sidebar (Menu) */}
        <div className="hidden lg:block lg:w-72 xl:w-80 h-full overflow-y-auto scrollbar-hide fixed left-0">
          <Menu />
        </div>

        {/* Main content section */}
        <div
          className={`${selectedItem === "Messages" ? `lg:mr-72 xl:mr-80` : ''} flex-1 lg:ml-64 xl:mr-80 xl:ml-80 p-0 lg:p-8 overflow-y-auto scrollbar-hide sm:m-0`}
        >
          <Main />
        </div>

        {/* Right Sidebar (Messages) */}
        <div><Messages /></div> 
         <div> {selectedItem==="Messages" && <> <MessageResponsive/></>}</div>
      </div>
      <BottomTabs/>
    </div>
  );
}

export default Mainpage;
