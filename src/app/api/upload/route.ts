import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { Console } from "console";
import { nanoid } from "nanoid";
import sharp from 'sharp';


const containerName = `postit`;
const sasToken = process.env.SAS_TOKEN;
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

export const isStorageConfigured = () => {
  return !storageAccountName || !sasToken ? false : true
}

// console.log("URL",`https://postit1.blob.core.windows.net/${sasToken}`);

const getBlobsInContainer = async (containerClient: ContainerClient) => {
  const returnedBlobUrls: string[] = []

  for await (const blob of containerClient.listBlobsFlat()) {
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`,
    )
  }
  console.log("Returned Blob Urls", returnedBlobUrls)
  return returnedBlobUrls
}
const createBlobInContainer = async (containerClient: ContainerClient, file: Blob) => {
  const blobClient = containerClient.getBlockBlobClient(nanoid())
  const options = { blobHTTPHeaders: { blobContentType: file.type } }

  await blobClient.uploadData(file, options)
}

const uploadFileToBlob = async (file: Blob | null): Promise<string[]> => {
  if (!file) return []

  const blobService = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING!);


  const containerClient: ContainerClient = await blobService.getContainerClient(containerName)

  await containerClient.createIfNotExists({
    access: 'container',
  })
  await createBlobInContainer(containerClient, file)

  return getBlobsInContainer(containerClient)
}
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
  console.log("Result", result)

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
