"use client"

import React from 'react'
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { fetchTemp3 } from '../utils'
import { useState, useEffect } from "react";




const page = () => {

    const [allTemp1, setTemp1] = useState() 
    const searchParams = useSearchParams()
    const search = searchParams.get('id')
    const [updatedNums, setUpdatedNums] = useState({});









    useEffect(() => {
        const b = fetchProducts();
        // setShowDetails(Array(b.cartItems.length).fill(false));
    }, []);

    const fetchProducts = async () => {
        const response = await fetch(`/api/order/${search}`);
        if (response.ok) {
            const data = await response.json();
            setTemp1(data);
        } else {
            console.error('Failed to fetch products');
        }
    };
 




    const calculateFinalTotal = () => {
        if (allTemp1 && allTemp1.userInfo) {
            const result = allTemp1.userInfo.reduce(
                (acc, post) => {
                    const price = post.price;
                    const qty = post.quantity;
                    acc.totalPrice += isNaN(price) || isNaN(qty) ? 0 : price * qty;
                    acc.totalItems += isNaN(qty) ? 0 : qty;
                    return acc;
                },
                { totalPrice: 0, totalItems: 0 }
            );

            return result;
        }

        return { totalPrice: 0, totalItems: 0 };
    };
    const finalTotal = calculateFinalTotal();





    const handleInputChange = (id, value) => {
        setUpdatedNums((prev) => ({
          ...prev,
          [id]: value, // Store num for the specific order
        }));
      };
    
      const handleUpdate = async (id) => {
        const numToUpdate = updatedNums[id]; // Get the updated num for this order
    
        if (!numToUpdate) return; // Prevent empty values from being sent
    
        try {
          const response = await fetch(`/api/order2/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ remark: numToUpdate }),
          });
    
          const result = await response.json();
    
          if (response.ok) {
            console.log("Receipt number updated:", result);
          } else {
            console.error("Failed to update receipt number:", result);
          }
        } catch (error) {
          console.error("Error updating receipt number:", error);
        }
      };



    return (
        <>
            <div className="bg-gray-100 h-screen py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-semibold mb-4">Receipt Number: {allTemp1?.num}</h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="col-md-8">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-semibold">Product</th>
                                            <th className="text-left font-semibold">Price</th>
                                            <th className="text-left font-semibold">Quantity</th>
                                            <th className="text-left font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allTemp1 && Object?.keys(allTemp1).length > 0 ? (
                                            allTemp1.userInfo.map((temp, index) => (

                                                <>
                                                    <tr>
                                                        <td className="py-4">
                                                            <div className="flex items-center">
                                                                <span className="font-semibold">{temp.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">${temp.discount}</td>
                                                        <td className="py-4">
                                                            <div className="flex items-center">
                                                                <span className="text-center w-8">{temp.quantity}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">${allTemp1.total}</td>



                                                    </tr>



                                                </>
                                            ))

                                        ) : (
                                            <div className='home___error-container'>
                                                <h2 className='text-black text-xl dont-bold'>...</h2>

                                            </div>
                                        )}



                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-4">
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Customer Details</h2>

        {allTemp1 && Object?.keys(allTemp1).length > 0 ? (
            <>
                <div className="flex justify-between mb-2">
                    <span>Name</span>
                    <span>{allTemp1.cartItems.fname} {allTemp1.cartItems.lname}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Phone</span>
                    <span>{allTemp1.cartItems.phone}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Address</span>
                    <span>{allTemp1.cartItems.address}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between mb-2">
                    <span className="font-semibold">Total Items</span>
                    <span className="font-semibold">{finalTotal.totalItems}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="font-semibold">Code</span>
                    <span className="font-semibold">{allTemp1.code}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-semibold">${allTemp1.total}</span>
                </div> 
                <div className="mt-4"> 
                <textarea 
                      value={updatedNums[allTemp1.id] || allTemp1.remark || ""}
                      onChange={(e) => handleInputChange(allTemp1.id, e.target.value)}
                      placeholder="Enter remark"
                      className="border p-1"
                    /><br/>
                    <button
                      onClick={() => handleUpdate(allTemp1.id)}
                      className="bg-blue-500 text-white p-1 ml-2"
                    >
                      Save
                    </button>
                </div>
            </>
        ) : (
            <div className='home___error-container'>
                <h2 className='text-black text-xl font-bold'>...</h2>
            </div>
        )}
    </div>
</div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default page