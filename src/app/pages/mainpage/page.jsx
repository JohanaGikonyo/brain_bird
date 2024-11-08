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
function Mainpage() {
  const router = useRouter();
  const { setUser } = useUser();
  const {selectedItem}=useSelected()

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
        <div className="hidden lg:block lg:w-72 xl:w-80 h-full overflow-y-auto fixed left-0">
          <Menu />
        </div>

        {/* Main content section */}
        <div className={`${selectedItem==="Messages"?`lg:mr-72 xl:mr-80`:'' }flex-1 lg:ml-64 xl:mr-80   xl:ml-80 p-0 lg:p-8 overflow-y-auto sm:m-0`}>
          <Main />
        </div>
<div><Messages /></div>
        {/* Right Sidebar (Messages) */}
        <div>
        {selectedItem==="Messages" && <>  <MessageResponsive/></>}
        </div>
        
      </div>
    </div>
  );
}

export default Mainpage;
