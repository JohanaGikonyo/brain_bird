"use client";
import React from "react";
import Skeleton from './components/Skeleton'
function Loading() {
  return (
    <div className="text-3xl font-extrabold flex items-center justify-center">
      <h1 className=" text-slate-100">WelCome to Brain Bird. Your Number OneSocial Environment.</h1>
      <Skeleton/>
    </div>
  );
}

export default Loading;
