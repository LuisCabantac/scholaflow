"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";

import { IUser } from "@/components/UserManagementSection";
import EditProfileForm from "@/components/EditProfileForm";

export default function ProfileSection({ user }: { user: IUser }) {
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);

  function handleToggleShowEditProfileForm() {
    setShowEditProfileForm(!showEditProfileForm);
  }

  return (
    <section>
      <div className="grid gap-4 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full">
              <Image
                src={user.avatar}
                alt={`${user.fullName}'s photo`}
                fill
                className="h-full w-full rounded-full"
              />
            </div>
            <div className="flex flex-col items-start justify-start">
              <h2 className="text-lg font-semibold">{user.fullName}</h2>
              <button
                type="button"
                className="font-medium text-[#22317c] hover:text-[#384689] disabled:text-[#1b2763]"
                onClick={handleToggleShowEditProfileForm}
              >
                Edit profile
              </button>
            </div>
          </div>
          <p
            className={`role mt-0.5 flex items-center justify-center rounded-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase ${user.role === "admin" ? "admin" : user.role === "teacher" ? "teacher" : user.role === "student" ? "student" : "guest"} `}
          >
            {user.role}
          </p>
        </div>
        <div className="grid gap-2 md:flex md:items-center">
          <div>
            <p className="font-medium">{user.email}</p>
            <h4 className="text-xs font-medium text-[#616572]">Email</h4>
          </div>
          <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
          <div>
            <p className="font-medium">
              {user.schoolName ? user.schoolName : "N/A"}
            </p>
            <h4 className="text-xs font-medium text-[#616572]">School</h4>
          </div>
          <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
          <div>
            <p className="font-medium">
              {format(user.created_at, "MMMM dd, yyyy")}
            </p>
            <h4 className="text-xs font-medium text-[#616572]">Joined</h4>
          </div>
        </div>
      </div>
      {showEditProfileForm && (
        <EditProfileForm
          user={user}
          handleSetShowEditProfileForm={setShowEditProfileForm}
          onToggleShowEditProfileForm={handleToggleShowEditProfileForm}
        />
      )}
    </section>
  );
}
