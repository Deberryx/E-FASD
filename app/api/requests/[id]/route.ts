import { handleGetRequest, handlePutRequest, handleDeleteRequest } from "@/lib/api/request-handlers"

export async function GET(request: Request, context: { params: { id: string } }) {
  return handleGetRequest(request, context.params.id)
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  return handlePutRequest(request, context.params.id)
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  return handleDeleteRequest(request, context.params.id)
}
