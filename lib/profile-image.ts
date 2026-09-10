import { Directory, File, Paths } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type StagedProfileImage = {
  extension: "jpg" | "png" | "webp";
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
  uri: string;
};

const normalizedMimeType = (extension: StagedProfileImage["extension"]) =>
  extension === "jpg" ? "image/jpeg" : (`image/${extension}` as const);

export async function stageManagerProfileImage(
  asset: ImagePickerAsset,
  managerUserId: number,
): Promise<StagedProfileImage> {
  const suppliedMime = asset.mimeType?.toLowerCase();
  const suppliedExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  const extension = suppliedMime
    ? EXTENSION_BY_MIME[suppliedMime]
    : suppliedExtension === "jpeg"
      ? "jpg"
      : suppliedExtension === "jpg" || suppliedExtension === "png" || suppliedExtension === "webp"
        ? suppliedExtension
        : undefined;

  if (!extension) {
    throw new Error("Choose a PNG, WEBP, JPG, or JPEG image.");
  }

  const source = new File(asset.uri);
  const size = asset.fileSize ?? source.size;

  if (size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Image must not exceed 5 MB");
  }

  const managerDirectory = new Directory(
    Paths.document,
    "manager-profile-images",
    String(managerUserId),
  );
  managerDirectory.create({ idempotent: true, intermediates: true });

  const stagedFile = new File(managerDirectory, `pending-${Date.now()}.${extension}`);
  await source.copy(stagedFile, { overwrite: true });

  return {
    extension,
    mimeType: normalizedMimeType(extension),
    size,
    uri: stagedFile.uri,
  };
}

export function discardStagedProfileImage(image: StagedProfileImage | null) {
  if (!image) return;

  const file = new File(image.uri);
  if (file.exists) file.delete();
}

export async function commitManagerProfileImage(
  image: StagedProfileImage,
  currentCacheUri?: string | null,
) {
  const stagedFile = new File(image.uri);
  const managerDirectory = stagedFile.parentDirectory;
  const savedFile = new File(managerDirectory, `profile.${image.extension}`);

  await stagedFile.copy(savedFile, { overwrite: true });

  if (currentCacheUri && currentCacheUri !== savedFile.uri) {
    const currentFile = new File(currentCacheUri);
    if (currentFile.exists) currentFile.delete();
  }

  if (stagedFile.exists) stagedFile.delete();
  return savedFile.uri;
}
