import React from "react";
import { Card, Col, Row } from "react-bootstrap";

const ProductsPage = () => {
  const dummyProducts = [
    { id: 1, name: "Blue Cap", price: 299 },
    { id: 2, name: "Black Cap", price: 399 },
    { id: 3, name: "Red Cap", price: 349 },
  ];

  return (
    <div className="mt-4">
      <h2>Products</h2>
      <Row className="mt-3">
        {dummyProducts.map((product) => (
          <Col md={4} key={product.id} className="mb-3">
            <Card className="p-3 card-shadow">
              <h5>{product.name}</h5>
              <p>₹{product.price}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductsPage;