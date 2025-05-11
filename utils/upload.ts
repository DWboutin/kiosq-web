import { createClient } from "@/utils/supabase/server";

interface UploadImageOptions {
  base64Image: string;
  userId: string;
  identifier: string;
  bucketName: string;
  filePrefix?: string;
}

export const uploadImage = async ({
  base64Image,
  userId,
  identifier,
  bucketName,
  filePrefix = "",
}: UploadImageOptions): Promise<string> => {
  if (!base64Image || !base64Image.startsWith("data:")) {
    throw new Error("Invalid image");
  }

  try {
    const supabase = await createClient();

    const [mimeTypeString, base64Data] = base64Image.split(",");
    const mimeType = mimeTypeString.split(":")[1].split(";")[0];

    const buffer = Buffer.from(base64Data, "base64");

    const prefixStr = filePrefix ? `${filePrefix}_` : "";
    const filePath = `${userId}/${prefixStr}${identifier}`;
    const fileExt = mimeType.split("/")[1];
    const fullPath = `${filePath}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fullPath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error processing image upload:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
