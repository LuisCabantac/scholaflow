import { Trans, useTranslation } from "react-i18next";
import { createFileRoute } from "@tanstack/react-router";

import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { LegalSection } from "@/components/shared/LegalSection";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("privacy");

	return (
		<section>
			<Nav showButton={true} />
			<div className="mx-auto mt-2 mb-6 flex max-w-6xl flex-col gap-5 px-6 md:mb-10 md:px-10 lg:px-14">
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-foreground text-2xl font-semibold md:text-4xl">
						{t("title")}
					</h1>
					<p className="text-foreground/70 mb-1 text-xs md:text-sm">
						{t("lastUpdated", { date: t("updatedAt") })}
					</p>
				</div>

				<LegalSection
					title={t("sections.overview.title")}
					content={t("sections.overview.content")}
				/>

				<LegalSection
					title={t("sections.infoCollect.title")}
					intro={t("sections.infoCollect.intro")}
					items={
						t("sections.infoCollect.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.visibility.title")}
					intro={t("sections.visibility.intro")}
					items={
						t("sections.visibility.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.hostResponsibility.title")}
					content={t("sections.hostResponsibility.content")}
				/>

				<LegalSection
					title={t("sections.storageRetention.title")}
					items={
						t("sections.storageRetention.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.educationalUse.title")}
					content={t("sections.educationalUse.content")}
				/>

				<LegalSection
					title={t("sections.choices.title")}
					content={t("sections.choices.content")}
				/>

				<LegalSection
					title={t("sections.changes.title")}
					content={t("sections.changes.content")}
				/>

				<LegalSection title={t("sections.contact.title")}>
					<p className="text-foreground/70 text-sm md:text-base">
						<Trans
							i18nKey="sections.contact.content"
							t={t}
							components={{
								emailLink: (
									<a
										href="mailto:scholaflow@gmail.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary font-medium hover:underline"
									>
										scholaflow@gmail.com
									</a>
								),
								githubLink: (
									<a
										href="https://github.com/LuisCabantac/scholaflow/issues"
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary font-medium hover:underline"
									>
										open an issue on GitHub.
									</a>
								),
							}}
						/>
					</p>
				</LegalSection>
			</div>
			<Footer />
		</section>
	);
}
