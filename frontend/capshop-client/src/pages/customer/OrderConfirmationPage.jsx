import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  return (
    <div className="mt-5">
      <Card className="p-5 text-center card-shadow">
        <h2 className="mb-3">Order Placed Successfully</h2>
        <p className="mb-2">Thank you for shopping with CapShop.</p>
        <p className="mb-4">
          Your Order ID is: <strong>#{orderId}</strong>
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Button as={Link} to={`/orders/${orderId}`}>
            View Order Details
          </Button>
          <Button as={Link} to="/orders" variant="outline-dark">
            My Orders
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;