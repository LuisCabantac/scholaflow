import React, { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { Classroom, EnrolledClass } from "@/lib/schema";

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
  classes: Classroom[] | EnrolledClass[] | null;
  classesIsPending: boolean;
  deleteClassIsPending: boolean;
  handleDeleteClass: UseMutateFunction<void, Error, string, unknown>;
}) {
  const [optimisticClasses, optimisticDelete] = useOptimistic(
    classes,
    (
      curClass: Classroom[] | EnrolledClass[] | null,
      classId: string,
    ): Classroom[] | EnrolledClass[] | null => {
      return (
        (curClass?.filter((item) => item.id !== classId) as typeof curClass) ||
        null
      );
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
