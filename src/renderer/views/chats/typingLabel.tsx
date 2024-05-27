function TypingLabel() {
  return (
    <div className="flex gap-1">
      <div className="animate-dotFlashing h-2 w-2 rounded-full bg-secondary-light dark:bg-secondary-dark"></div>
      <div
        className="animate-dotFlashing h-2 w-2 rounded-full bg-secondary-light dark:bg-secondary-dark"
        style={{ animationDelay: "0.16s" }}
      ></div>
      <div
        className="animate-dotFlashing h-2 w-2 rounded-full bg-secondary-light dark:bg-secondary-dark"
        style={{ animationDelay: "0.32s" }}
      ></div>
    </div>
  );
}

export default TypingLabel;
