import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";

import { useNow } from "@/hooks/use-now";
import { workStatus } from "@/lib/classwork-rules";
import type { Classwork, EnrolledClass, Stream } from "@/lib/schema";

import UserAvatar from "@/components/shared/UserAvatar";

function slug(name: string) {
  return name.split(" ").join("-").toLowerCase();
}

export default function SubmissionUserList({
  stream,
  classworks,
  assigned,
  onSelect,
}: {
  stream: Stream;
  classworks: Classwork[];
  assigned: EnrolledClass[];
  onSelect: () => void;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "submissions" });
  const now = useNow();

  const turnedIn = classworks.filter(
    (work) => work.isTurnedIn || (stream.points && work.isGraded),
  );

  const userLink = (
    userId: string,
    userName: string,
    children: React.ReactNode,
  ) => (
    <Link
      to="/classroom/class/$classId/stream/$streamId/submissions"
      params={{ classId: stream.classId, streamId: stream.id }}
      search={{ name: slug(userName), user: userId }}
      className="group flex items-center justify-between gap-2"
    >
      {children}
    </Link>
  );

  const avatar = (image: string, name: string) => (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <UserAvatar
        src={image}
        alt={t("avatarAlt", { name })}
        width={30}
        height={30}
        className="h-[30px] w-[30px] shrink-0 rounded-full"
      />
      <p className="min-w-0 [overflow-wrap:anywhere] group-hover:underline">
        {name}
      </p>
    </div>
  );

  return (
    <>
      {turnedIn.length ? (
        <div className="grid gap-2">
          <p className="font-medium">{t("turnedIn")}</p>
          <ul className="grid gap-2">
            {turnedIn.map((work) => (
              <li
                key={work.id}
                className="cursor-pointer"
                onClick={onSelect}
                onKeyDown={() => undefined}
              >
                {userLink(
                  work.userId,
                  work.userName,
                  <>
                    {avatar(work.userImage, work.userName)}
                    {stream.points && (
                      <p className="shrink-0 whitespace-nowrap tabular-nums">
                        {work.isGraded
                          ? t("score", {
                              points: work.points,
                              total: stream.points,
                            })
                          : t("ungraded")}
                      </p>
                    )}
                  </>,
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {assigned.length ? (
        <div className="grid w-full gap-2">
          <p className="font-medium">{t("assigned")}</p>
          <ul className="grid gap-2">
            {assigned.map((user) => {
              const work = classworks.find(
                (entry) => entry.userId === user.userId,
              );
              const status = workStatus(work, stream, now);
              const submitted = work?.isTurnedIn || work?.isGraded;

              return (
                <li
                  key={user.id}
                  className="cursor-pointer"
                  onClick={onSelect}
                  onKeyDown={() => undefined}
                >
                  {userLink(
                    user.userId,
                    user.userName,
                    <>
                      {avatar(user.userImage, user.userName)}
                      <ClientOnly fallback={<div />}>
                        <div className="shrink-0">
                          {submitted ? (
                            <p className="text-foreground font-medium">
                              {status === "doneLate"
                                ? t("doneLate")
                                : t("turnedIn")}
                            </p>
                          ) : (
                            status === "missing" && (
                              <p className="text-destructive font-medium">
                                {t("missing")}
                              </p>
                            )
                          )}
                        </div>
                      </ClientOnly>
                    </>,
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}
