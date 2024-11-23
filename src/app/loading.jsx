"use client";
import React from "react";
import Skeleton from './components/Skeleton'
function Loading() {
  return (
    <div className="text-3xl font-extrabold flex flex-col items-center justify-center">
      <Skeleton/>
    </div>
  );
}

export default Loading;
