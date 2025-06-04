import React, { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { Classroom } from "@/lib/schema";

import ClassLoading from "@/components/ClassLoading";
import ClassroomCard from "@/components/ClassroomCard";

export default function ClassroomLists({
  type,
  classes,
  classesIsPending,
  handleDeleteClass,
  deleteClassIsPending,
}: {
  type: "created" | "enrolled";
  classes: Classroom[] | null;
  classesIsPending: boolean;
  deleteClassIsPending: boolean;
  handleDeleteClass: UseMutateFunction<void, Error, string, unknown>;
}) {
  const [optimisticClasses, optimisticDelete] = useOptimistic(
    classes,
    (curClass, classId) => {
      return curClass?.filter((curClass) => curClass.id !== classId) || null;
    },
  );

  function handleClassDelete(classId: string) {
    optimisticDelete(classId);
    handleDeleteClass(classId);
  }

  if (classesIsPending) return <ClassLoading />;

  if (!optimisticClasses || !optimisticClasses?.length) return null;

  return (
    <ul className="contents">
      {optimisticClasses.map((classData) => (
        <ClassroomCard
          key={classData.id}
          type={type}
          classData={classData}
          onDeleteClass={handleClassDelete}
          deleteClassIsPending={deleteClassIsPending}
        />
      ))}
    </ul>
  );
}
