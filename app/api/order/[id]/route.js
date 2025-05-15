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
        const encodedTitle = encodeURIComponent(item.title); // ✅ Fix spaces issue

        await fetch(`https://senses1.netlify.app/api/products1/${encodedTitle}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: item.quantity }),
        });
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
