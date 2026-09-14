import { createFileRoute, Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";

import Footer from "@/components/layout/Footer";

export const Route = createFileRoute("/terms")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("terms");

	const eligibilityItems = t("sections.eligibility.items", {
		returnObjects: true,
	}) as string[];

	const acceptableUseItems = t("sections.acceptableUse.items", {
		returnObjects: true,
	}) as string[];

	const contentItems = t("sections.content.items", {
		returnObjects: true,
	}) as string[];

	const availabilityItems = t("sections.availability.items", {
		returnObjects: true,
	}) as string[];

	const terminationItems = t("sections.termination.items", {
		returnObjects: true,
	}) as string[];

	return (
		<section>
			<div className="mx-auto mb-6 mt-2 flex max-w-6xl flex-col gap-5 px-6 md:mb-10 md:px-10 lg:px-14">
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-2xl font-semibold text-foreground md:text-4xl">
						{t("title")}
					</h1>
					<p className="mb-1 text-xs text-foreground/70 md:text-sm">
						{t("lastUpdated")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.acceptance.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						<Trans
							i18nKey="sections.acceptance.content"
							t={t}
							components={{
								privacyLink: (
									<Link
										to="/privacy"
										className="text-sidebar-ring hover:underline"
									>
										Privacy Policy
									</Link>
								),
							}}
						/>
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.description.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.description.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.eligibility.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{eligibilityItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.acceptableUse.title")}
					</h4>
					<p className="mb-2 text-sm text-foreground/70 md:text-base">
						{t("sections.acceptableUse.intro")}
					</p>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{acceptableUseItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.content.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{contentItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.privacy.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.privacy.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.availability.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{availabilityItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.liability.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.liability.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.termination.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{terminationItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.integrity.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.integrity.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.thirdParty.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.thirdParty.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.dispute.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.dispute.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.changes.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.changes.content")}
					</p>
				</div>

				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.contact.title")}
					</h4>
					<p className="text-sm text-foreground md:text-base">
						<Trans
							i18nKey="sections.contact.content"
							t={t}
							components={{
								emailLink: (
									<a
										href="mailto:scholaflow@gmail.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sidebar-ring hover:underline"
									>
										scholaflow@gmail.com
									</a>
								),
								githubLink: (
									<a
										href="https://github.com/LuisCabantac/scholaflow/issues"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sidebar-ring hover:underline"
									>
										GitHub
									</a>
								),
							}}
						/>
					</p>
				</div>
			</div>
			<Footer />
		</section>
	);
}
