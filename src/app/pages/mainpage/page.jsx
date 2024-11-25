"use client";
import React, { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import dynamic from 'next/dynamic';
import { useUser } from "@apply/app/store/useStore"; 
import { useRouter } from "next/navigation";
import { useSelected } from "@apply/app/store/useSection";
import { useShowTop } from "@apply/app/store/useStore";

const TopItems = dynamic(() => import("../../components/TopItems"), { ssr: false });
const Main = dynamic(() => import("../../components/main"), { ssr: false });
const Menu = dynamic(() => import("../../components/menu"), { ssr: false });
const Messages = dynamic(() => import("../../components/messages"), { ssr: false });
const MessageResponsive = dynamic(() => import("@apply/app/components/MessageResponsive"), { ssr: false });
const BottomTabs = dynamic(() => import('../../components/BottomTabs'), { ssr: false });
const TopResponsive = dynamic(() => import('../../components/TopResponsive'), { ssr: false });

function Mainpage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { selectedItem } = useSelected();
  const { showTop } = useShowTop();

  useEffect(() => {
    const initializeSession = async () => {
      if (typeof window !== 'undefined') {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser) {
          setUser(storedUser);
        } else {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            setUser(session.user);
            localStorage.setItem('user', JSON.stringify(session.user));
          } else {
            router.push("/auth/login");
          }
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
      {showTop ? (
        <div className="sticky py-5 top-0 mb-0 bg-slate-950 z-50 lg:hidden">
          <TopResponsive />
        </div>
      ) : (
        <div className="sticky top-0 mb-0 bg-slate-950 z-50 lg:hidden">
          <TopItems />
        </div>
      )}

      <div className="sticky top-0 lg:mb-0 mb-0 bg-slate-950 z-50 hidden lg:block">
        <TopItems />
      </div>

      {/* Three-part content layout */}
      <div className="flex flex-1 flex-row bg-slate-950">
        {/* Left Sidebar (Menu) */}
        <div className="hidden lg:block lg:w-72 xl:w-80 h-full overflow-y-auto scrollbar-hide fixed left-0">
          <Menu />
        </div>

        {/* Main content section */}
        <div className={`${selectedItem === "!Messages" ? 'lg:mr-0' : 'lg:mr-72 xl:mr-80'} flex-1 lg:ml-64 xl:ml-80 p-0 lg:p-8 overflow-y-auto scrollbar-hide sm:m-0`}>
          <Main />
        </div>

        {/* Right Sidebar (Messages) */}
        <div><Messages /></div>
        <div>{selectedItem === "Messages" && <MessageResponsive />}</div>
      </div>
      <BottomTabs />
    </div>
  );
}

export default Mainpage;