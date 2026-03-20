import React from "react";
import { Card } from "react-bootstrap";

const CategoryCard = ({ category, onClick }) => {
  return (
    <Card
      className="h-100 card-shadow"
      style={{ cursor: "pointer" }}
      onClick={() => onClick(category.id)}
    >
      <Card.Img
        variant="top"
        src={category.imageUrl || "https://via.placeholder.com/300x180"}
        style={{ height: "180px", objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title>{category.name}</Card.Title>
        <Card.Text>
          {category.description?.length > 80
            ? `${category.description.substring(0, 80)}...`
            : category.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CategoryCard;