

export const handleDemo = (req, res) => {
  res.json({
    message: "Hello from the demo API endpoint!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  });
};
