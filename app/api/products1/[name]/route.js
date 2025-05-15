import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  const { name } = params; // Get product name from URL
  let { quantity } = await request.json(); // Get quantity from request body

  try {
    // 1️⃣ Parse `quantity` to an integer
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      return new Response(
        JSON.stringify({ message: "Invalid quantity value" }),
        { status: 400 }
      );
    }

    // 2️⃣ Ensure product exists
    const product = await prisma.product.findFirst({
      where: { title: name }, // ✅ Find by title
    });

    if (!product) {
      return new Response(JSON.stringify({ message: "Product not found" }), {
        status: 404,
      });
    }

    // 3️⃣ Parse `stock` to an integer
    let currentStock = parseInt(product.stock, 10);
    if (isNaN(currentStock)) {
      return new Response(
        JSON.stringify({ message: "Invalid stock value in database" }),
        { status: 500 }
      );
    }

    // 4️⃣ Restore stock and convert back to string before saving
    const updatedStock = (currentStock + quantity).toString();

    const updatedProduct = await prisma.product.update({
      where: { id: product.id }, // ✅ Use `id`
      data: { stock: updatedStock }, // Store as string
    });

    return new Response(
      JSON.stringify({ message: "Stock updated", updatedProduct }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating stock:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
