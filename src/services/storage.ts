import { v4 as uuidv4 } from "uuid";

import { createClient } from "@/lib/supabase/server";

export async function uploadAttachments(
  bucketName: string,
  folderId: string,
  file: File,
): Promise<string | null> {
  if (file.name !== "undefined") {
    const supabase = createClient();

    const sanitizedFileName = file.name.replace(/~/g, "").replace(/\s+/g, "_");
    const [name, extension] = sanitizedFileName.split(/\.(?=[^\.]+$)/);

    const filePath = `${folderId}/${name}_${uuidv4()}.${extension}`;

    const { data: attachment, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(attachment.path);

    return data.publicUrl;
  }
  return null;
}
