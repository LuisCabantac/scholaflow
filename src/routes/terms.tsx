import { Trans, useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";

import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { LegalSection } from "@/components/shared/LegalSection";

export const Route = createFileRoute("/terms")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("terms");

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

				<LegalSection title={t("sections.acceptance.title")}>
					<p className="text-foreground/70 text-sm md:text-base">
						<Trans
							i18nKey="sections.acceptance.content"
							t={t}
							components={{
								privacyLink: (
									<Link
										to="/privacy"
										className="text-primary font-medium hover:underline"
									>
										Privacy Policy
									</Link>
								),
							}}
						/>
					</p>
				</LegalSection>

				<LegalSection
					title={t("sections.description.title")}
					content={t("sections.description.content")}
				/>

				<LegalSection
					title={t("sections.eligibility.title")}
					items={
						t("sections.eligibility.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.roles.title")}
					items={
						t("sections.roles.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.coursework.title")}
					items={
						t("sections.coursework.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.communication.title")}
					items={
						t("sections.communication.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.notes.title")}
					content={t("sections.notes.content")}
				/>

				<LegalSection
					title={t("sections.acceptableUse.title")}
					intro={t("sections.acceptableUse.intro")}
					items={
						t("sections.acceptableUse.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.content.title")}
					items={
						t("sections.content.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.availability.title")}
					items={
						t("sections.availability.items", {
							returnObjects: true,
						}) as string[]
					}
				/>

				<LegalSection
					title={t("sections.liability.title")}
					content={t("sections.liability.content")}
				/>

				<LegalSection
					title={t("sections.termination.title")}
					items={
						t("sections.termination.items", {
							returnObjects: true,
						}) as string[]
					}
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
