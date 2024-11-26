import React, { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { IClass } from "@/components/ClassroomSection";
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
  classes: IClass[] | null | undefined;
  classesIsPending: boolean;
  deleteClassIsPending: boolean;
  handleDeleteClass: UseMutateFunction<void, Error, string, unknown>;
}) {
  const [optimisticClasses, optimisticDelete] = useOptimistic(
    classes,
    (curClass, classId) => {
      return curClass?.filter((curClass) => curClass.id !== classId);
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
          key={classData.classroomId}
          type={type}
          classData={classData}
          onDeleteClass={handleClassDelete}
          deleteClassIsPending={deleteClassIsPending}
        />
      ))}
    </ul>
  );
}
