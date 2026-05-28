const Card = ({ children, className = "", onClick, hover = true }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${
        hover ? "hover:shadow-md" : ""
      } transition-shadow duration-200 p-6 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
