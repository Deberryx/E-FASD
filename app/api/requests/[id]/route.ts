import { handleGetRequest, handlePutRequest, handleDeleteRequest } from "@/lib/api/request-handlers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleGetRequest(request, params.id)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return handlePutRequest(request, params.id)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return handleDeleteRequest(request, params.id)
}
