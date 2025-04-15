import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob"

// Initialize Azure Blob Storage client
const getBlobServiceClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) {
    throw new Error("Azure Storage connection string not found")
  }
  return BlobServiceClient.fromConnectionString(connectionString)
}

// Get container client
const getContainerClient = (containerName: string): ContainerClient => {
  const blobServiceClient = getBlobServiceClient()
  return blobServiceClient.getContainerClient(containerName)
}

// Create container if it doesn't exist
export async function createContainerIfNotExists(containerName: string) {
  const containerClient = getContainerClient(containerName)
  const exists = await containerClient.exists()
  if (!exists) {
    await containerClient.create()
  }
  return containerClient
}

// Upload file to Azure Blob Storage
export async function uploadFile(
  containerName: string,
  blobName: string,
  content: Buffer,
  contentType: string,
): Promise<string> {
  const containerClient = await createContainerIfNotExists(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.upload(content, content.length, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  })

  return blockBlobClient.url
}

// Get file from Azure Blob Storage
export async function getFile(containerName: string, blobName: string) {
  const containerClient = getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const exists = await blockBlobClient.exists()
  if (!exists) {
    throw new Error(`File ${blobName} does not exist in container ${containerName}`)
  }

  const downloadResponse = await blockBlobClient.download(0)
  return downloadResponse.readableStreamBody
}

// Delete file from Azure Blob Storage
export async function deleteFile(containerName: string, blobName: string) {
  const containerClient = getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const exists = await blockBlobClient.exists()
  if (!exists) {
    throw new Error(`File ${blobName} does not exist in container ${containerName}`)
  }

  await blockBlobClient.delete()
  return true
}

// Generate a unique blob name
export function generateUniqueBlobName(originalFilename: string): string {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 10)
  const extension = originalFilename.split(".").pop()

  return `${timestamp}-${randomString}.${extension}`
}
