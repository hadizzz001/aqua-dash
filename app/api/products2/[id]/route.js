import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  console.log("PATCH request received with params:", params);

  const { id } = params; // Get product ID from URL
  console.log("Product ID:", id);

  let requestData;
  try {
    requestData = await request.json();
    console.log("Request JSON body:", requestData);
  } catch (err) {
    console.error("Failed to parse JSON from request body:", err);
    return new Response(JSON.stringify({ message: "Invalid request body" }), {
      status: 400,
    });
  }

  let { quantity, selectedColor } = requestData;
  console.log("Received quantity:", quantity, "Selected color:", selectedColor);

  try {
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      console.warn("Invalid quantity value:", quantity);
      return new Response(JSON.stringify({ message: "Invalid quantity value" }), {
        status: 400,
      });
    }

    // Get the product by ID
    console.log("Fetching product with ID:", id);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      console.warn("Product not found with ID:", id);
      return new Response(JSON.stringify({ message: "Product not found" }), {
        status: 404,
      });
    }

    console.log("Product found:", product);

    // Parse the `color` field (assumed to be JSON)
    let colorArray = product.color;
    console.log("Original color array:", colorArray);

 

// ✅ Check if the selected color exists in the array
const matchFound = colorArray.some((c) => c.color === selectedColor);
if (!matchFound) {
  console.warn("No matching color found:", selectedColor);
  return new Response(JSON.stringify({ message: "Color not found" }), {
    status: 404,
  });
}

// Update the quantity of the selected color
const updatedColors = colorArray.map((c) =>
  c.color === selectedColor ? { ...c, qty: c.qty + quantity } : c
);





    if (!Array.isArray(colorArray)) {
      console.error("Invalid color data format. Expected array:", colorArray);
      return new Response(JSON.stringify({ message: "Invalid color data format" }), {
        status: 500,
      });
    }

 
    console.log("Updated color array:", updatedColors);

    // Save updated color array
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        color: updatedColors,
      },
    });

    console.log("Product updated successfully:", updatedProduct);

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
