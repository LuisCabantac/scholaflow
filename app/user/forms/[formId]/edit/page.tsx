import { Metadata } from "next";

import { getFormByFormId } from "@/lib/data-service";
import { capitalizeFirstLetter } from "@/lib/utils";

import FormEditSection from "@/components/FormEditSection";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { formId } = await params;

  const form = await getFormByFormId(formId);

  const route = (await searchParams).route;

  return {
    title: `${form?.title} - ${capitalizeFirstLetter((route as string) ?? "edit")}`,
    description: form?.description,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  async function handleGetForm(formId: string) {
    "use server";
    const form = await getFormByFormId(formId);
    return form;
  }

  return <FormEditSection formId={formId} onGetForm={handleGetForm} />;
}
