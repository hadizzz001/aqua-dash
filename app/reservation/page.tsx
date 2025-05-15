
"use client"
import Link from "next/link";
import ExportButton from "../components/ExportExcel";
import { useState, useEffect } from "react";
import { redirect, useRouter } from 'next/navigation';





const page = () => {
  const [allTemp, setTemp] = useState<any>()
  const [updatedNums, setUpdatedNums] = useState({});
  const [submittedPosts, setSubmittedPosts] = useState({}); 
  const [filterClientName, setFilterClientName] = useState("");
  const [filterReceiptNum, setFilterReceiptNum] = useState("");

  // Filtered data based on user input
  const filteredData = allTemp?.filter((post) => {
    const matchesClient =
      filterClientName === "" ||
      post.cartItems.fname.toLowerCase().includes(filterClientName.toLowerCase());

    const matchesReceipt =
      filterReceiptNum === "" || post.num?.includes(filterReceiptNum);

    return matchesClient && matchesReceipt;
  });


  // Load submitted state from localStorage on mount
  useEffect(() => {
    const storedSubmittedPosts = JSON.parse(localStorage.getItem("submittedPosts")) || {};
    setSubmittedPosts(storedSubmittedPosts);
  }, []);

  const handleInputChange = (id, value) => {
    setUpdatedNums((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (id) => {
    const numToUpdate = updatedNums[id]; // Get the updated number

    if (!numToUpdate) return; // Prevent empty submission

    try {
      const response = await fetch(`/api/order1/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num: numToUpdate }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Receipt number updated:", result);

        // Update state and save to localStorage
        setSubmittedPosts((prev) => {
          const updatedState = { ...prev, [id]: true };
          localStorage.setItem("submittedPosts", JSON.stringify(updatedState));
          return updatedState;
        });
      } else {
        console.error("Failed to update receipt number:", result);
      }
    } catch (error) {
      console.error("Error updating receipt number:", error);
    }
  };


 


  // Fetch products and categories on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/order');
    if (response.ok) {
      const data = await response.json();
      setTemp(data);
    } else {
      console.error('Failed to fetch products');
    }
  };




  const calculateFinalTotal = (idd) => {
    if (!allTemp || !allTemp?.userInfo || allTemp?.userInfo.length === 0) {
      return { totalItems: 0 };
    }

    const filteredOrders = allTemp?.userInfo?.filter(order => order.id === idd);

    return {
      totalItems: filteredOrders.reduce((acc, post) => acc + (isNaN(post.quantity) ? 0 : post.quantity), 0),
    };
  };







  const handlePaymentUpdate = async (id) => {
    try {
      const response = await fetch(`/api/order/${id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        // Update UI by changing the `paid` status for this order
        setTemp((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, paid: true } : order
          )
        );
      } else {
        console.error("Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };


 


  const handleDeleteOrder = async (id) => {
    try {
      const response = await fetch(`/api/order/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Order deleted and stock restored");
        // Refresh orders after deletion
        window.location.replace("/reservation");;
      } else {
        console.error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };
 
 

  return (
    <>
    {/* Filter Inputs */}
    <div className="flex space-x-4 mb-4">
      <input
        type="text"
        value={filterClientName}
        onChange={(e) => setFilterClientName(e.target.value)}
        placeholder="Filter by Client Name"
        className="border p-2"
      />
      <input
        type="text"
        value={filterReceiptNum}
        onChange={(e) => setFilterReceiptNum(e.target.value)}
        placeholder="Filter by Receipt #"
        className="border p-2"
      />
    </div>

    <ExportButton allTemp={allTemp} />
    <table className="table table-striped container">
      <thead>
        <tr>
          <th scope="col">Receipt #</th>
          <th scope="col">Image</th>
          <th scope="col">Client Name</th>
          <th scope="col">Total Amount</th>
          <th scope="col">Total Items</th>
          <th scope="col">Code</th>
          <th scope="col">Date</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredData?.length > 0 ? (
          filteredData.map((post) => (
            <tr key={post.id}>
              {/* Editable Receipt Number */}
              <td>
                {submittedPosts[post.id] ? (
                  <p>{updatedNums[post.id] || post.num}</p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={updatedNums[post.id] || post.num || ""}
                      onChange={(e) => handleInputChange(post.id, e.target.value)}
                      placeholder="Enter receipt number"
                      className="border p-1"
                    />
                    <button
                      onClick={() => handleUpdate(post.id)}
                      className="bg-blue-500 text-white p-1 ml-2"
                    >
                      Submit
                    </button>
                  </>
                )}
              </td>

              <td>
                <img src={post.userInfo[0].img[0]} width={70} height={70} />
              </td>
              <td>{post.cartItems.fname}</td>
              <td>${post.total}</td>
              <td>
                {post.userInfo?.reduce(
                  (acc, item) =>
                    acc + (isNaN(item.quantity) ? 0 : Number(item.quantity)),
                  0
                )}
              </td>
              <td>{post.code}</td>
              <td>{post.date}</td>
              <td className="flex space-x-2">
                <Link
                  className="text-blue-700 bg-black p-2 w-20 h-10 flex items-center justify-center"
                  href={`/order?id=${post.id}`}
                >
                  View
                </Link>
                <button
                  onClick={() => handleDeleteOrder(post.id)}
                  className="bg-red-500 text-white p-2 w-20 h-10"
                >
                  Delete
                </button>
                <button
                  className={`p-2 w-20 h-10 ${
                    post.paid ? "bg-blue-500 text-white" : "bg-black text-white"
                  }`}
                  onClick={() => !post.paid && handlePaymentUpdate(post.id)}
                  disabled={post.paid}
                >
                  {post.paid ? "Paid" : "Unpaid"}
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="text-center">
              No matching records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </>

  )
}

export default page