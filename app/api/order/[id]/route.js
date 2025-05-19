import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = params;

  try {

    const categories1 = await prisma.order.findUnique({
      where: { id },
    });

    if (!categories1 || categories1.length === 0) {
      return new Response(JSON.stringify({ message: 'No ids found for the specified type.' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(categories1), { status: 200 });
  } catch (error) {
    console.error('Error fetching ids:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}




export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paid: true },
    });

    return new Response(JSON.stringify(updatedOrder), { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}





export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // 1️⃣ Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userInfo: true },
    });

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    // 2️⃣ Restore stock
    if (Array.isArray(order.userInfo)) {
      for (const item of order.userInfo) {


        if (item.type === "single") {
          await fetch(`https://aqua-dash.netlify.app/api/products1/${item._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: item.quantity }),
          });
        }
        else {

          try {
            const response = await fetch(`https://aqua-dash.netlify.app/api/products2/${item._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity: item.quantity, selectedColor: item.selectedColor }),
            });

            if (!response.ok) {
              const error = await response.json();
              console.error("PATCH failed:", error);
              return { error: true, message: error.message };
            }

            const result = await response.json();
            console.log("PATCH successful:", result);
            return result;
          } catch (err) {
            console.error("Fetch error:", err);
            return { error: true, message: "Network or server error" };
          }


        }
      }

    }

    // 3️⃣ Delete order
    await prisma.order.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Order deleted and stock restored" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
