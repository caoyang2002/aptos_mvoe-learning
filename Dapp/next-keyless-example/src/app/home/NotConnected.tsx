'use client'

import React, { useState } from 'react'

export function NotConnected() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="nes-container is-dark with-title text-sm sm:text-base">
        <p className="title">Welcome</p>
        <p>Welcome to Aptogotchi!</p>
      </div>
    </div>
  )
}
