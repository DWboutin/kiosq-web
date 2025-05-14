import { createClient } from "@/utils/supabase/server";

interface UploadImageOptions {
  base64Image: string;
  userId: string;
  identifier: string;
  bucketName: string;
  filePrefix?: string;
  pathBuilder: (params: {
    userId: string;
    identifier: string;
    filePrefix: string;
    randomId: string;
    fileExt: string;
  }) => string;
}

export const uploadImage = async ({
  base64Image,
  userId,
  identifier,
  bucketName,
  filePrefix = "",
  pathBuilder,
}: UploadImageOptions): Promise<string> => {
  if (!base64Image || !base64Image.startsWith("data:")) {
    throw new Error("Invalid image");
  }

  try {
    const supabase = await createClient();

    const [mimeTypeString, base64Data] = base64Image.split(",");
    const mimeType = mimeTypeString.split(":")[1].split(";")[0];

    const buffer = Buffer.from(base64Data, "base64");

    // Generate a random filename component
    const randomId = Math.random().toString(36).substring(2, 10);

    // Get file extension from mime type
    const fileExt = mimeType.split("/")[1];
    const prefixStr = filePrefix ? `${filePrefix}-` : "";

    // Use the provided path builder function
    const filePath = pathBuilder({
      userId,
      identifier,
      filePrefix: prefixStr,
      randomId,
      fileExt,
    });

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error processing image upload:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
