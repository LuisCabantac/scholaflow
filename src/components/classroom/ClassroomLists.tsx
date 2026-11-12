import type { Classroom, EnrolledClass } from "@/lib/schema";

import ClassroomCard from "@/components/classroom/ClassroomCard";

export default function ClassroomLists({
  type,
  classes,
  onDeleteClass,
  deleteClassIsPending,
}: {
  type: "created" | "enrolled";
  classes: Classroom[] | EnrolledClass[] | null | undefined;
  onDeleteClass: (classId: string) => void;
  deleteClassIsPending: boolean;
}) {
  if (!classes?.length) return null;

  return (
    <ul className="contents">
      {classes.map((classData) => (
        <ClassroomCard
          key={classData.id}
          type={type}
          classData={classData}
          onDeleteClass={onDeleteClass}
          deleteClassIsPending={deleteClassIsPending}
        />
      ))}
    </ul>
  );
}
