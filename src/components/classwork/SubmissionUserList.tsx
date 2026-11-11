import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";

import { useNow } from "@/hooks/use-now";
import { workStatus } from "@/lib/classwork-rules";
import type { Classwork, EnrolledClass, Stream } from "@/lib/schema";

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
      className="group flex items-center justify-between"
    >
      {children}
    </Link>
  );

  const avatar = (image: string, name: string) => (
    <div className="flex items-center gap-2">
      <img
        src={image}
        alt={t("avatarAlt", { name })}
        width={30}
        height={30}
        className="rounded-full"
      />
      <p className="group-hover:underline">{name}</p>
    </div>
  );

  return (
    <>
      {turnedIn.length ? (
        <div className="grid gap-2">
          <p className="font-medium">{t("turnedIn")}</p>
          <ul className="grid gap-2">
            {turnedIn.map((work) => (
              <li key={work.id} onClick={onSelect} onKeyDown={() => undefined}>
                {userLink(
                  work.userId,
                  work.userName,
                  <>
                    {avatar(work.userImage, work.userName)}
                    {stream.points && (
                      <p>
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
                  onClick={onSelect}
                  onKeyDown={() => undefined}
                >
                  {userLink(
                    user.userId,
                    user.userName,
                    <>
                      {avatar(user.userImage, user.userName)}
                      <ClientOnly fallback={<div />}>
                        <div>
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
