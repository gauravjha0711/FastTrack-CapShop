import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <>
      <style>
        {`
          .capshop-loader-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            gap: 18px;
          }

          .capshop-spinner {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #3b82f6;
            border-right: 4px solid #8b5cf6;
            animation: spin 1s linear infinite;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .capshop-loader-text {
            font-size: 18px;
            font-weight: 600;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 1px;
          }

          .capshop-sub-text {
            font-size: 13px;
            color: #94a3b8;
            opacity: 0.8;
          }
        `}
      </style>

      <div className="capshop-loader-wrapper">
        {/* Spinner */}
        <div className="capshop-spinner"></div>

        {/* Brand Text */}
        <div className="capshop-loader-text">
          CapShop
        </div>

        {/* Dynamic Loading Text */}
        <div className="capshop-sub-text">
          {text}
        </div>
      </div>
    </>
  );
};

export default Loader;