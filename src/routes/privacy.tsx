import { createFileRoute } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";

import Footer from "@/components/layout/Footer";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("privacy");

	const infoCollectItems = t("sections.infoCollect.items", {
		returnObjects: true,
	}) as string[];

	const howWeShareItems = t("sections.howWeShare.items", {
		returnObjects: true,
	}) as string[];

	return (
		<section>
			{/*<Nav showButton={true} />*/}
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
						{t("sections.infoCollect.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{infoCollectItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.howWeUse.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.howWeUse.content")}
					</p>
				</div>
				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.howWeShare.title")}
					</h4>
					<ul className="space-y-2 text-sm text-foreground/70 md:text-base">
						{howWeShareItems.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.security.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.security.content")}
					</p>
				</div>
				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.children.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.children.content")}
					</p>
				</div>
				<div>
					<h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
						{t("sections.choices.title")}
					</h4>
					<p className="text-sm text-foreground/70 md:text-base">
						{t("sections.choices.content")}
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
										className="text-[#5c7cfa] hover:underline"
									>
										scholaflow@gmail.com
									</a>
								),
								githubLink: (
									<a
										href="https://github.com/LuisCabantac/scholaflow/issues"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#5c7cfa] hover:underline"
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
