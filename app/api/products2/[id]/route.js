import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  const { id } = params; // Get product ID from URL
  let { quantity, selectedColor } = await request.json(); // Get new quantity and color name

  try {
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      return new Response(JSON.stringify({ message: "Invalid quantity value" }), {
        status: 400,
      });
    }

    // Get the product by ID
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return new Response(JSON.stringify({ message: "Product not found" }), {
        status: 404,
      });
    }

    // Parse the `color` field (assumed to be JSON)
    let colorArray = product.color;

    if (!Array.isArray(colorArray)) {
      return new Response(JSON.stringify({ message: "Invalid color data format" }), {
        status: 500,
      });
    }

    // Update the quantity of the selected color
    const updatedColors = colorArray.map((c) =>
      c.color === selectedColor ? { ...c, qty: quantity } : c
    );

    // Save updated color array
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        color: updatedColors,
      },
    });

    return new Response(
      JSON.stringify({ message: "Color quantity updated", updatedProduct }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating color quantity:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
