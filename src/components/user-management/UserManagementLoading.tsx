import UserTableHead from "@/components/user-management/UserTableHead";
import UserListsLoading from "@/components/user-management/UserListsLoading";

export default function UserManagementLoading() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-muted h-9 w-[60%] animate-pulse rounded-full md:w-[50%]" />
        <div className="bg-muted h-9 w-32 animate-pulse rounded-md" />
      </div>
      <table className="bg-muted w-full border-collapse rounded-md text-sm">
        <tbody>
          <UserTableHead />
          <UserListsLoading />
        </tbody>
      </table>
    </section>
  );
}
