import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { nanoid } from "nanoid";
import sharp from 'sharp';


const containerName = `postit`;
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

export async function POST(req: Request) {
  // get the file or blob from request and pass to uploadFIletoBlob function
  const base64String = await req.json();
  // Convert the base64 string back to a Buffer
  const encoded = base64String.base64String.replace(/^data:(.*,)?/, '');
  // console.log(encoded)
  const buffer = Buffer.from(encoded, 'base64');
    // Compress the image using sharp
    const compressedBuffer = await sharp(buffer)
    .resize({ width: 500, withoutEnlargement: true }) // Set the desired width for the compressed image and prevent enlargement
    .toBuffer();

  const blobService = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING!);
  const containerClient: ContainerClient = await blobService.getContainerClient(containerName)
  const blobClient = containerClient.getBlockBlobClient(nanoid());

  // Get the file extension from the base64 string
  const extension = getFileExtension(base64String.base64String);

  // Set the content type based on the file extension
  const contentType = getContentTypeFromExtension(extension);

  const result = await blobClient.uploadData(compressedBuffer, { blobHTTPHeaders: { blobContentType: contentType } });

  return new Response(JSON.stringify({ message: "success", url: `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobClient.name}`, status: result._response.status }))
}


function getFileExtension(base64String: string): string {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const [, mimeType, base64Data] = matches;
    const extension = mimeType.split('/')[1];
    return extension;
  }
  return '';
}

function getContentTypeFromExtension(extension: string): string {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    // Add more cases for other file types if needed
    default:
      return 'application/octet-stream';
  }
}
