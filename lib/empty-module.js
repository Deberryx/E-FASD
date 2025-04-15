// This is an empty module that replaces MongoDB imports on the client side
module.exports = {
  // Add minimal type stubs to prevent errors
  ObjectId: (id) => ({ toString: () => id || "" }),
  MongoClient: () => {
    throw new Error("MongoDB cannot be used on the client side")
  },
}
