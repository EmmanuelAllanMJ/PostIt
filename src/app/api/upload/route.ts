import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import fs from "fs";

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

  return returnedBlobUrls
}
const createBlobInContainer = async (containerClient: ContainerClient, file: Blob) => {
  const blobClient = containerClient.getBlockBlobClient(file.name)
  const options = { blobHTTPHeaders: { blobContentType: file.type } }

  await blobClient.uploadData(file, options)
}

 const uploadFileToBlob = async (file: Blob | null): Promise<string[]> => {
  if (!file) return []

  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/${sasToken}/`,
  )

  const containerClient: ContainerClient = await blobService.getContainerClient(containerName)

  await containerClient.createIfNotExists({
    access: 'container',
  })
  await createBlobInContainer(containerClient, file)

  return getBlobsInContainer(containerClient)
}
export async function POST(req:Request){
    // get the file or blob from request and pass to uploadFIletoBlob function
    const file = await req.blob();
    // console.log(file);
    // const buffer = Buffer.from(file.arrayBuffer.toString());
    // const filePath = 'file.png';

    // fs.writeFile(filePath, buffer, (err) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log(`File saved to ${filePath}`);
    //   }
    // });

    const result = await uploadFileToBlob(file);
    console.log("Result ",result);
}
